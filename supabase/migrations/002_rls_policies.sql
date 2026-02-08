-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STAFF PROFILES POLICIES
-- =====================================================

CREATE POLICY "Staff can view all staff profiles"
  ON staff_profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can update own profile"
  ON staff_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Super admin can manage all staff"
  ON staff_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- =====================================================
-- PATIENTS POLICIES
-- =====================================================

CREATE POLICY "Staff can view all patients"
  ON patients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Receptionist and doctors can create patients"
  ON patients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'doctor', 'nurse', 'receptionist')
    )
  );

CREATE POLICY "Authorized staff can update patients"
  ON patients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'doctor', 'nurse', 'receptionist')
    )
  );

CREATE POLICY "Super admin can delete patients"
  ON patients FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- =====================================================
-- APPOINTMENTS POLICIES
-- =====================================================

CREATE POLICY "Staff can view all appointments"
  ON appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Authorized staff can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'doctor', 'nurse', 'receptionist')
    )
  );

CREATE POLICY "Authorized staff can update appointments"
  ON appointments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'doctor', 'nurse', 'receptionist')
    )
  );

CREATE POLICY "Authorized staff can delete appointments"
  ON appointments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'receptionist')
    )
  );

-- =====================================================
-- CONSULTATIONS POLICIES
-- =====================================================

CREATE POLICY "Doctors can view all consultations"
  ON consultations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'doctor', 'nurse')
    )
  );

CREATE POLICY "Doctors can create consultations"
  ON consultations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'doctor')
    )
  );

CREATE POLICY "Doctors can update own consultations"
  ON consultations FOR UPDATE
  USING (
    doctor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- =====================================================
-- PRESCRIPTIONS POLICIES
-- =====================================================

CREATE POLICY "Staff can view prescriptions"
  ON prescriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'doctor', 'nurse', 'receptionist')
    )
  );

CREATE POLICY "Doctors can create prescriptions"
  ON prescriptions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'doctor')
    )
  );

CREATE POLICY "Doctors can update own prescriptions"
  ON prescriptions FOR UPDATE
  USING (
    doctor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- =====================================================
-- PRESCRIPTION ITEMS POLICIES
-- =====================================================

CREATE POLICY "Staff can view prescription items"
  ON prescription_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Doctors can manage prescription items"
  ON prescription_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'doctor')
    )
  );

-- =====================================================
-- MEDICINES POLICIES
-- =====================================================

CREATE POLICY "Staff can view medicines"
  ON medicines FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Authorized staff can manage medicines"
  ON medicines FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'accountant', 'nurse')
    )
  );

-- =====================================================
-- INVENTORY POLICIES
-- =====================================================

CREATE POLICY "Staff can view inventory transactions"
  ON inventory_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Authorized staff can manage inventory"
  ON inventory_transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'accountant', 'nurse')
    )
  );

-- =====================================================
-- INVOICES & PAYMENTS POLICIES
-- =====================================================

CREATE POLICY "Staff can view invoices"
  ON invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Authorized staff can manage invoices"
  ON invoices FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'accountant', 'receptionist')
    )
  );

CREATE POLICY "Staff can view invoice items"
  ON invoice_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Authorized staff can manage invoice items"
  ON invoice_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'accountant', 'receptionist')
    )
  );

CREATE POLICY "Staff can view payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Authorized staff can manage payments"
  ON payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'accountant', 'receptionist')
    )
  );

-- =====================================================
-- QUEUE POLICIES
-- =====================================================

CREATE POLICY "Staff can view queues"
  ON queues FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage queues"
  ON queues FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'doctor', 'nurse', 'receptionist')
    )
  );

-- =====================================================
-- SERVICES & ROOMS POLICIES
-- =====================================================

CREATE POLICY "Staff can view services"
  ON services FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage services"
  ON services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Staff can view rooms"
  ON rooms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage rooms"
  ON rooms FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- =====================================================
-- EXPENSES POLICIES
-- =====================================================

CREATE POLICY "Staff can view expenses"
  ON expenses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'accountant')
    )
  );

CREATE POLICY "Authorized staff can manage expenses"
  ON expenses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'accountant')
    )
  );

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- SETTINGS POLICIES
-- =====================================================

CREATE POLICY "Staff can view settings"
  ON settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage settings"
  ON settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- =====================================================
-- ROLES POLICIES
-- =====================================================

CREATE POLICY "Staff can view roles"
  ON roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage roles"
  ON roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
