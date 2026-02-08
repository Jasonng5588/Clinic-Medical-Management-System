"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { createClient } from "@/lib/supabase/client"
import {
    LayoutDashboard,
    Users,
    Calendar,
    Clock,
    FileText,
    Pill,
    DollarSign,
    Settings,
    LogOut,
    Stethoscope,
    UserCog,
    BarChart3,
    Package,
    CreditCard,
    Bell,
    Shield,
    Database,
    Brain,
    UserCircle,
    ChevronDown,
    Building2,
    CalendarDays,
    ClipboardList,
    Receipt,
    Wallet,
    Activity,
    FolderCog,
    HelpCircle,
} from "lucide-react"
import { useState } from "react"

interface NavItem {
    name: string
    href: string
    icon: any
    roles: string[]
    badge?: string
    children?: { name: string; href: string }[]
}

export function Sidebar() {
    const pathname = usePathname()
    const { user, role, logout } = useAuthStore()
    const [expandedMenus, setExpandedMenus] = useState<string[]>([])

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        logout()
        window.location.href = "/login"
    }

    const navigation: NavItem[] = [
        // Core
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["all"] },

        // Patient Management
        {
            name: "Patients", href: "/patients", icon: Users, roles: ["all"], children: [
                { name: "All Patients", href: "/patients" },
                { name: "Add New", href: "/patients/new" },
                { name: "Medical Records", href: "/patients/records" },
            ]
        },

        // Appointments
        {
            name: "Appointments", href: "/appointments", icon: Calendar, roles: ["all"], children: [
                { name: "All Appointments", href: "/appointments" },
                { name: "Book New", href: "/appointments/new" },
                { name: "Calendar View", href: "/appointments/calendar" },
            ]
        },

        // Queue Management
        {
            name: "Queue", href: "/queue", icon: Clock, roles: ["all"], children: [
                { name: "Live Queue", href: "/queue" },
                { name: "Add to Queue", href: "/queue/add" },
                { name: "Queue History", href: "/queue/history" },
            ]
        },

        // Clinical
        {
            name: "Consultations", href: "/consultations", icon: Stethoscope, roles: ["super_admin", "doctor", "nurse"], children: [
                { name: "All Consultations", href: "/consultations" },
                { name: "New Consultation", href: "/consultations/new" },
                { name: "Templates", href: "/consultations/templates" },
            ]
        },

        {
            name: "Prescriptions", href: "/prescriptions", icon: FileText, roles: ["super_admin", "doctor", "nurse"], children: [
                { name: "All Prescriptions", href: "/prescriptions" },
                { name: "New Prescription", href: "/prescriptions/new" },
                { name: "Templates", href: "/prescriptions/templates" },
            ]
        },

        {
            name: "Medical Records", href: "/medical-records", icon: FileText, roles: ["super_admin", "doctor", "nurse"]
        },

        // Inventory
        { name: "Inventory", href: "/inventory", icon: Package, roles: ["super_admin", "accountant", "nurse"] },

        // Financial
        {
            name: "Invoices", href: "/invoices", icon: Receipt, roles: ["super_admin", "accountant", "receptionist"], children: [
                { name: "All Invoices", href: "/invoices" },
                { name: "Create Invoice", href: "/invoices/new" },
                { name: "Pending", href: "/invoices?status=pending" },
            ]
        },

        {
            name: "Payments", href: "/payments", icon: Wallet, roles: ["super_admin", "accountant", "receptionist"], children: [
                { name: "All Payments", href: "/payments" },
                { name: "Record Payment", href: "/payments/new" },
            ]
        },

        { name: "Refunds", href: "/refunds", icon: CreditCard, roles: ["super_admin", "accountant", "receptionist"] },

        // Reports
        {
            name: "Reports", href: "/reports", icon: BarChart3, roles: ["super_admin", "accountant"], children: [
                { name: "Overview", href: "/reports" },
                { name: "Financial", href: "/reports/financial" },
                { name: "Patients", href: "/reports/patients" },
                { name: "Appointments", href: "/reports/appointments" },
                { name: "AI Analytics", href: "/reports/ai" },
            ]
        },

        // Staff (Admin only)
        {
            name: "Staff", href: "/staff", icon: UserCog, roles: ["super_admin"], children: [
                { name: "All Staff", href: "/staff" },
                { name: "Schedules", href: "/schedules" },
            ]
        },

        // Audit
        { name: "Audit Logs", href: "/audit-logs", icon: Shield, roles: ["super_admin"] },

        // Settings
        {
            name: "Settings", href: "/settings", icon: Settings, roles: ["super_admin"], children: [
                { name: "Clinic Settings", href: "/settings" },
                { name: "Services", href: "/settings/services" },
                { name: "Rooms", href: "/settings/rooms" },
                { name: "Notifications", href: "/settings/notifications" },
                { name: "Backup", href: "/settings/backup" },
            ]
        },
    ]

    const filteredNavigation = navigation.filter(item =>
        item.roles.includes("all") || (role && item.roles.includes(role))
    )

    const toggleMenu = (name: string) => {
        setExpandedMenus(prev =>
            prev.includes(name)
                ? prev.filter(m => m !== name)
                : [...prev, name]
        )
    }

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

    return (
        <div className="flex flex-col h-full bg-card border-r">
            {/* Header */}
            <div className="p-5 border-b">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-primary">HealthCare Plus</h1>
                        <p className="text-xs text-muted-foreground">Clinic Management</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
                {filteredNavigation.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    const expanded = expandedMenus.includes(item.name)
                    const hasChildren = item.children && item.children.length > 0

                    return (
                        <div key={item.name}>
                            {hasChildren ? (
                                <button
                                    onClick={() => toggleMenu(item.name)}
                                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors ${active
                                        ? "bg-primary/10 text-primary"
                                        : "hover:bg-accent text-foreground"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium text-sm">{item.name}</span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
                                </button>
                            ) : (
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${active
                                        ? "bg-primary text-white"
                                        : "hover:bg-accent text-foreground"
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium text-sm">{item.name}</span>
                                    {item.badge && (
                                        <span className="ml-auto px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            )}

                            {/* Submenu */}
                            {hasChildren && expanded && (
                                <div className="ml-4 mt-1 space-y-1 border-l-2 border-muted pl-3">
                                    {item.children!.map((child) => (
                                        <Link
                                            key={child.href}
                                            href={child.href}
                                            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${pathname === child.href
                                                ? "bg-primary/10 text-primary font-medium"
                                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                                }`}
                                        >
                                            {child.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </nav>

            {/* User Profile & Logout */}
            <div className="p-3 border-t space-y-2">
                <Link
                    href="/profile"
                    className="flex items-center gap-3 px-3 py-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                >
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                        <UserCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{user?.first_name} {user?.last_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                            {role?.replace("_", " ")}
                        </p>
                    </div>
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm">Logout</span>
                </button>
            </div>
        </div>
    )
}
