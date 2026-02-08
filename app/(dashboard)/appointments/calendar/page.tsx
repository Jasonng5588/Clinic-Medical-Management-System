"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/auth-store"
import {
    Calendar, ChevronLeft, ChevronRight, Plus, Loader2,
    Clock, User, Stethoscope
} from "lucide-react"
import Link from "next/link"

interface Appointment {
    id: string
    appointment_date: string
    appointment_time: string
    status: string
    duration_minutes: number
    reason_for_visit: string | null
    patient?: { first_name: string; last_name: string }
    doctor?: { first_name: string; last_name: string }
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export default function AppointmentsCalendarPage() {
    const { role, user } = useAuthStore()
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [viewMode, setViewMode] = useState<"month" | "week">("month")

    useEffect(() => { fetchAppointments() }, [currentDate])

    const fetchAppointments = async () => {
        setLoading(true)
        try {
            const supabase = createClient()
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

            let query = supabase.from("appointments")
                .select(`*, patient:patients(first_name, last_name), doctor:staff_profiles!doctor_id(first_name, last_name)`)
                .gte("appointment_date", startOfMonth.toISOString().split("T")[0])
                .lte("appointment_date", endOfMonth.toISOString().split("T")[0])
                .order("appointment_time")

            // Doctors only see their own appointments
            if (role === "doctor" && user?.id) {
                query = query.eq("doctor_id", user.id)
            }

            const { data, error } = await query
            if (error) throw error
            setAppointments(data || [])
        } catch (error) { console.error("Error:", error) }
        finally { setLoading(false) }
    }

    const getDaysInMonth = () => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const firstDay = new Date(year, month, 1).getDay()
        const daysInMonth = new Date(year, month + 1, 0).getDate()

        const days = []
        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            days.push(null)
        }
        // Add days of month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i)
        }
        return days
    }

    const getAppointmentsForDay = (day: number) => {
        if (!day) return []
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        return appointments.filter(a => a.appointment_date === dateStr)
    }

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    const goToToday = () => {
        setCurrentDate(new Date())
    }

    const isToday = (day: number) => {
        const today = new Date()
        return day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear()
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "scheduled": return "bg-blue-500"
            case "confirmed": return "bg-green-500"
            case "in_progress": return "bg-yellow-500"
            case "completed": return "bg-gray-500"
            case "cancelled": return "bg-red-500"
            default: return "bg-gray-400"
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Appointments Calendar</h1>
                    <p className="text-muted-foreground">View and manage appointments</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={goToToday} className="px-4 py-2 border rounded-lg hover:bg-accent">
                        Today
                    </button>
                    <Link href="/appointments/new" className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90">
                        <Plus className="w-4 h-4" />
                        New Appointment
                    </Link>
                </div>
            </div>

            {/* Calendar Header */}
            <div className="bg-card rounded-xl border p-4">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={prevMonth} className="p-2 hover:bg-accent rounded-lg">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-bold">
                        {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <button onClick={nextMonth} className="p-2 hover:bg-accent rounded-lg">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Day Headers */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {DAYS.map(day => (
                                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {getDaysInMonth().map((day, index) => {
                                const dayAppointments = day ? getAppointmentsForDay(day) : []
                                return (
                                    <div
                                        key={index}
                                        className={`min-h-24 p-1 border rounded-lg ${day ? "bg-background hover:border-primary/50" : "bg-accent/30"
                                            } ${isToday(day!) ? "ring-2 ring-primary" : ""}`}
                                    >
                                        {day && (
                                            <>
                                                <div className={`text-sm font-medium mb-1 ${isToday(day) ? "text-primary" : ""}`}>
                                                    {day}
                                                </div>
                                                <div className="space-y-1">
                                                    {dayAppointments.slice(0, 3).map((apt) => (
                                                        <Link
                                                            key={apt.id}
                                                            href={`/appointments?date=${apt.appointment_date}`}
                                                            className={`block px-1.5 py-0.5 rounded text-xs text-white truncate ${getStatusColor(apt.status)}`}
                                                            title={`${apt.appointment_time} - ${apt.patient?.first_name} ${apt.patient?.last_name}`}
                                                        >
                                                            {apt.appointment_time.slice(0, 5)} {apt.patient?.first_name}
                                                        </Link>
                                                    ))}
                                                    {dayAppointments.length > 3 && (
                                                        <div className="text-xs text-muted-foreground px-1">
                                                            +{dayAppointments.length - 3} more
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>Scheduled</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>Confirmed</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span>In Progress</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-gray-500" />
                    <span>Completed</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>Cancelled</span>
                </div>
            </div>

            {/* Today's Appointments List */}
            <div className="bg-card rounded-xl border p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Today's Appointments
                </h3>
                <div className="space-y-3">
                    {appointments
                        .filter(a => a.appointment_date === new Date().toISOString().split("T")[0])
                        .map((apt) => (
                            <div key={apt.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent/50">
                                <div className={`w-2 h-full rounded-full ${getStatusColor(apt.status)}`} style={{ minHeight: 40 }} />
                                <div className="flex-1">
                                    <p className="font-medium">{apt.patient?.first_name} {apt.patient?.last_name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {apt.appointment_time.slice(0, 5)} • {apt.duration_minutes} min • Dr. {apt.doctor?.first_name}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${apt.status === "confirmed" ? "bg-green-100 text-green-700" :
                                        apt.status === "scheduled" ? "bg-blue-100 text-blue-700" :
                                            "bg-gray-100 text-gray-700"
                                    }`}>
                                    {apt.status}
                                </span>
                            </div>
                        ))}
                    {appointments.filter(a => a.appointment_date === new Date().toISOString().split("T")[0]).length === 0 && (
                        <p className="text-center text-muted-foreground py-8">No appointments today</p>
                    )}
                </div>
            </div>
        </div>
    )
}
