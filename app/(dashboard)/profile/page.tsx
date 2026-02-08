"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/auth-store"
import {
    User, Mail, Phone, Calendar, MapPin, Shield, Camera,
    Loader2, Save, Lock, Bell, FileText, Briefcase
} from "lucide-react"

export default function ProfilePage() {
    const { user, setUser } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState("personal")

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        gender: "male",
        date_of_birth: "",
        address: "",
        qualification: "",
        specialization: "",
        license_number: "",
    })

    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    })

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                email: user.email || "",
                phone: user.phone || "",
                gender: user.gender || "male",
                date_of_birth: user.date_of_birth || "",
                address: user.address || "",
                qualification: user.qualification || "",
                specialization: user.specialization || "",
                license_number: user.license_number || "",
            })
        }
    }, [user])

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const supabase = createClient()
            const { error } = await supabase
                .from("staff_profiles")
                .update(formData)
                .eq("id", user?.id)

            if (error) throw error

            // Update local store
            setUser({ ...user!, ...formData })
            alert("Profile updated successfully!")
        } catch (error) {
            console.error("Error saving profile:", error)
            alert("Failed to update profile")
        } finally {
            setSaving(false)
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (passwordData.new_password !== passwordData.confirm_password) {
            alert("Passwords do not match")
            return
        }

        setSaving(true)
        try {
            const supabase = createClient()
            const { error } = await supabase.auth.updateUser({
                password: passwordData.new_password
            })

            if (error) throw error

            setPasswordData({ current_password: "", new_password: "", confirm_password: "" })
            alert("Password changed successfully!")
        } catch (error) {
            console.error("Error changing password:", error)
            alert("Failed to change password")
        } finally {
            setSaving(false)
        }
    }

    const tabs = [
        { id: "personal", label: "Personal Info", icon: User },
        { id: "professional", label: "Professional", icon: Briefcase },
        { id: "security", label: "Security", icon: Lock },
        { id: "notifications", label: "Notifications", icon: Bell },
    ]

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-6 bg-card rounded-xl border p-6">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary">
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full hover:bg-primary/90">
                        <Camera className="w-4 h-4" />
                    </button>
                </div>
                <div>
                    <h1 className="text-2xl font-bold">{user?.first_name} {user?.last_name}</h1>
                    <p className="text-muted-foreground capitalize">{user?.role?.replace("_", " ")}</p>
                    <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b overflow-x-auto">
                {tabs.map(tab => {
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Personal Info Tab */}
            {activeTab === "personal" && (
                <form onSubmit={handleSaveProfile} className="bg-card rounded-xl border p-6 space-y-6">
                    <h2 className="text-lg font-semibold">Personal Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">First Name</label>
                            <input
                                type="text"
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Last Name</label>
                            <input
                                type="text"
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background"
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Date of Birth</label>
                            <input
                                type="date"
                                value={formData.date_of_birth}
                                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Gender</label>
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
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Address</label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg border bg-background"
                            rows={2}
                        />
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            )}

            {/* Professional Tab */}
            {activeTab === "professional" && (
                <form onSubmit={handleSaveProfile} className="bg-card rounded-xl border p-6 space-y-6">
                    <h2 className="text-lg font-semibold">Professional Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Qualification</label>
                            <input
                                type="text"
                                value={formData.qualification}
                                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                                placeholder="e.g., MBBS, MD"
                                className="w-full px-4 py-2.5 rounded-lg border bg-background"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Specialization</label>
                            <input
                                type="text"
                                value={formData.specialization}
                                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                placeholder="e.g., General Medicine, Pediatrics"
                                className="w-full px-4 py-2.5 rounded-lg border bg-background"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">License Number</label>
                            <input
                                type="text"
                                value={formData.license_number}
                                onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
                <form onSubmit={handleChangePassword} className="bg-card rounded-xl border p-6 space-y-6">
                    <h2 className="text-lg font-semibold">Change Password</h2>

                    <div className="max-w-md space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Current Password</label>
                            <input
                                type="password"
                                value={passwordData.current_password}
                                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">New Password</label>
                            <input
                                type="password"
                                value={passwordData.new_password}
                                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background"
                                required
                                minLength={6}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                value={passwordData.confirm_password}
                                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                            {saving ? "Changing..." : "Change Password"}
                        </button>
                    </div>
                </form>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
                <div className="bg-card rounded-xl border p-6 space-y-6">
                    <h2 className="text-lg font-semibold">Notification Preferences</h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-medium">Email Notifications</p>
                                <p className="text-sm text-muted-foreground">Receive updates via email</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-medium">SMS Notifications</p>
                                <p className="text-sm text-muted-foreground">Receive SMS for appointments</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-medium">In-App Notifications</p>
                                <p className="text-sm text-muted-foreground">Show notifications in dashboard</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
