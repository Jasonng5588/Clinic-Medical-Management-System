"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/auth-store"
import {
    FileText, ArrowLeft, Loader2, Search, User, Save, Plus, Trash2
} from "lucide-react"
import Link from "next/link"

interface Patient {
    id: string
    patient_number: string
    first_name: string
    last_name: string
    phone: string
}

interface Service {
    id: string
    name: string
    price: number
}

interface InvoiceItem {
    description: string
    quantity: number
    unit_price: number
    total: number
}

export default function NewInvoicePage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user } = useAuthStore()
    const patientId = searchParams.get("patient")

    const [loading, setLoading] = useState(false)
    const [patients, setPatients] = useState<Patient[]>([])
    const [services, setServices] = useState<Service[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

    const [items, setItems] = useState<InvoiceItem[]>([])
    const [discount, setDiscount] = useState(0)
    const [tax, setTax] = useState(0)
    const [notes, setNotes] = useState("")

    useEffect(() => {
        fetchServices()
        if (patientId) fetchPatientById(patientId)
    }, [patientId])

    useEffect(() => {
        if (searchTerm.length > 2) searchPatients()
        else setPatients([])
    }, [searchTerm])

    const fetchPatientById = async (id: string) => {
        const supabase = createClient()
        const { data } = await supabase.from("patients")
            .select("id, patient_number, first_name, last_name, phone")
            .eq("id", id)
            .single()
        if (data) setSelectedPatient(data)
    }

    const searchPatients = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from("patients")
            .select("id, patient_number, first_name, last_name, phone")
            .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,patient_number.ilike.%${searchTerm}%`)
            .eq("is_active", true)
            .limit(10)
        setPatients(data || [])
    }

    const fetchServices = async () => {
        const supabase = createClient()
        const { data } = await supabase.from("services").select("id, name, price").eq("is_active", true)
        setServices(data || [])
    }

    const addItem = () => {
        setItems([...items, { description: "", quantity: 1, unit_price: 0, total: 0 }])
    }

    const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        if (field === "quantity" || field === "unit_price") {
            newItems[index].total = newItems[index].quantity * newItems[index].unit_price
        }
        setItems(newItems)
    }

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const addService = (service: Service) => {
        setItems([...items, { description: service.name, quantity: 1, unit_price: service.price, total: service.price }])
    }

    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const discountAmount = (subtotal * discount) / 100
    const taxAmount = ((subtotal - discountAmount) * tax) / 100
    const total = subtotal - discountAmount + taxAmount

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedPatient) { alert("Please select a patient"); return }
        if (items.length === 0) { alert("Please add at least one item"); return }

        setLoading(true)
        try {
            const supabase = createClient()

            // Generate invoice number
            const invoiceNumber = `INV${Date.now().toString().slice(-8)}`

            const { data, error } = await supabase.from("invoices").insert({
                invoice_number: invoiceNumber,
                patient_id: selectedPatient.id,
                invoice_date: new Date().toISOString().split("T")[0],
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                subtotal: subtotal,
                discount_percentage: discount,
                discount_amount: discountAmount,
                tax_percentage: tax,
                tax_amount: taxAmount,
                total_amount: total,
                paid_amount: 0,
                balance: total,
                status: "draft",
                notes: notes || null,
                created_by: user?.id,
            }).select().single()

            if (error) throw error

            // Audit log
            await supabase.from("audit_logs").insert({
                action: "invoice_created",
                table_name: "invoices",
                record_id: data.id,
                user_id: user?.id,
                new_values: { items, total },
            })

            alert("Invoice created successfully!")
            router.push("/invoices")
        } catch (error: any) {
            console.error("Error:", error)
            alert(error.message || "Failed to create invoice")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/invoices" className="p-2 hover:bg-accent rounded-lg">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Create Invoice</h1>
                    <p className="text-muted-foreground">Generate a new invoice for patient billing</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Patient Selection */}
                <div className="bg-card rounded-xl border p-6">
                    <h2 className="text-lg font-semibold mb-4">Patient</h2>
                    {selectedPatient ? (
                        <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">{selectedPatient.first_name} {selectedPatient.last_name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedPatient.patient_number}</p>
                                </div>
                            </div>
                            <button type="button" onClick={() => setSelectedPatient(null)} className="text-sm text-primary hover:underline">
                                Change
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search patient..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background"
                            />
                            {patients.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {patients.map((p) => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => { setSelectedPatient(p); setPatients([]) }}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-accent text-left"
                                        >
                                            <User className="w-4 h-4" />
                                            <span>{p.first_name} {p.last_name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Quick Add Services */}
                {services.length > 0 && (
                    <div className="bg-card rounded-xl border p-6">
                        <h2 className="text-lg font-semibold mb-4">Quick Add Services</h2>
                        <div className="flex flex-wrap gap-2">
                            {services.map((s) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => addService(s)}
                                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20"
                                >
                                    {s.name} - RM {s.price}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Invoice Items */}
                <div className="bg-card rounded-xl border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Invoice Items</h2>
                        <button type="button" onClick={addItem} className="flex items-center gap-1 text-sm text-primary hover:underline">
                            <Plus className="w-4 h-4" /> Add Item
                        </button>
                    </div>

                    {items.length > 0 ? (
                        <div className="space-y-3">
                            <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground px-2">
                                <div className="col-span-5">Description</div>
                                <div className="col-span-2">Qty</div>
                                <div className="col-span-2">Unit Price</div>
                                <div className="col-span-2">Total</div>
                                <div className="col-span-1"></div>
                            </div>
                            {items.map((item, i) => (
                                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                                    <input
                                        type="text"
                                        value={item.description}
                                        onChange={(e) => updateItem(i, "description", e.target.value)}
                                        placeholder="Description"
                                        className="col-span-5 px-3 py-2 rounded-lg border bg-background"
                                    />
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 0)}
                                        min="1"
                                        className="col-span-2 px-3 py-2 rounded-lg border bg-background"
                                    />
                                    <input
                                        type="number"
                                        value={item.unit_price}
                                        onChange={(e) => updateItem(i, "unit_price", parseFloat(e.target.value) || 0)}
                                        step="0.01"
                                        className="col-span-2 px-3 py-2 rounded-lg border bg-background"
                                    />
                                    <div className="col-span-2 px-3 py-2 font-medium">
                                        RM {item.total.toFixed(2)}
                                    </div>
                                    <button type="button" onClick={() => removeItem(i)} className="col-span-1 p-2 hover:bg-red-100 rounded">
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No items added. Click "Add Item" or select a service above.</p>
                    )}
                </div>

                {/* Totals */}
                <div className="bg-card rounded-xl border p-6">
                    <div className="max-w-md ml-auto space-y-3">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span className="font-medium">RM {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span>Discount (%)</span>
                            <input
                                type="number"
                                value={discount}
                                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                min="0"
                                max="100"
                                className="w-24 px-3 py-1 rounded border bg-background text-right"
                            />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span>Tax (%)</span>
                            <input
                                type="number"
                                value={tax}
                                onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                                min="0"
                                max="100"
                                className="w-24 px-3 py-1 rounded border bg-background text-right"
                            />
                        </div>
                        <div className="border-t pt-3 flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span className="text-primary">RM {total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="bg-card rounded-xl border p-6">
                    <label className="block text-sm font-medium mb-2">Notes</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-lg border bg-background"
                        placeholder="Additional notes for this invoice..."
                    />
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <Link href="/invoices" className="px-6 py-2.5 border rounded-lg hover:bg-accent">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading || !selectedPatient || items.length === 0}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {loading ? "Creating..." : "Create Invoice"}
                    </button>
                </div>
            </form>
        </div>
    )
}
