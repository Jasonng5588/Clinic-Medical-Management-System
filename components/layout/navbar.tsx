"use client"

import { useState } from "react"
import { Bell, Search, Moon, Sun, Menu } from "lucide-react"
import { useNotificationStore } from "@/store/notification-store"

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
    const { unreadCount } = useNotificationStore()
    const [darkMode, setDarkMode] = useState(false)

    const toggleDarkMode = () => {
        setDarkMode(!darkMode)
        document.documentElement.classList.toggle("dark")
    }

    return (
        <div className="h-16 border-b bg-card px-6 flex items-center justify-between">
            {/* Left */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 hover:bg-accent rounded-lg"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2 rounded-lg border bg-background w-64 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleDarkMode}
                    className="p-2 hover:bg-accent rounded-lg"
                >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Notifications */}
                <button className="relative p-2 hover:bg-accent rounded-lg">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </button>
            </div>
        </div>
    )
}
