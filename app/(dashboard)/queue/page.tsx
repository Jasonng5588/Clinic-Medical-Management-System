"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/auth-store"
import {
    Users, Clock, ArrowRight, Volume2, CheckCircle, XCircle,
    Loader2, Play, SkipForward, Timer, User, Calendar
} from "lucide-react"

interface QueueEntry {
    id: string
    patient_id: string
    appointment_id: string | null
    queue_number: number
    status: "waiting" | "in_progress" | "completed" | "cancelled"
    priority_level: number // 1=normal, 2=urgent, 3=emergency
    check_in_time: string
    start_time: string | null
    end_time: string | null
    notes: string | null
    patient?: { first_name: string; last_name: string; patient_number: string }
    appointment?: { service_type: string; doctor_id: string }
}

export default function QueuePage() {
    const { user, role } = useAuthStore()
    const [queue, setQueue] = useState<QueueEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [currentNumber, setCurrentNumber] = useState<number | null>(null)

    useEffect(() => { fetchQueue() }, [])

    const fetchQueue = async () => {
        setLoading(true)
        try {
            const supabase = createClient()
            const today = new Date().toISOString().split("T")[0]
            const { data, error } = await supabase.from("queues")
                .select(`*, patient:patients(first_name, last_name, patient_number), appointment:appointments(service_type, doctor_id)`)
                .gte("check_in_time", today)
                .order("priority_level", { ascending: false }) // Changed from priority to priority_level
                .order("queue_number")

            if (error) throw error
            setQueue(data || [])

            const inProgress = data?.find(q => q.status === "in_progress")
            setCurrentNumber(inProgress?.queue_number || null)
        } catch (error) { console.error("Error:", error) }
        finally { setLoading(false) }
    }

    const callNext = async () => {
        const waiting = queue.filter(q => q.status === "waiting")
        if (waiting.length === 0) { alert("No patients waiting"); return }

        const next = waiting[0]
        const supabase = createClient()

        // Complete current if any
        const current = queue.find(q => q.status === "in_progress")
        if (current) {
            await supabase.from("queues").update({ status: "completed", end_time: new Date().toISOString() }).eq("id", current.id)
        }

        // Start next
        await supabase.from("queues").update({ status: "in_progress", start_time: new Date().toISOString() }).eq("id", next.id)
        await supabase.from("audit_logs").insert({ action: "queue_called", table_name: "queues", record_id: next.id, user_id: user?.id })

        setCurrentNumber(next.queue_number)
        fetchQueue()

        // Play announcement sound
        const utterance = new SpeechSynthesisUtterance(`Number ${next.queue_number}, please proceed to the counter`)
        speechSynthesis.speak(utterance)
    }

    const skipPatient = async (id: string) => {
        const supabase = createClient()
        await supabase.from("queues").update({ status: "cancelled" }).eq("id", id)
        fetchQueue()
    }

    const markComplete = async (id: string) => {
        const supabase = createClient()
        await supabase.from("queues").update({ status: "completed", end_time: new Date().toISOString() }).eq("id", id)
        fetchQueue()
    }

    const waiting = queue.filter(q => q.status === "waiting")
    const inProgress = queue.find(q => q.status === "in_progress")
    const completed = queue.filter(q => q.status === "completed")

    const getPriorityBadge = (priority_level: number) => {
        if (priority_level === 3) return "bg-red-500 text-white" // emergency
        if (priority_level === 2) return "bg-orange-500 text-white" // urgent
        return "bg-gray-100 text-gray-700" // normal
    }

    const getPriorityLabel = (priority_level: number) => {
        if (priority_level === 3) return "Emergency"
        if (priority_level === 2) return "Urgent"
        return "Normal"
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div><h1 className="text-2xl font-bold">Queue Management</h1><p className="text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
                <button onClick={callNext} className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 text-lg font-medium"><Volume2 className="w-5 h-5" />Call Next</button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl p-5 border"><div className="flex items-center gap-3"><Timer className="w-8 h-8 text-yellow-500" /><div><p className="text-sm text-muted-foreground">Waiting</p><p className="text-3xl font-bold">{waiting.length}</p></div></div></div>
                <div className="bg-card rounded-xl p-5 border"><div className="flex items-center gap-3"><Play className="w-8 h-8 text-blue-500" /><div><p className="text-sm text-muted-foreground">In Progress</p><p className="text-3xl font-bold">{inProgress ? 1 : 0}</p></div></div></div>
                <div className="bg-card rounded-xl p-5 border"><div className="flex items-center gap-3"><CheckCircle className="w-8 h-8 text-green-500" /><div><p className="text-sm text-muted-foreground">Completed</p><p className="text-3xl font-bold">{completed.length}</p></div></div></div>
                <div className="bg-gradient-to-br from-primary to-blue-700 text-white rounded-xl p-5"><div className="text-center"><p className="text-sm opacity-90">Now Serving</p><p className="text-5xl font-bold">{currentNumber || "-"}</p></div></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Waiting */}
                <div className="bg-card rounded-xl border">
                    <div className="px-4 py-3 border-b font-semibold flex items-center gap-2"><Clock className="w-5 h-5 text-yellow-500" />Waiting ({waiting.length})</div>
                    <div className="divide-y max-h-96 overflow-y-auto">
                        {loading ? <div className="p-4 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
                            : waiting.length > 0 ? waiting.map((q) => (
                                <div key={q.id} className="p-4 flex items-center justify-between hover:bg-accent/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-xl font-bold text-yellow-700">{q.queue_number}</div>
                                        <div>
                                            <p className="font-medium">{q.patient?.first_name} {q.patient?.last_name}</p>
                                            <p className="text-sm text-muted-foreground">{new Date(q.check_in_time).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityBadge(q.priority_level)}`}>{getPriorityLabel(q.priority_level)}</span>
                                        <button onClick={() => skipPatient(q.id)} className="p-1 hover:bg-red-100 text-red-600 rounded"><SkipForward className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            )) : <div className="p-8 text-center text-muted-foreground">No patients waiting</div>}
                    </div>
                </div>

                {/* In Progress */}
                <div className="bg-card rounded-xl border">
                    <div className="px-4 py-3 border-b font-semibold flex items-center gap-2"><Play className="w-5 h-5 text-blue-500" />In Progress</div>
                    <div className="p-6">
                        {inProgress ? (
                            <div className="text-center">
                                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-700 mx-auto mb-4">{inProgress.queue_number}</div>
                                <h3 className="text-xl font-bold">{inProgress.patient?.first_name} {inProgress.patient?.last_name}</h3>
                                <p className="text-muted-foreground mb-4">{inProgress.patient?.patient_number}</p>
                                <p className="text-sm text-muted-foreground mb-4">Started: {inProgress.start_time ? new Date(inProgress.start_time).toLocaleTimeString() : "-"}</p>
                                <button onClick={() => markComplete(inProgress.id)} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg mx-auto hover:bg-green-600"><CheckCircle className="w-4 h-4" />Complete</button>
                            </div>
                        ) : <div className="py-12 text-center text-muted-foreground">No patient in progress</div>}
                    </div>
                </div>

                {/* Completed */}
                <div className="bg-card rounded-xl border">
                    <div className="px-4 py-3 border-b font-semibold flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" />Completed ({completed.length})</div>
                    <div className="divide-y max-h-96 overflow-y-auto">
                        {completed.length > 0 ? completed.slice(0, 10).map((q) => (
                            <div key={q.id} className="p-4 flex items-center gap-3 opacity-60">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-lg font-bold text-green-700">{q.queue_number}</div>
                                <div>
                                    <p className="font-medium">{q.patient?.first_name} {q.patient?.last_name}</p>
                                    <p className="text-xs text-muted-foreground">{q.end_time ? new Date(q.end_time).toLocaleTimeString() : "-"}</p>
                                </div>
                            </div>
                        )) : <div className="p-8 text-center text-muted-foreground">No completed patients</div>}
                    </div>
                </div>
            </div>
        </div>
    )
}
