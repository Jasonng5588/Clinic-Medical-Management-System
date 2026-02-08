"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Search, Plus, Package, AlertTriangle, Edit, Trash2 } from "lucide-react"

interface Medicine {
    id: string
    name: string
    generic_name: string
    category: string
    form: string
    strength: string
    current_stock: number
    reorder_level: number
    price_per_unit: number
    is_active: boolean
}

export default function InventoryMedicinesPage() {
    const [medicines, setMedicines] = useState<Medicine[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [filter, setFilter] = useState<"all" | "low_stock" | "out_of_stock">("all")

    useEffect(() => {
        loadMedicines()
    }, [])

    const loadMedicines = async () => {
        try {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('medicines')
                .select('*')
                .eq('is_active', true)
                .order('name')

            if (error) throw error
            setMedicines(data || [])
        } catch (error) {
            console.error('Error loading medicines:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredMedicines = medicines.filter((med) => {
        const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            med.generic_name?.toLowerCase().includes(searchTerm.toLowerCase())

        if (filter === "low_stock") {
            return matchesSearch && med.current_stock <= med.reorder_level && med.current_stock > 0
        } else if (filter === "out_of_stock") {
            return matchesSearch && med.current_stock === 0
        }

        return matchesSearch
    })

    const lowStockCount = medicines.filter(m => m.current_stock <= m.reorder_level && m.current_stock > 0).length
    const outOfStockCount = medicines.filter(m => m.current_stock === 0).length

    const getStockStatus = (medicine: Medicine) => {
        if (medicine.current_stock === 0) {
            return { text: "Out of Stock", className: "bg-red-100 text-red-700 border-red-300" }
        } else if (medicine.current_stock <= medicine.reorder_level) {
            return { text: "Low Stock", className: "bg-yellow-100 text-yellow-700 border-yellow-300" }
        }
        return { text: "In Stock", className: "bg-green-100 text-green-700 border-green-300" }
    }

    if (loading) {
        return <div className="p-6">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Medicine Inventory</h1>
                    <p className="text-muted-foreground mt-1">Manage your clinic's medicine stock</p>
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Medicine
                </button>
            </div>

            {/* Alerts */}
            {(lowStockCount > 0 || outOfStockCount > 0) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                            <p className="font-medium text-yellow-900">Stock Alerts</p>
                            <p className="text-sm text-yellow-700">
                                {outOfStockCount > 0 && `${outOfStockCount} medicine(s) out of stock. `}
                                {lowStockCount > 0 && `${lowStockCount} medicine(s) running low.`}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search medicines..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-4 py-2 rounded-lg border transition-colors ${filter === "all" ? "bg-primary text-white" : "bg-background hover:bg-accent"
                            }`}
                    >
                        All ({medicines.length})
                    </button>
                    <button
                        onClick={() => setFilter("low_stock")}
                        className={`px-4 py-2 rounded-lg border transition-colors ${filter === "low_stock" ? "bg-yellow-600 text-white" : "bg-background hover:bg-accent"
                            }`}
                    >
                        Low Stock ({lowStockCount})
                    </button>
                    <button
                        onClick={() => setFilter("out_of_stock")}
                        className={`px-4 py-2 rounded-lg border transition-colors ${filter === "out_of_stock" ? "bg-red-600 text-white" : "bg-background hover:bg-accent"
                            }`}
                    >
                        Out of Stock ({outOfStockCount})
                    </button>
                </div>
            </div>

            {/* Medicine Table */}
            <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left p-4 font-semibold">Medicine Name</th>
                                <th className="text-left p-4 font-semibold">Generic Name</th>
                                <th className="text-left p-4 font-semibold">Category</th>
                                <th className="text-left p-4 font-semibold">Form & Strength</th>
                                <th className="text-right p-4 font-semibold">Stock</th>
                                <th className="text-right p-4 font-semibold">Price</th>
                                <th className="text-center p-4 font-semibold">Status</th>
                                <th className="text-center p-4 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredMedicines.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                                        No medicines found
                                    </td>
                                </tr>
                            ) : (
                                filteredMedicines.map((medicine) => {
                                    const status = getStockStatus(medicine)

                                    return (
                                        <tr key={medicine.id} className="hover:bg-muted/30">
                                            <td className="p-4 font-medium">{medicine.name}</td>
                                            <td className="p-4 text-sm text-muted-foreground">{medicine.generic_name || '-'}</td>
                                            <td className="p-4 text-sm">{medicine.category}</td>
                                            <td className="p-4 text-sm">{medicine.form} - {medicine.strength}</td>
                                            <td className="p-4 text-right">
                                                <span className={`font-medium ${medicine.current_stock <= medicine.reorder_level ? 'text-red-600' : ''}`}>
                                                    {medicine.current_stock}
                                                </span>
                                                <span className="text-xs text-muted-foreground ml-1">
                                                    / {medicine.reorder_level}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right font-medium">
                                                RM {medicine.price_per_unit.toFixed(2)}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${status.className}`}>
                                                    {status.text}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button className="p-2 hover:bg-accent rounded-lg">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 hover:bg-destructive/10 text-destructive rounded-lg">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
