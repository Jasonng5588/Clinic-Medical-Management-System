"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/auth-store"
import {
    Stethoscope, ArrowLeft, Loader2, Search, User, Save,
    Plus, Trash2, Pill
} from "lucide-react"
import Link from "next/link"
import { AIDiagnosisSuggestion } from "@/components/ai/diagnosis-suggestion"

interface Patient {
    id: string
    patient_number: string
    first_name: string
    last_name: string
    phone: string
    allergies: string | null
    chronic_conditions: string | null
}

interface Prescription {
    medicine_name: string
    dosage: string
    frequency: string
    duration: string
    instructions: string
}

export default function NewConsultationPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user, role } = useAuthStore()
    const appointmentId = searchParams.get("appointment")

    const [loading, setLoading] = useState(false)
    const [patients, setPatients] = useState<Patient[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

    const [formData, setFormData] = useState({
        subjective: "",
        objective: "",
        assessment: "",
        plan: "",
        diagnosis: "",
        symptoms: "",
        notes: "",
    })

    const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
    const [showAddPrescription, setShowAddPrescription] = useState(false)
    const [newPrescription, setNewPrescription] = useState<Prescription>({
        medicine_name: "",
        dosage: "",
        frequency: "1 x daily",
        duration: "7 days",
        instructions: "",
    })

    useEffect(() => {
        if (searchTerm.length > 2) searchPatients()
        else setPatients([])
    }, [searchTerm])

    const searchPatients = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from("patients")
            .select("id, patient_number, first_name, last_name, phone, allergies, chronic_conditions")
            .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,patient_number.ilike.%${searchTerm}%`)
            .eq("is_active", true)
            .limit(10)
        setPatients(data || [])
    }

    const addPrescription = () => {
        if (!newPrescription.medicine_name || !newPrescription.dosage) return
        setPrescriptions([...prescriptions, newPrescription])
        setNewPrescription({ medicine_name: "", dosage: "", frequency: "1 x daily", duration: "7 days", instructions: "" })
        setShowAddPrescription(false)
    }

    const removePrescription = (index: number) => {
        setPrescriptions(prescriptions.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedPatient) { alert("Please select a patient"); return }

        setLoading(true)
        try {
            const supabase = createClient()

            // Generate consultation number
            const consultationNumber = `CON${Date.now().toString().slice(-10)}`

            const { data, error } = await supabase.from("consultations").insert({
                consultation_number: consultationNumber,
                patient_id: selectedPatient.id,
                doctor_id: user?.id,
                appointment_id: appointmentId || null,
                subjective: formData.subjective || null,
                objective: formData.objective || null,
                assessment: formData.assessment || null,
                plan: formData.plan || null,
                diagnosis: formData.diagnosis || null,
                symptoms: formData.symptoms || null,
                notes: formData.notes || null,
                prescriptions: prescriptions.length > 0 ? prescriptions : null,
            }).select().single()

            if (error) throw error

            // Audit log
            await supabase.from("audit_logs").insert({
                action: "consultation_created",
                table_name: "consultations",
                record_id: data.id,
                user_id: user?.id,
            })

            alert("Consultation saved successfully!")
            router.push("/consultations")
        } catch (error: any) {
            console.error("Error:", error)
            alert(error.message || "Failed to save consultation")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/consultations" className="p-2 hover:bg-accent rounded-lg">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">New Consultation</h1>
                    <p className="text-muted-foreground">Record patient consultation with SOAP notes</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Patient Selection */}
                <div className="bg-card rounded-xl border p-6">
                    <h2 className="text-lg font-semibold mb-4">Patient Information</h2>
                    {selectedPatient ? (
                        <div className="flex items-start gap-4 p-4 bg-accent/50 rounded-lg">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-lg">{selectedPatient.first_name} {selectedPatient.last_name}</p>
                                <p className="text-sm text-muted-foreground">{selectedPatient.patient_number} • {selectedPatient.phone}</p>
                                {selectedPatient.allergies && (
                                    <p className="text-sm text-red-600 mt-2">⚠️ Allergies: {selectedPatient.allergies}</p>
                                )}
                                {selectedPatient.chronic_conditions && (
                                    <p className="text-sm text-orange-600">⚠️ Conditions: {selectedPatient.chronic_conditions}</p>
                                )}
                            </div>
                            <button type="button" onClick={() => setSelectedPatient(null)} className="text-sm text-primary hover:underline">
                                Change
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search patient by name, phone, or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background"
                            />
                            {patients.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {patients.map((p) => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => { setSelectedPatient(p); setPatients([]) }}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-accent text-left"
                                        >
                                            <User className="w-5 h-5 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{p.first_name} {p.last_name}</p>
                                                <p className="text-sm text-muted-foreground">{p.patient_number}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* SOAP Notes */}
                <div className="bg-card rounded-xl border p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Stethoscope className="w-5 h-5" />
                        SOAP Notes
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-blue-600">Subjective</label>
                            <textarea
                                value={formData.subjective}
                                onChange={(e) => setFormData({ ...formData, subjective: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background focus:ring-2 focus:ring-blue-500"
                                rows={4}
                                placeholder="Patient's symptoms, complaints, history..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-green-600">Objective</label>
                            <textarea
                                value={formData.objective}
                                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background focus:ring-2 focus:ring-green-500"
                                rows={4}
                                placeholder="Vital signs, physical examination findings..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-orange-600">Assessment</label>
                            <textarea
                                value={formData.assessment}
                                onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background focus:ring-2 focus:ring-orange-500"
                                rows={4}
                                placeholder="Diagnosis, differential diagnoses..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-purple-600">Plan</label>
                            <textarea
                                value={formData.plan}
                                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background focus:ring-2 focus:ring-purple-500"
                                rows={4}
                                placeholder="Treatment plan, follow-up, referrals..."
                            />
                        </div>
                    </div>
                </div>

                {/* Diagnosis & Symptoms */}
                <div className="bg-card rounded-xl border p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Diagnosis</label>
                            <input
                                type="text"
                                value={formData.diagnosis}
                                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background"
                                placeholder="Primary diagnosis"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Symptoms</label>
                            <input
                                type="text"
                                value={formData.symptoms}
                                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background"
                                placeholder="Key symptoms (e.g., fever, cough, headache)"
                            />
                        </div>
                    </div>
                </div>

                {/* AI Diagnosis Suggestion */}
                {(formData.symptoms || formData.subjective) && (
                    <AIDiagnosisSuggestion
                        symptoms={`${formData.symptoms} ${formData.subjective}`}
                        onSelectDiagnosis={(diagnosis) => setFormData({ ...formData, diagnosis })}
                        onSelectMedication={(med) => {
                            setNewPrescription({ ...newPrescription, medicine_name: med })
                            setShowAddPrescription(true)
                        }}
                    />
                )}

                {/* Prescriptions */}
                <div className="bg-card rounded-xl border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Pill className="w-5 h-5" />
                            Prescriptions
                        </h2>
                        <button
                            type="button"
                            onClick={() => setShowAddPrescription(true)}
                            className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                            <Plus className="w-4 h-4" /> Add Prescription
                        </button>
                    </div>

                    {prescriptions.length > 0 && (
                        <div className="space-y-3 mb-4">
                            {prescriptions.map((rx, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                                    <div>
                                        <p className="font-medium">{rx.medicine_name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {rx.dosage} • {rx.frequency} • {rx.duration}
                                        </p>
                                        {rx.instructions && <p className="text-sm">{rx.instructions}</p>}
                                    </div>
                                    <button type="button" onClick={() => removePrescription(i)} className="p-2 hover:bg-red-100 rounded">
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {showAddPrescription && (
                        <div className="p-4 border rounded-lg bg-accent/30 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    value={newPrescription.medicine_name}
                                    onChange={(e) => setNewPrescription({ ...newPrescription, medicine_name: e.target.value })}
                                    placeholder="Medicine name"
                                    className="px-3 py-2 rounded-lg border bg-background"
                                />
                                <input
                                    type="text"
                                    value={newPrescription.dosage}
                                    onChange={(e) => setNewPrescription({ ...newPrescription, dosage: e.target.value })}
                                    placeholder="Dosage (e.g., 500mg)"
                                    className="px-3 py-2 rounded-lg border bg-background"
                                />
                                <select
                                    value={newPrescription.frequency}
                                    onChange={(e) => setNewPrescription({ ...newPrescription, frequency: e.target.value })}
                                    className="px-3 py-2 rounded-lg border bg-background"
                                >
                                    <option>1 x daily</option>
                                    <option>2 x daily</option>
                                    <option>3 x daily</option>
                                    <option>4 x daily</option>
                                    <option>Every 4 hours</option>
                                    <option>Every 6 hours</option>
                                    <option>As needed</option>
                                </select>
                                <select
                                    value={newPrescription.duration}
                                    onChange={(e) => setNewPrescription({ ...newPrescription, duration: e.target.value })}
                                    className="px-3 py-2 rounded-lg border bg-background"
                                >
                                    <option>3 days</option>
                                    <option>5 days</option>
                                    <option>7 days</option>
                                    <option>14 days</option>
                                    <option>30 days</option>
                                    <option>Ongoing</option>
                                </select>
                            </div>
                            <input
                                type="text"
                                value={newPrescription.instructions}
                                onChange={(e) => setNewPrescription({ ...newPrescription, instructions: e.target.value })}
                                placeholder="Special instructions (e.g., After meals)"
                                className="w-full px-3 py-2 rounded-lg border bg-background"
                            />
                            <div className="flex gap-2">
                                <button type="button" onClick={addPrescription} className="px-4 py-2 bg-primary text-white rounded-lg text-sm">
                                    Add
                                </button>
                                <button type="button" onClick={() => setShowAddPrescription(false)} className="px-4 py-2 border rounded-lg text-sm">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {prescriptions.length === 0 && !showAddPrescription && (
                        <p className="text-center text-muted-foreground py-4">No prescriptions added</p>
                    )}
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <Link href="/consultations" className="px-6 py-2.5 border rounded-lg hover:bg-accent">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading || !selectedPatient}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {loading ? "Saving..." : "Save Consultation"}
                    </button>
                </div>
            </form>
        </div>
    )
}
