"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Download, FileText, TrendingUp, DollarSign } from "lucide-react"
import { downloadAsCSV } from "@/lib/utils"

export default function ReportsPage() {
    const today = new Date()
    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
    const [dateFrom, setDateFrom] = useState(monthAgo.toISOString().split("T")[0])
    const [dateTo, setDateTo] = useState(today.toISOString().split("T")[0])
    const [loading, setLoading] = useState(false)

    const generateReport = async (type: string) => {
        setLoading(true)
        try {
            const supabase = createClient()

            switch (type) {
                case "revenue":
                    const { data: payments } = await supabase
                        .from("payments")
                        .select("*, invoice:invoices(*)")
                        .gte("payment_date", dateFrom)
                        .lte("payment_date", dateTo)

                    if (payments) {
                        downloadAsCSV(payments, `revenue-report-${dateFrom}-${dateTo}`)
                    }
                    break

                case "appointments":
                    const { data: appointments } = await supabase
                        .from("appointments")
                        .select("*, patient:patients(*), doctor:staff_profiles(*)")
                        .gte("appointment_date", dateFrom)
                        .lte("appointment_date", dateTo)

                    if (appointments) {
                        downloadAsCSV(appointments, `appointments-report-${dateFrom}-${dateTo}`)
                    }
                    break

                case "inventory":
                    const { data: medicines } = await supabase
                        .from("medicines")
                        .select("*")

                    if (medicines) {
                        downloadAsCSV(medicines, `inventory-report-${new Date().toISOString().split("T")[0]}`)
                    }
                    break

                case "patients":
                    const { data: patients } = await supabase
                        .from("patients")
                        .select("*")
                        .gte("created_at", dateFrom)
                        .lte("created_at", dateTo)

                    if (patients) {
                        downloadAsCSV(patients, `patients-report-${dateFrom}-${dateTo}`)
                    }
                    break
            }
        } catch (error) {
            console.error("Error generating report:", error)
        } finally {
            setLoading(false)
        }
    }

    const reports = [
        {
            title: "Revenue Report",
            description: "Financial summary including payments and invoices",
            icon: DollarSign,
            type: "revenue",
            color: "bg-green-500",
        },
        {
            title: "Appointments Report",
            description: "Appointments statistics and trends",
            icon: FileText,
            type: "appointments",
            color: "bg-blue-500",
        },
        {
            title: "Inventory Report",
            description: "Stock levels and medicine inventory",
            icon: TrendingUp,
            type: "inventory",
            color: "bg-orange-500",
        },
        {
            title: "Patient Report",
            description: "New patient registrations and demographics",
            icon: FileText,
            type: "patients",
            color: "bg-purple-500",
        },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Reports & Analytics</h1>
                <p className="text-muted-foreground mt-1">Generate business intelligence reports</p>
            </div>

            {/* Date Range */}
            <div className="bg-card rounded-2xl p-6 border shadow-sm">
                <h2 className="font-semibold mb-4">Select Date Range</h2>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-2">From</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border bg-background"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-2">To</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border bg-background"
                        />
                    </div>
                </div>
            </div>

            {/* Report Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reports.map((report) => {
                    const Icon = report.icon
                    return (
                        <div
                            key={report.type}
                            className="bg-card rounded-2xl p-6 border shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`${report.color} p-3 rounded-xl`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg">{report.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {report.description}
                                    </p>
                                    <button
                                        onClick={() => generateReport(report.type)}
                                        disabled={loading || !dateFrom || !dateTo}
                                        className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Download className="w-4 h-4" />
                                        Generate CSV
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Quick Stats */}
            <div className="bg-card rounded-2xl p-6 border shadow-sm">
                <h2 className="font-semibold mb-4">Quick Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-accent rounded-lg">
                        <p className="text-2xl font-bold">1,234</p>
                        <p className="text-sm text-muted-foreground">Total Patients</p>
                    </div>
                    <div className="text-center p-4 bg-accent rounded-lg">
                        <p className="text-2xl font-bold">456</p>
                        <p className="text-sm text-muted-foreground">This Month</p>
                    </div>
                    <div className="text-center p-4 bg-accent rounded-lg">
                        <p className="text-2xl font-bold">RM 45,680</p>
                        <p className="text-sm text-muted-foreground">Revenue (MTD)</p>
                    </div>
                    <div className="text-center p-4 bg-accent rounded-lg">
                        <p className="text-2xl font-bold">89%</p>
                        <p className="text-sm text-muted-foreground">Satisfaction</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
