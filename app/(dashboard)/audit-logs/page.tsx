"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/auth-store"
import {
    ScrollText, Search, Filter, Calendar, User, FileText,
    Loader2, ChevronLeft, ChevronRight, Download, Eye, Shield
} from "lucide-react"

interface AuditLog {
    id: string
    action: string
    table_name: string
    record_id: string | null
    user_id: string | null
    old_values: any
    new_values: any
    ip_address: string | null
    created_at: string
    user?: { first_name: string; last_name: string; email: string }
}

export default function AuditLogsPage() {
    const { role } = useAuthStore()
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [actionFilter, setActionFilter] = useState("all")
    const [dateFrom, setDateFrom] = useState("")
    const [dateTo, setDateTo] = useState("")
    const [page, setPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

    useEffect(() => { fetchLogs() }, [searchTerm, actionFilter, dateFrom, dateTo, page])

    const fetchLogs = async () => {
        setLoading(true)
        try {
            const supabase = createClient()
            let query = supabase.from("audit_logs")
                .select(`*, user:staff_profiles!user_id(first_name, last_name, email)`, { count: "exact" })
                .order("created_at", { ascending: false })
                .range((page - 1) * 20, page * 20 - 1)

            if (actionFilter !== "all") query = query.eq("action", actionFilter)
            if (dateFrom) query = query.gte("created_at", dateFrom)
            if (dateTo) query = query.lte("created_at", dateTo + "T23:59:59")

            const { data, count, error } = await query
            if (error) throw error
            setLogs(data || [])
            setTotalCount(count || 0)
        } catch (error) { console.error("Error:", error) }
        finally { setLoading(false) }
    }

    const exportLogs = async () => {
        const csv = [
            ["Date", "Action", "Table", "User", "Record ID", "IP Address"].join(","),
            ...logs.map(l => [
                new Date(l.created_at).toLocaleString(),
                l.action,
                l.table_name,
                l.user ? `${l.user.first_name} ${l.user.last_name}` : "-",
                l.record_id || "-",
                l.ip_address || "-"
            ].join(","))
        ].join("\n")

        const blob = new Blob([csv], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `audit_logs_${new Date().toISOString().split("T")[0]}.csv`
        a.click()
    }

    const getActionBadge = (action: string) => {
        if (action.includes("created")) return "bg-green-100 text-green-700"
        if (action.includes("updated") || action.includes("approved")) return "bg-blue-100 text-blue-700"
        if (action.includes("deleted") || action.includes("deactivated")) return "bg-red-100 text-red-700"
        if (action.includes("rejected")) return "bg-orange-100 text-orange-700"
        return "bg-gray-100 text-gray-700"
    }

    const uniqueActions = [...new Set(logs.map(l => l.action))]

    if (role !== "super_admin") return (
        <div className="flex items-center justify-center h-96">
            <div className="text-center"><Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" /><h2 className="text-xl font-semibold">Access Denied</h2><p className="text-muted-foreground">Only administrators can view audit logs.</p></div>
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div><h1 className="text-2xl font-bold">Audit Logs</h1><p className="text-muted-foreground">Track all system actions</p></div>
                <button onClick={exportLogs} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90"><Download className="w-4 h-4" />Export CSV</button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl p-4 border"><p className="text-sm text-muted-foreground">Total Logs</p><p className="text-2xl font-bold">{totalCount}</p></div>
                <div className="bg-card rounded-xl p-4 border"><p className="text-sm text-muted-foreground">Creates</p><p className="text-2xl font-bold text-green-600">{logs.filter(l => l.action.includes("created")).length}</p></div>
                <div className="bg-card rounded-xl p-4 border"><p className="text-sm text-muted-foreground">Updates</p><p className="text-2xl font-bold text-blue-600">{logs.filter(l => l.action.includes("updated")).length}</p></div>
                <div className="bg-card rounded-xl p-4 border"><p className="text-sm text-muted-foreground">Deletes</p><p className="text-2xl font-bold text-red-600">{logs.filter(l => l.action.includes("deleted") || l.action.includes("deactivated")).length}</p></div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="px-4 py-2.5 border rounded-lg bg-background">
                    <option value="all">All Actions</option>
                    {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <div className="flex items-center gap-2">
                    <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-4 py-2.5 border rounded-lg bg-background" />
                    <span>to</span>
                    <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-4 py-2.5 border rounded-lg bg-background" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-card rounded-xl border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-accent/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium">Timestamp</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Action</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Table</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Record ID</th>
                            <th className="px-4 py-3 text-right text-sm font-medium">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? <tr><td colSpan={6} className="px-4 py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
                            : logs.length > 0 ? logs.map((log) => (
                                <tr key={log.id} className="hover:bg-accent/30">
                                    <td className="px-4 py-3 text-sm">{new Date(log.created_at).toLocaleString()}</td>
                                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionBadge(log.action)}`}>{log.action}</span></td>
                                    <td className="px-4 py-3 text-sm font-mono">{log.table_name}</td>
                                    <td className="px-4 py-3 text-sm">{log.user ? `${log.user.first_name} ${log.user.last_name}` : "-"}</td>
                                    <td className="px-4 py-3 text-sm font-mono truncate max-w-32">{log.record_id?.slice(0, 8) || "-"}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => setSelectedLog(log)} className="p-2 hover:bg-accent rounded-lg"><Eye className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No logs found</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalCount > 20 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Page {page} of {Math.ceil(totalCount / 20)}</p>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border rounded-lg disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                        <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= totalCount} className="p-2 border rounded-lg disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold">Log Details</h2>
                            <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-accent rounded-lg">×</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><p className="text-sm text-muted-foreground">Action</p><p className="font-medium">{selectedLog.action}</p></div>
                                <div><p className="text-sm text-muted-foreground">Table</p><p className="font-medium">{selectedLog.table_name}</p></div>
                                <div><p className="text-sm text-muted-foreground">Timestamp</p><p className="font-medium">{new Date(selectedLog.created_at).toLocaleString()}</p></div>
                                <div><p className="text-sm text-muted-foreground">User</p><p className="font-medium">{selectedLog.user ? `${selectedLog.user.first_name} ${selectedLog.user.last_name}` : "-"}</p></div>
                                <div><p className="text-sm text-muted-foreground">Record ID</p><p className="font-mono text-sm">{selectedLog.record_id || "-"}</p></div>
                                <div><p className="text-sm text-muted-foreground">IP Address</p><p className="font-medium">{selectedLog.ip_address || "-"}</p></div>
                            </div>
                            {selectedLog.old_values && <div><p className="text-sm font-medium text-muted-foreground mb-2">Old Values</p><pre className="p-4 bg-accent rounded-lg text-sm overflow-x-auto">{JSON.stringify(selectedLog.old_values, null, 2)}</pre></div>}
                            {selectedLog.new_values && <div><p className="text-sm font-medium text-muted-foreground mb-2">New Values</p><pre className="p-4 bg-accent rounded-lg text-sm overflow-x-auto">{JSON.stringify(selectedLog.new_values, null, 2)}</pre></div>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
