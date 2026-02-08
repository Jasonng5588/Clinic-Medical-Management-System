"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/auth-store"
import { X, Loader2 } from "lucide-react"

interface Staff {
    id: string; first_name: string; last_name: string; email: string; phone: string | null
    role: "super_admin" | "doctor" | "nurse" | "receptionist" | "accountant"
    gender: string | null; date_of_birth: string | null; address: string | null
    qualification: string | null; specialization: string | null; license_number: string | null
    is_active: boolean; department: string | null; emergency_contact_name: string | null
    emergency_contact_phone: string | null; ic_number: string | null; staff_id: string | null
    employment_status: string | null
}

export function EditStaffModal({ isOpen, staff, onClose, onSuccess }: { isOpen: boolean; staff: Staff; onClose: () => void; onSuccess: () => void }) {
    const { user } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState(staff)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const supabase = createClient()
            const { error } = await supabase.from("staff_profiles").update({
                first_name: formData.first_name, last_name: formData.last_name, phone: formData.phone,
                role: formData.role, gender: formData.gender, specialization: formData.specialization,
                qualification: formData.qualification, department: formData.department,
                license_number: formData.license_number, is_active: formData.is_active,
            }).eq("id", staff.id)

            if (error) throw error

            await supabase.from("audit_logs").insert({
                action: "staff_updated", table_name: "staff_profiles", record_id: staff.id,
                user_id: user?.id, old_values: staff, new_values: formData
            })

            alert("Staff updated successfully!")
            onSuccess()
        } catch (error) {
            alert("Failed to update staff")
        } finally { setLoading(false) }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Edit Staff</h2>
                    <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium mb-2">First Name</label><input type="text" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" required /></div>
                        <div><label className="block text-sm font-medium mb-2">Last Name</label><input type="text" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" required /></div>
                        <div><label className="block text-sm font-medium mb-2">Phone</label><input type="tel" value={formData.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" /></div>
                        <div><label className="block text-sm font-medium mb-2">Role</label><select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as any })} className="w-full px-4 py-2.5 rounded-lg border bg-background"><option value="super_admin">Super Admin</option><option value="doctor">Doctor</option><option value="nurse">Nurse</option><option value="receptionist">Receptionist</option><option value="accountant">Accountant</option></select></div>
                        <div><label className="block text-sm font-medium mb-2">Specialization</label><input type="text" value={formData.specialization || ""} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" /></div>
                        <div><label className="block text-sm font-medium mb-2">Department</label><input type="text" value={formData.department || ""} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" /></div>
                        <div><label className="block text-sm font-medium mb-2">Qualification</label><input type="text" value={formData.qualification || ""} onChange={(e) => setFormData({ ...formData, qualification: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" /></div>
                        <div><label className="block text-sm font-medium mb-2">Status</label><select value={formData.is_active ? "active" : "inactive"} onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "active" })} className="w-full px-4 py-2.5 rounded-lg border bg-background"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 border rounded-lg">Cancel</button>
                        <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg disabled:opacity-50">
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}{loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
