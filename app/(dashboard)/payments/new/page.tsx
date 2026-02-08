"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/auth-store"
import { ArrowLeft, Search, Loader2, CreditCard, Wallet, Building2, Smartphone } from "lucide-react"
import Link from "next/link"

export default function NewPaymentPage() {
    const router = useRouter()
    const { user } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [invoices, setInvoices] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
    const [formData, setFormData] = useState({
        amount: 0,
        payment_method: "cash",
        reference_number: "",
        notes: "",
    })

    useEffect(() => {
        if (searchTerm.length >= 2) {
            searchInvoices()
        }
    }, [searchTerm])

    const searchInvoices = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from("invoices")
            .select(`
                id, invoice_number, total_amount, status,
                patient:patients(first_name, last_name, patient_number)
            `)
            .or(`invoice_number.ilike.%${searchTerm}%`)
            .in("status", ["pending", "draft"])
            .limit(5)
        setInvoices(data || [])
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedInvoice) {
            alert("Please select an invoice")
            return
        }
        if (formData.amount <= 0) {
            alert("Please enter a valid amount")
            return
        }

        setLoading(true)
        try {
            const supabase = createClient()
            const paymentNumber = `PAY${Date.now().toString().slice(-10)}`

            const { error } = await supabase.from("payments").insert({
                payment_number: paymentNumber,
                invoice_id: selectedInvoice.id,
                amount: formData.amount,
                payment_method: formData.payment_method,
                reference_number: formData.reference_number || null,
                notes: formData.notes || null,
                status: "completed",
                processed_by: user?.id,
            })

            if (error) throw error

            // Update invoice status if fully paid
            if (formData.amount >= selectedInvoice.total_amount) {
                await supabase
                    .from("invoices")
                    .update({ status: "paid", paid_at: new Date().toISOString() })
                    .eq("id", selectedInvoice.id)
            }

            alert("Payment recorded successfully!")
            router.push("/payments")
        } catch (error) {
            console.error("Error:", error)
            alert("Failed to record payment")
        } finally {
            setLoading(false)
        }
    }

    const paymentMethods = [
        { id: "cash", label: "Cash", icon: Wallet },
        { id: "card", label: "Card", icon: CreditCard },
        { id: "transfer", label: "Bank Transfer", icon: Building2 },
        { id: "ewallet", label: "E-Wallet", icon: Smartphone },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/payments" className="p-2 hover:bg-accent rounded-lg">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Record Payment</h1>
                    <p className="text-muted-foreground">Record a new payment for an invoice</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                {/* Invoice Selection */}
                <div className="bg-card rounded-xl border p-6">
                    <h2 className="text-lg font-semibold mb-4">Select Invoice</h2>
                    {selectedInvoice ? (
                        <div className="p-4 bg-accent rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-mono font-medium">{selectedInvoice.invoice_number}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedInvoice.patient?.first_name} {selectedInvoice.patient?.last_name}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold">RM {selectedInvoice.total_amount?.toFixed(2)}</p>
                                    <button type="button" onClick={() => setSelectedInvoice(null)} className="text-sm text-primary">Change</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by invoice number..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background"
                            />
                            {invoices.length > 0 && searchTerm && (
                                <div className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg">
                                    {invoices.map(invoice => (
                                        <button
                                            key={invoice.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedInvoice(invoice)
                                                setFormData({ ...formData, amount: invoice.total_amount })
                                                setSearchTerm("")
                                                setInvoices([])
                                            }}
                                            className="w-full px-4 py-3 text-left hover:bg-accent flex items-center justify-between"
                                        >
                                            <div>
                                                <p className="font-mono font-medium">{invoice.invoice_number}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {invoice.patient?.first_name} {invoice.patient?.last_name}
                                                </p>
                                            </div>
                                            <span className="font-semibold">RM {invoice.total_amount?.toFixed(2)}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Payment Details */}
                <div className="bg-card rounded-xl border p-6 space-y-4">
                    <h2 className="text-lg font-semibold">Payment Details</h2>

                    <div>
                        <label className="block text-sm font-medium mb-2">Amount (RM) *</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.amount || ""}
                            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-2.5 rounded-lg border bg-background text-lg font-semibold"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Payment Method</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {paymentMethods.map(method => (
                                <button
                                    key={method.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, payment_method: method.id })}
                                    className={`p-3 rounded-lg border text-center transition-colors ${formData.payment_method === method.id
                                            ? "bg-primary text-white border-primary"
                                            : "hover:bg-accent"
                                        }`}
                                >
                                    <method.icon className="w-5 h-5 mx-auto mb-1" />
                                    <span className="text-sm">{method.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {formData.payment_method !== "cash" && (
                        <div>
                            <label className="block text-sm font-medium mb-2">Reference Number</label>
                            <input
                                type="text"
                                value={formData.reference_number}
                                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                                placeholder="Transaction reference..."
                                className="w-full px-4 py-2.5 rounded-lg border bg-background"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-2">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={2}
                            placeholder="Additional notes..."
                            className="w-full px-4 py-2.5 rounded-lg border bg-background resize-none"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Link href="/payments" className="px-6 py-2.5 border rounded-lg hover:bg-accent">Cancel</Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? "Processing..." : "Record Payment"}
                    </button>
                </div>
            </form>
        </div>
    )
}
