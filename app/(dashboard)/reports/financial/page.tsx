"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Download, DollarSign, TrendingUp, TrendingDown, CreditCard, Loader2, ArrowLeft } from "lucide-react"
import { downloadAsCSV } from "@/lib/utils"
import Link from "next/link"

export default function FinancialReportPage() {
    const [loading, setLoading] = useState(true)
    const [dateFrom, setDateFrom] = useState(() => {
        const d = new Date(); d.setMonth(d.getMonth() - 1)
        return d.toISOString().split("T")[0]
    })
    const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0])
    const [stats, setStats] = useState({ totalRevenue: 0, totalPayments: 0, pendingAmount: 0, refundedAmount: 0 })
    const [recentPayments, setRecentPayments] = useState<any[]>([])

    useEffect(() => { fetchData() }, [dateFrom, dateTo])

    const fetchData = async () => {
        setLoading(true)
        try {
            const supabase = createClient()

            // Get payments
            const { data: payments } = await supabase
                .from("payments")
                .select("*, invoice:invoices(invoice_number, patient:patients(first_name, last_name))")
                .gte("created_at", dateFrom)
                .lte("created_at", dateTo + "T23:59:59")
                .order("created_at", { ascending: false })

            // Get invoices
            const { data: invoices } = await supabase
                .from("invoices")
                .select("*")
                .gte("created_at", dateFrom)
                .lte("created_at", dateTo + "T23:59:59")

            const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0
            const totalPayments = payments?.filter(p => p.status === "completed").reduce((sum, p) => sum + (p.amount || 0), 0) || 0
            const pendingAmount = invoices?.filter(i => i.status === "pending").reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0
            const refundedAmount = payments?.filter(p => p.status === "refunded").reduce((sum, p) => sum + (p.amount || 0), 0) || 0

            setStats({ totalRevenue, totalPayments, pendingAmount, refundedAmount })
            setRecentPayments(payments?.slice(0, 10) || [])
        } catch (error) {
            console.error("Error:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleExport = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from("payments")
            .select("*, invoice:invoices(invoice_number)")
            .gte("created_at", dateFrom)
            .lte("created_at", dateTo + "T23:59:59")

        if (data) {
            const exportData = data.map(p => ({
                payment_number: p.payment_number,
                invoice: p.invoice?.invoice_number,
                amount: p.amount,
                method: p.payment_method,
                status: p.status,
                date: new Date(p.created_at).toLocaleDateString()
            }))
            downloadAsCSV(exportData, `financial-report-${dateFrom}-to-${dateTo}`)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/reports" className="p-2 hover:bg-accent rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
                <div><h1 className="text-2xl font-bold">Financial Report</h1><p className="text-muted-foreground">Revenue and payment analytics</p></div>
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
                        <div className="bg-card rounded-xl p-4 border"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-500/20"><DollarSign className="w-5 h-5 text-green-500" /></div><div><p className="text-sm text-muted-foreground">Total Revenue</p><p className="text-xl font-bold">RM {stats.totalRevenue.toFixed(2)}</p></div></div></div>
                        <div className="bg-card rounded-xl p-4 border"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-500/20"><CreditCard className="w-5 h-5 text-blue-500" /></div><div><p className="text-sm text-muted-foreground">Collected</p><p className="text-xl font-bold">RM {stats.totalPayments.toFixed(2)}</p></div></div></div>
                        <div className="bg-card rounded-xl p-4 border"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-yellow-500/20"><TrendingUp className="w-5 h-5 text-yellow-500" /></div><div><p className="text-sm text-muted-foreground">Pending</p><p className="text-xl font-bold">RM {stats.pendingAmount.toFixed(2)}</p></div></div></div>
                        <div className="bg-card rounded-xl p-4 border"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-red-500/20"><TrendingDown className="w-5 h-5 text-red-500" /></div><div><p className="text-sm text-muted-foreground">Refunded</p><p className="text-xl font-bold">RM {stats.refundedAmount.toFixed(2)}</p></div></div></div>
                    </div>

                    {/* Recent Payments */}
                    <div className="bg-card rounded-xl border">
                        <div className="px-6 py-4 border-b"><h2 className="font-semibold">Recent Payments</h2></div>
                        <table className="w-full">
                            <thead className="bg-accent/50"><tr><th className="px-4 py-3 text-left text-sm font-medium">Payment</th><th className="px-4 py-3 text-left text-sm font-medium">Invoice</th><th className="px-4 py-3 text-left text-sm font-medium">Amount</th><th className="px-4 py-3 text-left text-sm font-medium">Method</th><th className="px-4 py-3 text-left text-sm font-medium">Date</th></tr></thead>
                            <tbody className="divide-y">
                                {recentPayments.length > 0 ? recentPayments.map(p => (
                                    <tr key={p.id} className="hover:bg-accent/30">
                                        <td className="px-4 py-3 font-mono text-sm">{p.payment_number}</td>
                                        <td className="px-4 py-3 font-mono text-sm">{p.invoice?.invoice_number || '-'}</td>
                                        <td className="px-4 py-3 font-medium">RM {(p.amount || 0).toFixed(2)}</td>
                                        <td className="px-4 py-3 capitalize">{p.payment_method}</td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                                    </tr>
                                )) : <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No payments in this period</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    )
}
