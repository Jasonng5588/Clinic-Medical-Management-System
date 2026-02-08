"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/auth-store"
import {
    RotateCcw, Search, Plus, Eye, Check, X as XIcon, Loader2,
    Clock, DollarSign, User, FileText, AlertTriangle
} from "lucide-react"

interface Refund {
    id: string
    invoice_id: string
    amount: number
    reason: string
    status: "pending" | "approved" | "rejected" | "processed"
    requested_by: string
    approved_by: string | null
    processed_at: string | null
    created_at: string
    invoice?: { invoice_number: string; total_amount: number; patient?: { first_name: string; last_name: string } }
    requester?: { first_name: string; last_name: string }
}

export default function RefundsPage() {
    const { user, role } = useAuthStore()
    const [refunds, setRefunds] = useState<Refund[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [statusFilter, setStatusFilter] = useState("all")

    useEffect(() => { fetchRefunds() }, [statusFilter])

    const fetchRefunds = async () => {
        setLoading(true)
        try {
            const supabase = createClient()
            let query = supabase.from("refunds").select(`*, invoice:invoices(invoice_number, total_amount, patient:patients(first_name, last_name)), requester:staff_profiles!requested_by(first_name, last_name)`).order("created_at", { ascending: false })
            if (statusFilter !== "all") query = query.eq("status", statusFilter)
            const { data, error } = await query
            if (error) throw error
            setRefunds(data || [])
        } catch (error) { console.error("Error:", error) }
        finally { setLoading(false) }
    }

    const handleApprove = async (id: string) => {
        if (!confirm("Approve this refund request?")) return
        const supabase = createClient()
        await supabase.from("refunds").update({ status: "approved", approved_by: user?.id }).eq("id", id)
        await supabase.from("audit_logs").insert({ action: "refund_approved", table_name: "refunds", record_id: id, user_id: user?.id })
        fetchRefunds()
    }

    const handleReject = async (id: string) => {
        if (!confirm("Reject this refund request?")) return
        const supabase = createClient()
        await supabase.from("refunds").update({ status: "rejected", approved_by: user?.id }).eq("id", id)
        await supabase.from("audit_logs").insert({ action: "refund_rejected", table_name: "refunds", record_id: id, user_id: user?.id })
        fetchRefunds()
    }

    const handleProcess = async (id: string, invoice_id: string) => {
        if (!confirm("Process this refund? This will update the invoice status.")) return
        const supabase = createClient()
        await supabase.from("refunds").update({ status: "processed", processed_at: new Date().toISOString() }).eq("id", id)
        await supabase.from("invoices").update({ status: "refunded" }).eq("id", invoice_id)
        await supabase.from("audit_logs").insert({ action: "refund_processed", table_name: "refunds", record_id: id, user_id: user?.id })
        fetchRefunds()
    }

    const getStatusBadge = (status: string) => {
        const s: Record<string, string> = { pending: "bg-yellow-100 text-yellow-700", approved: "bg-blue-100 text-blue-700", rejected: "bg-red-100 text-red-700", processed: "bg-green-100 text-green-700" }
        return s[status] || "bg-gray-100 text-gray-700"
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div><h1 className="text-2xl font-bold">Refund Management</h1><p className="text-muted-foreground">Process and manage refund requests</p></div>
                <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90"><Plus className="w-4 h-4" />Request Refund</button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Pending", count: refunds.filter(r => r.status === "pending").length, color: "bg-yellow-500", icon: Clock },
                    { label: "Approved", count: refunds.filter(r => r.status === "approved").length, color: "bg-blue-500", icon: Check },
                    { label: "Processed", count: refunds.filter(r => r.status === "processed").length, color: "bg-green-500", icon: DollarSign },
                    { label: "Rejected", count: refunds.filter(r => r.status === "rejected").length, color: "bg-red-500", icon: XIcon },
                ].map((s, i) => (
                    <div key={i} className="bg-card rounded-xl p-4 border">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${s.color}/20`}><s.icon className={`w-5 h-5 ${s.color.replace("bg-", "text-")}`} /></div>
                            <div><p className="text-sm text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.count}</p></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div className="flex gap-4">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border rounded-lg bg-background">
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="processed">Processed</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-card rounded-xl border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-accent/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium">Invoice</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Patient</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Reason</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                            <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr><td colSpan={7} className="px-4 py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
                        ) : refunds.length > 0 ? refunds.map((r) => (
                            <tr key={r.id} className="hover:bg-accent/30">
                                <td className="px-4 py-3 font-mono text-sm">{r.invoice?.invoice_number}</td>
                                <td className="px-4 py-3">{r.invoice?.patient?.first_name} {r.invoice?.patient?.last_name}</td>
                                <td className="px-4 py-3 font-semibold">RM {r.amount.toFixed(2)}</td>
                                <td className="px-4 py-3 text-sm max-w-xs truncate">{r.reason}</td>
                                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(r.status)}`}>{r.status}</span></td>
                                <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-1">
                                        {r.status === "pending" && (role === "super_admin" || role === "accountant") && (
                                            <>
                                                <button onClick={() => handleApprove(r.id)} className="p-2 hover:bg-green-100 text-green-600 rounded-lg" title="Approve"><Check className="w-4 h-4" /></button>
                                                <button onClick={() => handleReject(r.id)} className="p-2 hover:bg-red-100 text-red-600 rounded-lg" title="Reject"><XIcon className="w-4 h-4" /></button>
                                            </>
                                        )}
                                        {r.status === "approved" && (role === "super_admin" || role === "accountant") && (
                                            <button onClick={() => handleProcess(r.id, r.invoice_id)} className="px-3 py-1 bg-primary text-white text-sm rounded-lg hover:bg-primary/90">Process</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No refunds found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showCreateModal && <CreateRefundModal onClose={() => setShowCreateModal(false)} onSuccess={() => { setShowCreateModal(false); fetchRefunds() }} />}
        </div>
    )
}

// Create Refund Modal
function CreateRefundModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const { user } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [invoices, setInvoices] = useState<any[]>([])
    const [formData, setFormData] = useState({ invoice_id: "", amount: 0, reason: "" })

    useEffect(() => {
        const fetchInvoices = async () => {
            const supabase = createClient()
            const { data } = await supabase.from("invoices").select("id, invoice_number, total_amount, patient:patients(first_name, last_name)").eq("status", "paid").order("created_at", { ascending: false }).limit(50)
            setInvoices(data || [])
        }
        fetchInvoices()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.invoice_id || formData.amount <= 0) { alert("Please fill all required fields"); return }

        setLoading(true)
        try {
            const supabase = createClient()
            const { error } = await supabase.from("refunds").insert({
                invoice_id: formData.invoice_id,
                amount: formData.amount,
                reason: formData.reason,
                status: "pending",
                requested_by: user?.id,
            })
            if (error) throw error

            await supabase.from("audit_logs").insert({ action: "refund_requested", table_name: "refunds", user_id: user?.id, new_values: formData })
            alert("Refund request submitted!")
            onSuccess()
        } catch (error) { alert("Failed to create refund request") }
        finally { setLoading(false) }
    }

    const selectedInvoice = invoices.find(i => i.id === formData.invoice_id)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-card rounded-2xl w-full max-w-lg shadow-xl">
                <div className="border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Request Refund</h2>
                    <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg"><XIcon className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Invoice *</label>
                        <select value={formData.invoice_id} onChange={(e) => { const inv = invoices.find(i => i.id === e.target.value); setFormData({ ...formData, invoice_id: e.target.value, amount: inv?.total_amount || 0 }) }} className="w-full px-4 py-2.5 rounded-lg border bg-background" required>
                            <option value="">Select Invoice</option>
                            {invoices.map(inv => (
                                <option key={inv.id} value={inv.id}>{inv.invoice_number} - {inv.patient?.first_name} {inv.patient?.last_name} (RM {inv.total_amount})</option>
                            ))}
                        </select>
                    </div>

                    {selectedInvoice && (
                        <div className="p-4 bg-accent rounded-lg">
                            <p className="text-sm text-muted-foreground">Maximum refund amount</p>
                            <p className="text-lg font-bold">RM {selectedInvoice.total_amount.toFixed(2)}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-2">Refund Amount *</label>
                        <input type="number" value={formData.amount || ""} onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })} max={selectedInvoice?.total_amount || 0} step="0.01" className="w-full px-4 py-2.5 rounded-lg border bg-background" required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Reason *</label>
                        <textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" rows={3} required placeholder="Explain why refund is needed..." />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 border rounded-lg">Cancel</button>
                        <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg disabled:opacity-50">
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}{loading ? "Submitting..." : "Submit Request"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
