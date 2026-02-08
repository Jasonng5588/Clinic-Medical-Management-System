"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Navbar } from "./navbar"

export function MainLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="h-screen flex overflow-hidden">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
                <Sidebar />
            </aside>

            {/* Sidebar - Mobile */}
            {sidebarOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <aside className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden">
                        <Sidebar />
                    </aside>
                </>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 overflow-y-auto bg-background p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
