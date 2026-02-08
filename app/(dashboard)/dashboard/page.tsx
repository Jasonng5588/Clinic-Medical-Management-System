"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/auth-store"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import {
    Users, Calendar, Clock, DollarSign, AlertTriangle, FileText,
    Stethoscope, Pill, TrendingUp, Activity, UserPlus, CalendarPlus,
    ClipboardList, CreditCard, Package, BarChart3, Settings, Bell,
    Brain, ChevronRight, ArrowUpRight, ArrowDownRight
} from "lucide-react"

// Role-specific stats configurations
const roleStats = {
    super_admin: [
        { title: "Total Patients", key: "total_patients", icon: Users, color: "bg-blue-500", link: "/patients" },
        { title: "Today's Appointments", key: "today_appointments", icon: Calendar, color: "bg-green-500", link: "/appointments" },
        { title: "Active Staff", key: "active_staff", icon: Users, color: "bg-purple-500", link: "/staff" },
        { title: "Today's Revenue", key: "today_revenue", icon: DollarSign, color: "bg-emerald-500", link: "/reports" },
        { title: "Pending Invoices", key: "pending_invoices", icon: FileText, color: "bg-orange-500", link: "/invoices" },
        { title: "Low Stock Items", key: "low_stock", icon: AlertTriangle, color: "bg-red-500", link: "/inventory/medicines" },
    ],
    doctor: [
        { title: "My Patients Today", key: "my_patients_today", icon: Users, color: "bg-blue-500", link: "/queue" },
        { title: "Pending Consultations", key: "pending_consultations", icon: Stethoscope, color: "bg-green-500", link: "/consultations" },
        { title: "Today's Appointments", key: "today_appointments", icon: Calendar, color: "bg-purple-500", link: "/appointments" },
        { title: "Prescriptions Written", key: "prescriptions_today", icon: FileText, color: "bg-emerald-500", link: "/prescriptions" },
    ],
    nurse: [
        { title: "In Queue", key: "in_queue", icon: Clock, color: "bg-blue-500", link: "/queue" },
        { title: "Waiting Patients", key: "waiting_patients", icon: Users, color: "bg-yellow-500", link: "/queue" },
        { title: "Vitals Recorded", key: "vitals_today", icon: Activity, color: "bg-green-500", link: "/consultations" },
        { title: "Prescriptions to Fill", key: "prescriptions_pending", icon: Pill, color: "bg-purple-500", link: "/prescriptions" },
    ],
    receptionist: [
        { title: "Today's Appointments", key: "today_appointments", icon: Calendar, color: "bg-blue-500", link: "/appointments" },
        { title: "Walk-in Patients", key: "walkin_today", icon: UserPlus, color: "bg-green-500", link: "/patients" },
        { title: "Current Queue", key: "in_queue", icon: Clock, color: "bg-yellow-500", link: "/queue" },
        { title: "Checked In", key: "checked_in", icon: ClipboardList, color: "bg-purple-500", link: "/queue" },
    ],
    accountant: [
        { title: "Today's Revenue", key: "today_revenue", icon: DollarSign, color: "bg-emerald-500", link: "/reports" },
        { title: "Pending Payments", key: "pending_payments", icon: CreditCard, color: "bg-yellow-500", link: "/payments" },
        { title: "Unpaid Invoices", key: "unpaid_invoices", icon: FileText, color: "bg-orange-500", link: "/invoices" },
        { title: "This Month", key: "month_revenue", icon: TrendingUp, color: "bg-blue-500", link: "/reports" },
    ],
}

