"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import {
    Calendar, Clock, User, Mail, Phone, MapPin,
    ChevronRight, ChevronLeft, Check, Loader2,
    Building2, Stethoscope, CalendarDays
} from "lucide-react"

interface Service {
    id: string
    name: string
    price: number
    duration_minutes: number
}

interface Doctor {
    id: string
    first_name: string
    last_name: string
    specialization: string
}

export default function BookingPage() {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [services, setServices] = useState<Service[]>([])
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [availableSlots, setAvailableSlots] = useState<string[]>([])

    const [formData, setFormData] = useState({
        // Patient Info
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "male",
        address: "",
        // Appointment
        serviceId: "",
        doctorId: "",
        date: "",
        time: "",
        notes: "",
    })

    useEffect(() => {
        fetchServices()
        fetchDoctors()
    }, [])

    useEffect(() => {
        if (formData.date && formData.doctorId) {
            generateTimeSlots()
        }
    }, [formData.date, formData.doctorId])

    const fetchServices = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from("services")
            .select("*")
            .eq("is_active", true)
            .order("name")
        setServices(data || [])
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

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const supabase = createClient()

            // Check if patient exists
            let patientId: string
            const { data: existingPatient } = await supabase
                .from("patients")
                .select("id")
                .eq("phone", formData.phone)
                .single()

            if (existingPatient) {
                patientId = existingPatient.id
            } else {
                // Create new patient
                const { data: newPatient, error: patientError } = await supabase
                    .from("patients")
                    .insert({
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        email: formData.email,
                        phone: formData.phone,
                        date_of_birth: formData.dateOfBirth,
                        gender: formData.gender,
                        address: formData.address,
                        is_active: true,
                    })
                    .select("id")
                    .single()

                if (patientError) throw patientError
                patientId = newPatient.id
            }

            // Create appointment
            const { error: appointmentError } = await supabase
                .from("appointments")
                .insert({
                    patient_id: patientId,
                    doctor_id: formData.doctorId,
                    service_id: formData.serviceId || null,
                    appointment_date: formData.date,
                    appointment_time: formData.time,
                    status: "scheduled",
                    notes: formData.notes,
                    reason_for_visit: formData.notes,
                })

            if (appointmentError) throw appointmentError

            setSuccess(true)
        } catch (error) {
            console.error("Booking error:", error)
            alert("Failed to book appointment. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
                <div className="bg-card rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed!</h2>
                    <p className="text-muted-foreground mb-4">
                        Your appointment has been scheduled for {formData.date} at {formData.time}.
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                        You will receive a confirmation SMS shortly.
                    </p>
                    <Link
                        href="/booking"
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Book Another Appointment
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
            {/* Header */}
            <header className="bg-card border-b">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-primary">HealthCare Plus</h1>
                            <p className="text-xs text-muted-foreground">Online Appointment Booking</p>
                        </div>
                    </div>
                    <Link href="/login" className="text-sm text-primary hover:underline">
                        Staff Login
                    </Link>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= s ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                                }`}>
                                {s}
                            </div>
                            {s < 3 && (
                                <div className={`w-20 h-1 mx-2 ${step > s ? "bg-primary" : "bg-muted"
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex justify-center gap-8 mb-8 text-sm">
                    <span className={step >= 1 ? "text-primary font-medium" : "text-muted-foreground"}>Your Info</span>
                    <span className={step >= 2 ? "text-primary font-medium" : "text-muted-foreground"}>Choose Service</span>
                    <span className={step >= 3 ? "text-primary font-medium" : "text-muted-foreground"}>Confirm</span>
                </div>

                <div className="bg-card rounded-2xl shadow-xl p-6 md:p-8 border">
                    {/* Step 1: Patient Info */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Personal Information</h2>
                                <p className="text-muted-foreground">Please enter your details to proceed with booking.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">First Name *</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Last Name *</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Phone Number *</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Date of Birth *</label>
                                    <input
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Gender</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Address</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                                    rows={2}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Service & Time */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Book Your Appointment</h2>
                                <p className="text-muted-foreground">Select your preferred service, doctor, and time.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-3">Select Service</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {services.length > 0 ? services.map((service) => (
                                        <button
                                            key={service.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, serviceId: service.id })}
                                            className={`p-4 rounded-xl border text-left transition-all ${formData.serviceId === service.id
                                                    ? "border-primary bg-primary/5 ring-2 ring-primary"
                                                    : "hover:border-primary/50"
                                                }`}
                                        >
                                            <p className="font-medium">{service.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                RM {service.price} • {service.duration_minutes} mins
                                            </p>
                                        </button>
                                    )) : (
                                        <p className="text-muted-foreground col-span-2">No services available</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-3">Select Doctor</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {doctors.length > 0 ? doctors.map((doctor) => (
                                        <button
                                            key={doctor.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, doctorId: doctor.id })}
                                            className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${formData.doctorId === doctor.id
                                                    ? "border-primary bg-primary/5 ring-2 ring-primary"
                                                    : "hover:border-primary/50"
                                                }`}
                                        >
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Stethoscope className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Dr. {doctor.first_name} {doctor.last_name}</p>
                                                <p className="text-sm text-muted-foreground">{doctor.specialization || "General"}</p>
                                            </div>
                                        </button>
                                    )) : (
                                        <p className="text-muted-foreground col-span-2">No doctors available</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Preferred Date *</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Preferred Time *</label>
                                    <select
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select time</option>
                                        {availableSlots.map((slot) => (
                                            <option key={slot} value={slot}>{slot}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Reason for Visit</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                                    rows={3}
                                    placeholder="Describe your symptoms or reason for visiting..."
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Confirmation */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Confirm Your Booking</h2>
                                <p className="text-muted-foreground">Please review your appointment details.</p>
                            </div>

                            <div className="bg-accent/50 rounded-xl p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Patient</p>
                                        <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Phone</p>
                                        <p className="font-medium">{formData.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Stethoscope className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Doctor</p>
                                        <p className="font-medium">
                                            {doctors.find(d => d.id === formData.doctorId)?.first_name || "Not selected"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CalendarDays className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Date & Time</p>
                                        <p className="font-medium">{formData.date} at {formData.time}</p>
                                    </div>
                                </div>
                                {formData.notes && (
                                    <div className="pt-4 border-t">
                                        <p className="text-sm text-muted-foreground">Notes</p>
                                        <p className="font-medium">{formData.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between mt-8 pt-6 border-t">
                        {step > 1 ? (
                            <button
                                type="button"
                                onClick={() => setStep(step - 1)}
                                className="flex items-center gap-2 px-6 py-3 rounded-lg border hover:bg-accent transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back
                            </button>
                        ) : (
                            <div />
                        )}

                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={() => setStep(step + 1)}
                                disabled={
                                    (step === 1 && (!formData.firstName || !formData.lastName || !formData.phone || !formData.dateOfBirth)) ||
                                    (step === 2 && (!formData.doctorId || !formData.date || !formData.time))
                                }
                                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Continue
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {loading ? "Booking..." : "Confirm Booking"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
