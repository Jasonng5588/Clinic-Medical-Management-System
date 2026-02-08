"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import {
    History, Search, Calendar, Loader2, User, Clock,
    CheckCircle, XCircle, ChevronLeft, ChevronRight
} from "lucide-react"

interface QueueHistory {
    id: string
    queue_number: number
    status: string
    priority: string
    check_in_time: string
    start_time: string | null
    end_time: string | null
    patient?: { first_name: string; last_name: string; patient_number: string }
}

export default function QueueHistoryPage() {
    const [history, setHistory] = useState<QueueHistory[]>([])
    const [loading, setLoading] = useState(true)
    const [dateFrom, setDateFrom] = useState("")
    const [dateTo, setDateTo] = useState("")
    const [page, setPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)

    useEffect(() => { fetchHistory() }, [dateFrom, dateTo, page])

    const fetchHistory = async () => {
        setLoading(true)
        try {
            const supabase = createClient()
            let query = supabase.from("queues")
                .select(`*, patient:patients(first_name, last_name, patient_number)`, { count: "exact" })
                .in("status", ["completed", "cancelled"])
                .order("check_in_time", { ascending: false })
                .range((page - 1) * 20, page * 20 - 1)

            if (dateFrom) query = query.gte("check_in_time", dateFrom)
            if (dateTo) query = query.lte("check_in_time", dateTo + "T23:59:59")

            const { data, count, error } = await query
            if (error) throw error
            setHistory(data || [])
            setTotalCount(count || 0)
        } catch (error) { console.error("Error:", error) }
        finally { setLoading(false) }
    }

    const calculateWaitTime = (checkIn: string, start: string | null) => {
        if (!start) return "-"
        const diff = new Date(start).getTime() - new Date(checkIn).getTime()
        const minutes = Math.round(diff / 60000)
        return `${minutes} min`
    }

    const calculateServiceTime = (start: string | null, end: string | null) => {
        if (!start || !end) return "-"
        const diff = new Date(end).getTime() - new Date(start).getTime()
        const minutes = Math.round(diff / 60000)
        return `${minutes} min`
    }

    const completedCount = history.filter(h => h.status === "completed").length
    const cancelledCount = history.filter(h => h.status === "cancelled").length

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Queue History</h1>
                <p className="text-muted-foreground">View past queue records</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl p-4 border">
                    <p className="text-sm text-muted-foreground">Total Records</p>
                    <p className="text-2xl font-bold">{totalCount}</p>
                </div>
                <div className="bg-card rounded-xl p-4 border">
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{completedCount}</p>
                </div>
                <div className="bg-card rounded-xl p-4 border">
                    <p className="text-sm text-muted-foreground">Cancelled</p>
                    <p className="text-2xl font-bold text-red-600">{cancelledCount}</p>
                </div>
                <div className="bg-card rounded-xl p-4 border">
                    <p className="text-sm text-muted-foreground">Showing</p>
                    <p className="text-2xl font-bold">Page {page}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="px-4 py-2.5 border rounded-lg bg-background"
                    />
                    <span>to</span>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="px-4 py-2.5 border rounded-lg bg-background"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-card rounded-xl border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-accent/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium">Queue #</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Patient</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Check In</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Wait Time</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Service Time</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                </td>
                            </tr>
                        ) : history.length > 0 ? history.map((item) => (
                            <tr key={item.id} className="hover:bg-accent/30">
                                <td className="px-4 py-3">
                                    <span className="font-bold text-lg">{item.queue_number}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="font-medium">{item.patient?.first_name} {item.patient?.last_name}</p>
                                    <p className="text-sm text-muted-foreground">{item.patient?.patient_number}</p>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    {new Date(item.check_in_time).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        {calculateWaitTime(item.check_in_time, item.start_time)}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    {calculateServiceTime(item.start_time, item.end_time)}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${item.status === "completed"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                        }`}>
                                        {item.status === "completed" ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                                    No queue history found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalCount > 20 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, totalCount)} of {totalCount}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 border rounded-lg disabled:opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page * 20 >= totalCount}
                            className="p-2 border rounded-lg disabled:opacity-50"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
