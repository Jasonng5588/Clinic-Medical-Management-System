export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            staff_profiles: {
                Row: {
                    id: string
                    role: "super_admin" | "doctor" | "nurse" | "receptionist" | "accountant"
                    first_name: string
                    last_name: string
                    email: string
                    phone: string | null
                    gender: "male" | "female" | "other" | null
                    date_of_birth: string | null
                    address: string | null
                    qualification: string | null
                    specialization: string | null
                    license_number: string | null
                    hire_date: string | null
                    is_active: boolean
                    avatar_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    role: "super_admin" | "doctor" | "nurse" | "receptionist" | "accountant"
                    first_name: string
                    last_name: string
                    email: string
                    phone?: string | null
                    gender?: "male" | "female" | "other" | null
                    date_of_birth?: string | null
                    address?: string | null
                    qualification?: string | null
                    specialization?: string | null
                    license_number?: string | null
                    hire_date?: string | null
                    is_active?: boolean
                    avatar_url?: string | null
                }
                Update: {
                    id?: string
                    role?: "super_admin" | "doctor" | "nurse" | "receptionist" | "accountant"
                    first_name?: string
                    last_name?: string
                    email?: string
                    phone?: string | null
                    is_active?: boolean
                }
            }
            patients: {
                Row: {
                    id: string
                    patient_number: string
                    first_name: string
                    last_name: string
                    email: string | null
                    phone: string
                    gender: "male" | "female" | "other" | null
                    date_of_birth: string
                    blood_group: string | null
                    address: string | null
                    city: string | null
                    state: string | null
                    postal_code: string | null
                    country: string | null
                    emergency_contact_name: string | null
                    emergency_contact_phone: string | null
                    emergency_contact_relation: string | null
                    medical_history: string | null
                    allergies: string | null
                    chronic_conditions: string | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database["public"]["Tables"]["patients"]["Row"], "id" | "patient_number" | "created_at" | "updated_at"> & { id?: string }
                Update: Partial<Database["public"]["Tables"]["patients"]["Insert"]>
            }
            appointments: {
                Row: {
                    id: string
                    appointment_number: string
                    patient_id: string
                    doctor_id: string
                    service_id: string | null
                    appointment_date: string
                    appointment_time: string
                    duration_minutes: number
                    status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show"
                    notes: string | null
                    reason_for_visit: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database["public"]["Tables"]["appointments"]["Row"], "id" | "appointment_number" | "created_at" | "updated_at">
                Update: Partial<Database["public"]["Tables"]["appointments"]["Insert"]>
            }
            queues: {
                Row: {
                    id: string
                    queue_number: number
                    patient_id: string
                    appointment_id: string | null
                    status: "waiting" | "in_progress" | "completed" | "cancelled"
                    priority: "normal" | "urgent" | "emergency"
                    check_in_time: string
                    start_time: string | null
                    end_time: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    queue_number: number
                    patient_id: string
                    appointment_id?: string | null
                    status?: "waiting" | "in_progress" | "completed" | "cancelled"
                    priority?: "normal" | "urgent" | "emergency"
                    check_in_time?: string
                    notes?: string | null
                }
                Update: {
                    status?: "waiting" | "in_progress" | "completed" | "cancelled"
                    start_time?: string | null
                    end_time?: string | null
                }
            }
            medicines: {
                Row: {
                    id: string
                    name: string
                    generic_name: string | null
                    category: string | null
                    sku: string | null
                    batch_number: string | null
                    manufacturer: string | null
                    supplier_id: string | null
                    unit_price: number
                    selling_price: number
                    quantity_in_stock: number
                    reorder_level: number
                    expiry_date: string | null
                    storage_conditions: string | null
                    description: string | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    name: string
                    generic_name?: string | null
                    category?: string | null
                    sku?: string | null
                    batch_number?: string | null
                    manufacturer?: string | null
                    supplier_id?: string | null
                    unit_price?: number
                    selling_price?: number
                    quantity_in_stock?: number
                    reorder_level?: number
                    expiry_date?: string | null
                    storage_conditions?: string | null
                    description?: string | null
                    is_active?: boolean
                }
                Update: Partial<Database["public"]["Tables"]["medicines"]["Insert"]>
            }
            audit_logs: {
                Row: {
                    id: string
                    action: string
                    table_name: string
                    record_id: string | null
                    user_id: string | null
                    old_values: any
                    new_values: any
                    ip_address: string | null
                    created_at: string
                }
                Insert: {
                    action: string
                    table_name: string
                    record_id?: string | null
                    user_id?: string | null
                    old_values?: any
                    new_values?: any
                    ip_address?: string | null
                }
                Update: never
            }
            staff_schedules: {
                Row: {
                    id: string
                    staff_id: string
                    day_of_week: number
                    start_time: string
                    end_time: string
                    is_available: boolean
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    staff_id: string
                    day_of_week: number
                    start_time: string
                    end_time: string
                    is_available?: boolean
                    notes?: string | null
                }
                Update: Partial<Database["public"]["Tables"]["staff_schedules"]["Insert"]>
            }
            leave_requests: {
                Row: {
                    id: string
                    staff_id: string
                    start_date: string
                    end_date: string
                    reason: string
                    status: "pending" | "approved" | "rejected"
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    staff_id: string
                    start_date: string
                    end_date: string
                    reason: string
                    status?: "pending" | "approved" | "rejected"
                }
                Update: {
                    status?: "pending" | "approved" | "rejected"
                }
            }
            refunds: {
                Row: {
                    id: string
                    invoice_id: string
                    amount: number
                    reason: string
                    status: "pending" | "approved" | "rejected" | "processed"
                    processed_by: string | null
                    processed_at: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    invoice_id: string
                    amount: number
                    reason: string
                    status?: "pending" | "approved" | "rejected" | "processed"
                    created_by?: string | null
                }
                Update: {
                    status?: "pending" | "approved" | "rejected" | "processed"
                    processed_by?: string | null
                    processed_at?: string | null
                }
            }
            invoices: {
                Row: {
                    id: string
                    invoice_number: string
                    patient_id: string
                    invoice_date: string
                    due_date: string
                    subtotal: number
                    discount_percentage: number
                    discount_amount: number
                    tax_percentage: number
                    tax_amount: number
                    total_amount: number
                    paid_amount: number
                    balance: number
                    status: "draft" | "sent" | "paid" | "overdue" | "cancelled" | "partial"
                    notes: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    invoice_number: string
                    patient_id: string
                    invoice_date: string
                    due_date: string
                    subtotal?: number
                    discount_percentage?: number
                    discount_amount?: number
                    tax_percentage?: number
                    tax_amount?: number
                    total_amount?: number
                    paid_amount?: number
                    balance?: number
                    status?: "draft" | "sent" | "paid" | "overdue" | "cancelled" | "partial"
                    notes?: string | null
                    created_by?: string | null
                }
                Update: Partial<Database["public"]["Tables"]["invoices"]["Insert"]>
            }
            services: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    duration_minutes: number
                    price: number
                    category: string | null
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    name: string
                    description?: string | null
                    duration_minutes?: number
                    price?: number
                    category?: string | null
                    is_active?: boolean
                }
                Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>
            }
            consultations: {
                Row: {
                    id: string
                    patient_id: string
                    doctor_id: string
                    appointment_id: string | null
                    diagnosis: string | null
                    symptoms: string | null
                    notes: string | null
                    subjective: string | null
                    objective: string | null
                    assessment: string | null
                    plan: string | null
                    prescriptions: any
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    patient_id: string
                    doctor_id: string
                    appointment_id?: string | null
                    diagnosis?: string | null
                    symptoms?: string | null
                    notes?: string | null
                    subjective?: string | null
                    objective?: string | null
                    assessment?: string | null
                    plan?: string | null
                    prescriptions?: any
                }
                Update: Partial<Database["public"]["Tables"]["consultations"]["Insert"]>
            }
            [key: string]: any
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            get_next_queue_number: {
                Args: { p_queue_date?: string }
                Returns: number
            }
            generate_patient_number: {
                Args: Record<PropertyKey, never>
                Returns: string
            }
            generate_appointment_number: {
                Args: Record<PropertyKey, never>
                Returns: string
            }
            get_dashboard_stats: {
                Args: { p_staff_id: string }
                Returns: Json
            }
        }
        Enums: {
            user_role: "super_admin" | "doctor" | "nurse" | "receptionist" | "accountant"
            appointment_status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show"
            queue_status: "waiting" | "called" | "serving" | "completed" | "cancelled"
            payment_method: "cash" | "card" | "bank_transfer" | "stripe" | "insurance"
            payment_status: "pending" | "completed" | "failed" | "refunded"
            invoice_status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
            transaction_type: "purchase" | "sale" | "adjustment" | "return" | "expired"
            gender: "male" | "female" | "other"
        }
    }
}
