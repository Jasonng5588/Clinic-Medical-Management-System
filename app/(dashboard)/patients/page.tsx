"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import {
    Users, Search, Plus, Filter, MoreVertical, Eye, Edit, Trash2,
    Phone, Mail, Calendar, MapPin, FileText, AlertCircle, X, Loader2,
    Download, Upload, ChevronLeft, ChevronRight, User
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
    is_active: boolean
    created_at: string
}

export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [showAddModal, setShowAddModal] = useState(false)
    const [showViewModal, setShowViewModal] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
    const [stats, setStats] = useState({ total: 0, male: 0, female: 0, newThisMonth: 0 })
    const [page, setPage] = useState(1)
    const pageSize = 12

    useEffect(() => {
        fetchPatients()
    }, [searchTerm, page])

    const fetchPatients = async () => {
        setLoading(true)
        try {
            const supabase = createClient()
            let query = supabase
                .from("patients")
                .select("*", { count: "exact" })
                .eq("is_active", true)
                .order("created_at", { ascending: false })
                .range((page - 1) * pageSize, page * pageSize - 1)

            if (searchTerm) {
                query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,patient_number.ilike.%${searchTerm}%`)
            }

            const { data, count, error } = await query

            if (error) throw error
            setPatients(data || [])

            // Stats
            const { data: allPatients } = await supabase.from("patients").select("gender, created_at").eq("is_active", true)
            const thisMonth = new Date()
            thisMonth.setDate(1)

            setStats({
                total: count || 0,
                male: allPatients?.filter(p => p.gender === "male").length || 0,
                female: allPatients?.filter(p => p.gender === "female").length || 0,
                newThisMonth: allPatients?.filter(p => new Date(p.created_at) >= thisMonth).length || 0,
            })
        } catch (error) {
            console.error("Error fetching patients:", error)
        } finally {
            setLoading(false)
        }
    }

    const calculateAge = (dob: string) => {
        const birthDate = new Date(dob)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const m = today.getMonth() - birthDate.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        return age
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to deactivate this patient?")) return

        try {
            const supabase = createClient()
            await supabase.from("patients").update({ is_active: false }).eq("id", id)
            fetchPatients()
        } catch (error) {
            console.error("Error deleting patient:", error)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Patients</h1>
                    <p className="text-muted-foreground">Manage patient records and information</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Patient
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl p-4 border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Patients</p>
                            <p className="text-xl font-bold">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-4 border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Male</p>
                            <p className="text-xl font-bold">{stats.male}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-4 border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900">
                            <User className="w-5 h-5 text-pink-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Female</p>
                            <p className="text-xl font-bold">{stats.female}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-4 border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                            <Calendar className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">New This Month</p>
                            <p className="text-xl font-bold">{stats.newThisMonth}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by name, phone, or patient number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2.5 border rounded-lg hover:bg-accent">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 border rounded-lg hover:bg-accent">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Patients Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : patients.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patients.map((patient) => (
                        <div key={patient.id} className="bg-card rounded-xl border p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${patient.gender === "male" ? "bg-blue-500" : "bg-pink-500"
                                        }`}>
                                        {patient.first_name[0]}{patient.last_name[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{patient.first_name} {patient.last_name}</h3>
                                        <p className="text-sm text-muted-foreground">{patient.patient_number}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => { setSelectedPatient(patient); setShowViewModal(true) }}
                                        className="p-2 hover:bg-accent rounded-lg"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <Link href={`/patients/${patient.id}/edit`} className="p-2 hover:bg-accent rounded-lg">
                                        <Edit className="w-4 h-4" />
                                    </Link>
                                    <button onClick={() => handleDelete(patient.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Phone className="w-4 h-4" />
                                    <span>{patient.phone}</span>
                                </div>
                                {patient.email && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="w-4 h-4" />
                                        <span className="truncate">{patient.email}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    <span>{calculateAge(patient.date_of_birth)} years old • {patient.gender}</span>
                                </div>
                                {patient.blood_group && (
                                    <div className="inline-block px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                                        Blood: {patient.blood_group}
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t flex gap-2">
                                <Link href={`/appointments/new?patient=${patient.id}`} className="flex-1 text-center py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20">
                                    Book Appointment
                                </Link>
                                <Link href={`/patients/${patient.id}`} className="flex-1 text-center py-2 border rounded-lg text-sm font-medium hover:bg-accent">
                                    View Profile
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-card rounded-xl border">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No patients found</h3>
                    <p className="text-muted-foreground mb-4">Get started by adding your first patient</p>
                    <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-primary text-white rounded-lg">
                        Add Patient
                    </button>
                </div>
            )}

            {/* Pagination */}
            {stats.total > pageSize && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 border rounded-lg disabled:opacity-50"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 text-sm">
                        Page {page} of {Math.ceil(stats.total / pageSize)}
                    </span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= Math.ceil(stats.total / pageSize)}
                        className="p-2 border rounded-lg disabled:opacity-50"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Add Patient Modal */}
            <AddPatientModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => { setShowAddModal(false); fetchPatients() }}
            />

            {/* View Patient Modal */}
            {selectedPatient && (
                <ViewPatientModal
                    isOpen={showViewModal}
                    onClose={() => setShowViewModal(false)}
                    patient={selectedPatient}
                />
            )}
        </div>
    )
}

// Add Patient Modal Component
function AddPatientModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        date_of_birth: "",
        gender: "male",
        blood_group: "",
        address: "",
        city: "",
        state: "",
        postal_code: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
        emergency_contact_relation: "",
        medical_history: "",
        allergies: "",
        chronic_conditions: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const supabase = createClient()
            const { error } = await supabase.from("patients").insert({
                ...formData,
                is_active: true,
            })
            if (error) throw error
            onSuccess()
        } catch (error) {
            console.error("Error adding patient:", error)
            alert("Failed to add patient")
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-card rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4 shadow-xl">
                <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Add New Patient</h2>
                    <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Personal Information */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">First Name *</label>
                                <input
                                    type="text"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border bg-background"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Last Name *</label>
                                <input
                                    type="text"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border bg-background"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border bg-background"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Phone *</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border bg-background"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Date of Birth *</label>
                                <input
                                    type="date"
                                    value={formData.date_of_birth}
                                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border bg-background"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Gender *</label>
                                <select
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border bg-background"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Blood Group</label>
                                <select
                                    value={formData.blood_group}
                                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border bg-background"
                                >
                                    <option value="">Select</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2">Street Address</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border bg-background"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">City</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border bg-background"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">State</label>
                                <input
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border bg-background"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Name</label>
                                <input
                                    type="text"
                                    value={formData.emergency_contact_name}
                                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border bg-background"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.emergency_contact_phone}
                                    onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border bg-background"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Relationship</label>
                                <input
                                    type="text"
                                    value={formData.emergency_contact_relation}
                                    onChange={(e) => setFormData({ ...formData, emergency_contact_relation: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border bg-background"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Medical Information */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Medical Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Medical History</label>
                                <textarea
                                    value={formData.medical_history}
                                    onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border bg-background"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Allergies</label>
                                <textarea
                                    value={formData.allergies}
                                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border bg-background"
                                    rows={2}
                                    placeholder="List any known allergies..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Chronic Conditions</label>
                                <textarea
                                    value={formData.chronic_conditions}
                                    onChange={(e) => setFormData({ ...formData, chronic_conditions: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border bg-background"
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 border rounded-lg hover:bg-accent">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? "Saving..." : "Add Patient"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// View Patient Modal Component
function ViewPatientModal({ isOpen, onClose, patient }: { isOpen: boolean; onClose: () => void; patient: Patient }) {
    if (!isOpen) return null

    const calculateAge = (dob: string) => {
        const birthDate = new Date(dob)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        return age
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-card rounded-2xl w-full max-w-lg m-4 shadow-xl">
                <div className="border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Patient Details</h2>
                    <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${patient.gender === "male" ? "bg-blue-500" : "bg-pink-500"
                            }`}>
                            {patient.first_name[0]}{patient.last_name[0]}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{patient.first_name} {patient.last_name}</h3>
                            <p className="text-muted-foreground">{patient.patient_number}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p className="font-medium">{patient.phone}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{patient.email || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Age</p>
                            <p className="font-medium">{calculateAge(patient.date_of_birth)} years</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Gender</p>
                            <p className="font-medium capitalize">{patient.gender}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Blood Group</p>
                            <p className="font-medium">{patient.blood_group || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Registered</p>
                            <p className="font-medium">{new Date(patient.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                        <Link href={`/patients/${patient.id}`} className="flex-1 text-center py-2.5 bg-primary text-white rounded-lg font-medium">
                            Full Profile
                        </Link>
                        <Link href={`/appointments/new?patient=${patient.id}`} className="flex-1 text-center py-2.5 border rounded-lg font-medium hover:bg-accent">
                            Book Appointment
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
