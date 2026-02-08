"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
    Calendar, Clock, User, Loader2, ArrowLeft, Search,
    Stethoscope, FileText
} from "lucide-react"
import Link from "next/link"

interface Patient {
    id: string
    first_name: string
    last_name: string
    phone: string
    patient_number: string
}

interface Doctor {
    id: string
    first_name: string
    last_name: string
    specialization: string | null
}

interface Service {
    id: string
    name: string
    price: number
    duration_minutes: number
}

export default function NewAppointmentPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const preselectedPatient = searchParams.get("patient")

    const [loading, setLoading] = useState(false)
    const [patients, setPatients] = useState<Patient[]>([])
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [services, setServices] = useState<Service[]>([])
    const [patientSearch, setPatientSearch] = useState("")
    const [showPatientDropdown, setShowPatientDropdown] = useState(false)
    const [availableSlots, setAvailableSlots] = useState<string[]>([])

    const [formData, setFormData] = useState({
        patient_id: preselectedPatient || "",
        doctor_id: "",
        service_id: "",
        appointment_date: "",
        appointment_time: "",
        duration_minutes: 30,
        reason_for_visit: "",
        notes: "",
    })

    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

    useEffect(() => {
        fetchDoctors()
        fetchServices()
        generateTimeSlots() // Generate time slots immediately
        if (preselectedPatient) {
            fetchPatientById(preselectedPatient)
        }
    }, [preselectedPatient])

    useEffect(() => {
        if (patientSearch.length >= 2) {
            searchPatients()
        }
    }, [patientSearch])

    // Regenerate if date changes (for future availability checking)
    useEffect(() => {
        if (formData.appointment_date) {
            generateTimeSlots()
        }
    }, [formData.appointment_date])

    const fetchPatientById = async (id: string) => {
        const supabase = createClient()
        const { data } = await supabase
            .from("patients")
            .select("id, first_name, last_name, phone, patient_number")
            .eq("id", id)
            .single()
        if (data) {
            setSelectedPatient(data)
            setFormData(prev => ({ ...prev, patient_id: data.id }))
        }
    }

    const searchPatients = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from("patients")
            .select("id, first_name, last_name, phone, patient_number")
            .or(`first_name.ilike.%${patientSearch}%,last_name.ilike.%${patientSearch}%,phone.ilike.%${patientSearch}%`)
            .limit(10)
        setPatients(data || [])
    }

    const fetchDoctors = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from("staff_profiles")
            .select("id, first_name, last_name, specialization")
            .eq("role", "doctor")
            .eq("is_active", true)
        setDoctors(data || [])
    }

    const fetchServices = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from("services")
            .select("*")
            .eq("is_active", true)
            .order("name")
        setServices(data || [])
    }

    const generateTimeSlots = () => {
        const slots = []
        for (let hour = 9; hour < 18; hour++) {
            for (let min = 0; min < 60; min += 30) {
                const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
                slots.push(time)
            }
        }
        setAvailableSlots(slots)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const supabase = createClient()
            const { error } = await supabase.from("appointments").insert({
                patient_id: formData.patient_id,
                doctor_id: formData.doctor_id,
                service_id: formData.service_id || null,
                appointment_date: formData.appointment_date,
                appointment_time: formData.appointment_time,
                duration_minutes: formData.duration_minutes,
                status: "scheduled",
                reason_for_visit: formData.reason_for_visit,
                notes: formData.notes,
            })

            if (error) throw error
            router.push("/appointments")
        } catch (error) {
            console.error("Error creating appointment:", error)
            alert("Failed to create appointment")
        } finally {
            setLoading(false)
        }
    }

    const selectPatient = (patient: Patient) => {
        setSelectedPatient(patient)
        setFormData(prev => ({ ...prev, patient_id: patient.id }))
        setPatientSearch("")
        setShowPatientDropdown(false)
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/appointments" className="p-2 hover:bg-accent rounded-lg">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">New Appointment</h1>
                    <p className="text-muted-foreground">Schedule a new patient appointment</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-card rounded-xl border p-6 space-y-6">
                {/* Patient Selection */}
                <div>
                    <label className="block text-sm font-medium mb-2">Patient *</label>
                    {selectedPatient ? (
                        <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">{selectedPatient.first_name} {selectedPatient.last_name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedPatient.patient_number} • {selectedPatient.phone}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setSelectedPatient(null); setFormData(prev => ({ ...prev, patient_id: "" })) }}
                                className="text-sm text-primary hover:underline"
                            >
                                Change
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={patientSearch}
                                onChange={(e) => { setPatientSearch(e.target.value); setShowPatientDropdown(true) }}
                                onFocus={() => setShowPatientDropdown(true)}
                                placeholder="Search patient by name or phone..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background"
                            />
                            {showPatientDropdown && patients.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {patients.map(patient => (
                                        <button
                                            key={patient.id}
                                            type="button"
                                            onClick={() => selectPatient(patient)}
                                            className="w-full px-4 py-3 text-left hover:bg-accent flex items-center gap-3"
                                        >
                                            <User className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{patient.first_name} {patient.last_name}</p>
                                                <p className="text-sm text-muted-foreground">{patient.phone}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Doctor & Service */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Doctor *</label>
                        <select
                            value={formData.doctor_id}
                            onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg border bg-background"
                            required
                        >
                            <option value="">Select Doctor</option>
                            {doctors.map(doctor => (
                                <option key={doctor.id} value={doctor.id}>
                                    Dr. {doctor.first_name} {doctor.last_name} {doctor.specialization && `(${doctor.specialization})`}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Service</label>
                        <select
                            value={formData.service_id}
                            onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg border bg-background"
                        >
                            <option value="">Select Service (Optional)</option>
                            {services.map(service => (
                                <option key={service.id} value={service.id}>
                                    {service.name} - RM {service.price}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Date *</label>
                        <input
                            type="date"
                            value={formData.appointment_date}
                            onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2.5 rounded-lg border bg-background"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Time *</label>
                        <select
                            value={formData.appointment_time}
                            onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg border bg-background"
                            required
                        >
                            <option value="">Select Time</option>
                            {availableSlots.map(slot => (
                                <option key={slot} value={slot}>{slot}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Duration</label>
                        <select
                            value={formData.duration_minutes}
                            onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                            className="w-full px-4 py-2.5 rounded-lg border bg-background"
                        >
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={45}>45 minutes</option>
                            <option value={60}>1 hour</option>
                        </select>
                    </div>
                </div>

                {/* Reason & Notes */}
                <div>
                    <label className="block text-sm font-medium mb-2">Reason for Visit</label>
                    <input
                        type="text"
                        value={formData.reason_for_visit}
                        onChange={(e) => setFormData({ ...formData, reason_for_visit: e.target.value })}
                        placeholder="e.g., Regular checkup, Follow-up, etc."
                        className="w-full px-4 py-2.5 rounded-lg border bg-background"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Additional Notes</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-lg border bg-background"
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Link href="/appointments" className="px-6 py-2.5 border rounded-lg hover:bg-accent">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading || !formData.patient_id || !formData.doctor_id || !formData.appointment_date || !formData.appointment_time}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? "Creating..." : "Create Appointment"}
                    </button>
                </div>
            </form>
        </div>
    )
}
