"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/auth-store"
import { Sidebar } from "@/components/layout/sidebar"
import { Loader2, Menu, Bell, Search, Moon, Sun } from "lucide-react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const { user, setUser, setRole, setLoading } = useAuthStore()
    const [checking, setChecking] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [darkMode, setDarkMode] = useState(false)

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const supabase = createClient()
                const { data: { user: authUser } } = await supabase.auth.getUser()

                if (!authUser) {
                    router.push("/login")
                    return
                }

                // Fetch staff profile
                const { data: profile } = await supabase
                    .from("staff_profiles")
                    .select("*")
                    .eq("id", authUser.id)
                    .single()

                if (profile) {
                    setUser(profile)
                    setRole(profile.role)
                }
            } catch (error) {
                console.error("Auth check failed:", error)
                router.push("/login")
            } finally {
                setLoading(false)
                setChecking(false)
            }
        }

        checkAuth()
    }, [router, setUser, setRole, setLoading])

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!user) {
        // Still show dashboard with default content while loading
        return (
            <div className="flex h-screen overflow-hidden bg-background">
                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <div className={`
                    fixed lg:static inset-y-0 left-0 z-50 w-64
                    transform transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <Sidebar />
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Navbar */}
                    <header className="bg-card border-b px-4 lg:px-6 py-4">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-2 hover:bg-accent rounded-lg"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div className="flex-1 max-w-xl mx-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search patients, appointments..."
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-accent rounded-lg relative">
                                    <Bell className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                        {children}
                    </main>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:static inset-y-0 left-0 z-50 w-64
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Navbar */}
                <header className="bg-card border-b px-4 lg:px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 hover:bg-accent rounded-lg"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-xl mx-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search patients, appointments..."
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-2">
                            {/* Dark Mode Toggle */}
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className="p-2 hover:bg-accent rounded-lg"
                            >
                                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>

                            {/* Notifications */}
                            <button className="p-2 hover:bg-accent rounded-lg relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
