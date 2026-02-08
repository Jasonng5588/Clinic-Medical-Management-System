"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/auth-store"
import { createClient } from "@/lib/supabase/client"
import {
    Settings, Moon, Sun, Bell, Database, Shield, Upload, Download,
    Building2, Mail, Phone, MapPin, Clock, Loader2, Save, Check
} from "lucide-react"

export default function SettingsPage() {
    const { role } = useAuthStore()
    const [activeTab, setActiveTab] = useState("clinic")
    const [saving, setSaving] = useState(false)
    const [darkMode, setDarkMode] = useState(false)

    const [clinicSettings, setClinicSettings] = useState({
        name: "HealthCare Plus",
        email: "info@healthcareplus.com",
        phone: "+60 12-345 6789",
        address: "123 Medical Street, Kuala Lumpur",
        working_hours_start: "09:00",
        working_hours_end: "18:00",
        appointment_duration: 30,
        logo_url: "",
    })

    useEffect(() => {
        // Load dark mode preference
        const isDark = localStorage.getItem("darkMode") === "true"
        setDarkMode(isDark)
        if (isDark) {
            document.documentElement.classList.add("dark")
        }
    }, [])

    const toggleDarkMode = () => {
        const newMode = !darkMode
        setDarkMode(newMode)
        localStorage.setItem("darkMode", String(newMode))
        if (newMode) {
            document.documentElement.classList.add("dark")
        } else {
            document.documentElement.classList.remove("dark")
        }
    }

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        // Simulate saving
        await new Promise(resolve => setTimeout(resolve, 1000))
        setSaving(false)
        alert("Settings saved successfully!")
    }

    const handleBackup = async () => {
        alert("Backup started. You will receive an email when complete.")
    }

    const tabs = [
        { id: "clinic", label: "Clinic Info", icon: Building2 },
        { id: "appearance", label: "Appearance", icon: Sun },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "backup", label: "Backup & Restore", icon: Database },
        { id: "security", label: "Security", icon: Shield },
    ]

    if (role !== "super_admin") {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
                    <p className="text-muted-foreground">Only administrators can access settings.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage clinic settings and preferences</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar */}
                <div className="w-full md:w-64 space-y-1">
                    {tabs.map(tab => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === tab.id
                                        ? "bg-primary text-white"
                                        : "hover:bg-accent"
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>

                {/* Content */}
                <div className="flex-1 bg-card rounded-xl border p-6">
                    {/* Clinic Info */}
                    {activeTab === "clinic" && (
                        <form onSubmit={handleSaveSettings} className="space-y-6">
                            <h2 className="text-lg font-semibold">Clinic Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">Clinic Name</label>
                                    <input
                                        type="text"
                                        value={clinicSettings.name}
                                        onChange={(e) => setClinicSettings({ ...clinicSettings, name: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border bg-background"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={clinicSettings.email}
                                        onChange={(e) => setClinicSettings({ ...clinicSettings, email: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border bg-background"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        value={clinicSettings.phone}
                                        onChange={(e) => setClinicSettings({ ...clinicSettings, phone: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border bg-background"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">Address</label>
                                    <textarea
                                        value={clinicSettings.address}
                                        onChange={(e) => setClinicSettings({ ...clinicSettings, address: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border bg-background"
                                        rows={2}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Opening Time</label>
                                    <input
                                        type="time"
                                        value={clinicSettings.working_hours_start}
                                        onChange={(e) => setClinicSettings({ ...clinicSettings, working_hours_start: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border bg-background"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Closing Time</label>
                                    <input
                                        type="time"
                                        value={clinicSettings.working_hours_end}
                                        onChange={(e) => setClinicSettings({ ...clinicSettings, working_hours_end: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border bg-background"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Default Appointment Duration</label>
                                    <select
                                        value={clinicSettings.appointment_duration}
                                        onChange={(e) => setClinicSettings({ ...clinicSettings, appointment_duration: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2.5 rounded-lg border bg-background"
                                    >
                                        <option value={15}>15 minutes</option>
                                        <option value={30}>30 minutes</option>
                                        <option value={45}>45 minutes</option>
                                        <option value={60}>60 minutes</option>
                                    </select>
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

                    {/* Appearance */}
                    {activeTab === "appearance" && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold">Appearance</h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-4">
                                        {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                        <div>
                                            <p className="font-medium">Dark Mode</p>
                                            <p className="text-sm text-muted-foreground">
                                                {darkMode ? "Currently using dark theme" : "Currently using light theme"}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={toggleDarkMode}
                                        className={`relative w-14 h-7 rounded-full transition-colors ${darkMode ? "bg-primary" : "bg-gray-200"
                                            }`}
                                    >
                                        <div className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${darkMode ? "translate-x-7" : ""
                                            }`} />
                                    </button>
                                </div>

                                <div className="p-4 border rounded-lg">
                                    <p className="font-medium mb-3">Theme Colors</p>
                                    <div className="flex gap-3">
                                        {["#0EA5E9", "#22C55E", "#8B5CF6", "#F59E0B", "#EF4444"].map(color => (
                                            <button
                                                key={color}
                                                className="w-10 h-10 rounded-full border-2 border-transparent hover:border-foreground transition-colors"
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications */}
                    {activeTab === "notifications" && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold">Notification Settings</h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">Appointment Reminders</p>
                                        <p className="text-sm text-muted-foreground">Send reminder to patients before appointments</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">Email for New Appointments</p>
                                        <p className="text-sm text-muted-foreground">Receive email when new appointment is booked</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">Low Stock Alerts</p>
                                        <p className="text-sm text-muted-foreground">Get notified when medicine stock is low</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Backup & Restore */}
                    {activeTab === "backup" && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold">Backup & Restore</h2>

                            <div className="space-y-4">
                                <div className="p-6 border rounded-lg bg-accent/50">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-primary/10 rounded-lg">
                                            <Upload className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Create Backup</p>
                                            <p className="text-sm text-muted-foreground">Export all data to a backup file</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleBackup}
                                        className="w-full px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90"
                                    >
                                        Create Backup Now
                                    </button>
                                </div>

                                <div className="p-6 border rounded-lg">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                                            <Download className="w-6 h-6 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Restore from Backup</p>
                                            <p className="text-sm text-muted-foreground">Restore data from a backup file</p>
                                        </div>
                                    </div>
                                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                        <input type="file" className="hidden" id="backup-file" accept=".json,.zip" />
                                        <label htmlFor="backup-file" className="cursor-pointer">
                                            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                                            <p className="text-sm text-muted-foreground">Click to upload backup file</p>
                                        </label>
                                    </div>
                                </div>

                                <div className="p-4 border rounded-lg">
                                    <p className="font-medium mb-3">Scheduled Backups</p>
                                    <div className="flex items-center gap-4">
                                        <select className="px-4 py-2 rounded-lg border bg-background">
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                        </label>
                                        <span className="text-sm text-muted-foreground">Enable</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security */}
                    {activeTab === "security" && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold">Security Settings</h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">Two-Factor Authentication</p>
                                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                                    </div>
                                    <button className="px-4 py-2 border rounded-lg hover:bg-accent">
                                        Enable
                                    </button>
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">Session Timeout</p>
                                        <p className="text-sm text-muted-foreground">Auto logout after inactivity</p>
                                    </div>
                                    <select className="px-4 py-2 rounded-lg border bg-background">
                                        <option value={15}>15 minutes</option>
                                        <option value={30}>30 minutes</option>
                                        <option value={60}>1 hour</option>
                                        <option value={0}>Never</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">Login Alerts</p>
                                        <p className="text-sm text-muted-foreground">Get notified of new logins</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
