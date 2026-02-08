"use client"

import { useState } from "react"
import { Brain, FileText, Loader2, Download, Copy, CheckCircle } from "lucide-react"

interface MedicalReportData {
    patientName: string
    patientAge?: number
    patientGender?: string
    diagnosis: string
    symptoms: string
    vitals?: {
        bloodPressure?: string
        heartRate?: number
        temperature?: number
        weight?: number
    }
    medications?: string[]
    testResults?: string[]
    doctorName?: string
    consultationDate?: string
}

interface AIReportGeneratorProps {
    data: MedicalReportData
    onReportGenerated?: (report: string) => void
}

export function AIReportGenerator({ data, onReportGenerated }: AIReportGeneratorProps) {
    const [loading, setLoading] = useState(false)
    const [report, setReport] = useState<string>("")
    const [copied, setCopied] = useState(false)

    const generateReport = () => {
        setLoading(true)

        setTimeout(() => {
            const today = new Date().toLocaleDateString("en-MY", {
                year: "numeric",
                month: "long",
                day: "numeric"
            })

            let generatedReport = `
═══════════════════════════════════════════════════════════════
                    MEDICAL CONSULTATION REPORT
                    Clinic Management System
═══════════════════════════════════════════════════════════════

DATE: ${data.consultationDate || today}
ATTENDING PHYSICIAN: ${data.doctorName || "Dr. [Name]"}

───────────────────────────────────────────────────────────────
                        PATIENT INFORMATION
───────────────────────────────────────────────────────────────
Name: ${data.patientName}
Age: ${data.patientAge || "N/A"} years
Gender: ${data.patientGender || "N/A"}

───────────────────────────────────────────────────────────────
                        CHIEF COMPLAINTS
───────────────────────────────────────────────────────────────
${data.symptoms || "Not specified"}

───────────────────────────────────────────────────────────────
                        VITAL SIGNS
───────────────────────────────────────────────────────────────
Blood Pressure: ${data.vitals?.bloodPressure || "N/A"}
Heart Rate: ${data.vitals?.heartRate ? `${data.vitals.heartRate} bpm` : "N/A"}
Temperature: ${data.vitals?.temperature ? `${data.vitals.temperature}°C` : "N/A"}
Weight: ${data.vitals?.weight ? `${data.vitals.weight} kg` : "N/A"}

───────────────────────────────────────────────────────────────
                        DIAGNOSIS
───────────────────────────────────────────────────────────────
${data.diagnosis || "Pending"}

───────────────────────────────────────────────────────────────
                        AI CLINICAL ANALYSIS
───────────────────────────────────────────────────────────────
`
            // AI-generated analysis based on symptoms and diagnosis
            const symptoms = data.symptoms?.toLowerCase() || ""
            const diagnosis = data.diagnosis?.toLowerCase() || ""

            if (symptoms.includes("fever") || diagnosis.includes("infection")) {
                generatedReport += `
• Inflammatory markers likely elevated
• Recommend monitoring temperature every 4 hours
• Adequate hydration essential (2-3L/day)
• Consider complete blood count if symptoms persist >48h
`
            }

            if (symptoms.includes("cough") || diagnosis.includes("respiratory")) {
                generatedReport += `
• Respiratory assessment indicates possible upper/lower tract involvement
• Chest examination recommended if cough persists >1 week
• Avoid cold beverages and irritants
• Steam inhalation may provide symptomatic relief
`
            }

            if (symptoms.includes("headache") || symptoms.includes("pain")) {
                generatedReport += `
• Pain management protocol initiated
• Monitor for red flag symptoms (vision changes, neck stiffness)
• Adequate rest recommended
• Follow-up if symptoms worsen or new symptoms develop
`
            }

            if (diagnosis.includes("diabetes") || diagnosis.includes("hypertension")) {
                generatedReport += `
• Chronic condition management protocol in effect
• Regular monitoring of relevant biomarkers essential
• Lifestyle modifications advised
• Medication compliance critical for optimal outcomes
`
            }

            generatedReport += `
───────────────────────────────────────────────────────────────
                        PRESCRIBED MEDICATIONS
───────────────────────────────────────────────────────────────
`
            if (data.medications && data.medications.length > 0) {
                data.medications.forEach((med, i) => {
                    generatedReport += `${i + 1}. ${med}\n`
                })
            } else {
                generatedReport += "No medications prescribed\n"
            }

            generatedReport += `
───────────────────────────────────────────────────────────────
                        RECOMMENDATIONS
───────────────────────────────────────────────────────────────
• Complete prescribed medication course as directed
• Return for follow-up if symptoms persist or worsen
• Maintain adequate rest and hydration
• Contact clinic immediately if emergency symptoms develop

───────────────────────────────────────────────────────────────
                        FOLLOW-UP
───────────────────────────────────────────────────────────────
Recommended follow-up: 1-2 weeks or as needed

═══════════════════════════════════════════════════════════════
               This report was generated with AI assistance
                    © Clinic Management System
═══════════════════════════════════════════════════════════════
`

            setReport(generatedReport)
            setLoading(false)

            if (onReportGenerated) {
                onReportGenerated(generatedReport)
            }
        }, 1500)
    }

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(report)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const downloadReport = () => {
        const blob = new Blob([report], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `Medical_Report_${data.patientName.replace(/\s/g, "_")}_${new Date().toISOString().split("T")[0]}.txt`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200 p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                        <FileText className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-emerald-900">AI Medical Report Generator</h3>
                        <p className="text-sm text-emerald-600">Auto-generate professional medical reports</p>
                    </div>
                </div>
                <button
                    onClick={generateReport}
                    disabled={loading}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Brain className="w-4 h-4" />
                            Generate Report
                        </>
                    )}
                </button>
            </div>

            {report && (
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <button
                            onClick={copyToClipboard}
                            className="px-3 py-1.5 bg-white border rounded-lg text-sm flex items-center gap-1 hover:bg-gray-50"
                        >
                            {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                            {copied ? "Copied!" : "Copy"}
                        </button>
                        <button
                            onClick={downloadReport}
                            className="px-3 py-1.5 bg-white border rounded-lg text-sm flex items-center gap-1 hover:bg-gray-50"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </button>
                    </div>
                    <pre className="bg-white border rounded-lg p-4 text-xs font-mono overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap">
                        {report}
                    </pre>
                </div>
            )}
        </div>
    )
}
