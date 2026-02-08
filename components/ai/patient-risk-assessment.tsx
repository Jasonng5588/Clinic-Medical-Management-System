"use client"

import { useState, useEffect } from "react"
import { Brain, AlertTriangle, TrendingUp, Heart, Activity, Shield, Loader2 } from "lucide-react"

interface RiskFactor {
    factor: string
    severity: "low" | "medium" | "high" | "critical"
    description: string
    recommendation: string
}

interface RiskAssessment {
    overallRisk: "low" | "medium" | "high" | "critical"
    riskScore: number
    factors: RiskFactor[]
    recommendations: string[]
}

interface AIPatientRiskAssessmentProps {
    patient: {
        age?: number
        gender?: string
        bloodGroup?: string
        allergies?: string
        chronicConditions?: string
        medicalHistory?: string
        currentMedications?: string[]
        vitals?: {
            bloodPressure?: string
            heartRate?: number
            temperature?: number
            weight?: number
            height?: number
        }
    }
    onAssessmentComplete?: (assessment: RiskAssessment) => void
}

export function AIPatientRiskAssessment({ patient, onAssessmentComplete }: AIPatientRiskAssessmentProps) {
    const [loading, setLoading] = useState(false)
    const [assessment, setAssessment] = useState<RiskAssessment | null>(null)

    const analyzeRisk = () => {
        setLoading(true)

        setTimeout(() => {
            const factors: RiskFactor[] = []
            let riskScore = 0
            const recommendations: string[] = []

            // Age-based risk
            if (patient.age) {
                if (patient.age >= 65) {
                    factors.push({
                        factor: "Advanced Age",
                        severity: "medium",
                        description: `Patient is ${patient.age} years old, higher risk for complications`,
                        recommendation: "Consider geriatric-specific protocols"
                    })
                    riskScore += 20
                } else if (patient.age >= 50) {
                    factors.push({
                        factor: "Middle Age",
                        severity: "low",
                        description: `Patient is ${patient.age} years old`,
                        recommendation: "Regular screening recommended"
                    })
                    riskScore += 10
                }
            }

            // Chronic conditions
            if (patient.chronicConditions) {
                const conditions = patient.chronicConditions.toLowerCase()

                if (conditions.includes("diabetes")) {
                    factors.push({
                        factor: "Diabetes",
                        severity: "high",
                        description: "Increased risk for infections, wound healing issues",
                        recommendation: "Monitor blood glucose levels closely"
                    })
                    riskScore += 25
                    recommendations.push("Schedule HbA1c test every 3 months")
                }

                if (conditions.includes("hypertension") || conditions.includes("high blood pressure")) {
                    factors.push({
                        factor: "Hypertension",
                        severity: "medium",
                        description: "Increased cardiovascular risk",
                        recommendation: "Regular BP monitoring required"
                    })
                    riskScore += 20
                    recommendations.push("Lifestyle modifications for BP control")
                }

                if (conditions.includes("heart") || conditions.includes("cardiac")) {
                    factors.push({
                        factor: "Cardiac Condition",
                        severity: "high",
                        description: "Requires careful monitoring during procedures",
                        recommendation: "Cardiology clearance before any surgical procedures"
                    })
                    riskScore += 30
                }

                if (conditions.includes("asthma") || conditions.includes("copd")) {
                    factors.push({
                        factor: "Respiratory Condition",
                        severity: "medium",
                        description: "Risk during anesthesia and respiratory infections",
                        recommendation: "Pulmonary function test recommended"
                    })
                    riskScore += 15
                }
            }

            // Allergies
            if (patient.allergies && patient.allergies.toLowerCase() !== "none") {
                factors.push({
                    factor: "Known Allergies",
                    severity: "medium",
                    description: `Patient allergic to: ${patient.allergies}`,
                    recommendation: "Verify all medications before administration"
                })
                riskScore += 10
                recommendations.push(`⚠️ Avoid ${patient.allergies} and related medications`)
            }

            // Blood pressure check
            if (patient.vitals?.bloodPressure) {
                const bp = patient.vitals.bloodPressure.split("/")
                const systolic = parseInt(bp[0])
                const diastolic = parseInt(bp[1])

                if (systolic >= 180 || diastolic >= 120) {
                    factors.push({
                        factor: "Hypertensive Crisis",
                        severity: "critical",
                        description: `BP: ${patient.vitals.bloodPressure} - Immediate attention required`,
                        recommendation: "Emergency intervention needed"
                    })
                    riskScore += 40
                } else if (systolic >= 140 || diastolic >= 90) {
                    factors.push({
                        factor: "Elevated Blood Pressure",
                        severity: "medium",
                        description: `BP: ${patient.vitals.bloodPressure}`,
                        recommendation: "Monitor and consider medication adjustment"
                    })
                    riskScore += 15
                }
            }

            // Calculate overall risk
            let overallRisk: "low" | "medium" | "high" | "critical" = "low"
            if (riskScore >= 70) overallRisk = "critical"
            else if (riskScore >= 50) overallRisk = "high"
            else if (riskScore >= 25) overallRisk = "medium"

            // Add general recommendations
            if (factors.length === 0) {
                recommendations.push("Continue regular health checkups")
                recommendations.push("Maintain healthy lifestyle")
            }

            const result: RiskAssessment = {
                overallRisk,
                riskScore: Math.min(riskScore, 100),
                factors,
                recommendations
            }

            setAssessment(result)
            setLoading(false)

            if (onAssessmentComplete) {
                onAssessmentComplete(result)
            }
        }, 1500)
    }

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case "critical": return "bg-red-500 text-white"
            case "high": return "bg-orange-500 text-white"
            case "medium": return "bg-yellow-500 text-white"
            case "low": return "bg-green-500 text-white"
            default: return "bg-gray-500 text-white"
        }
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "critical": return "border-red-300 bg-red-50 text-red-800"
            case "high": return "border-orange-300 bg-orange-50 text-orange-800"
            case "medium": return "border-yellow-300 bg-yellow-50 text-yellow-800"
            case "low": return "border-green-300 bg-green-50 text-green-800"
            default: return "border-gray-300 bg-gray-50"
        }
    }

    return (
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-200 p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-rose-100 rounded-lg">
                        <Shield className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-rose-900">AI Patient Risk Assessment</h3>
                        <p className="text-sm text-rose-600">Comprehensive health risk analysis</p>
                    </div>
                </div>
                <button
                    onClick={analyzeRisk}
                    disabled={loading}
                    className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Brain className="w-4 h-4" />
                            Analyze Risk
                        </>
                    )}
                </button>
            </div>

            {assessment && (
                <div className="space-y-4">
                    {/* Overall Risk Score */}
                    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${getRiskColor(assessment.overallRisk)}`}>
                            <span className="text-2xl font-bold">{assessment.riskScore}</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Overall Risk Level</p>
                            <p className={`text-xl font-bold uppercase ${assessment.overallRisk === "critical" ? "text-red-600" :
                                    assessment.overallRisk === "high" ? "text-orange-600" :
                                        assessment.overallRisk === "medium" ? "text-yellow-600" : "text-green-600"
                                }`}>
                                {assessment.overallRisk}
                            </p>
                            <p className="text-sm text-gray-500">{assessment.factors.length} risk factor(s) identified</p>
                        </div>
                    </div>

                    {/* Risk Factors */}
                    {assessment.factors.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="font-medium text-gray-700">Risk Factors:</h4>
                            {assessment.factors.map((factor, i) => (
                                <div key={i} className={`p-3 rounded-lg border ${getSeverityColor(factor.severity)}`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium">{factor.factor}</span>
                                        <span className="text-xs px-2 py-1 bg-white/50 rounded uppercase font-bold">
                                            {factor.severity}
                                        </span>
                                    </div>
                                    <p className="text-sm">{factor.description}</p>
                                    <p className="text-sm mt-1 font-medium">💡 {factor.recommendation}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Recommendations */}
                    {assessment.recommendations.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-blue-800 mb-2">AI Recommendations:</h4>
                            <ul className="space-y-1">
                                {assessment.recommendations.map((rec, i) => (
                                    <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                                        <span>•</span>
                                        <span>{rec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
