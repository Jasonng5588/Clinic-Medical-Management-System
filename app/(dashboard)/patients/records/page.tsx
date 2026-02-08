"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import {
    FileText, Search, Loader2, User, Calendar, ChevronRight,
    Eye, Filter, Download
} from "lucide-react"
import Link from "next/link"

interface MedicalRecord {
    id: string
    patient_id: string
    diagnosis: string
    symptoms: string
    notes: string
    subjective: string
    objective: string
    assessment: string
    plan: string
    created_at: string
    patient?: { first_name: string; last_name: string; patient_number: string }
    doctor?: { first_name: string; last_name: string }
}

export default function MedicalRecordsPage() {
    const [records, setRecords] = useState<MedicalRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)

    useEffect(() => { fetchRecords() }, [searchTerm])

    const fetchRecords = async () => {
        setLoading(true)
        try {
            const supabase = createClient()
            let query = supabase.from("consultations")
                .select(`*, patient:patients(first_name, last_name, patient_number), doctor:staff_profiles!doctor_id(first_name, last_name)`)
                .order("created_at", { ascending: false })
                .limit(50)

            if (searchTerm) {
                // Search by patient name - need to do client-side filter
            }

            const { data, error } = await query
            if (error) throw error

            let filteredData = data || []
            if (searchTerm) {
                const term = searchTerm.toLowerCase()
                filteredData = filteredData.filter(r =>
                    r.patient?.first_name?.toLowerCase().includes(term) ||
                    r.patient?.last_name?.toLowerCase().includes(term) ||
                    r.patient?.patient_number?.toLowerCase().includes(term) ||
                    r.diagnosis?.toLowerCase().includes(term)
                )
            }

            setRecords(filteredData)
        } catch (error) { console.error("Error:", error) }
        finally { setLoading(false) }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Medical Records</h1>
                    <p className="text-muted-foreground">View patient consultation records</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search by patient name, ID, or diagnosis..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            ) : records.length > 0 ? (
                <div className="grid gap-4">
                    {records.map((record) => (
                        <div key={record.id} className="bg-card rounded-xl border p-4 hover:border-primary/50 transition-colors">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">
                                            {record.patient?.first_name} {record.patient?.last_name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {record.patient?.patient_number} • Dr. {record.doctor?.first_name} {record.doctor?.last_name}
                                        </p>
                                        {record.diagnosis && (
                                            <p className="text-sm mt-2">
                                                <span className="font-medium">Diagnosis:</span> {record.diagnosis}
                                            </p>
                                        )}
                                        {record.symptoms && (
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                <span className="font-medium">Symptoms:</span> {record.symptoms}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                        {new Date(record.created_at).toLocaleDateString()}
                                    </span>
                                    <button
                                        onClick={() => setSelectedRecord(record)}
                                        className="p-2 hover:bg-accent rounded-lg"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No medical records found</p>
                </div>
            )}

            {/* View Record Modal */}
            {selectedRecord && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-card rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Consultation Record</h2>
                                <button onClick={() => setSelectedRecord(null)} className="text-muted-foreground hover:text-foreground">
                                    ×
                                </button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {new Date(selectedRecord.created_at).toLocaleString()}
                            </p>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Patient Info */}
                            <div className="flex items-center gap-4 p-4 bg-accent/50 rounded-lg">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="font-semibold">{selectedRecord.patient?.first_name} {selectedRecord.patient?.last_name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedRecord.patient?.patient_number}</p>
                                </div>
                            </div>

                            {/* SOAP Notes */}
                            {selectedRecord.subjective && (
                                <div>
                                    <h3 className="font-semibold text-blue-600 mb-2">Subjective</h3>
                                    <p className="text-sm bg-blue-50 p-3 rounded-lg">{selectedRecord.subjective}</p>
                                </div>
                            )}
                            {selectedRecord.objective && (
                                <div>
                                    <h3 className="font-semibold text-green-600 mb-2">Objective</h3>
                                    <p className="text-sm bg-green-50 p-3 rounded-lg">{selectedRecord.objective}</p>
                                </div>
                            )}
                            {selectedRecord.assessment && (
                                <div>
                                    <h3 className="font-semibold text-orange-600 mb-2">Assessment</h3>
                                    <p className="text-sm bg-orange-50 p-3 rounded-lg">{selectedRecord.assessment}</p>
                                </div>
                            )}
                            {selectedRecord.plan && (
                                <div>
                                    <h3 className="font-semibold text-purple-600 mb-2">Plan</h3>
                                    <p className="text-sm bg-purple-50 p-3 rounded-lg">{selectedRecord.plan}</p>
                                </div>
                            )}

                            {/* Diagnosis */}
                            {selectedRecord.diagnosis && (
                                <div>
                                    <h3 className="font-semibold mb-2">Diagnosis</h3>
                                    <p className="text-sm p-3 bg-accent rounded-lg">{selectedRecord.diagnosis}</p>
                                </div>
                            )}

                            {/* Doctor */}
                            <div className="text-sm text-muted-foreground">
                                <p>Attending Doctor: Dr. {selectedRecord.doctor?.first_name} {selectedRecord.doctor?.last_name}</p>
                            </div>
                        </div>
                        <div className="p-4 border-t flex justify-end">
                            <button
                                onClick={() => setSelectedRecord(null)}
                                className="px-4 py-2 border rounded-lg hover:bg-accent"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
