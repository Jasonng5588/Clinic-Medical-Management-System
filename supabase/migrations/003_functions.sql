-- =====================================================
-- DATABASE FUNCTIONS
-- =====================================================

-- Function to get next queue number for the day
CREATE OR REPLACE FUNCTION get_next_queue_number(p_queue_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER AS $$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(queue_number), 0) + 1
  INTO next_number
  FROM queues
  WHERE queue_date = p_queue_date;
  
  RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique patient number
CREATE OR REPLACE FUNCTION generate_patient_number()
RETURNS TEXT AS $$
DECLARE
  next_number TEXT;
  count_num INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO count_num FROM patients;
  next_number := 'P' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || LPAD(count_num::TEXT, 4, '0');
  RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique appointment number
CREATE OR REPLACE FUNCTION generate_appointment_number()
RETURNS TEXT AS $$
DECLARE
  next_number TEXT;
  count_num INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO count_num FROM appointments;
  next_number := 'APT' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || LPAD(count_num::TEXT, 4, '0');
  RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique consultation number
CREATE OR REPLACE FUNCTION generate_consultation_number()
RETURNS TEXT AS $$
DECLARE
  next_number TEXT;
  count_num INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO count_num FROM consultations;
  next_number := 'CON' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || LPAD(count_num::TEXT, 4, '0');
  RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique prescription number
CREATE OR REPLACE FUNCTION generate_prescription_number()
RETURNS TEXT AS $$
DECLARE
  next_number TEXT;
  count_num INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO count_num FROM prescriptions;
  next_number := 'PRE' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || LPAD(count_num::TEXT, 4, '0');
  RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  next_number TEXT;
  count_num INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO count_num FROM invoices;
  next_number := 'INV' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || LPAD(count_num::TEXT, 4, '0');
  RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique payment number
CREATE OR REPLACE FUNCTION generate_payment_number()
RETURNS TEXT AS $$
DECLARE
  next_number TEXT;
  count_num INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO count_num FROM payments;
  next_number := 'PAY' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || LPAD(count_num::TEXT, 4, '0');
  RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique expense number
CREATE OR REPLACE FUNCTION generate_expense_number()
RETURNS TEXT AS $$
DECLARE
  next_number TEXT;
  count_num INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO count_num FROM expenses;
  next_number := 'EXP' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || LPAD(count_num::TEXT, 4, '0');
  RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-deduct inventory when prescription is filled
CREATE OR REPLACE FUNCTION deduct_inventory_on_prescription()
RETURNS TRIGGER AS $$
BEGIN
  -- Deduct stock from medicines
  UPDATE medicines
  SET current_stock = current_stock - NEW.quantity
  WHERE id = NEW.medicine_id;
  
  -- Record inventory transaction
  INSERT INTO inventory_transactions (
    medicine_id,
    transaction_type,
    quantity,
    reference_id,
    reference_type,
    transaction_date
  ) VALUES (
    NEW.medicine_id,
    'sale',
    -NEW.quantity,
    NEW.prescription_id,
    'prescription',
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_deduct_inventory_on_prescription
AFTER INSERT ON prescription_items
FOR EACH ROW
EXECUTE FUNCTION deduct_inventory_on_prescription();

-- Trigger to update invoice totals
CREATE OR REPLACE FUNCTION calculate_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_subtotal DECIMAL(10, 2);
BEGIN
  -- Calculate subtotal from invoice items
  SELECT COALESCE(SUM(total_price), 0)
  INTO v_subtotal
  FROM invoice_items
  WHERE invoice_id = NEW.invoice_id;
  
  -- Update invoice
  UPDATE invoices
  SET 
    subtotal = v_subtotal,
    discount_amount = v_subtotal * (discount_percentage / 100),
    tax_amount = (v_subtotal - (v_subtotal * (discount_percentage / 100))) * (tax_percentage / 100),
    total_amount = v_subtotal - (v_subtotal * (discount_percentage / 100)) + ((v_subtotal - (v_subtotal * (discount_percentage / 100))) * (tax_percentage / 100)),
    balance = total_amount - COALESCE(paid_amount, 0)
  WHERE id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_invoice_totals
AFTER INSERT OR UPDATE OR DELETE ON invoice_items
FOR EACH ROW
EXECUTE FUNCTION calculate_invoice_totals();

-- Trigger to update invoice status based on payment
CREATE OR REPLACE FUNCTION update_invoice_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Update invoice paid amount
  UPDATE invoices
  SET 
    paid_amount = COALESCE(paid_amount, 0) + NEW.amount,
    balance = total_amount - (COALESCE(paid_amount, 0) + NEW.amount),
    status = CASE
      WHEN (total_amount - (COALESCE(paid_amount, 0) + NEW.amount)) <= 0 THEN 'paid'::invoice_status
      ELSE status
    END
  WHERE id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_invoice_on_payment
AFTER INSERT ON payments
FOR EACH ROW
EXECUTE FUNCTION update_invoice_on_payment();

-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_staff_id UUID)
RETURNS JSON AS $$
DECLARE
  stats JSON;
  user_role user_role;
BEGIN
  -- Get user role
  SELECT role INTO user_role FROM staff_profiles WHERE id = p_staff_id;
  
  SELECT json_build_object(
    'total_patients', (SELECT COUNT(*) FROM patients WHERE is_active = true),
    'today_appointments', (SELECT COUNT(*) FROM appointments WHERE appointment_date = CURRENT_DATE),
    'pending_queue', (SELECT COUNT(*) FROM queues WHERE queue_date = CURRENT_DATE AND status = 'waiting'),
    'today_revenue', (SELECT COALESCE(SUM(total_amount), 0) FROM invoices WHERE invoice_date = CURRENT_DATE AND status = 'paid'),
    'low_stock_medicines', (SELECT COUNT(*) FROM medicines WHERE current_stock <= reorder_level AND is_active = true),
    'unpaid_invoices', (SELECT COUNT(*) FROM invoices WHERE status IN ('sent', 'overdue'))
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql;
