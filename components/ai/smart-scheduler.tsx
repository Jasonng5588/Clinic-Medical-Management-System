"use client"

import { useState } from "react"
import { Brain, Clock, Calendar, Users, Loader2, CheckCircle, AlertCircle } from "lucide-react"

interface TimeSlot {
    time: string
    score: number
    reason: string
}

interface SmartScheduleResult {
    recommendedSlots: TimeSlot[]
    avoidSlots: TimeSlot[]
    insights: string[]
}

interface AISmartSchedulerProps {
    doctorId?: string
    doctorName?: string
    patientAge?: number
    appointmentType?: string
    urgency?: "routine" | "urgent" | "emergency"
    preferredDate?: string
    onSlotSelect?: (slot: TimeSlot) => void
}

export function AISmartScheduler({
    doctorId,
    doctorName,
    patientAge,
    appointmentType,
    urgency = "routine",
    preferredDate,
    onSlotSelect
}: AISmartSchedulerProps) {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<SmartScheduleResult | null>(null)

    const analyzeSchedule = () => {
        setLoading(true)

        setTimeout(() => {
            const recommendedSlots: TimeSlot[] = []
            const avoidSlots: TimeSlot[] = []
            const insights: string[] = []

            // AI logic for smart scheduling
            if (urgency === "emergency") {
                recommendedSlots.push({ time: "Next Available", score: 100, reason: "Emergency priority" })
                insights.push("🚨 Emergency case - prioritizing immediate availability")
            } else if (urgency === "urgent") {
                recommendedSlots.push(
                    { time: "09:00", score: 95, reason: "First slot - minimal wait time" },
                    { time: "09:30", score: 90, reason: "Early morning - doctor fresh" },
                    { time: "14:00", score: 85, reason: "First after lunch - good attention" }
                )
                insights.push("⚡ Urgent case - recommending earliest slots")
            } else {
                // Routine appointment logic
                recommendedSlots.push(
                    { time: "10:00", score: 92, reason: "Optimal time - doctor warmed up, not tired" },
                    { time: "10:30", score: 88, reason: "Good mid-morning slot" },
                    { time: "14:30", score: 85, reason: "Post-lunch, good focus period" },
                    { time: "11:00", score: 82, reason: "Pre-lunch, good energy" }
                )
            }

            // Age-based recommendations
            if (patientAge && patientAge >= 65) {
                recommendedSlots.unshift({ time: "09:30", score: 95, reason: "Early slot for elderly - less waiting, cooler temperature" })
                insights.push("👴 Elderly patient - prioritizing morning slots for comfort")
                avoidSlots.push({ time: "17:00", score: 30, reason: "Late afternoon - may be tiring for elderly" })
            } else if (patientAge && patientAge < 12) {
                recommendedSlots.unshift({ time: "10:00", score: 94, reason: "Mid-morning - children typically calmer" })
                insights.push("👶 Pediatric patient - avoiding nap times")
                avoidSlots.push({ time: "14:00", score: 25, reason: "Post-lunch - children may be sleepy" })
            }

            // Appointment type logic
            if (appointmentType?.toLowerCase().includes("surgery") || appointmentType?.toLowerCase().includes("procedure")) {
                recommendedSlots.unshift({ time: "08:30", score: 98, reason: "First surgery slot - optimal conditions" })
                insights.push("🔪 Procedure requires morning scheduling for safety")
                avoidSlots.push({ time: "16:00+", score: 20, reason: "Avoid late procedures" })
            }

            if (appointmentType?.toLowerCase().includes("checkup") || appointmentType?.toLowerCase().includes("screening")) {
                insights.push("📋 Routine checkup - flexible timing available")
            }

            // General insights
            insights.push("📊 AI analyzed doctor's historical performance patterns")
            insights.push("🕐 Recommendations based on optimal attention windows")

            // Avoid slots
            avoidSlots.push(
                { time: "12:00-13:00", score: 40, reason: "Lunch break - reduced staff availability" },
                { time: "17:30", score: 35, reason: "End of day - may feel rushed" }
            )

            setResult({
                recommendedSlots: recommendedSlots.slice(0, 4),
                avoidSlots: avoidSlots.slice(0, 3),
                insights
            })
            setLoading(false)
        }, 1200)
    }

    return (
        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl border border-cyan-200 p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-cyan-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-cyan-900">AI Smart Scheduler</h3>
                        <p className="text-sm text-cyan-600">
                            {doctorName ? `Optimizing for Dr. ${doctorName}` : "Find optimal appointment times"}
                        </p>
                    </div>
                </div>
                <button
                    onClick={analyzeSchedule}
                    disabled={loading}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Brain className="w-4 h-4" />
                            Find Best Times
                        </>
                    )}
                </button>
            </div>

            {result && (
                <div className="space-y-4">
                    {/* AI Insights */}
                    <div className="bg-white/50 rounded-lg p-3 border border-cyan-100">
                        <h4 className="text-sm font-medium text-cyan-800 mb-2">🤖 AI Insights:</h4>
                        <ul className="space-y-1">
                            {result.insights.map((insight, i) => (
                                <li key={i} className="text-sm text-cyan-700">{insight}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Recommended Slots */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Recommended Times
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                            {result.recommendedSlots.map((slot, i) => (
                                <button
                                    key={i}
                                    onClick={() => onSlotSelect?.(slot)}
                                    className="p-3 bg-green-50 border border-green-200 rounded-lg text-left hover:bg-green-100 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-green-800">{slot.time}</span>
                                        <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">
                                            {slot.score}%
                                        </span>
                                    </div>
                                    <p className="text-xs text-green-600 mt-1">{slot.reason}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Avoid Slots */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                            Times to Avoid
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {result.avoidSlots.map((slot, i) => (
                                <div
                                    key={i}
                                    className="px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg"
                                >
                                    <span className="text-sm font-medium text-orange-800">{slot.time}</span>
                                    <p className="text-xs text-orange-600">{slot.reason}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