// Role-specific quick actions
const roleActions = {
    super_admin: [
        { name: "Add Staff", icon: UserPlus, href: "/staff/new", color: "text-blue-600" },
        { name: "System Settings", icon: Settings, href: "/settings", color: "text-purple-600" },
        { name: "View Reports", icon: BarChart3, href: "/reports", color: "text-green-600" },
        { name: "AI Analytics", icon: Brain, href: "/reports/ai", color: "text-pink-600" },
    ],
    doctor: [
        { name: "Start Consultation", icon: Stethoscope, href: "/consultations/new", color: "text-blue-600" },
        { name: "Write Prescription", icon: FileText, href: "/prescriptions/new", color: "text-green-600" },
        { name: "View Schedule", icon: Calendar, href: "/appointments", color: "text-purple-600" },
        { name: "AI Diagnosis Help", icon: Brain, href: "/ai/diagnosis", color: "text-pink-600" },
    ],
    nurse: [
        { name: "Call Next Patient", icon: Clock, href: "/queue", color: "text-blue-600" },
        { name: "Record Vitals", icon: Activity, href: "/consultations/vitals", color: "text-green-600" },
        { name: "View Queue", icon: ClipboardList, href: "/queue", color: "text-yellow-600" },
        { name: "Prepare Medicines", icon: Pill, href: "/prescriptions", color: "text-purple-600" },
    ],
    receptionist: [
        { name: "New Patient", icon: UserPlus, href: "/patients/new", color: "text-blue-600" },
        { name: "Book Appointment", icon: CalendarPlus, href: "/appointments/new", color: "text-green-600" },
        { name: "Add to Queue", icon: Clock, href: "/queue/add", color: "text-yellow-600" },
        { name: "Check In Patient", icon: ClipboardList, href: "/queue", color: "text-purple-600" },
    ],
    accountant: [
        { name: "Create Invoice", icon: FileText, href: "/invoices/new", color: "text-blue-600" },
        { name: "Record Payment", icon: CreditCard, href: "/payments/new", color: "text-green-600" },
        { name: "Process Refund", icon: DollarSign, href: "/payments/refund", color: "text-orange-600" },
        { name: "Financial Report", icon: BarChart3, href: "/reports/financial", color: "text-purple-600" },
    ],
}

