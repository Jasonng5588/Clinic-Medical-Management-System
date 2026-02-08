"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Download, Users, UserPlus, Calendar, Loader2, ArrowLeft } from "lucide-react"
import { downloadAsCSV } from "@/lib/utils"
import Link from "next/link"

export default function PatientsReportPage() {
    const [loading, setLoading] = useState(true)
    const [dateFrom, setDateFrom] = useState(() => {
        const d = new Date(); d.setMonth(d.getMonth() - 1)
        return d.toISOString().split("T")[0]
    })
    const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0])
    const [stats, setStats] = useState({ total: 0, newThisMonth: 0, male: 0, female: 0 })
    const [patients, setPatients] = useState<any[]>([])
    const [ageGroups, setAgeGroups] = useState({ under18: 0, adult: 0, senior: 0 })

    useEffect(() => { fetchData() }, [dateFrom, dateTo])

    const fetchData = async () => {
        setLoading(true)
        try {
            const supabase = createClient()

            // Get all patients
            const { data: allPatients, count } = await supabase
                .from("patients")
                .select("*", { count: "exact" })

            // Get new patients in range
            const { data: newPatients } = await supabase
                .from("patients")
                .select("*")
                .gte("created_at", dateFrom)
                .lte("created_at", dateTo + "T23:59:59")
                .order("created_at", { ascending: false })

            const male = allPatients?.filter(p => p.gender === "male").length || 0
            const female = allPatients?.filter(p => p.gender === "female").length || 0

            // Calculate age groups
            const now = new Date()
            let under18 = 0, adult = 0, senior = 0
            allPatients?.forEach(p => {
                if (p.date_of_birth) {
                    const age = Math.floor((now.getTime() - new Date(p.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                    if (age < 18) under18++
                    else if (age < 60) adult++
                    else senior++
                }
            })

            setStats({ total: count || 0, newThisMonth: newPatients?.length || 0, male, female })
            setAgeGroups({ under18, adult, senior })
            setPatients(newPatients?.slice(0, 10) || [])
        } catch (error) {
            console.error("Error:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleExport = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from("patients")
            .select("*")
            .gte("created_at", dateFrom)
            .lte("created_at", dateTo + "T23:59:59")

        if (data) {
            const exportData = data.map(p => ({
                patient_number: p.patient_number,
                name: `${p.first_name} ${p.last_name}`,
                gender: p.gender,
                phone: p.phone,
                email: p.email,
                registered: new Date(p.created_at).toLocaleDateString()
            }))
            downloadAsCSV(exportData, `patients-report-${dateFrom}-to-${dateTo}`)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/reports" className="p-2 hover:bg-accent rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
                <div><h1 className="text-2xl font-bold">Patient Report</h1><p className="text-muted-foreground">Patient demographics and registrations</p></div>
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
                        <div className="bg-card rounded-xl p-4 border"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-500/20"><Users className="w-5 h-5 text-blue-500" /></div><div><p className="text-sm text-muted-foreground">Total Patients</p><p className="text-xl font-bold">{stats.total}</p></div></div></div>
                        <div className="bg-card rounded-xl p-4 border"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-500/20"><UserPlus className="w-5 h-5 text-green-500" /></div><div><p className="text-sm text-muted-foreground">New Registrations</p><p className="text-xl font-bold text-green-600">{stats.newThisMonth}</p></div></div></div>
                        <div className="bg-card rounded-xl p-4 border"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-purple-500/20"><Users className="w-5 h-5 text-purple-500" /></div><div><p className="text-sm text-muted-foreground">Male</p><p className="text-xl font-bold">{stats.male}</p></div></div></div>
                        <div className="bg-card rounded-xl p-4 border"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-pink-500/20"><Users className="w-5 h-5 text-pink-500" /></div><div><p className="text-sm text-muted-foreground">Female</p><p className="text-xl font-bold">{stats.female}</p></div></div></div>
                    </div>

                    {/* Age Distribution */}
                    <div className="bg-card rounded-xl border p-6">
                        <h2 className="font-semibold mb-4">Age Distribution</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-accent rounded-lg"><p className="text-2xl font-bold">{ageGroups.under18}</p><p className="text-sm text-muted-foreground">Under 18</p></div>
                            <div className="text-center p-4 bg-accent rounded-lg"><p className="text-2xl font-bold">{ageGroups.adult}</p><p className="text-sm text-muted-foreground">18-59 years</p></div>
                            <div className="text-center p-4 bg-accent rounded-lg"><p className="text-2xl font-bold">{ageGroups.senior}</p><p className="text-sm text-muted-foreground">60+ years</p></div>
                        </div>
                    </div>

                    {/* Recent Registrations */}
                    <div className="bg-card rounded-xl border">
                        <div className="px-6 py-4 border-b"><h2 className="font-semibold">Recent Registrations</h2></div>
                        <table className="w-full">
                            <thead className="bg-accent/50"><tr><th className="px-4 py-3 text-left text-sm font-medium">Patient ID</th><th className="px-4 py-3 text-left text-sm font-medium">Name</th><th className="px-4 py-3 text-left text-sm font-medium">Gender</th><th className="px-4 py-3 text-left text-sm font-medium">Phone</th><th className="px-4 py-3 text-left text-sm font-medium">Registered</th></tr></thead>
                            <tbody className="divide-y">
                                {patients.length > 0 ? patients.map(p => (
                                    <tr key={p.id} className="hover:bg-accent/30">
                                        <td className="px-4 py-3 font-mono text-sm">{p.patient_number}</td>
                                        <td className="px-4 py-3 font-medium">{p.first_name} {p.last_name}</td>
                                        <td className="px-4 py-3 capitalize">{p.gender}</td>
                                        <td className="px-4 py-3">{p.phone}</td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                                    </tr>
                                )) : <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No new patients in this period</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    )
}
