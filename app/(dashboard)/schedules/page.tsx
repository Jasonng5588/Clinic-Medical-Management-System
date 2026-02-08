"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/auth-store"
import {
    Calendar, Plus, Clock, User, ChevronLeft, ChevronRight,
    Loader2, X, Edit, Trash2, Shield
} from "lucide-react"

interface Schedule {
    id: string
    staff_id: string
    day_of_week: number
    start_time: string
    end_time: string
    is_available: boolean
    notes: string | null
    staff?: { first_name: string; last_name: string; role: string }
}

interface LeaveRequest {
    id: string
    staff_id: string
    start_date: string
    end_date: string
    reason: string
    status: "pending" | "approved" | "rejected"
    staff?: { first_name: string; last_name: string }
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function SchedulesPage() {
    const { user, role } = useAuthStore()
    const [schedules, setSchedules] = useState<Schedule[]>([])
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
    const [staffList, setStaffList] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedStaff, setSelectedStaff] = useState("all")
    const [showAddModal, setShowAddModal] = useState(false)
    const [showLeaveModal, setShowLeaveModal] = useState(false)
    const [tab, setTab] = useState<"schedules" | "leaves">("schedules")

    useEffect(() => { fetchData() }, [selectedStaff])

    const fetchData = async () => {
        setLoading(true)
        try {
            const supabase = createClient()

            // Fetch staff list
            const { data: staff } = await supabase.from("staff_profiles").select("id, first_name, last_name, role").eq("is_active", true)
            setStaffList(staff || [])

            // Fetch schedules
            let scheduleQuery = supabase.from("staff_schedules").select(`*, staff:staff_profiles!staff_id(first_name, last_name, role)`).order("day_of_week")
            if (selectedStaff !== "all") scheduleQuery = scheduleQuery.eq("staff_id", selectedStaff)
            const { data: scheduleData } = await scheduleQuery
            setSchedules(scheduleData || [])

            // Fetch leave requests
            let leaveQuery = supabase.from("leave_requests").select(`*, staff:staff_profiles!staff_id(first_name, last_name)`).order("created_at", { ascending: false })
            if (role !== "super_admin") leaveQuery = leaveQuery.eq("staff_id", user?.id)
            const { data: leaveData } = await leaveQuery
            setLeaveRequests(leaveData || [])
        } catch (error) { console.error("Error:", error) }
        finally { setLoading(false) }
    }

    const handleApproveLeave = async (id: string, approve: boolean) => {
        const supabase = createClient()
        await supabase.from("leave_requests").update({ status: approve ? "approved" : "rejected" }).eq("id", id)
        await supabase.from("audit_logs").insert({ action: approve ? "leave_approved" : "leave_rejected", table_name: "leave_requests", record_id: id, user_id: user?.id })
        fetchData()
    }

    const handleDeleteSchedule = async (id: string) => {
        if (!confirm("Delete this schedule?")) return
        const supabase = createClient()
        await supabase.from("staff_schedules").delete().eq("id", id)
        fetchData()
    }

    // Group schedules by day
    const schedulesByDay = DAYS.map((day, index) => ({
        day, index, schedules: schedules.filter(s => s.day_of_week === index)
    }))

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div><h1 className="text-2xl font-bold">Staff Schedules</h1><p className="text-muted-foreground">Manage working hours and leave requests</p></div>
                <div className="flex gap-2">
                    <button onClick={() => setShowLeaveModal(true)} className="flex items-center gap-2 px-4 py-2.5 border rounded-lg hover:bg-accent"><Calendar className="w-4 h-4" />Request Leave</button>
                    {role === "super_admin" && <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90"><Plus className="w-4 h-4" />Add Schedule</button>}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b">
                <button onClick={() => setTab("schedules")} className={`px-4 py-2 border-b-2 ${tab === "schedules" ? "border-primary text-primary" : "border-transparent"}`}>Weekly Schedules</button>
                <button onClick={() => setTab("leaves")} className={`px-4 py-2 border-b-2 ${tab === "leaves" ? "border-primary text-primary" : "border-transparent"}`}>Leave Requests</button>
            </div>

            {tab === "schedules" && (
                <>
                    <select value={selectedStaff} onChange={(e) => setSelectedStaff(e.target.value)} className="px-4 py-2.5 border rounded-lg bg-background max-w-xs">
                        <option value="all">All Staff</option>
                        {staffList.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.role})</option>)}
                    </select>

