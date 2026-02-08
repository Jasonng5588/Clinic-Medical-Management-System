"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/auth-store"
import {
    Receipt, Search, Plus, Filter, Eye, Edit, Trash2, Download, Printer,
    CreditCard, DollarSign, AlertCircle, X, Loader2, Check, MoreVertical,
    ChevronLeft, ChevronRight, Calendar, User, Clock, FileText
} from "lucide-react"
import Link from "next/link"

interface Invoice {
    id: string
    invoice_number: string
    patient_id: string
    appointment_id: string | null
    subtotal: number
    tax_amount: number
    discount_amount: number
    total_amount: number
    status: "draft" | "pending" | "paid" | "cancelled" | "refunded"
    payment_method: string | null
    notes: string | null
    created_at: string
    paid_at: string | null
    patient?: { first_name: string; last_name: string; patient_number: string }
}

interface InvoiceItem {
    id: string
    description: string
    quantity: number
    unit_price: number
    total: number
}

export default function InvoicesPage() {
    const { user } = useAuthStore()
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showViewModal, setShowViewModal] = useState(false)
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
    const [page, setPage] = useState(1)
    const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, revenue: 0 })

    useEffect(() => {
        fetchInvoices()
    }, [searchTerm, statusFilter, page])

    const fetchInvoices = async () => {
        setLoading(true)
        try {
            const supabase = createClient()
            let query = supabase
                .from("invoices")
                .select(`
                    *,
                    patient:patients(first_name, last_name, patient_number)
                `, { count: "exact" })
                .order("created_at", { ascending: false })
                .range((page - 1) * 10, page * 10 - 1)

            if (statusFilter !== "all") {
                query = query.eq("status", statusFilter)
            }

            if (searchTerm) {
                query = query.ilike("invoice_number", `%${searchTerm}%`)
            }

            const { data, count, error } = await query

            if (error) throw error
            setInvoices(data || [])

            // Stats
            const { data: allInvoices } = await supabase.from("invoices").select("status, total_amount")
            const paidInvoices = allInvoices?.filter(i => i.status === "paid") || []
            setStats({
                total: count || 0,
                paid: paidInvoices.length,
                pending: allInvoices?.filter(i => i.status === "pending").length || 0,
                revenue: paidInvoices.reduce((sum, i) => sum + (i.total_amount || 0), 0),
            })
        } catch (error) {
            console.error("Error fetching invoices:", error)
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const supabase = createClient()
            const updateData: any = { status: newStatus }

            if (newStatus === "paid") {
                updateData.paid_at = new Date().toISOString()
            }

            const { error } = await supabase
                .from("invoices")
                .update(updateData)
                .eq("id", id)

            if (error) throw error

            // Try to log audit (don't fail if table doesn't exist)
            try {
                await supabase.from("audit_logs").insert({
                    action: "invoice_status_change",
                    table_name: "invoices",
                    record_id: id,
                    user_id: user?.id,
                    new_values: { status: newStatus },
                    ip_address: "127.0.0.1"
                })
            } catch (auditError) {
                console.log("Audit log failed (non-critical):", auditError)
            }

            fetchInvoices()
            alert("Invoice status updated successfully!")
        } catch (error) {
            console.error("Error updating invoice:", error)
            alert("Failed to update invoice status")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this invoice?")) return

        try {
            const supabase = createClient()
            const { error } = await supabase.from("invoices").delete().eq("id", id)
            if (error) throw error
            fetchInvoices()
        } catch (error) {
            console.error("Error deleting invoice:", error)
            alert("Failed to delete invoice")
        }
    }

    const handlePrint = (invoice: Invoice) => {
        const printWindow = window.open('', '_blank')
        if (!printWindow) return

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice ${invoice.invoice_number}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0ea5e9; padding-bottom: 20px; }
                    .header h1 { color: #0ea5e9; margin: 0; }
                    .info-row { display: flex; justify-content: space-between; margin-bottom: 20px; }
                    .info-block { }
                    .info-block h3 { margin: 0 0 8px 0; color: #666; font-size: 12px; text-transform: uppercase; }
                    .info-block p { margin: 0; font-size: 14px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
                    th { background: #f8f9fa; font-weight: 600; }
                    .total-row { font-weight: bold; font-size: 18px; background: #f0f9ff; }
                    .status { padding: 4px 12px; border-radius: 20px; font-size: 12px; display: inline-block; }
                    .status-paid { background: #dcfce7; color: #166534; }
                    .status-pending { background: #fef9c3; color: #854d0e; }
                    .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
                    @media print { body { padding: 20px; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>HealthCare Plus</h1>
                    <p>Clinic Management System</p>
                </div>
                <div class="info-row">
                    <div class="info-block">
                        <h3>Invoice Number</h3>
                        <p><strong>${invoice.invoice_number}</strong></p>
                    </div>
                    <div class="info-block">
                        <h3>Date</h3>
                        <p>${new Date(invoice.created_at).toLocaleDateString()}</p>
                    </div>
                    <div class="info-block">
                        <h3>Status</h3>
                        <span class="status status-${invoice.status}">${invoice.status.toUpperCase()}</span>
                    </div>
                </div>
                <div class="info-row">
                    <div class="info-block">
                        <h3>Patient</h3>
                        <p>${invoice.patient?.first_name || ''} ${invoice.patient?.last_name || ''}</p>
                        <p style="color: #666; font-size: 12px;">${invoice.patient?.patient_number || ''}</p>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Medical Services</td>
                            <td style="text-align: right;">RM ${(invoice.subtotal || 0).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Tax</td>
                            <td style="text-align: right;">RM ${(invoice.tax_amount || 0).toFixed(2)}</td>
                        </tr>
                        ${invoice.discount_amount > 0 ? `
                        <tr>
                            <td>Discount</td>
                            <td style="text-align: right;">- RM ${(invoice.discount_amount || 0).toFixed(2)}</td>
                        </tr>
                        ` : ''}
                        <tr class="total-row">
                            <td>Total</td>
                            <td style="text-align: right;">RM ${(invoice.total_amount || 0).toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
                <div class="footer">
                    <p>Thank you for choosing HealthCare Plus</p>
                    <p>Generated on ${new Date().toLocaleString()}</p>
                </div>
            </body>
            </html>
        `)
        printWindow.document.close()
        printWindow.print()
    }

    const handleDownload = (invoice: Invoice) => {
        const content = `
INVOICE
=======
Invoice Number: ${invoice.invoice_number}
Date: ${new Date(invoice.created_at).toLocaleDateString()}
Status: ${invoice.status.toUpperCase()}

PATIENT
-------
Name: ${invoice.patient?.first_name || ''} ${invoice.patient?.last_name || ''}
Patient ID: ${invoice.patient?.patient_number || ''}

CHARGES
-------
Subtotal:    RM ${(invoice.subtotal || 0).toFixed(2)}
Tax:         RM ${(invoice.tax_amount || 0).toFixed(2)}
Discount:    RM ${(invoice.discount_amount || 0).toFixed(2)}
--------------------------
TOTAL:       RM ${(invoice.total_amount || 0).toFixed(2)}

Payment Method: ${invoice.payment_method || 'N/A'}
${invoice.paid_at ? `Paid on: ${new Date(invoice.paid_at).toLocaleDateString()}` : ''}

Notes: ${invoice.notes || 'None'}

---
HealthCare Plus - Clinic Management System
Generated on ${new Date().toLocaleString()}
        `.trim()

        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${invoice.invoice_number}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            draft: "bg-gray-100 text-gray-700",
            pending: "bg-yellow-100 text-yellow-700",
            paid: "bg-green-100 text-green-700",
            cancelled: "bg-red-100 text-red-700",
            refunded: "bg-purple-100 text-purple-700",
        }
        return styles[status] || styles.draft
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Invoices</h1>
                    <p className="text-muted-foreground">Manage billing and invoices</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                    <Plus className="w-4 h-4" />
                    Create Invoice
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl p-4 border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                            <Receipt className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Invoices</p>
                            <p className="text-xl font-bold">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-4 border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                            <Check className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Paid</p>
                            <p className="text-xl font-bold">{stats.paid}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-4 border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900">
                            <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Pending</p>
                            <p className="text-xl font-bold">{stats.pending}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-4 border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                            <DollarSign className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Revenue</p>
                            <p className="text-xl font-bold">RM {stats.revenue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by invoice number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 border rounded-lg bg-background"
                >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-card rounded-xl border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-accent/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium">Invoice #</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Patient</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                            <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                </td>
                            </tr>
                        ) : invoices.length > 0 ? invoices.map((invoice) => (
                            <tr key={invoice.id} className="hover:bg-accent/30">
                                <td className="px-4 py-3">
                                    <span className="font-mono font-medium">{invoice.invoice_number}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="font-medium">{invoice.patient?.first_name} {invoice.patient?.last_name}</p>
                                    <p className="text-sm text-muted-foreground">{invoice.patient?.patient_number}</p>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="font-semibold">RM {invoice.total_amount?.toFixed(2)}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <select
                                        value={invoice.status}
                                        onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                                        className={`px-2 py-1 rounded-full text-xs font-medium border-none ${getStatusBadge(invoice.status)}`}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="refunded">Refunded</option>
                                    </select>
                                </td>
                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                    {new Date(invoice.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-1">
                                        <button
                                            onClick={() => { setSelectedInvoice(invoice); setShowViewModal(true) }}
                                            className="p-2 hover:bg-accent rounded-lg"
                                            title="View"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handlePrint(invoice)}
                                            className="p-2 hover:bg-accent rounded-lg" title="Print"
                                        >
                                            <Printer className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDownload(invoice)}
                                            className="p-2 hover:bg-accent rounded-lg" title="Download"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(invoice.id)}
                                            className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                                    No invoices found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Invoice Modal */}
            <CreateInvoiceModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => { setShowCreateModal(false); fetchInvoices() }}
            />
        </div>
    )
}

// Create Invoice Modal
function CreateInvoiceModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
    const { user } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [patients, setPatients] = useState<any[]>([])
    const [patientSearch, setPatientSearch] = useState("")
    const [selectedPatient, setSelectedPatient] = useState<any>(null)
    const [items, setItems] = useState<InvoiceItem[]>([
        { id: "1", description: "", quantity: 1, unit_price: 0, total: 0 }
    ])
    const [formData, setFormData] = useState({
        tax_rate: 0,
        discount_amount: 0,
        payment_method: "cash",
        notes: "",
    })

    useEffect(() => {
        if (patientSearch.length >= 2) {
            searchPatients()
        }
    }, [patientSearch])

    const searchPatients = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from("patients")
            .select("id, first_name, last_name, phone, patient_number")
            .or(`first_name.ilike.%${patientSearch}%,last_name.ilike.%${patientSearch}%,phone.ilike.%${patientSearch}%`)
            .limit(5)
        setPatients(data || [])
    }

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        newItems[index].total = newItems[index].quantity * newItems[index].unit_price
        setItems(newItems)
    }

    const addItem = () => {
        setItems([...items, { id: Date.now().toString(), description: "", quantity: 1, unit_price: 0, total: 0 }])
    }

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index))
        }
    }

    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const taxAmount = subtotal * (formData.tax_rate / 100)
    const totalAmount = subtotal + taxAmount - formData.discount_amount

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedPatient) {
            alert("Please select a patient")
            return
        }
        if (items.some(item => !item.description || item.unit_price <= 0)) {
            alert("Please fill in all item details")
            return
        }

        setLoading(true)
        try {
            const supabase = createClient()

            // Generate invoice number
            const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`

            const { data: invoice, error: invoiceError } = await supabase
                .from("invoices")
                .insert({
                    invoice_number: invoiceNumber,
                    patient_id: selectedPatient.id,
                    subtotal: subtotal,
                    tax_amount: taxAmount,
                    discount_amount: formData.discount_amount,
                    total_amount: totalAmount,
                    status: "pending",
                    payment_method: formData.payment_method,
                    notes: formData.notes,
                    created_by: user?.id,
                })
                .select("id")
                .single()

            if (invoiceError) throw invoiceError

            // Insert invoice items
            const invoiceItems = items.map(item => ({
                invoice_id: invoice.id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total: item.total,
            }))

            const { error: itemsError } = await supabase
                .from("invoice_items")
                .insert(invoiceItems)

            if (itemsError) throw itemsError

            // Audit log
            await supabase.from("audit_logs").insert({
                action: "invoice_created",
                table_name: "invoices",
                record_id: invoice.id,
                user_id: user?.id,
                new_values: { invoice_number: invoiceNumber, total: totalAmount },
                ip_address: "127.0.0.1"
            })

            onSuccess()
        } catch (error) {
            console.error("Error creating invoice:", error)
            alert("Failed to create invoice")
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-card rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Create Invoice</h2>
                    <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Patient Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Patient *</label>
                        {selectedPatient ? (
                            <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-primary" />
                                    <div>
                                        <p className="font-medium">{selectedPatient.first_name} {selectedPatient.last_name}</p>
                                        <p className="text-sm text-muted-foreground">{selectedPatient.patient_number}</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setSelectedPatient(null)} className="text-sm text-primary">
                                    Change
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={patientSearch}
                                    onChange={(e) => setPatientSearch(e.target.value)}
                                    placeholder="Search patient..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background"
                                />
                                {patients.length > 0 && patientSearch && (
                                    <div className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg">
                                        {patients.map(patient => (
                                            <button
                                                key={patient.id}
                                                type="button"
                                                onClick={() => { setSelectedPatient(patient); setPatientSearch(""); setPatients([]) }}
                                                className="w-full px-4 py-3 text-left hover:bg-accent"
                                            >
                                                <p className="font-medium">{patient.first_name} {patient.last_name}</p>
                                                <p className="text-sm text-muted-foreground">{patient.phone}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Invoice Items */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium">Invoice Items *</label>
                            <button type="button" onClick={addItem} className="text-sm text-primary hover:underline">
                                + Add Item
                            </button>
                        </div>
                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={item.id} className="flex gap-3 items-start">
                                    <input
                                        type="text"
                                        placeholder="Description"
                                        value={item.description}
                                        onChange={(e) => updateItem(index, "description", e.target.value)}
                                        className="flex-1 px-4 py-2.5 rounded-lg border bg-background"
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="Qty"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)}
                                        className="w-20 px-4 py-2.5 rounded-lg border bg-background"
                                        min={1}
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={item.unit_price || ""}
                                        onChange={(e) => updateItem(index, "unit_price", parseFloat(e.target.value) || 0)}
                                        className="w-28 px-4 py-2.5 rounded-lg border bg-background"
                                        step="0.01"
                                        min={0}
                                        required
                                    />
                                    <div className="w-28 px-4 py-2.5 bg-accent rounded-lg text-right font-medium">
                                        RM {item.total.toFixed(2)}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="p-2.5 hover:bg-destructive/10 text-destructive rounded-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-accent/50 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span className="font-medium">RM {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span>Tax</span>
                                <input
                                    type="number"
                                    value={formData.tax_rate}
                                    onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                                    className="w-16 px-2 py-1 rounded border bg-background text-center"
                                    step="0.1"
                                />
                                <span>%</span>
                            </div>
                            <span className="font-medium">RM {taxAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Discount</span>
                            <div className="flex items-center gap-2">
                                <span>RM</span>
                                <input
                                    type="number"
                                    value={formData.discount_amount || ""}
                                    onChange={(e) => setFormData({ ...formData, discount_amount: parseFloat(e.target.value) || 0 })}
                                    className="w-24 px-2 py-1 rounded border bg-background text-right"
                                    step="0.01"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between pt-3 border-t border-primary/20 text-lg font-bold">
                            <span>Total</span>
                            <span>RM {totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Payment & Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Payment Method</label>
                            <select
                                value={formData.payment_method}
                                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background"
                            >
                                <option value="cash">Cash</option>
                                <option value="card">Credit/Debit Card</option>
                                <option value="transfer">Bank Transfer</option>
                                <option value="ewallet">E-Wallet</option>
                                <option value="insurance">Insurance</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Notes</label>
                            <input
                                type="text"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 border rounded-lg hover:bg-accent">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? "Creating..." : "Create Invoice"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
