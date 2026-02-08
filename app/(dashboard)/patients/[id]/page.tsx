"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
    User, ArrowLeft, Loader2, Phone, Mail, MapPin, Calendar,
    Heart, AlertCircle, FileText, Clock, Edit, Trash2
} from "lucide-react"
import Link from "next/link"

interface Patient {
    id: string
    patient_number: string
    first_name: string
    last_name: string
    email: string | null
    phone: string
    gender: string | null
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
}

interface Appointment {
    id: string
    appointment_date: string
    appointment_time: string
    status: string
    doctor?: { first_name: string; last_name: string }
}

interface Consultation {
    id: string
    diagnosis: string | null
    symptoms: string | null
    created_at: string
    doctor?: { first_name: string; last_name: string }
}

export default function PatientDetailPage() {
    const params = useParams()
    const router = useRouter()
    const patientId = params.id as string

    const [patient, setPatient] = useState<Patient | null>(null)
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [consultations, setConsultations] = useState<Consultation[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<"info" | "appointments" | "history" | "billing">("info")

    useEffect(() => {
        if (patientId) {
            fetchPatientDetails()
        }
    }, [patientId])

    const fetchPatientDetails = async () => {
        setLoading(true)
        try {
            const supabase = createClient()

            // Fetch patient
            const { data: patientData, error: patientError } = await supabase
                .from("patients")
                .select("*")
                .eq("id", patientId)
                .single()

            if (patientError) throw patientError
            setPatient(patientData)

            // Fetch recent appointments
            const { data: appointmentsData } = await supabase
                .from("appointments")
                .select("id, appointment_date, appointment_time, status, doctor:staff_profiles!doctor_id(first_name, last_name)")
                .eq("patient_id", patientId)
                .order("appointment_date", { ascending: false })
                .limit(10)
            setAppointments(appointmentsData || [])

            // Fetch consultations
            const { data: consultationsData } = await supabase
                .from("consultations")
                .select("id, diagnosis, symptoms, created_at, doctor:staff_profiles!doctor_id(first_name, last_name)")
                .eq("patient_id", patientId)
                .order("created_at", { ascending: false })
                .limit(10)
            setConsultations(consultationsData || [])

        } catch (error) {
            console.error("Error fetching patient:", error)
            alert("Failed to load patient details")
            router.push("/patients")
        } finally {
            setLoading(false)
        }
    }

    const calculateAge = (dob: string) => {
        const birthDate = new Date(dob)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const m = today.getMonth() - birthDate.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
        return age
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        )
    }

    if (!patient) {
        return (
            <div className="text-center py-20">
                <p>Patient not found</p>
                <Link href="/patients" className="text-primary hover:underline">
                    Back to patients
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/patients" className="p-2 hover:bg-accent rounded-lg">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">{patient.first_name} {patient.last_name}</h1>
                    <p className="text-muted-foreground">Patient ID: {patient.patient_number}</p>
                </div>
                <div className="flex gap-2">
                    <Link
                        href={`/appointments/new?patient=${patient.id}`}
                        className="px-4 py-2 border rounded-lg hover:bg-accent"
                    >
                        Book Appointment
                    </Link>
                    <Link
                        href={`/queue/add?patient=${patient.id}`}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                        Add to Queue
                    </Link>
                </div>
            </div>

            {/* Patient Summary Card */}
            <div className="bg-card rounded-xl border p-6">
                <div className="flex items-start gap-6">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-10 h-10 text-primary" />
                    </div>
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Age</p>
                            <p className="font-medium">{calculateAge(patient.date_of_birth)} years</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Gender</p>
                            <p className="font-medium capitalize">{patient.gender || "-"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Blood Group</p>
                            <p className="font-medium">{patient.blood_group || "-"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${patient.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                }`}>
                                {patient.is_active ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {(patient.allergies || patient.chronic_conditions) && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {patient.allergies && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm">
                                <AlertCircle className="w-4 h-4" />
                                Allergies: {patient.allergies}
                            </div>
                        )}
                        {patient.chronic_conditions && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm">
                                <Heart className="w-4 h-4" />
                                {patient.chronic_conditions}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="border-b">
                <nav className="flex gap-4">
                    {(["info", "appointments", "history", "billing"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 border-b-2 -mb-px transition-colors ${activeTab === tab
                                    ? "border-primary text-primary font-medium"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {tab === "info" && "Information"}
                            {tab === "appointments" && "Appointments"}
                            {tab === "history" && "Medical History"}
                            {tab === "billing" && "Billing"}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === "info" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact */}
                    <div className="bg-card rounded-xl border p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Contact Information
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span>{patient.phone}</span>
                            </div>
                            {patient.email && (
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <span>{patient.email}</span>
                                </div>
                            )}
                            {patient.address && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                                    <span>
                                        {patient.address}<br />
                                        {[patient.city, patient.state, patient.postal_code].filter(Boolean).join(", ")}<br />
                                        {patient.country}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="bg-card rounded-xl border p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Emergency Contact
                        </h3>
                        {patient.emergency_contact_name ? (
                            <div className="space-y-2">
                                <p className="font-medium">{patient.emergency_contact_name}</p>
                                <p className="text-sm text-muted-foreground">{patient.emergency_contact_relation}</p>
                                <p>{patient.emergency_contact_phone}</p>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No emergency contact on file</p>
                        )}
                    </div>

                    {/* Medical History */}
                    <div className="bg-card rounded-xl border p-6 md:col-span-2">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Medical History
                        </h3>
                        <p className="text-sm whitespace-pre-wrap">
                            {patient.medical_history || "No medical history recorded"}
                        </p>
                    </div>
                </div>
            )}

            {activeTab === "appointments" && (
                <div className="bg-card rounded-xl border">
                    <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="font-semibold">Appointment History</h3>
                        <Link href={`/appointments/new?patient=${patient.id}`} className="text-sm text-primary hover:underline">
                            Book New
                        </Link>
                    </div>
                    {appointments.length > 0 ? (
                        <div className="divide-y">
                            {appointments.map((apt) => (
                                <div key={apt.id} className="p-4 flex items-center justify-between hover:bg-accent/50">
                                    <div className="flex items-center gap-4">
                                        <Calendar className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{new Date(apt.appointment_date).toLocaleDateString()}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {apt.appointment_time.slice(0, 5)} • Dr. {apt.doctor?.first_name} {apt.doctor?.last_name}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${apt.status === "completed" ? "bg-green-100 text-green-700" :
                                            apt.status === "scheduled" ? "bg-blue-100 text-blue-700" :
                                                apt.status === "cancelled" ? "bg-red-100 text-red-700" :
                                                    "bg-gray-100 text-gray-700"
                                        }`}>
                                        {apt.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="p-8 text-center text-muted-foreground">No appointments found</p>
                    )}
                </div>
            )}

            {activeTab === "history" && (
                <div className="bg-card rounded-xl border">
                    <div className="p-4 border-b">
                        <h3 className="font-semibold">Consultation History</h3>
                    </div>
                    {consultations.length > 0 ? (
                        <div className="divide-y">
                            {consultations.map((consult) => (
                                <div key={consult.id} className="p-4 hover:bg-accent/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(consult.created_at).toLocaleDateString()} • Dr. {consult.doctor?.first_name} {consult.doctor?.last_name}
                                        </p>
                                    </div>
                                    {consult.diagnosis && (
                                        <p className="font-medium">{consult.diagnosis}</p>
                                    )}
                                    {consult.symptoms && (
                                        <p className="text-sm text-muted-foreground">{consult.symptoms}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="p-8 text-center text-muted-foreground">No consultation history</p>
                    )}
                </div>
            )}

            {activeTab === "billing" && (
                <div className="bg-card rounded-xl border p-8 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">View patient invoices and payment history</p>
                    <Link href={`/invoices?patient=${patient.id}`} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 inline-block">
                        View Invoices
                    </Link>
                </div>
            )}
        </div>
    )
}
