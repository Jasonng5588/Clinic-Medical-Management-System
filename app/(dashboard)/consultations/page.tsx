"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/auth-store"
import {
    Stethoscope, Search, Plus, Eye, Edit, Loader2, X, User,
    FileText, Pill, Save, Calendar, Clock, ChevronLeft, ChevronRight
} from "lucide-react"
import Link from "next/link"

interface Consultation {
    id: string
    patient_id: string
    doctor_id: string
    appointment_id: string | null
    subjective: string | null
    objective: string | null
    assessment: string | null
    plan: string | null
    diagnosis: string | null
    prescriptions: any[]
    notes: string | null
    created_at: string
    patient?: { first_name: string; last_name: string; patient_number: string }
    doctor?: { first_name: string; last_name: string }
}

export default function ConsultationsPage() {
    const { user, role } = useAuthStore()
    const [consultations, setConsultations] = useState<Consultation[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [showNewModal, setShowNewModal] = useState(false)
    const [showViewModal, setShowViewModal] = useState(false)
    const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
    const [page, setPage] = useState(1)

    useEffect(() => { fetchConsultations() }, [searchTerm, page])

    const fetchConsultations = async () => {
        setLoading(true)
        try {
            const supabase = createClient()
            let query = supabase.from("consultations")
                .select(`*, patient:patients(first_name, last_name, patient_number), doctor:staff_profiles!doctor_id(first_name, last_name)`)
                .order("created_at", { ascending: false }).range((page - 1) * 10, page * 10 - 1)

            if (role === "doctor") query = query.eq("doctor_id", user?.id)

            const { data, error } = await query
            if (error) throw error
            setConsultations(data || [])
        } catch (error) { console.error("Error:", error) }
        finally { setLoading(false) }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div><h1 className="text-2xl font-bold">Consultations</h1><p className="text-muted-foreground">SOAP notes and patient consultations</p></div>
                {(role === "doctor" || role === "super_admin") && (
                    <button onClick={() => setShowNewModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90"><Plus className="w-4 h-4" />New Consultation</button>
                )}
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Search patient..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background" />
            </div>

            <div className="bg-card rounded-xl border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-accent/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium">Patient</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Doctor</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Diagnosis</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                            <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr><td colSpan={5} className="px-4 py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
                        ) : consultations.length > 0 ? consultations.map((c) => (
                            <tr key={c.id} className="hover:bg-accent/30">
                                <td className="px-4 py-3">
                                    <p className="font-medium">{c.patient?.first_name} {c.patient?.last_name}</p>
                                    <p className="text-sm text-muted-foreground">{c.patient?.patient_number}</p>
                                </td>
                                <td className="px-4 py-3">Dr. {c.doctor?.first_name} {c.doctor?.last_name}</td>
                                <td className="px-4 py-3 max-w-xs truncate">{c.diagnosis || "-"}</td>
                                <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-1">
                                        <button onClick={() => { setSelectedConsultation(c); setShowViewModal(true) }} className="p-2 hover:bg-accent rounded-lg"><Eye className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No consultations found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showNewModal && <NewConsultationModal onClose={() => setShowNewModal(false)} onSuccess={() => { setShowNewModal(false); fetchConsultations() }} />}
            {selectedConsultation && <ViewConsultationModal isOpen={showViewModal} consultation={selectedConsultation} onClose={() => { setShowViewModal(false); setSelectedConsultation(null) }} />}
        </div>
    )
}

// New Consultation Modal with SOAP Notes
function NewConsultationModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const { user } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [patients, setPatients] = useState<any[]>([])
    const [patientSearch, setPatientSearch] = useState("")
    const [selectedPatient, setSelectedPatient] = useState<any>(null)
    const [formData, setFormData] = useState({
        subjective: "", objective: "", assessment: "", plan: "", diagnosis: "", notes: "",
        prescriptions: [{ medicine: "", dosage: "", frequency: "", duration: "", instructions: "" }]
    })

    useEffect(() => {
        if (patientSearch.length >= 2) {
            const search = async () => {
                const supabase = createClient()
                const { data } = await supabase.from("patients").select("id, first_name, last_name, patient_number").or(`first_name.ilike.%${patientSearch}%,last_name.ilike.%${patientSearch}%`).limit(5)
                setPatients(data || [])
            }
            search()
        }
    }, [patientSearch])

    const addPrescription = () => {
        setFormData({ ...formData, prescriptions: [...formData.prescriptions, { medicine: "", dosage: "", frequency: "", duration: "", instructions: "" }] })
    }

    const updatePrescription = (index: number, field: string, value: string) => {
        const updated = [...formData.prescriptions]
        updated[index] = { ...updated[index], [field]: value }
        setFormData({ ...formData, prescriptions: updated })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedPatient) { alert("Please select a patient"); return }

        setLoading(true)
        try {
            const supabase = createClient()
            const { error } = await supabase.from("consultations").insert({
                patient_id: selectedPatient.id,
                doctor_id: user?.id,
                subjective: formData.subjective,
                objective: formData.objective,
                assessment: formData.assessment,
                plan: formData.plan,
                diagnosis: formData.diagnosis,
                prescriptions: formData.prescriptions.filter(p => p.medicine),
                notes: formData.notes,
            })
            if (error) throw error

            await supabase.from("audit_logs").insert({ action: "consultation_created", table_name: "consultations", user_id: user?.id })
            alert("Consultation saved!")
            onSuccess()
        } catch (error) { alert("Failed to save consultation") }
        finally { setLoading(false) }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-card rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">New Consultation - SOAP Notes</h2>
                    <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Patient Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Patient *</label>
                        {selectedPatient ? (
                            <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                                <div className="flex items-center gap-3"><User className="w-5 h-5" /><div><p className="font-medium">{selectedPatient.first_name} {selectedPatient.last_name}</p><p className="text-sm text-muted-foreground">{selectedPatient.patient_number}</p></div></div>
                                <button type="button" onClick={() => setSelectedPatient(null)} className="text-sm text-primary">Change</button>
                            </div>
                        ) : (
                            <div className="relative">
                                <input type="text" value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)} placeholder="Search patient..." className="w-full px-4 py-2.5 rounded-lg border bg-background" />
                                {patients.length > 0 && patientSearch && (
                                    <div className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg">
                                        {patients.map(p => (
                                            <button key={p.id} type="button" onClick={() => { setSelectedPatient(p); setPatientSearch(""); setPatients([]) }} className="w-full px-4 py-3 text-left hover:bg-accent">{p.first_name} {p.last_name} - {p.patient_number}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* SOAP Notes */}
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium mb-2">Subjective (S)</label><textarea value={formData.subjective} onChange={(e) => setFormData({ ...formData, subjective: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" rows={4} placeholder="Patient symptoms..." /></div>
                        <div><label className="block text-sm font-medium mb-2">Objective (O)</label><textarea value={formData.objective} onChange={(e) => setFormData({ ...formData, objective: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" rows={4} placeholder="Exam findings..." /></div>
                        <div><label className="block text-sm font-medium mb-2">Assessment (A)</label><textarea value={formData.assessment} onChange={(e) => setFormData({ ...formData, assessment: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" rows={4} placeholder="Diagnosis..." /></div>
                        <div><label className="block text-sm font-medium mb-2">Plan (P)</label><textarea value={formData.plan} onChange={(e) => setFormData({ ...formData, plan: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" rows={4} placeholder="Treatment plan..." /></div>
                    </div>

                    <div><label className="block text-sm font-medium mb-2">Diagnosis</label><input type="text" value={formData.diagnosis} onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" /></div>

                    {/* Prescriptions */}
                    <div>
                        <div className="flex items-center justify-between mb-2"><label className="text-sm font-medium">Prescriptions</label><button type="button" onClick={addPrescription} className="text-sm text-primary">+ Add</button></div>
                        <div className="space-y-2">
                            {formData.prescriptions.map((p, i) => (
                                <div key={i} className="grid grid-cols-5 gap-2">
                                    <input value={p.medicine} onChange={(e) => updatePrescription(i, "medicine", e.target.value)} placeholder="Medicine" className="px-3 py-2 rounded-lg border bg-background" />
                                    <input value={p.dosage} onChange={(e) => updatePrescription(i, "dosage", e.target.value)} placeholder="Dosage" className="px-3 py-2 rounded-lg border bg-background" />
                                    <input value={p.frequency} onChange={(e) => updatePrescription(i, "frequency", e.target.value)} placeholder="Frequency" className="px-3 py-2 rounded-lg border bg-background" />
                                    <input value={p.duration} onChange={(e) => updatePrescription(i, "duration", e.target.value)} placeholder="Duration" className="px-3 py-2 rounded-lg border bg-background" />
                                    <input value={p.instructions} onChange={(e) => updatePrescription(i, "instructions", e.target.value)} placeholder="Instructions" className="px-3 py-2 rounded-lg border bg-background" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 border rounded-lg">Cancel</button>
                        <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg disabled:opacity-50">{loading && <Loader2 className="w-4 h-4 animate-spin" />}{loading ? "Saving..." : "Save"}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function ViewConsultationModal({ isOpen, consultation, onClose }: { isOpen: boolean; consultation: Consultation; onClose: () => void }) {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-card rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between"><h2 className="text-xl font-bold">Consultation</h2><button onClick={onClose} className="p-2 hover:bg-accent rounded-lg"><X className="w-5 h-5" /></button></div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between p-4 bg-accent rounded-lg"><div><p className="font-medium">{consultation.patient?.first_name} {consultation.patient?.last_name}</p></div><div className="text-right"><p className="text-sm text-muted-foreground">{new Date(consultation.created_at).toLocaleDateString()}</p></div></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg"><h4 className="font-semibold text-primary mb-2">Subjective</h4><p className="text-sm">{consultation.subjective || "-"}</p></div>
                        <div className="p-4 border rounded-lg"><h4 className="font-semibold text-primary mb-2">Objective</h4><p className="text-sm">{consultation.objective || "-"}</p></div>
                        <div className="p-4 border rounded-lg"><h4 className="font-semibold text-primary mb-2">Assessment</h4><p className="text-sm">{consultation.assessment || "-"}</p></div>
                        <div className="p-4 border rounded-lg"><h4 className="font-semibold text-primary mb-2">Plan</h4><p className="text-sm">{consultation.plan || "-"}</p></div>
                    </div>
                    {consultation.diagnosis && <div className="p-4 bg-primary/10 rounded-lg"><h4 className="font-semibold">Diagnosis</h4><p>{consultation.diagnosis}</p></div>}
                    {consultation.prescriptions?.length > 0 && <div><h4 className="font-semibold mb-3">Prescriptions</h4>{consultation.prescriptions.map((p: any, i: number) => <div key={i} className="p-3 border rounded-lg flex items-center gap-4 mb-2"><Pill className="w-5 h-5 text-primary" /><div><p className="font-medium">{p.medicine}</p><p className="text-sm text-muted-foreground">{p.dosage} - {p.frequency}</p></div></div>)}</div>}
                </div>
            </div>
        </div>
    )
}
