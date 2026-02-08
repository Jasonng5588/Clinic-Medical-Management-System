"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Download, Calendar, CheckCircle, XCircle, Clock, Loader2, ArrowLeft } from "lucide-react"
import { downloadAsCSV } from "@/lib/utils"
import Link from "next/link"

export default function AppointmentsReportPage() {
    const [loading, setLoading] = useState(true)
    const [dateFrom, setDateFrom] = useState(() => {
        const d = new Date(); d.setMonth(d.getMonth() - 1)
        return d.toISOString().split("T")[0]
    })
    const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0])
    const [stats, setStats] = useState({ total: 0, completed: 0, cancelled: 0, noShow: 0 })
    const [appointments, setAppointments] = useState<any[]>([])
    const [byDoctor, setByDoctor] = useState<{ name: string, count: number }[]>([])

    useEffect(() => { fetchData() }, [dateFrom, dateTo])

    const fetchData = async () => {
        setLoading(true)
        try {
            const supabase = createClient()

            const { data, count } = await supabase
                .from("appointments")
                .select("*, patient:patients(first_name, last_name), doctor:staff_profiles(first_name, last_name)", { count: "exact" })
                .gte("appointment_date", dateFrom)
                .lte("appointment_date", dateTo)
                .order("appointment_date", { ascending: false })

            const completed = data?.filter(a => a.status === "completed").length || 0
            const cancelled = data?.filter(a => a.status === "cancelled").length || 0
            const noShow = data?.filter(a => a.status === "no_show").length || 0

            // Group by doctor
            const doctorCounts: Record<string, number> = {}
            data?.forEach(a => {
                const name = a.doctor ? `Dr. ${a.doctor.first_name} ${a.doctor.last_name}` : "Unassigned"
                doctorCounts[name] = (doctorCounts[name] || 0) + 1
            })
            const doctorStats = Object.entries(doctorCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)

            setStats({ total: count || 0, completed, cancelled, noShow })
            setByDoctor(doctorStats.slice(0, 5))
            setAppointments(data?.slice(0, 10) || [])
        } catch (error) {
            console.error("Error:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleExport = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from("appointments")
            .select("*, patient:patients(first_name, last_name), doctor:staff_profiles(first_name, last_name)")
            .gte("appointment_date", dateFrom)
            .lte("appointment_date", dateTo)

        if (data) {
            const exportData = data.map(a => ({
                date: a.appointment_date,
                time: a.appointment_time,
                patient: a.patient ? `${a.patient.first_name} ${a.patient.last_name}` : '',
                doctor: a.doctor ? `Dr. ${a.doctor.first_name} ${a.doctor.last_name}` : '',
                type: a.appointment_type,
                status: a.status
            }))
            downloadAsCSV(exportData, `appointments-report-${dateFrom}-to-${dateTo}`)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/reports" className="p-2 hover:bg-accent rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
                <div><h1 className="text-2xl font-bold">Appointments Report</h1><p className="text-muted-foreground">Appointment statistics and trends</p></div>
            </div>

            {/* Date Filter */}
            <div className="flex flex-wrap gap-4 items-end">
                <div><label className="block text-sm font-medium mb-1">From</label><input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-4 py-2 border rounded-lg bg-background" /></div>
                <div><label className="block text-sm font-medium mb-1">To</label><input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-4 py-2 border rounded-lg bg-background" /></div>
                <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg"><Download className="w-4 h-4" />Export CSV</button>
            </div>

            {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div> : (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-card rounded-xl p-4 border"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-500/20"><Calendar className="w-5 h-5 text-blue-500" /></div><div><p className="text-sm text-muted-foreground">Total</p><p className="text-xl font-bold">{stats.total}</p></div></div></div>
                        <div className="bg-card rounded-xl p-4 border"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-500/20"><CheckCircle className="w-5 h-5 text-green-500" /></div><div><p className="text-sm text-muted-foreground">Completed</p><p className="text-xl font-bold text-green-600">{stats.completed}</p></div></div></div>
                        <div className="bg-card rounded-xl p-4 border"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-red-500/20"><XCircle className="w-5 h-5 text-red-500" /></div><div><p className="text-sm text-muted-foreground">Cancelled</p><p className="text-xl font-bold text-red-600">{stats.cancelled}</p></div></div></div>
                        <div className="bg-card rounded-xl p-4 border"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-yellow-500/20"><Clock className="w-5 h-5 text-yellow-500" /></div><div><p className="text-sm text-muted-foreground">No Show</p><p className="text-xl font-bold text-yellow-600">{stats.noShow}</p></div></div></div>
                    </div>

                    {/* By Doctor */}
                    <div className="bg-card rounded-xl border p-6">
                        <h2 className="font-semibold mb-4">Appointments by Doctor</h2>
                        <div className="space-y-3">
                            {byDoctor.map((doc, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                                    <span className="font-medium">{doc.name}</span>
                                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm">{doc.count}</span>
                                </div>
                            ))}
                            {byDoctor.length === 0 && <p className="text-center text-muted-foreground py-4">No data</p>}
                        </div>
                    </div>

                    {/* Recent Appointments */}
                    <div className="bg-card rounded-xl border">
                        <div className="px-6 py-4 border-b"><h2 className="font-semibold">Recent Appointments</h2></div>
                        <table className="w-full">
                            <thead className="bg-accent/50"><tr><th className="px-4 py-3 text-left text-sm font-medium">Date</th><th className="px-4 py-3 text-left text-sm font-medium">Time</th><th className="px-4 py-3 text-left text-sm font-medium">Patient</th><th className="px-4 py-3 text-left text-sm font-medium">Doctor</th><th className="px-4 py-3 text-left text-sm font-medium">Status</th></tr></thead>
                            <tbody className="divide-y">
                                {appointments.length > 0 ? appointments.map(a => (
                                    <tr key={a.id} className="hover:bg-accent/30">
                                        <td className="px-4 py-3">{new Date(a.appointment_date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">{a.appointment_time?.slice(0, 5)}</td>
                                        <td className="px-4 py-3 font-medium">{a.patient?.first_name} {a.patient?.last_name}</td>
                                        <td className="px-4 py-3">Dr. {a.doctor?.first_name}</td>
                                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs ${a.status === "completed" ? "bg-green-100 text-green-700" : a.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>{a.status}</span></td>
                                    </tr>
                                )) : <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No appointments in this period</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    )
}
