import { Database } from "./database.types"

export type UserRole = Database["public"]["Enums"]["user_role"]
export type AppointmentStatus = Database["public"]["Enums"]["appointment_status"]
export type QueueStatus = Database["public"]["Enums"]["queue_status"]
export type PaymentMethod = Database["public"]["Enums"]["payment_method"]
export type PaymentStatus = Database["public"]["Enums"]["payment_status"]
export type InvoiceStatus = Database["public"]["Enums"]["invoice_status"]
export type TransactionType = Database["public"]["Enums"]["transaction_type"]
export type Gender = Database["public"]["Enums"]["gender"]

// Staff Profile
export interface StaffProfile {
    id: string
    role: UserRole
    first_name: string
    last_name: string
    email: string
    phone?: string
    gender?: Gender
    date_of_birth?: string
    address?: string
    qualification?: string
    specialization?: string
    license_number?: string
    hire_date?: string
    is_active: boolean
    avatar_url?: string
    created_at: string
    updated_at: string
}

// Patient
export interface Patient {
    id: string
    patient_number: string
    first_name: string
    last_name: string
    email?: string
    phone: string
    gender?: Gender
    date_of_birth: string
    age?: number
    blood_group?: string
    address?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
    emergency_contact_name?: string
    emergency_contact_phone?: string
    emergency_contact_relation?: string
    medical_history?: string
    allergies?: string
    chronic_conditions?: string
    is_active: boolean
    created_at: string
    updated_at: string
}

// Appointment
export interface Appointment {
    id: string
    appointment_number: string
    patient_id: string
    doctor_id: string
    service_id?: string
    appointment_date: string
    appointment_time: string
    duration_minutes: number
    status: AppointmentStatus
    notes?: string
    reason_for_visit?: string
    created_by?: string
    created_at: string
    updated_at: string
    // Relations
    patient?: Patient
    doctor?: StaffProfile
    service?: Service
}

// Service
export interface Service {
    id: string
    name: string
    code?: string
    description?: string
    category?: string
    price: number
    duration_minutes: number
    is_active: boolean
    created_at: string
    updated_at: string
}

// Queue
export interface Queue {
    id: string
    queue_number: number
    patient_id: string
    appointment_id?: string
    doctor_id?: string
    room_id?: string
    status: QueueStatus
    priority: number
    queue_date: string
    called_at?: string
    serving_started_at?: string
    completed_at?: string
    notes?: string
    created_at: string
    updated_at: string
    // Relations
    patient?: Patient
    doctor?: StaffProfile
    room?: Room
}

// Room
export interface Room {
    id: string
    name: string
    room_number: string
    type?: string
    capacity: number
    is_available: boolean
    created_at: string
    updated_at: string
}

// Consultation
export interface Consultation {
    id: string
    consultation_number: string
    patient_id: string
    doctor_id: string
    appointment_id?: string
    consultation_date: string
    chief_complaint?: string
    symptoms?: string
    vital_signs?: Record<string, any>
    diagnosis?: string
    treatment_plan?: string
    notes?: string
    follow_up_date?: string
    created_at: string
    updated_at: string
    // Relations
    patient?: Patient
    doctor?: StaffProfile
}

// Medicine
export interface Medicine {
    id: string
    name: string
    generic_name?: string
    brand_name?: string
    category?: string
    form?: string
    strength?: string
    unit?: string
    manufacturer?: string
    description?: string
    price_per_unit?: number
    current_stock: number
    reorder_level: number
    is_active: boolean
    created_at: string
    updated_at: string
}

// Prescription
export interface Prescription {
    id: string
    prescription_number: string
    patient_id: string
    doctor_id: string
    consultation_id?: string
    prescription_date: string
    notes?: string
    created_at: string
    updated_at: string
    // Relations
    patient?: Patient
    doctor?: StaffProfile
    items?: PrescriptionItem[]
}

// Prescription Item
export interface PrescriptionItem {
    id: string
    prescription_id: string
    medicine_id: string
    quantity: number
    dosage?: string
    frequency?: string
    duration?: string
    instructions?: string
    created_at: string
    // Relations
    medicine?: Medicine
}

// Invoice
export interface Invoice {
    id: string
    invoice_number: string
    patient_id: string
    consultation_id?: string
    invoice_date: string
    due_date?: string
    subtotal: number
    discount_percentage: number
    discount_amount: number
    tax_percentage: number
    tax_amount: number
    total_amount: number
    paid_amount: number
    balance: number
    status: InvoiceStatus
    notes?: string
    created_by?: string
    created_at: string
    updated_at: string
    // Relations
    patient?: Patient
    items?: InvoiceItem[]
}

// Invoice Item
export interface InvoiceItem {
    id: string
    invoice_id: string
    item_type: string
    item_id?: string
    description: string
    quantity: number
    unit_price: number
    total_price: number
    created_at: string
}

// Payment
export interface Payment {
    id: string
    payment_number: string
    invoice_id: string
    patient_id: string
    amount: number
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    transaction_id?: string
    stripe_payment_intent_id?: string
    payment_date: string
    notes?: string
    received_by?: string
    created_at: string
    updated_at: string
}

// Notification
export interface Notification {
    id: string
    user_id: string
    title: string
    message: string
    type?: string
    is_read: boolean
    action_url?: string
    created_at: string
}

// Dashboard Stats
export interface DashboardStats {
    total_patients: number
    today_appointments: number
    pending_queue: number
    today_revenue: number
    low_stock_medicines: number
    unpaid_invoices: number
}

// Form Types
export interface LoginForm {
    email: string
    password: string
}

export interface RegisterForm {
    email: string
    password: string
    confirmPassword: string
    firstName: string
    lastName: string
    role: UserRole
}

export interface PatientForm {
    first_name: string
    last_name: string
    email?: string
    phone: string
    gender?: Gender
    date_of_birth: string
    blood_group?: string
    address?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
    emergency_contact_name?: string
    emergency_contact_phone?: string
    emergency_contact_relation?: string
    medical_history?: string
    allergies?: string
    chronic_conditions?: string
}

export interface AppointmentForm {
    patient_id: string
    doctor_id: string
    service_id?: string
    appointment_date: string
    appointment_time: string
    duration_minutes?: number
    reason_for_visit?: string
    notes?: string
}
