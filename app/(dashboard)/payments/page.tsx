"use client"

import { useState } from "react"
import { Search, DollarSign } from "lucide-react"

export default function PaymentsPage() {
    const [searchTerm, setSearchTerm] = useState("")

    // Mock data
    const payments = [
        {
            id: "1",
            payment_date: "2026-02-01",
            invoice_number: "INV20260201000001",
            patient_name: "Ahmad Abdullah",
            amount: 580.00,
            payment_method: "card",
            transaction_id: "TXN123456789",
            status: "completed",
        },
        {
            id: "2",
            payment_date: "2026-02-01",
            invoice_number: "INV20260201000002",
            patient_name: "Siti Nurhaliza",
            amount: 500.00,
            payment_method: "cash",
            transaction_id: "TXN123456790",
            status: "completed",
        },
    ]

    const getMethodColor = (method: string) => {
        const colors: Record<string, string> = {
            cash: "bg-green-100 text-green-700",
            card: "bg-blue-100 text-blue-700",
            bank_transfer: "bg-purple-100 text-purple-700",
            stripe: "bg-indigo-100 text-indigo-700",
            insurance: "bg-orange-100 text-orange-700",
        }
        return colors[method] || "bg-gray-100 text-gray-700"
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Payments</h1>
                    <p className="text-muted-foreground mt-1">Track all payment transactions</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card rounded-xl p-4 border">
                    <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <div>
                            <p className="text-sm text-muted-foreground">Today's Payments</p>
                            <p className="text-2xl font-bold text-green-600">RM 1,080.00</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-4 border">
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold">RM 12,450.00</p>
                </div>
                <div className="bg-card rounded-xl p-4 border">
                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                    <p className="text-2xl font-bold">156</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-card rounded-2xl p-4 border shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search payments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background"
                    />
                </div>
            </div>

            {/* Payments Table */}
            <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left p-4 font-medium">Date</th>
                                <th className="text-left p-4 font-medium">Invoice #</th>
                                <th className="text-left p-4 font-medium">Patient</th>
                                <th className="text-right p-4 font-medium">Amount</th>
                                <th className="text-left p-4 font-medium">Method</th>
                                <th className="text-left p-4 font-medium">Transaction ID</th>
                                <th className="text-left p-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-accent/50 transition-colors">
                                    <td className="p-4">{payment.payment_date}</td>
                                    <td className="p-4 font-mono text-sm">{payment.invoice_number}</td>
                                    <td className="p-4 font-medium">{payment.patient_name}</td>
                                    <td className="p-4 text-right font-semibold text-green-600">
                                        RM {payment.amount.toFixed(2)}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getMethodColor(payment.payment_method)}`}>
                                            {payment.payment_method.replace("_", " ")}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono text-xs text-muted-foreground">{payment.transaction_id}</td>
                                    <td className="p-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                            {payment.status.toUpperCase()}
                                        </span>
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