                    {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div> : (
                        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                            {schedulesByDay.map(({ day, index, schedules: daySchedules }) => (
                                <div key={day} className="bg-card rounded-xl border p-4">
                                    <h3 className={`font-semibold mb-3 ${index === new Date().getDay() ? "text-primary" : ""}`}>{day}</h3>
                                    {daySchedules.length > 0 ? (
                                        <div className="space-y-2">
                                            {daySchedules.map((s) => (
                                                <div key={s.id} className={`p-2 rounded-lg text-sm ${s.is_available ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"} border`}>
                                                    <p className="font-medium">{s.staff?.first_name}</p>
                                                    <p className="text-xs text-muted-foreground">{s.start_time} - {s.end_time}</p>
                                                    {role === "super_admin" && <button onClick={() => handleDeleteSchedule(s.id)} className="text-xs text-red-600 mt-1">Remove</button>}
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="text-sm text-muted-foreground">No schedules</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {tab === "leaves" && (
                <div className="bg-card rounded-xl border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-accent/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium">Staff</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Period</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Reason</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                {role === "super_admin" && <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {leaveRequests.length > 0 ? leaveRequests.map((l) => (
                                <tr key={l.id} className="hover:bg-accent/30">
                                    <td className="px-4 py-3 font-medium">{l.staff?.first_name} {l.staff?.last_name}</td>
                                    <td className="px-4 py-3 text-sm">{new Date(l.start_date).toLocaleDateString()} - {new Date(l.end_date).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-sm">{l.reason}</td>
                                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${l.status === "approved" ? "bg-green-100 text-green-700" : l.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{l.status}</span></td>
                                    {role === "super_admin" && l.status === "pending" && (
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => handleApproveLeave(l.id, true)} className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg mr-2">Approve</button>
                                            <button onClick={() => handleApproveLeave(l.id, false)} className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg">Reject</button>
                                        </td>
                                    )}
                                </tr>
                            )) : <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No leave requests</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {showAddModal && <AddScheduleModal staffList={staffList} onClose={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); fetchData() }} />}
            {showLeaveModal && <LeaveRequestModal onClose={() => setShowLeaveModal(false)} onSuccess={() => { setShowLeaveModal(false); fetchData() }} />}
        </div>
    )
}

function AddScheduleModal({ staffList, onClose, onSuccess }: { staffList: any[]; onClose: () => void; onSuccess: () => void }) {
    const { user } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({ staff_id: "", day_of_week: 1, start_time: "09:00", end_time: "17:00", is_available: true })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const supabase = createClient()
            const { error } = await supabase.from("staff_schedules").insert(formData)
            if (error) throw error
            await supabase.from("audit_logs").insert({ action: "schedule_created", table_name: "staff_schedules", user_id: user?.id })
            onSuccess()
        } catch (error) { alert("Failed to create schedule") }
        finally { setLoading(false) }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-card rounded-2xl w-full max-w-md shadow-xl">
                <div className="border-b px-6 py-4 flex items-center justify-between"><h2 className="text-xl font-bold">Add Schedule</h2><button onClick={onClose} className="p-2 hover:bg-accent rounded-lg"><X className="w-5 h-5" /></button></div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div><label className="block text-sm font-medium mb-2">Staff *</label><select value={formData.staff_id} onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" required><option value="">Select Staff</option>{staffList.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}</select></div>
                    <div><label className="block text-sm font-medium mb-2">Day *</label><select value={formData.day_of_week} onChange={(e) => setFormData({ ...formData, day_of_week: parseInt(e.target.value) })} className="w-full px-4 py-2.5 rounded-lg border bg-background">{DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}</select></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium mb-2">Start Time</label><input type="time" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" /></div>
                        <div><label className="block text-sm font-medium mb-2">End Time</label><input type="time" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" /></div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 border rounded-lg">Cancel</button>
                        <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg disabled:opacity-50">{loading && <Loader2 className="w-4 h-4 animate-spin" />}Save</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function LeaveRequestModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const { user } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({ start_date: "", end_date: "", reason: "" })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const supabase = createClient()
            await supabase.from("leave_requests").insert({ staff_id: user?.id, ...formData, status: "pending" })
            await supabase.from("audit_logs").insert({ action: "leave_requested", table_name: "leave_requests", user_id: user?.id })
            alert("Leave request submitted!")
            onSuccess()
        } catch (error) { alert("Failed") }
        finally { setLoading(false) }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-card rounded-2xl w-full max-w-md shadow-xl">
                <div className="border-b px-6 py-4 flex items-center justify-between"><h2 className="text-xl font-bold">Request Leave</h2><button onClick={onClose} className="p-2 hover:bg-accent rounded-lg"><X className="w-5 h-5" /></button></div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium mb-2">From</label><input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" required /></div>
                        <div><label className="block text-sm font-medium mb-2">To</label><input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" required /></div>
                    </div>
                    <div><label className="block text-sm font-medium mb-2">Reason</label><textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" rows={3} required /></div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 border rounded-lg">Cancel</button>
                        <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg disabled:opacity-50">{loading && <Loader2 className="w-4 h-4 animate-spin" />}Submit</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
