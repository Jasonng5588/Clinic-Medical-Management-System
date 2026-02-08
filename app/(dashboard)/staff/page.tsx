"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/auth-store"
import {
    Users, Search, Plus, Eye, Edit, Trash2, Phone, Mail,
    Shield, Briefcase, X, Loader2, ChevronLeft, ChevronRight
} from "lucide-react"
import { AddStaffModal } from "@/components/staff/add-staff-modal"
import { ViewStaffModal } from "@/components/staff/view-staff-modal"
import { EditStaffModal } from "@/components/staff/edit-staff-modal"

interface Staff {
    id: string
    first_name: string
    last_name: string
    email: string
    phone: string | null
    role: "super_admin" | "doctor" | "nurse" | "receptionist" | "accountant"
    gender: string | null
    date_of_birth: string | null
    address: string | null
    qualification: string | null
    specialization: string | null
    license_number: string | null
    hire_date: string | null
    is_active: boolean
    department: string | null
    emergency_contact_name: string | null
    emergency_contact_phone: string | null
    ic_number: string | null
    staff_id: string | null
    employment_status: string | null
    created_at: string
}

export default function StaffPage() {
    const { user, role: currentRole } = useAuthStore()
    const [staff, setStaff] = useState<Staff[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [roleFilter, setRoleFilter] = useState("all")
    const [showAddModal, setShowAddModal] = useState(false)
    const [showViewModal, setShowViewModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
    const [page, setPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)

    useEffect(() => { fetchStaff() }, [searchTerm, roleFilter, page])

    const fetchStaff = async () => {
        setLoading(true)
        try {
            const supabase = createClient()
            let query = supabase.from("staff_profiles").select("*", { count: "exact" })
                .order("created_at", { ascending: false }).range((page - 1) * 10, page * 10 - 1)

            if (roleFilter !== "all") query = query.eq("role", roleFilter)
            if (searchTerm) query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)

            const { data, count, error } = await query
            if (error) throw error
            setStaff(data || [])
            setTotalCount(count || 0)
        } catch (error) { console.error("Error:", error) }
        finally { setLoading(false) }
    }

    const handleDeactivate = async (id: string) => {
        if (!confirm("Deactivate this staff member?")) return
        const supabase = createClient()
        await supabase.from("staff_profiles").update({ is_active: false }).eq("id", id)
        await supabase.from("audit_logs").insert({ action: "staff_deactivated", table_name: "staff_profiles", record_id: id, user_id: user?.id })
        fetchStaff()
    }

    const getRoleBadge = (role: string) => {
        const s: Record<string, string> = { super_admin: "bg-purple-100 text-purple-700", doctor: "bg-blue-100 text-blue-700", nurse: "bg-green-100 text-green-700", receptionist: "bg-orange-100 text-orange-700", accountant: "bg-teal-100 text-teal-700" }
        return s[role] || "bg-gray-100 text-gray-700"
    }

    if (currentRole !== "super_admin") return (
        <div className="flex items-center justify-center h-96">
            <div className="text-center"><Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" /><h2 className="text-xl font-semibold">Access Denied</h2></div>
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div><h1 className="text-2xl font-bold">Staff Management</h1><p className="text-muted-foreground">Manage clinic staff</p></div>
                <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90"><Plus className="w-4 h-4" />Add Staff</button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background" />
                </div>
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-4 py-2.5 border rounded-lg bg-background">
                    <option value="all">All Roles</option>
                    <option value="doctor">Doctors</option>
                    <option value="nurse">Nurses</option>
                    <option value="receptionist">Receptionists</option>
                </select>
            </div>

            {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {staff.map((m) => (
                        <div key={m.id} className="bg-card rounded-xl border p-5 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">{m.first_name?.[0]}{m.last_name?.[0]}</div>
                                    <div><h3 className="font-semibold">{m.first_name} {m.last_name}</h3><span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadge(m.role)}`}>{m.role}</span></div>
                                </div>
                                <div className={`w-2.5 h-2.5 rounded-full ${m.is_active ? "bg-green-500" : "bg-gray-400"}`} />
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground mb-4">
                                <div className="flex items-center gap-2"><Mail className="w-4 h-4" />{m.email}</div>
                                {m.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4" />{m.phone}</div>}
                                {m.specialization && <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" />{m.specialization}</div>}
                            </div>
                            <div className="flex gap-2 pt-3 border-t">
                                <button onClick={() => { setSelectedStaff(m); setShowViewModal(true) }} className="flex-1 flex items-center justify-center gap-1 py-2 text-sm hover:bg-accent rounded-lg"><Eye className="w-4 h-4" />View</button>
                                <button onClick={() => { setSelectedStaff(m); setShowEditModal(true) }} className="flex-1 flex items-center justify-center gap-1 py-2 text-sm hover:bg-accent rounded-lg"><Edit className="w-4 h-4" />Edit</button>
                                <button onClick={() => handleDeactivate(m.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalCount > 10 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Showing {(page - 1) * 10 + 1}-{Math.min(page * 10, totalCount)} of {totalCount}</p>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border rounded-lg disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                        <button onClick={() => setPage(p => p + 1)} disabled={page * 10 >= totalCount} className="p-2 border rounded-lg disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            )}

            <AddStaffModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); fetchStaff() }} />
            {selectedStaff && <ViewStaffModal isOpen={showViewModal} staff={selectedStaff} onClose={() => { setShowViewModal(false); setSelectedStaff(null) }} />}
            {selectedStaff && <EditStaffModal isOpen={showEditModal} staff={selectedStaff} onClose={() => { setShowEditModal(false); setSelectedStaff(null) }} onSuccess={() => { setShowEditModal(false); fetchStaff() }} />}
        </div>
    )
}
