"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/auth-store"
import {
    Clock, ArrowLeft, Loader2, Search, User, AlertTriangle,
    Plus, CheckCircle
} from "lucide-react"
import Link from "next/link"

interface Patient {
    id: string
    patient_number: string
    first_name: string
    last_name: string
    phone: string
}

export default function AddToQueuePage() {
    const router = useRouter()
    const { user } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [patients, setPatients] = useState<Patient[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
    const [priority, setPriority] = useState<1 | 2 | 3>(1) // 1=normal, 2=urgent, 3=emergency
    const [notes, setNotes] = useState("")
    const [searchLoading, setSearchLoading] = useState(false)

    useEffect(() => {
        if (searchTerm.length > 2) {
            searchPatients()
        } else {
            setPatients([])
        }
    }, [searchTerm])

    const searchPatients = async () => {
        setSearchLoading(true)
        try {
            const supabase = createClient()
            const { data } = await supabase.from("patients")
                .select("id, patient_number, first_name, last_name, phone")
                .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,patient_number.ilike.%${searchTerm}%`)
                .eq("is_active", true)
                .limit(10)
            setPatients(data || [])
        } catch (error) {
            console.error("Search error:", error)
        } finally {
            setSearchLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedPatient) {
            alert("Please select a patient")
            return
        }

        setLoading(true)
        try {
            const supabase = createClient()

            // Get next queue number for today
            const today = new Date().toISOString().split("T")[0]
            const { data: lastQueue } = await supabase.from("queues")
                .select("queue_number")
                .gte("check_in_time", today)
                .order("queue_number", { ascending: false })
                .limit(1)
                .single()

            const nextNumber = (lastQueue?.queue_number || 0) + 1

            const { data, error } = await supabase.from("queues").insert({
                patient_id: selectedPatient.id,
                queue_number: nextNumber,
                status: "waiting",
                priority_level: priority, // Now sending integer
                check_in_time: new Date().toISOString(),
                notes: notes || null,
            }).select().single()

            if (error) throw error

            // Audit log
            await supabase.from("audit_logs").insert({
                action: "patient_added_to_queue",
                table_name: "queues",
                record_id: data.id,
                user_id: user?.id,
            })

            alert(`Patient added to queue! Queue number: ${nextNumber}`)
            router.push("/queue")
        } catch (error: any) {
            console.error("Error:", error)
            alert(error.message || "Failed to add to queue")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/queue" className="p-2 hover:bg-accent rounded-lg">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Add Patient to Queue</h1>
                    <p className="text-muted-foreground">Check in a patient for today</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                {/* Patient Search */}
                <div className="bg-card rounded-xl border p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Select Patient
                    </h2>

                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by name, phone, or patient ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        {searchLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" />}
                    </div>

                    {patients.length > 0 && !selectedPatient && (
                        <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                            {patients.map((patient) => (
                                <button
                                    key={patient.id}
                                    type="button"
                                    onClick={() => { setSelectedPatient(patient); setPatients([]) }}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-accent text-left"
                                >
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{patient.first_name} {patient.last_name}</p>
                                        <p className="text-sm text-muted-foreground">{patient.patient_number} • {patient.phone}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {selectedPatient && (
                        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div className="flex-1">
                                <p className="font-medium">{selectedPatient.first_name} {selectedPatient.last_name}</p>
                                <p className="text-sm text-muted-foreground">{selectedPatient.patient_number}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedPatient(null)}
                                className="text-sm text-red-600 hover:underline"
                            >
                                Change
                            </button>
                        </div>
                    )}

                    {!selectedPatient && (
                        <Link href="/patients/new" className="flex items-center gap-2 text-primary hover:underline mt-3">
                            <Plus className="w-4 h-4" />
                            Register New Patient
                        </Link>
                    )}
                </div>

                {/* Priority */}
                <div className="bg-card rounded-xl border p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Priority Level
                    </h2>

                    <div className="grid grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => setPriority(1)}
                            className={`p-4 rounded-xl border-2 text-center transition-all ${priority === 1
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200 hover:border-gray-300"
                                }`}
                        >
                            <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${priority === 1 ? "bg-green-500" : "bg-gray-300"}`} />
                            <p className="font-medium">Normal</p>
                            <p className="text-xs text-muted-foreground">Standard wait</p>
                        </button>
                        <button
                            type="button"
                            onClick={() => setPriority(2)}
                            className={`p-4 rounded-xl border-2 text-center transition-all ${priority === 2
                                ? "border-orange-500 bg-orange-50"
                                : "border-gray-200 hover:border-gray-300"
                                }`}
                        >
                            <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${priority === 2 ? "bg-orange-500" : "bg-gray-300"}`} />
                            <p className="font-medium">Urgent</p>
                            <p className="text-xs text-muted-foreground">Priority queue</p>
                        </button>
                        <button
                            type="button"
                            onClick={() => setPriority(3)}
                            className={`p-4 rounded-xl border-2 text-center transition-all ${priority === 3
                                ? "border-red-500 bg-red-50"
                                : "border-gray-200 hover:border-gray-300"
                                }`}
                        >
                            <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${priority === 3 ? "bg-red-500" : "bg-gray-300"}`} />
                            <p className="font-medium">Emergency</p>
                            <p className="text-xs text-muted-foreground">Immediate</p>
                        </button>
                    </div>
                </div>

                {/* Notes */}
                <div className="bg-card rounded-xl border p-6">
                    <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={3}
                        placeholder="Any special notes or reason for visit..."
                    />
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <Link href="/queue" className="px-6 py-2.5 border rounded-lg hover:bg-accent">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading || !selectedPatient}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                        {loading ? "Adding..." : "Add to Queue"}
                    </button>
                </div>
            </form>
        </div>
    )
}
