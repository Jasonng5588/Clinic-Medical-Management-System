"use client"

import { useState } from "react"
import { Brain, AlertTriangle, CheckCircle, Pill, Activity, Zap } from "lucide-react"

interface DrugInteraction {
    drug1: string
    drug2: string
    severity: "mild" | "moderate" | "severe"
    description: string
    recommendation: string
}

// Drug interaction database
const drugInteractions: Record<string, DrugInteraction[]> = {
    "warfarin": [
        { drug1: "Warfarin", drug2: "Aspirin", severity: "severe", description: "Increased bleeding risk", recommendation: "Avoid combination or monitor closely" },
        { drug1: "Warfarin", drug2: "Ibuprofen", severity: "severe", description: "Increased bleeding risk and reduced anticoagulant effect", recommendation: "Use alternative pain relief" },
        { drug1: "Warfarin", drug2: "Amoxicillin", severity: "moderate", description: "May increase anticoagulant effect", recommendation: "Monitor INR closely" },
    ],
    "metformin": [
        { drug1: "Metformin", drug2: "Alcohol", severity: "severe", description: "Risk of lactic acidosis", recommendation: "Limit alcohol consumption" },
        { drug1: "Metformin", drug2: "Contrast Dye", severity: "moderate", description: "Risk of kidney damage", recommendation: "Hold metformin before/after contrast imaging" },
    ],
    "aspirin": [
        { drug1: "Aspirin", drug2: "Ibuprofen", severity: "moderate", description: "Reduced cardioprotective effect", recommendation: "Take aspirin 30min before ibuprofen" },
        { drug1: "Aspirin", drug2: "Warfarin", severity: "severe", description: "Increased bleeding risk", recommendation: "Avoid combination" },
    ],
    "omeprazole": [
        { drug1: "Omeprazole", drug2: "Clopidogrel", severity: "moderate", description: "Reduced effectiveness of clopidogrel", recommendation: "Consider alternative PPI or timing separation" },
        { drug1: "Omeprazole", drug2: "Methotrexate", severity: "moderate", description: "Increased methotrexate levels", recommendation: "Monitor for toxicity" },
    ],
    "amlodipine": [
        { drug1: "Amlodipine", drug2: "Simvastatin", severity: "moderate", description: "Increased statin levels", recommendation: "Limit simvastatin to 20mg daily" },
    ],
}

interface AIDrugInteractionCheckerProps {
    medications: string[]
    patientAllergies?: string[]
    onInteractionFound?: (interactions: DrugInteraction[]) => void
}

export function AIDrugInteractionChecker({
    medications,
    patientAllergies = [],
    onInteractionFound
}: AIDrugInteractionCheckerProps) {
    const [checking, setChecking] = useState(false)
    const [interactions, setInteractions] = useState<DrugInteraction[]>([])
    const [allergyWarnings, setAllergyWarnings] = useState<string[]>([])
    const [checked, setChecked] = useState(false)

    const checkInteractions = () => {
        setChecking(true)

        // Simulate AI processing
        setTimeout(() => {
            const foundInteractions: DrugInteraction[] = []
            const foundAllergyWarnings: string[] = []

            // Check drug-drug interactions
            medications.forEach(med1 => {
                const medLower = med1.toLowerCase()
                Object.keys(drugInteractions).forEach(key => {
                    if (medLower.includes(key)) {
                        drugInteractions[key].forEach(interaction => {
                            // Check if second drug is in the list
                            medications.forEach(med2 => {
                                if (med1 !== med2 && med2.toLowerCase().includes(interaction.drug2.toLowerCase())) {
                                    if (!foundInteractions.find(i =>
                                        (i.drug1 === interaction.drug1 && i.drug2 === interaction.drug2) ||
                                        (i.drug1 === interaction.drug2 && i.drug2 === interaction.drug1)
                                    )) {
                                        foundInteractions.push(interaction)
                                    }
                                }
                            })
                        })
                    }
                })
            })

            // Check allergies
            patientAllergies.forEach(allergy => {
                medications.forEach(med => {
                    if (med.toLowerCase().includes(allergy.toLowerCase()) ||
                        allergy.toLowerCase().includes(med.toLowerCase())) {
                        foundAllergyWarnings.push(`⚠️ Patient allergic to ${allergy} - ${med} may cause reaction!`)
                    }
                })
                // Common allergy checks
                if (allergy.toLowerCase().includes("penicillin")) {
                    medications.forEach(med => {
                        if (med.toLowerCase().includes("amoxicillin") ||
                            med.toLowerCase().includes("ampicillin")) {
                            foundAllergyWarnings.push(`🚨 CRITICAL: Patient allergic to Penicillin - ${med} is contraindicated!`)
                        }
                    })
                }
            })

            setInteractions(foundInteractions)
            setAllergyWarnings(foundAllergyWarnings)
            setChecked(true)
            setChecking(false)

            if (onInteractionFound && foundInteractions.length > 0) {
                onInteractionFound(foundInteractions)
            }
        }, 1000)
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "severe": return "bg-red-100 border-red-300 text-red-800"
            case "moderate": return "bg-orange-100 border-orange-300 text-orange-800"
            case "mild": return "bg-yellow-100 border-yellow-300 text-yellow-800"
            default: return "bg-gray-100"
        }
    }

    if (medications.length === 0) {
        return null
    }

    return (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Pill className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-purple-900">AI Drug Interaction Checker</h3>
                        <p className="text-sm text-purple-600">Analyzing {medications.length} medications</p>
                    </div>
                </div>
                <button
                    onClick={checkInteractions}
                    disabled={checking}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                >
                    {checking ? (
                        <>
                            <Activity className="w-4 h-4 animate-pulse" />
                            Checking...
                        </>
                    ) : (
                        <>
                            <Zap className="w-4 h-4" />
                            Check Interactions
                        </>
                    )}
                </button>
            </div>

            {checked && (
                <div className="space-y-3">
                    {/* Allergy Warnings */}
                    {allergyWarnings.length > 0 && (
                        <div className="bg-red-50 border border-red-300 rounded-lg p-4">
                            <h4 className="font-semibold text-red-800 flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-5 h-5" />
                                Allergy Alerts
                            </h4>
                            {allergyWarnings.map((warning, i) => (
                                <p key={i} className="text-red-700 text-sm">{warning}</p>
                            ))}
                        </div>
                    )}

                    {/* Drug Interactions */}
                    {interactions.length > 0 ? (
                        <div className="space-y-2">
                            <h4 className="font-medium text-gray-700">Found {interactions.length} interaction(s):</h4>
                            {interactions.map((interaction, i) => (
                                <div key={i} className={`p-3 rounded-lg border ${getSeverityColor(interaction.severity)}`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium">
                                            {interaction.drug1} + {interaction.drug2}
                                        </span>
                                        <span className="text-xs px-2 py-1 bg-white/50 rounded uppercase font-bold">
                                            {interaction.severity}
                                        </span>
                                    </div>
                                    <p className="text-sm">{interaction.description}</p>
                                    <p className="text-sm mt-1 font-medium">💡 {interaction.recommendation}</p>
                                </div>
                            ))}
                        </div>
                    ) : allergyWarnings.length === 0 ? (
                        <div className="bg-green-50 border border-green-300 rounded-lg p-4 flex items-center gap-3">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                            <div>
                                <p className="font-medium text-green-800">No Interactions Found</p>
                                <p className="text-sm text-green-600">All medications appear to be safe together</p>
                            </div>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    )
}
