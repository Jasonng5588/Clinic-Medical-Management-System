"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/auth-store"
import {
    Package, Search, Plus, Eye, Edit, Trash2, Loader2, X,
    AlertTriangle, Clock, Box, DollarSign, BarChart
} from "lucide-react"

interface Medicine {
    id: string
    name: string
    generic_name: string | null
    category: string | null
    form: string | null
    strength: string | null
    current_stock: number
    reorder_level: number
    price_per_unit: number
    is_active: boolean
    created_at: string
}

export default function InventoryPage() {
    const { user, role } = useAuthStore()
    const [medicines, setMedicines] = useState<Medicine[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("all")
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)

    useEffect(() => { fetchMedicines() }, [searchTerm, categoryFilter])

    const fetchMedicines = async () => {
        setLoading(true)
        try {
            const supabase = createClient()
            let query = supabase.from("medicines").select("*").eq("is_active", true).order("name")
            if (categoryFilter !== "all") query = query.eq("category", categoryFilter)
            if (searchTerm) query = query.or(`name.ilike.%${searchTerm}%,generic_name.ilike.%${searchTerm}%`)
            const { data, error } = await query
            if (error) throw error
            setMedicines(data || [])
        } catch (error) { console.error("Error:", error) }
        finally { setLoading(false) }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this medicine?")) return
        const supabase = createClient()
        await supabase.from("medicines").update({ is_active: false }).eq("id", id)
        await supabase.from("audit_logs").insert({ action: "medicine_deleted", table_name: "medicines", record_id: id, user_id: user?.id })
        fetchMedicines()
    }

    const lowStock = medicines.filter(m => (m.current_stock || 0) <= (m.reorder_level || 0))
    const totalValue = medicines.reduce((sum, m) => sum + (m.current_stock || 0) * (m.price_per_unit || 0), 0)

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div><h1 className="text-2xl font-bold">Inventory / Pharmacy</h1><p className="text-muted-foreground">Manage medicines and stock</p></div>
                <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90"><Plus className="w-4 h-4" />Add Medicine</button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl p-4 border"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-500/20"><Package className="w-5 h-5 text-blue-500" /></div><div><p className="text-sm text-muted-foreground">Total Items</p><p className="text-xl font-bold">{medicines.length}</p></div></div></div>
                <div className="bg-card rounded-xl p-4 border"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-yellow-500/20"><AlertTriangle className="w-5 h-5 text-yellow-500" /></div><div><p className="text-sm text-muted-foreground">Low Stock</p><p className="text-xl font-bold text-yellow-600">{lowStock.length}</p></div></div></div>
                <div className="bg-card rounded-xl p-4 border"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-500/20"><DollarSign className="w-5 h-5 text-green-500" /></div><div><p className="text-sm text-muted-foreground">Stock Value</p><p className="text-xl font-bold">RM {totalValue.toFixed(0)}</p></div></div></div>
                <div className="bg-card rounded-xl p-4 border"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-purple-500/20"><BarChart className="w-5 h-5 text-purple-500" /></div><div><p className="text-sm text-muted-foreground">Categories</p><p className="text-xl font-bold">{new Set(medicines.map(m => m.category)).size}</p></div></div></div>
            </div>

            {/* Low Stock Alert */}
            {lowStock.length > 0 && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <p className="text-sm"><span className="font-medium">{lowStock.length} items</span> below reorder level: {lowStock.slice(0, 3).map(m => m.name).join(", ")}</p>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input type="text" placeholder="Search medicines..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background" /></div>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-2.5 border rounded-lg bg-background">
                    <option value="all">All Categories</option>
                    <option value="Pain Relief">Pain Relief</option>
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Gastric">Gastric</option>
                    <option value="Diabetes">Diabetes</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                    <option value="Antihistamine">Antihistamine</option>
                    <option value="Respiratory">Respiratory</option>
                    <option value="Corticosteroid">Corticosteroid</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-card rounded-xl border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-accent/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium">Medicine</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Form / Strength</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Stock</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Price</th>
                            <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? <tr><td colSpan={5} className="px-4 py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
                            : medicines.length > 0 ? medicines.map((m) => (
                                <tr key={m.id} className={`hover:bg-accent/30 ${(m.current_stock || 0) <= (m.reorder_level || 0) ? "bg-yellow-50 dark:bg-yellow-900/10" : ""}`}>
                                    <td className="px-4 py-3"><p className="font-medium">{m.name}</p><p className="text-sm text-muted-foreground">{m.generic_name || m.category}</p></td>
                                    <td className="px-4 py-3 text-sm"><p>{m.form || "-"}</p><p className="text-muted-foreground">{m.strength || "-"}</p></td>
                                    <td className="px-4 py-3"><span className={`font-semibold ${(m.current_stock || 0) <= (m.reorder_level || 0) ? "text-red-600" : ""}`}>{m.current_stock || 0}</span><span className="text-sm text-muted-foreground"> / min {m.reorder_level || 0}</span></td>
                                    <td className="px-4 py-3"><p className="font-medium">RM {(m.price_per_unit || 0).toFixed(2)}</p></td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-1">
                                            <button onClick={() => { setSelectedMedicine(m); setShowEditModal(true) }} className="p-2 hover:bg-accent rounded-lg"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(m.id)} className="p-2 hover:bg-red-100 text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No medicines found</td></tr>}
                    </tbody>
                </table>
            </div>

            {showAddModal && <MedicineModal onClose={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); fetchMedicines() }} />}
            {selectedMedicine && showEditModal && <MedicineModal medicine={selectedMedicine} onClose={() => { setShowEditModal(false); setSelectedMedicine(null) }} onSuccess={() => { setShowEditModal(false); fetchMedicines() }} />}
        </div>
    )
}

