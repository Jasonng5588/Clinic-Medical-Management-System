"use client"

import { useState } from "react"
import { Search, Plus, FileText } from "lucide-react"

export default function PrescriptionsPage() {
    const [searchTerm, setSearchTerm] = useState("")

    // Mock data
    const prescriptions = [
        {
            id: "1",
            prescription_number: "RX20260201000001",
            date: "2026-02-01",
            patient_name: "Ahmad Abdullah",
            doctor_name: "Dr. Sarah Johnson",
            medicines_count: 3,
            status: "dispensed",
        },
        {
            id: "2",
            prescription_number: "RX20260201000002",
            date: "2026-02-01",
            patient_name: "Siti Nurhaliza",
            doctor_name: "Dr. Michael Chen",
            medicines_count: 2,
            status: "pending",
        },
    ]

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: "bg-yellow-100 text-yellow-700",
            dispensed: "bg-green-100 text-green-700",
            cancelled: "bg-red-100 text-red-700",
        }
        return colors[status] || "bg-gray-100 text-gray-700"
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Prescriptions</h1>
                    <p className="text-muted-foreground mt-1">Manage medication prescriptions</p>
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Prescription
                </button>
            </div>

            {/* Search */}
            <div className="bg-card rounded-2xl p-4 border shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search prescriptions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background"
                    />
                </div>
            </div>

            {/* Prescriptions Table */}
            <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left p-4 font-medium">Prescription #</th>
                                <th className="text-left p-4 font-medium">Date</th>
                                <th className="text-left p-4 font-medium">Patient</th>
                                <th className="text-left p-4 font-medium">Doctor</th>
                                <th className="text-left p-4 font-medium">Medicines</th>
                                <th className="text-left p-4 font-medium">Status</th>
                                <th className="text-left p-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {prescriptions.map((prescription) => (
                                <tr key={prescription.id} className="hover:bg-accent/50 transition-colors">
                                    <td className="p-4 font-mono text-sm">{prescription.prescription_number}</td>
                                    <td className="p-4">{prescription.date}</td>
                                    <td className="p-4 font-medium">{prescription.patient_name}</td>
                                    <td className="p-4">{prescription.doctor_name}</td>
                                    <td className="p-4">{prescription.medicines_count} items</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
                                            {prescription.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <button className="text-primary hover:underline text-sm">View</button>
                                            <button className="p-2 hover:bg-accent rounded-lg" title="Download PDF">
                                                <FileText className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
