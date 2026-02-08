"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Calendar as CalendarIcon, Plus, Search, Clock, User, Phone, Mail } from "lucide-react"
import Link from "next/link"

interface Appointment {
    id: string
    appointment_number: string
    patient: {
        first_name: string
        last_name: string
        phone: string
    }
    doctor: {
        first_name: string
        last_name: string
    }
    appointment_date: string
    appointment_time: string
    status: string
    reason_for_visit: string
}

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState<"list" | "calendar">("list")
    const [statusFilter, setStatusFilter] = useState<string>("all")

    useEffect(() => {
        loadAppointments()
    }, [])

    const loadAppointments = async () => {
        try {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('appointments')
                .select(`
          *,
          patient:patients(first_name, last_name, phone),
          doctor:staff_profiles!appointments_doctor_id_fkey(first_name, last_name)
        `)
                .order('appointment_date', { ascending: true })
                .order('appointment_time', { ascending: true })

            if (error) throw error
            setAppointments(data || [])
        } catch (error) {
            console.error('Error loading appointments:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            scheduled: 'bg-blue-100 text-blue-700 border-blue-300',
            confirmed: 'bg-green-100 text-green-700 border-green-300',
            in_progress: 'bg-purple-100 text-purple-700 border-purple-300',
            completed: 'bg-gray-100 text-gray-700 border-gray-300',
            cancelled: 'bg-red-100 text-red-700 border-red-300',
            no_show: 'bg-orange-100 text-orange-700 border-orange-300',
        }
        return colors[status] || colors.scheduled
    }

    const filteredAppointments = statusFilter === "all"
        ? appointments
        : appointments.filter(apt => apt.status === statusFilter)

    const stats = {
        today: appointments.filter(a => a.appointment_date === new Date().toISOString().split('T')[0]).length,
        scheduled: appointments.filter(a => a.status === 'scheduled').length,
        confirmed: appointments.filter(a => a.status === 'confirmed').length,
    }

    if (loading) {
        return <div className="p-6">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Appointments</h1>
                    <p className="text-muted-foreground mt-1">Manage patient appointments and schedules</p>
                </div>
                <Link href="/appointments/new" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Appointment
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-3">
                        <CalendarIcon className="w-8 h-8 text-blue-600" />
                        <div>
                            <p className="text-sm text-blue-700">Today's Appointments</p>
                            <p className="text-3xl font-bold text-blue-900">{stats.today}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <div className="flex items-center gap-3">
                        <Clock className="w-8 h-8 text-yellow-600" />
                        <div>
                            <p className="text-sm text-yellow-700">Scheduled</p>
                            <p className="text-3xl font-bold text-yellow-900">{stats.scheduled}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-3">
                        <User className="w-8 h-8 text-green-600" />
                        <div>
                            <p className="text-sm text-green-700">Confirmed</p>
                            <p className="text-3xl font-bold text-green-900">{stats.confirmed}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Toggle & Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex gap-2">
                    <button
                        onClick={() => setView("list")}
                        className={`px-4 py-2 rounded-lg transition-colors ${view === "list" ? "bg-primary text-white" : "bg-card border hover:bg-accent"
                            }`}
                    >
                        List View
                    </button>
                    <button
                        onClick={() => setView("calendar")}
                        className={`px-4 py-2 rounded-lg transition-colors ${view === "calendar" ? "bg-primary text-white" : "bg-card border hover:bg-accent"
                            }`}
                    >
                        Calendar View
                    </button>
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="all">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Appointments List */}
            <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left p-4 font-semibold">Appointment #</th>
                                <th className="text-left p-4 font-semibold">Patient</th>
                                <th className="text-left p-4 font-semibold">Doctor</th>
                                <th className="text-left p-4 font-semibold">Date & Time</th>
                                <th className="text-left p-4 font-semibold">Reason</th>
                                <th className="text-center p-4 font-semibold">Status</th>
                                <th className="text-center p-4 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredAppointments.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                        No appointments found
                                    </td>
                                </tr>
                            ) : (
                                filteredAppointments.map((appointment) => (
                                    <tr key={appointment.id} className="hover:bg-muted/30">
                                        <td className="p-4 font-medium">{appointment.appointment_number}</td>
                                        <td className="p-4">
                                            <div>
                                                <p className="font-medium">{appointment.patient.first_name} {appointment.patient.last_name}</p>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {appointment.patient.phone}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            Dr. {appointment.doctor.first_name} {appointment.doctor.last_name}
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <p className="font-medium">
                                                    {new Date(appointment.appointment_date).toLocaleDateString()}
                                                </p>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {appointment.appointment_time}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm max-w-xs truncate">
                                            {appointment.reason_for_visit || '-'}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                                                {appointment.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button className="px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-primary/90">
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