export default function DashboardPage() {
    const { user, role } = useAuthStore()
    const [stats, setStats] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(true)
    const [recentActivity, setRecentActivity] = useState<any[]>([])

    useEffect(() => {
        fetchDashboardData()
    }, [role])

    const fetchDashboardData = async () => {
        try {
            const supabase = createClient()
            const today = new Date().toISOString().split('T')[0]

            // Fetch counts based on role
            const [patientsRes, appointmentsRes, queueRes, invoicesRes, staffRes] = await Promise.all([
                supabase.from("patients").select("id, gender, created_at", { count: "exact" }),
                supabase.from("appointments").select("id, status", { count: "exact" }).eq("appointment_date", today),
                supabase.from("queues").select("id, status", { count: "exact" }).eq("queue_date", today),
                supabase.from("invoices").select("id, status, total_amount", { count: "exact" }),
                supabase.from("staff_profiles").select("id", { count: "exact" }).eq("is_active", true),
            ])

            const waitingQueue = queueRes.data?.filter(q => q.status === "waiting").length || 0
            const pendingInvoices = invoicesRes.data?.filter(i => i.status !== "paid").length || 0
            const todayRevenue = invoicesRes.data?.filter(i => i.status === "paid").reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0

            setStats({
                total_patients: patientsRes.count || 0,
                today_appointments: appointmentsRes.count || 0,
                in_queue: waitingQueue,
                waiting_patients: waitingQueue,
                pending_invoices: pendingInvoices,
                unpaid_invoices: pendingInvoices,
                today_revenue: `RM ${todayRevenue.toLocaleString()}`,
                month_revenue: `RM ${(todayRevenue * 30).toLocaleString()}`,
                active_staff: staffRes.count || 0,
                my_patients_today: appointmentsRes.count || 0,
                pending_consultations: waitingQueue,
                low_stock: 0,
                prescriptions_today: 0,
                vitals_today: 0,
                prescriptions_pending: 0,
                walkin_today: 0,
                checked_in: appointmentsRes.data?.filter(a => a.status === "confirmed").length || 0,
                pending_payments: pendingInvoices,
            })

            // Fetch recent activity
            const { data: recentPatients } = await supabase
                .from("patients")
                .select("id, first_name, last_name, created_at")
                .order("created_at", { ascending: false })
                .limit(5)

            setRecentActivity(recentPatients || [])
        } catch (error) {
            console.error("Dashboard data error:", error)
        } finally {
            setLoading(false)
        }
    }

    const currentRole = role || "receptionist"
    const currentStats = roleStats[currentRole as keyof typeof roleStats] || roleStats.receptionist
    const currentActions = roleActions[currentRole as keyof typeof roleActions] || roleActions.receptionist

    const getRoleTitle = () => {
        switch (currentRole) {
            case "super_admin": return "System Administrator"
            case "doctor": return "Doctor"
            case "nurse": return "Nurse"
            case "receptionist": return "Receptionist"
            case "accountant": return "Accountant"
            default: return "Staff"
        }
    }

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">
                        Welcome back, {user?.first_name || "User"}!
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {getRoleTitle()} Dashboard • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${currentRole === "super_admin" ? "bg-red-100 text-red-700" :
                            currentRole === "doctor" ? "bg-blue-100 text-blue-700" :
                                currentRole === "nurse" ? "bg-green-100 text-green-700" :
                                    currentRole === "accountant" ? "bg-purple-100 text-purple-700" :
                                        "bg-yellow-100 text-yellow-700"
                        }`}>
                        {currentRole?.replace("_", " ").toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentStats.map((stat, index) => {
                    const Icon = stat.icon
                    const value = stats[stat.key] ?? "..."
                    return (
                        <Link
                            key={index}
                            href={stat.link}
                            className="bg-card rounded-xl p-5 border shadow-sm hover:shadow-md transition-all hover:border-primary/50 group"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                                    <p className="text-2xl font-bold mt-1">{loading ? "..." : value}</p>
                                </div>
                                <div className={`${stat.color} p-2.5 rounded-lg`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-primary">
                                <span>View details</span>
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </div>
                        </Link>
                    )
                })}
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-xl p-6 border shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {currentActions.map((action, index) => {
                        const Icon = action.icon
                        return (
                            <Link
                                key={index}
                                href={action.href}
                                className="flex flex-col items-center justify-center p-4 rounded-xl border hover:bg-accent hover:border-primary/50 transition-all group"
                            >
                                <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-800 mb-2 group-hover:scale-110 transition-transform`}>
                                    <Icon className={`w-5 h-5 ${action.color}`} />
                                </div>
                                <span className="text-sm font-medium text-center">{action.name}</span>
                            </Link>
                        )
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-card rounded-xl p-6 border shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Recent Activity</h2>
                        <Link href="/patients" className="text-sm text-primary hover:underline">View All</Link>
                    </div>
                    <div className="space-y-3">
                        {recentActivity.length > 0 ? recentActivity.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{item.first_name} {item.last_name}</p>
                                    <p className="text-sm text-muted-foreground">New patient registered</p>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(item.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        )) : (
                            <p className="text-center text-muted-foreground py-8">No recent activity</p>
                        )}
                    </div>
                </div>

                {/* Today's Schedule / Alerts */}
                <div className="bg-card rounded-xl p-6 border shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">
                            {currentRole === "doctor" || currentRole === "nurse" ? "Today's Schedule" : "Notifications"}
                        </h2>
                        <Bell className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <div className="flex-1">
                                <p className="font-medium text-blue-900 dark:text-blue-100">Upcoming appointments</p>
                                <p className="text-sm text-blue-700 dark:text-blue-300">{stats.today_appointments || 0} scheduled for today</p>
                            </div>
                        </div>
                        {stats.in_queue > 0 && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                                <Clock className="w-5 h-5 text-yellow-600" />
                                <div className="flex-1">
                                    <p className="font-medium text-yellow-900 dark:text-yellow-100">Patients waiting</p>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300">{stats.in_queue} in queue</p>
                                </div>
                            </div>
                        )}
                        {stats.low_stock > 0 && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                <div className="flex-1">
                                    <p className="font-medium text-red-900 dark:text-red-100">Low stock alert</p>
                                    <p className="text-sm text-red-700 dark:text-red-300">{stats.low_stock} items need restocking</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Insights (for doctor/admin) */}
            {(currentRole === "doctor" || currentRole === "super_admin") && (
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-purple-500">
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">AI Insights</h2>
                            <p className="text-sm text-muted-foreground">Powered by AI analytics</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-card/50 backdrop-blur rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">Patient Flow Prediction</p>
                            <p className="text-xl font-bold mt-1">+15% expected</p>
                            <div className="flex items-center text-green-600 text-sm mt-1">
                                <ArrowUpRight className="w-4 h-4" />
                                <span>Higher than usual</span>
                            </div>
                        </div>
                        <div className="bg-card/50 backdrop-blur rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">Revenue Forecast</p>
                            <p className="text-xl font-bold mt-1">RM 12,500</p>
                            <div className="flex items-center text-green-600 text-sm mt-1">
                                <ArrowUpRight className="w-4 h-4" />
                                <span>On track</span>
                            </div>
                        </div>
                        <div className="bg-card/50 backdrop-blur rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">Suggested Actions</p>
                            <p className="text-lg font-medium mt-1">3 recommendations</p>
                            <Link href="/ai/suggestions" className="text-sm text-primary hover:underline">View all</Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
