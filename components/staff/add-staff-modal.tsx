"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/auth-store"
import { X, Loader2 } from "lucide-react"

export function AddStaffModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
    const { user } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        first_name: "", last_name: "", email: "", password: "", phone: "", role: "receptionist",
        gender: "male", date_of_birth: "", ic_number: "", staff_id: "", address: "",
        emergency_contact_name: "", emergency_contact_phone: "",
        department: "", qualification: "", specialization: "", license_number: "",
        hire_date: new Date().toISOString().split("T")[0], employment_status: "full-time",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const supabase = createClient()
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email, password: formData.password,
            })
            if (authError) throw authError

            const { error: profileError } = await supabase.from("staff_profiles").insert({
                id: authData.user!.id, ...formData, password: undefined,
                staff_id: formData.staff_id || `STAFF-${Date.now().toString().slice(-6)}`,
                is_active: true,
            })
            if (profileError) throw profileError

            await supabase.from("audit_logs").insert({
                action: "staff_created", table_name: "staff_profiles", record_id: authData.user!.id,
                user_id: user?.id, new_values: { email: formData.email, role: formData.role }
            })

            alert("Staff created successfully!")
            onSuccess()
        } catch (error: any) {
            alert(error.message || "Failed to create staff")
        } finally { setLoading(false) }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-card rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between">
                    <div><h2 className="text-xl font-bold">Add New Staff</h2><p className="text-sm text-muted-foreground">Step {step} of 3</p></div>
                    <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="flex justify-center gap-2 mb-6">
                        {[1, 2, 3].map(s => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s ? "bg-primary text-white" : "bg-accent"}`}>{s}</div>
                                {s < 3 && <div className={`w-8 h-0.5 ${step > s ? "bg-primary" : "bg-accent"}`} />}
                            </div>
                        ))}
                    </div>

                    {step === 1 && (
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium mb-2">First Name *</label><input type="text" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" required /></div>
                            <div><label className="block text-sm font-medium mb-2">Last Name *</label><input type="text" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" required /></div>
                            <div><label className="block text-sm font-medium mb-2">Email *</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" required /></div>
                            <div><label className="block text-sm font-medium mb-2">Password *</label><input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" required minLength={6} /></div>
                            <div><label className="block text-sm font-medium mb-2">Phone</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" /></div>
                            <div><label className="block text-sm font-medium mb-2">Role *</label><select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background"><option value="receptionist">Receptionist</option><option value="nurse">Nurse</option><option value="doctor">Doctor</option><option value="accountant">Accountant</option></select></div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium mb-2">Gender</label><select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background"><option value="male">Male</option><option value="female">Female</option></select></div>
                            <div><label className="block text-sm font-medium mb-2">Date of Birth</label><input type="date" value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" /></div>
                            <div><label className="block text-sm font-medium mb-2">IC/Passport</label><input type="text" value={formData.ic_number} onChange={(e) => setFormData({ ...formData, ic_number: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" /></div>
                            <div><label className="block text-sm font-medium mb-2">Staff ID</label><input type="text" value={formData.staff_id} onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })} placeholder="Auto-generated" className="w-full px-4 py-2.5 rounded-lg border bg-background" /></div>
                            <div className="col-span-2"><label className="block text-sm font-medium mb-2">Address</label><textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" rows={2} /></div>
                            <div><label className="block text-sm font-medium mb-2">Emergency Contact</label><input type="text" value={formData.emergency_contact_name} onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" /></div>
                            <div><label className="block text-sm font-medium mb-2">Emergency Phone</label><input type="tel" value={formData.emergency_contact_phone} onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" /></div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium mb-2">Department</label><input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" /></div>
                            <div><label className="block text-sm font-medium mb-2">Qualification</label><input type="text" value={formData.qualification} onChange={(e) => setFormData({ ...formData, qualification: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" /></div>
                            <div><label className="block text-sm font-medium mb-2">Specialization</label><input type="text" value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" /></div>
                            <div><label className="block text-sm font-medium mb-2">License Number</label><input type="text" value={formData.license_number} onChange={(e) => setFormData({ ...formData, license_number: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" /></div>
                            <div><label className="block text-sm font-medium mb-2">Hire Date</label><input type="date" value={formData.hire_date} onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" /></div>
                            <div><label className="block text-sm font-medium mb-2">Employment Status</label><select value={formData.employment_status} onChange={(e) => setFormData({ ...formData, employment_status: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background"><option value="full-time">Full-time</option><option value="part-time">Part-time</option><option value="contract">Contract</option></select></div>
                        </div>
                    )}

                    <div className="flex justify-between mt-8 pt-4 border-t">
                        {step > 1 ? <button type="button" onClick={() => setStep(s => s - 1)} className="px-6 py-2.5 border rounded-lg">Previous</button> : <button type="button" onClick={onClose} className="px-6 py-2.5 border rounded-lg">Cancel</button>}
                        {step < 3 ? <button type="button" onClick={() => setStep(s => s + 1)} className="px-6 py-2.5 bg-primary text-white rounded-lg">Next</button> : (
                            <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg disabled:opacity-50">
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}{loading ? "Creating..." : "Create Staff"}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}
