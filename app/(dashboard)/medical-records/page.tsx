"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
    FileText, Search, Plus, Eye, Download, Calendar,
    User, Stethoscope, Pill, Activity, Brain, Filter
} from "lucide-react"
import Link from "next/link"
import { AIPatientRiskAssessment } from "@/components/ai/patient-risk-assessment"

interface MedicalRecord {
    id: string
    patient: {
        id: string
        first_name: string
        last_name: string
        patient_number: string
        date_of_birth: string
        blood_group: string
        allergies: string
        chronic_conditions: string
    }
    doctor: {
        first_name: string
        last_name: string
    }
    diagnosis: string
    symptoms: string
    subjective: string
    objective: string
    assessment: string
    plan: string
    prescriptions: any
    created_at: string
}

export default function MedicalRecordsPage() {
    const [records, setRecords] = useState<MedicalRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
    const [showAIAssessment, setShowAIAssessment] = useState(false)

    useEffect(() => {
        loadRecords()
    }, [])

    const loadRecords = async () => {
        try {
            const supabase = createClient()
            const { data, error } = await supabase
                .from("consultations")
                .select(`
                    *,
                    patient:patients(id, first_name, last_name, patient_number, date_of_birth, blood_group, allergies, chronic_conditions),
                    doctor:staff_profiles!consultations_doctor_id_fkey(first_name, last_name)
                `)
                .order("created_at", { ascending: false })
                .limit(50)

            if (error) throw error
            setRecords(data || [])
        } catch (error) {
            console.error("Error loading records:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredRecords = records.filter(record => {
        const searchLower = searchTerm.toLowerCase()
        return (
            record.patient?.first_name?.toLowerCase().includes(searchLower) ||
            record.patient?.last_name?.toLowerCase().includes(searchLower) ||
            record.patient?.patient_number?.toLowerCase().includes(searchLower) ||
            record.diagnosis?.toLowerCase().includes(searchLower)
        )
    })

    const calculateAge = (dob: string) => {
        if (!dob) return null
        const birthDate = new Date(dob)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        return age
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <FileText className="w-8 h-8 text-primary" />
                        Medical Records
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        View and manage patient medical history with AI insights
                    </p>
                </div>
                <Link
                    href="/consultations/new"
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2 w-fit"
                >
                    <Plus className="w-4 h-4" />
                    New Consultation
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <div>
                            <p className="text-sm text-blue-600">Total Records</p>
                            <p className="text-2xl font-bold text-blue-900">{records.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-green-600" />
                        <div>
                            <p className="text-sm text-green-600">This Week</p>
                            <p className="text-2xl font-bold text-green-900">
                                {records.filter(r => {
                                    const date = new Date(r.created_at)
                                    const weekAgo = new Date()
                                    weekAgo.setDate(weekAgo.getDate() - 7)
                                    return date > weekAgo
                                }).length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center gap-3">
                        <Brain className="w-8 h-8 text-purple-600" />
                        <div>
                            <p className="text-sm text-purple-600">AI Assisted</p>
                            <p className="text-2xl font-bold text-purple-900">Active</p>
                        </div>
                    </div>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                    <div className="flex items-center gap-3">
                        <Activity className="w-8 h-8 text-orange-600" />
                        <div>
                            <p className="text-sm text-orange-600">Today</p>
                            <p className="text-2xl font-bold text-orange-900">
                                {records.filter(r => {
                                    const date = new Date(r.created_at).toDateString()
                                    return date === new Date().toDateString()
                                }).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search by patient name, ID, or diagnosis..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            {/* Records List */}
            <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-muted/30">
                    <h2 className="font-semibold">Patient Medical Records</h2>
                </div>

                {filteredRecords.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No medical records found</p>
                        <p className="text-sm">Create a new consultation to add records</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {filteredRecords.map((record) => (
                            <div
                                key={record.id}
                                className="p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                                onClick={() => setSelectedRecord(record)}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {record.patient?.first_name?.[0]}{record.patient?.last_name?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-semibold">
                                                {record.patient?.first_name} {record.patient?.last_name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {record.patient?.patient_number} • Age: {calculateAge(record.patient?.date_of_birth) || "N/A"}
                                            </p>
                                            <div className="flex items-center gap-4 mt-2 text-sm">
                                                <span className="flex items-center gap-1 text-blue-600">
                                                    <Stethoscope className="w-3 h-3" />
                                                    {record.diagnosis || "Pending diagnosis"}
                                                </span>
                                                {record.prescriptions && (
                                                    <span className="flex items-center gap-1 text-green-600">
                                                        <Pill className="w-3 h-3" />
                                                        {Array.isArray(record.prescriptions) ? record.prescriptions.length : 0} medications
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(record.created_at).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Dr. {record.doctor?.first_name} {record.doctor?.last_name}
                                        </p>
                                        <button
                                            className="mt-2 px-3 py-1 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setSelectedRecord(record)
                                            }}
                                        >
                                            <Eye className="w-3 h-3 inline mr-1" />
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedRecord && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b sticky top-0 bg-card z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold">
                                        {selectedRecord.patient?.first_name} {selectedRecord.patient?.last_name}
                                    </h2>
                                    <p className="text-muted-foreground">
                                        {selectedRecord.patient?.patient_number} •
                                        Blood Group: {selectedRecord.patient?.blood_group || "N/A"}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedRecord(null)}
                                    className="px-4 py-2 border rounded-lg hover:bg-muted"
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Patient Alerts */}
                            {(selectedRecord.patient?.allergies || selectedRecord.patient?.chronic_conditions) && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-red-800 mb-2">⚠️ Patient Alerts</h3>
                                    {selectedRecord.patient?.allergies && (
                                        <p className="text-sm text-red-700">
                                            <strong>Allergies:</strong> {selectedRecord.patient.allergies}
                                        </p>
                                    )}
                                    {selectedRecord.patient?.chronic_conditions && (
                                        <p className="text-sm text-red-700">
                                            <strong>Chronic Conditions:</strong> {selectedRecord.patient.chronic_conditions}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* SOAP Notes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h4 className="font-semibold text-blue-800 mb-2">Subjective</h4>
                                    <p className="text-sm text-blue-700">{selectedRecord.subjective || "N/A"}</p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                    <h4 className="font-semibold text-green-800 mb-2">Objective</h4>
                                    <p className="text-sm text-green-700">{selectedRecord.objective || "N/A"}</p>
                                </div>
                                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                    <h4 className="font-semibold text-orange-800 mb-2">Assessment</h4>
                                    <p className="text-sm text-orange-700">{selectedRecord.assessment || "N/A"}</p>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                    <h4 className="font-semibold text-purple-800 mb-2">Plan</h4>
                                    <p className="text-sm text-purple-700">{selectedRecord.plan || "N/A"}</p>
                                </div>
                            </div>

                            {/* Diagnosis */}
                            <div className="p-4 bg-card border rounded-lg">
                                <h4 className="font-semibold mb-2">Diagnosis</h4>
                                <p className="text-lg">{selectedRecord.diagnosis || "Pending"}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Symptoms: {selectedRecord.symptoms || "N/A"}
                                </p>
                            </div>

                            {/* Prescriptions */}
                            {selectedRecord.prescriptions && Array.isArray(selectedRecord.prescriptions) && selectedRecord.prescriptions.length > 0 && (
                                <div className="p-4 bg-card border rounded-lg">
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <Pill className="w-4 h-4" />
                                        Prescriptions
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedRecord.prescriptions.map((rx: any, i: number) => (
                                            <div key={i} className="p-3 bg-muted/50 rounded-lg">
                                                <p className="font-medium">{rx.medicine_name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {rx.dosage} • {rx.frequency} • {rx.duration}
                                                </p>
                                                {rx.instructions && (
                                                    <p className="text-sm text-blue-600 mt-1">{rx.instructions}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* AI Risk Assessment Toggle */}
                            <button
                                onClick={() => setShowAIAssessment(!showAIAssessment)}
                                className="w-full px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 flex items-center justify-center gap-2"
                            >
                                <Brain className="w-5 h-5" />
                                {showAIAssessment ? "Hide" : "Show"} AI Risk Assessment
                            </button>

                            {showAIAssessment && (
                                <AIPatientRiskAssessment
                                    patient={{
                                        age: calculateAge(selectedRecord.patient?.date_of_birth) || undefined,
                                        bloodGroup: selectedRecord.patient?.blood_group,
                                        allergies: selectedRecord.patient?.allergies,
                                        chronicConditions: selectedRecord.patient?.chronic_conditions,
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