function MedicineModal({ medicine, onClose, onSuccess }: { medicine?: Medicine; onClose: () => void; onSuccess: () => void }) {
    const { user } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: medicine?.name || "",
        generic_name: medicine?.generic_name || "",
        category: medicine?.category || "Pain Relief",
        form: medicine?.form || "Tablet",
        strength: medicine?.strength || "",
        price_per_unit: medicine?.price_per_unit || 0,
        current_stock: medicine?.current_stock || 0,
        reorder_level: medicine?.reorder_level || 10,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const supabase = createClient()
            if (medicine) {
                await supabase.from("medicines").update({ ...formData, is_active: true }).eq("id", medicine.id)
                await supabase.from("audit_logs").insert({ action: "medicine_updated", table_name: "medicines", record_id: medicine.id, user_id: user?.id })
            } else {
                const { data } = await supabase.from("medicines").insert({ ...formData, is_active: true }).select().single()
                await supabase.from("audit_logs").insert({ action: "medicine_created", table_name: "medicines", record_id: data?.id, user_id: user?.id })
            }
            alert(medicine ? "Medicine updated!" : "Medicine added!")
            onSuccess()
        } catch (error) { alert("Failed to save medicine") }
        finally { setLoading(false) }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">{medicine ? "Edit" : "Add"} Medicine</h2>
                    <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2"><label className="block text-sm font-medium mb-2">Name *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" required /></div>
                        <div><label className="block text-sm font-medium mb-2">Generic Name</label><input type="text" value={formData.generic_name} onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" /></div>
                        <div><label className="block text-sm font-medium mb-2">Category</label><select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background"><option>Pain Relief</option><option>Antibiotics</option><option>Gastric</option><option>Diabetes</option><option>Cardiovascular</option><option>Antihistamine</option><option>Respiratory</option><option>Corticosteroid</option></select></div>
                        <div><label className="block text-sm font-medium mb-2">Form</label><select value={formData.form} onChange={(e) => setFormData({ ...formData, form: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background"><option>Tablet</option><option>Capsule</option><option>Syrup</option><option>Injection</option><option>Cream</option><option>Inhaler</option></select></div>
                        <div><label className="block text-sm font-medium mb-2">Strength</label><input type="text" value={formData.strength} onChange={(e) => setFormData({ ...formData, strength: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border bg-background" placeholder="e.g. 500mg" /></div>
                        <div><label className="block text-sm font-medium mb-2">Price (RM)</label><input type="number" step="0.01" value={formData.price_per_unit || ""} onChange={(e) => setFormData({ ...formData, price_per_unit: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-2.5 rounded-lg border bg-background" /></div>
                        <div><label className="block text-sm font-medium mb-2">Stock Qty</label><input type="number" value={formData.current_stock || ""} onChange={(e) => setFormData({ ...formData, current_stock: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 rounded-lg border bg-background" /></div>
                        <div><label className="block text-sm font-medium mb-2">Reorder Level</label><input type="number" value={formData.reorder_level || ""} onChange={(e) => setFormData({ ...formData, reorder_level: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 rounded-lg border bg-background" /></div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 border rounded-lg">Cancel</button>
                        <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg disabled:opacity-50">{loading && <Loader2 className="w-4 h-4 animate-spin" />}{loading ? "Saving..." : "Save"}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
