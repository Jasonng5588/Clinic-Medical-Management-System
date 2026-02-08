"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/auth-store"
import { ArrowLeft, Search, Plus, X, Loader2, Pill } from "lucide-react"
import Link from "next/link"

export default function NewPrescriptionPage() {
    const router = useRouter()
    const { user } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [patients, setPatients] = useState<any[]>([])
    const [medicines, setMedicines] = useState<any[]>([])
    const [patientSearch, setPatientSearch] = useState("")
    const [selectedPatient, setSelectedPatient] = useState<any>(null)
    const [prescriptionItems, setPrescriptionItems] = useState<any[]>([
        { medicine_id: "", medicine_name: "", dosage: "", frequency: "", duration: "", quantity: 1, instructions: "" }
    ])
    const [notes, setNotes] = useState("")

    useEffect(() => {
        fetchMedicines()
    }, [])

    useEffect(() => {
        if (patientSearch.length >= 2) {
            searchPatients()
        }
    }, [patientSearch])

    const fetchMedicines = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from("medicines")
            .select("id, name, generic_name, form, strength")
            .eq("is_active", true)
            .order("name")
        setMedicines(data || [])
    }

    const searchPatients = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from("patients")
            .select("id, first_name, last_name, phone, patient_number")
            .or(`first_name.ilike.%${patientSearch}%,last_name.ilike.%${patientSearch}%,phone.ilike.%${patientSearch}%`)
            .limit(5)
        setPatients(data || [])
    }

    const addItem = () => {
        setPrescriptionItems([...prescriptionItems, { medicine_id: "", medicine_name: "", dosage: "", frequency: "", duration: "", quantity: 1, instructions: "" }])
    }

    const removeItem = (index: number) => {
        if (prescriptionItems.length > 1) {
            setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index))
        }
    }

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...prescriptionItems]
        newItems[index] = { ...newItems[index], [field]: value }

        if (field === "medicine_id") {
            const med = medicines.find(m => m.id === value)
            if (med) {
                newItems[index].medicine_name = med.name
            }
        }
        setPrescriptionItems(newItems)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedPatient) {
            alert("Please select a patient")
            return
        }
        if (prescriptionItems.some(item => !item.medicine_id || !item.dosage)) {
            alert("Please fill in all medicine details")
            return
        }

        setLoading(true)
        try {
            const supabase = createClient()
            const prescriptionNumber = `RX${Date.now().toString().slice(-10)}`

            const { data: prescription, error } = await supabase
                .from("prescriptions")
                .insert({
                    prescription_number: prescriptionNumber,
                    patient_id: selectedPatient.id,
                    doctor_id: user?.id,
                    status: "pending",
                    notes: notes,
                })
                .select("id")
                .single()

            if (error) throw error

            // Insert prescription items
            const items = prescriptionItems.map(item => ({
                prescription_id: prescription.id,
                medicine_id: item.medicine_id,
                dosage: item.dosage,
                frequency: item.frequency,
                duration: item.duration,
                quantity: item.quantity,
                instructions: item.instructions,
            }))

            await supabase.from("prescription_items").insert(items)

            alert("Prescription created successfully!")
            router.push("/prescriptions")
        } catch (error) {
            console.error("Error:", error)
            alert("Failed to create prescription")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/prescriptions" className="p-2 hover:bg-accent rounded-lg">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">New Prescription</h1>
                    <p className="text-muted-foreground">Create a new medication prescription</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
                {/* Patient Selection */}
                <div className="bg-card rounded-xl border p-6">
                    <h2 className="text-lg font-semibold mb-4">Patient Information</h2>
                    {selectedPatient ? (
                        <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                            <div>
                                <p className="font-medium">{selectedPatient.first_name} {selectedPatient.last_name}</p>
                                <p className="text-sm text-muted-foreground">{selectedPatient.patient_number} • {selectedPatient.phone}</p>
                            </div>
                            <button type="button" onClick={() => setSelectedPatient(null)} className="text-sm text-primary">Change</button>
                        </div>
                    ) : (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={patientSearch}
                                onChange={(e) => setPatientSearch(e.target.value)}
                                placeholder="Search patient by name or phone..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background"
                            />
                            {patients.length > 0 && patientSearch && (
                                <div className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg">
                                    {patients.map(patient => (
                                        <button
                                            key={patient.id}
                                            type="button"
                                            onClick={() => { setSelectedPatient(patient); setPatientSearch(""); setPatients([]) }}
                                            className="w-full px-4 py-3 text-left hover:bg-accent"
                                        >
                                            <p className="font-medium">{patient.first_name} {patient.last_name}</p>
                                            <p className="text-sm text-muted-foreground">{patient.phone}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Prescription Items */}
                <div className="bg-card rounded-xl border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Medications</h2>
                        <button type="button" onClick={addItem} className="text-sm text-primary hover:underline flex items-center gap-1">
                            <Plus className="w-4 h-4" /> Add Medicine
                        </button>
                    </div>

                    <div className="space-y-4">
                        {prescriptionItems.map((item, index) => (
                            <div key={index} className="p-4 bg-accent/50 rounded-lg space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <Pill className="w-4 h-4 text-primary" />
                                        <span className="font-medium">Medicine {index + 1}</span>
                                    </div>
                                    {prescriptionItems.length > 1 && (
                                        <button type="button" onClick={() => removeItem(index)} className="p-1 hover:bg-red-100 text-red-600 rounded">
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Medicine *</label>
                                        <select
                                            value={item.medicine_id}
                                            onChange={(e) => updateItem(index, "medicine_id", e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border bg-background"
                                            required
                                        >
                                            <option value="">Select medicine</option>
                                            {medicines.map(med => (
                                                <option key={med.id} value={med.id}>
                                                    {med.name} {med.strength && `(${med.strength})`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Dosage *</label>
                                        <input
                                            type="text"
                                            value={item.dosage}
                                            onChange={(e) => updateItem(index, "dosage", e.target.value)}
                                            placeholder="e.g., 1 tablet"
                                            className="w-full px-3 py-2 rounded-lg border bg-background"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Frequency</label>
                                        <select
                                            value={item.frequency}
                                            onChange={(e) => updateItem(index, "frequency", e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border bg-background"
                                        >
                                            <option value="">Select frequency</option>
                                            <option value="Once daily">Once daily</option>
                                            <option value="Twice daily">Twice daily</option>
                                            <option value="Three times daily">Three times daily</option>
                                            <option value="Four times daily">Four times daily</option>
                                            <option value="Every 6 hours">Every 6 hours</option>
                                            <option value="Every 8 hours">Every 8 hours</option>
                                            <option value="As needed">As needed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Duration</label>
                                        <select
                                            value={item.duration}
                                            onChange={(e) => updateItem(index, "duration", e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border bg-background"
                                        >
                                            <option value="">Select duration</option>
                                            <option value="3 days">3 days</option>
                                            <option value="5 days">5 days</option>
                                            <option value="7 days">7 days</option>
                                            <option value="10 days">10 days</option>
                                            <option value="14 days">14 days</option>
                                            <option value="1 month">1 month</option>
                                            <option value="Ongoing">Ongoing</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Quantity</label>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                                            min={1}
                                            className="w-full px-3 py-2 rounded-lg border bg-background"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Instructions</label>
                                        <input
                                            type="text"
                                            value={item.instructions}
                                            onChange={(e) => updateItem(index, "instructions", e.target.value)}
                                            placeholder="e.g., Take after meals"
                                            className="w-full px-3 py-2 rounded-lg border bg-background"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notes */}
                <div className="bg-card rounded-xl border p-6">
                    <h2 className="text-lg font-semibold mb-4">Additional Notes</h2>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        placeholder="Any additional instructions or notes..."
                        className="w-full px-4 py-2.5 rounded-lg border bg-background resize-none"
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Link href="/prescriptions" className="px-6 py-2.5 border rounded-lg hover:bg-accent">Cancel</Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? "Creating..." : "Create Prescription"}
                    </button>
                </div>
            </form>
        </div>
    )
}
