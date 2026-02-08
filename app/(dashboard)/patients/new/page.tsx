"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/auth-store"
import {
    UserPlus, ArrowLeft, Loader2, User, Phone, Mail, MapPin,
    Calendar, Heart, AlertCircle, Save
} from "lucide-react"
import Link from "next/link"

export default function NewPatientPage() {
    const router = useRouter()
    const { user } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        gender: "male" as "male" | "female" | "other",
        date_of_birth: "",
        blood_group: "",
        address: "",
        city: "",
        state: "",
        postal_code: "",
        country: "Malaysia",
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

            // Generate patient number
            const patientNumber = `P${Date.now().toString().slice(-8)}`

            const { data, error } = await supabase.from("patients").insert({
                ...formData,
                patient_number: patientNumber,
                is_active: true,
            }).select().single()

            if (error) throw error

            // Audit log
            await supabase.from("audit_logs").insert({
                action: "patient_created",
                table_name: "patients",
                record_id: data.id,
                user_id: user?.id,
            })

            alert("Patient registered successfully!")
            router.push("/patients")
        } catch (error: any) {
            console.error("Error:", error)
            alert(error.message || "Failed to register patient")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/patients" className="p-2 hover:bg-accent rounded-lg">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Register New Patient</h1>
                    <p className="text-muted-foreground">Enter patient information</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="bg-card rounded-xl border p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Personal Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">First Name *</label>
                            <input
                                type="text"
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Last Name *</label>
                            <input
                                type="text"
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Gender *</label>
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Date of Birth *</label>
                            <input
                                type="date"
                                value={formData.date_of_birth}
                                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Blood Group</label>
                            <select
                                value={formData.blood_group}
                                onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">Select Blood Group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-card rounded-xl border p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Phone className="w-5 h-5" />
                        Contact Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Phone Number *</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="+60 12-345 6789"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Email Address</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div className="bg-card rounded-xl border p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Address
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Street Address</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">City</label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">State</label>
                            <input
                                type="text"
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Postal Code</label>
                            <input
                                type="text"
                                value={formData.postal_code}
                                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Country</label>
                            <input
                                type="text"
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-card rounded-xl border p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Emergency Contact
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Contact Name</label>
                            <input
                                type="text"
                                value={formData.emergency_contact_name}
                                onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Contact Phone</label>
                            <input
                                type="tel"
                                value={formData.emergency_contact_phone}
                                onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Relationship</label>
                            <select
                                value={formData.emergency_contact_relation}
                                onChange={(e) => setFormData({ ...formData, emergency_contact_relation: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">Select Relationship</option>
                                <option value="Spouse">Spouse</option>
                                <option value="Parent">Parent</option>
                                <option value="Child">Child</option>
                                <option value="Sibling">Sibling</option>
                                <option value="Friend">Friend</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Medical Information */}
                <div className="bg-card rounded-xl border p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5" />
                        Medical Information
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Allergies</label>
                            <textarea
                                value={formData.allergies}
                                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                rows={2}
                                placeholder="List any known allergies..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Chronic Conditions</label>
                            <textarea
                                value={formData.chronic_conditions}
                                onChange={(e) => setFormData({ ...formData, chronic_conditions: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                rows={2}
                                placeholder="E.g., Diabetes, Hypertension, Asthma..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Medical History</label>
                            <textarea
                                value={formData.medical_history}
                                onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                rows={3}
                                placeholder="Previous surgeries, hospitalizations, etc..."
                            />
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <Link href="/patients" className="px-6 py-2.5 border rounded-lg hover:bg-accent">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {loading ? "Saving..." : "Register Patient"}
                    </button>
                </div>
            </form>
        </div>
    )
}
