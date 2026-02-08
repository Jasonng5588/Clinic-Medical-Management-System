"use client"

import { useState } from "react"
import { Brain, Loader2, AlertTriangle, Lightbulb, Pill, Stethoscope } from "lucide-react"

interface DiagnosisSuggestion {
    condition: string
    confidence: number
    description: string
    recommendedTests: string[]
    suggestedMedications: string[]
}

// AI diagnosis knowledge base
const symptomDiagnosisMap: Record<string, DiagnosisSuggestion[]> = {
    "fever": [
        {
            condition: "Viral Infection",
            confidence: 75,
            description: "Common viral infection causing elevated body temperature",
            recommendedTests: ["Complete Blood Count (CBC)", "C-Reactive Protein (CRP)"],
            suggestedMedications: ["Paracetamol 500mg", "Rest and hydration"]
        },
        {
            condition: "Bacterial Infection",
            confidence: 60,
            description: "Bacterial infection requiring antibiotic treatment",
            recommendedTests: ["Blood Culture", "Urinalysis", "CBC"],
            suggestedMedications: ["Amoxicillin 500mg", "Paracetamol 500mg"]
        }
    ],
    "cough": [
        {
            condition: "Upper Respiratory Tract Infection (URTI)",
            confidence: 80,
            description: "Common cold or flu affecting upper airways",
            recommendedTests: ["Chest X-Ray (if persistent)", "Throat Swab"],
            suggestedMedications: ["Cetirizine 10mg", "Cough syrup", "Vitamin C"]
        },
        {
            condition: "Bronchitis",
            confidence: 55,
            description: "Inflammation of bronchial tubes",
            recommendedTests: ["Chest X-Ray", "Sputum Culture"],
            suggestedMedications: ["Salbutamol Inhaler", "Azithromycin 500mg"]
        }
    ],
    "headache": [
        {
            condition: "Tension Headache",
            confidence: 70,
            description: "Stress-related headache often bilateral",
            recommendedTests: ["Blood pressure check", "Eye examination (if recurring)"],
            suggestedMedications: ["Paracetamol 500mg", "Ibuprofen 400mg"]
        },
        {
            condition: "Migraine",
            confidence: 50,
            description: "Neurological condition causing severe headaches",
            recommendedTests: ["Neurological examination", "CT/MRI (if severe)"],
            suggestedMedications: ["Sumatriptan", "Metoclopramide"]
        }
    ],
    "chest pain": [
        {
            condition: "Musculoskeletal Pain",
            confidence: 45,
            description: "Pain from chest wall muscles or ribs",
            recommendedTests: ["ECG", "Chest X-Ray"],
            suggestedMedications: ["Ibuprofen 400mg", "Muscle relaxant"]
        },
        {
            condition: "Angina",
            confidence: 35,
            description: "Reduced blood flow to heart - URGENT EVALUATION NEEDED",
            recommendedTests: ["ECG", "Cardiac enzymes (Troponin)", "Stress test"],
            suggestedMedications: ["Aspirin (if cardiac)", "GTN sublingual"]
        }
    ],
    "stomach pain": [
        {
            condition: "Gastritis",
            confidence: 70,
            description: "Inflammation of stomach lining",
            recommendedTests: ["H. pylori test", "Endoscopy (if chronic)"],
            suggestedMedications: ["Omeprazole 20mg", "Antacid"]
        },
        {
            condition: "Gastroenteritis",
            confidence: 65,
            description: "Viral or bacterial infection of GI tract",
            recommendedTests: ["Stool test", "Electrolyte panel"],
            suggestedMedications: ["Oral Rehydration Salts", "Loperamide (if diarrhea)"]
        }
    ],
    "fatigue": [
        {
            condition: "Anemia",
            confidence: 55,
            description: "Low red blood cell count causing tiredness",
            recommendedTests: ["CBC", "Iron studies", "Vitamin B12 level"],
            suggestedMedications: ["Iron supplement", "Vitamin B12"]
        },
        {
            condition: "Thyroid Dysfunction",
            confidence: 45,
            description: "Underactive or overactive thyroid gland",
            recommendedTests: ["TSH", "T3/T4 levels"],
            suggestedMedications: ["Based on thyroid function results"]
        }
    ],
    "joint pain": [
        {
            condition: "Osteoarthritis",
            confidence: 60,
            description: "Degenerative joint disease",
            recommendedTests: ["X-Ray of affected joint", "ESR/CRP"],
            suggestedMedications: ["Paracetamol 500mg", "Glucosamine", "Physiotherapy"]
        },
        {
            condition: "Gout",
            confidence: 45,
            description: "Uric acid crystal deposit in joints",
            recommendedTests: ["Serum uric acid", "Joint aspiration"],
            suggestedMedications: ["Colchicine", "Allopurinol (preventive)"]
        }
    ],
    "skin rash": [
        {
            condition: "Allergic Reaction",
            confidence: 65,
            description: "Immune response to allergen",
            recommendedTests: ["Allergy panel", "IgE levels"],
            suggestedMedications: ["Cetirizine 10mg", "Hydrocortisone cream"]
        },
        {
            condition: "Eczema",
            confidence: 50,
            description: "Chronic inflammatory skin condition",
            recommendedTests: ["Skin patch test", "IgE levels"],
            suggestedMedications: ["Emollients", "Topical steroids"]
        }
    ],
    "dizziness": [
        {
            condition: "Benign Positional Vertigo",
            confidence: 55,
            description: "Inner ear problem causing spinning sensation",
            recommendedTests: ["Dix-Hallpike test", "Audiometry"],
            suggestedMedications: ["Betahistine", "Meclizine"]
        },
        {
            condition: "Hypotension",
            confidence: 45,
            description: "Low blood pressure",
            recommendedTests: ["Blood pressure monitoring", "ECG"],
            suggestedMedications: ["Increase salt/water intake", "Review medications"]
        }
    ],
    "shortness of breath": [
        {
            condition: "Asthma",
            confidence: 60,
            description: "Chronic airway inflammation",
            recommendedTests: ["Peak flow", "Spirometry", "Chest X-Ray"],
            suggestedMedications: ["Salbutamol Inhaler", "Inhaled corticosteroid"]
        },
        {
            condition: "Anxiety",
            confidence: 40,
            description: "Anxiety-related hyperventilation",
            recommendedTests: ["Rule out cardiac/pulmonary causes first"],
            suggestedMedications: ["Breathing exercises", "Anxiolytic if needed"]
        }
    ]
}

interface AIDiagnosisProps {
    symptoms: string
    onSelectDiagnosis?: (diagnosis: string) => void
    onSelectMedication?: (medication: string) => void
}

export function AIDiagnosisSuggestion({ symptoms, onSelectDiagnosis, onSelectMedication }: AIDiagnosisProps) {
    const [suggestions, setSuggestions] = useState<DiagnosisSuggestion[]>([])
    const [loading, setLoading] = useState(false)
    const [analyzed, setAnalyzed] = useState(false)

    const analyzeSymptoms = () => {
        setLoading(true)

        // Simulate AI processing delay
        setTimeout(() => {
            const lowerSymptoms = symptoms.toLowerCase()
            const matchedSuggestions: DiagnosisSuggestion[] = []

            // Check each symptom category
            Object.entries(symptomDiagnosisMap).forEach(([symptom, diagnoses]) => {
                if (lowerSymptoms.includes(symptom)) {
                    diagnoses.forEach(d => {
                        // Avoid duplicates
                        if (!matchedSuggestions.find(s => s.condition === d.condition)) {
                            matchedSuggestions.push(d)
                        }
                    })
                }
            })

            // Sort by confidence
            matchedSuggestions.sort((a, b) => b.confidence - a.confidence)

            setSuggestions(matchedSuggestions.slice(0, 5))
            setLoading(false)
            setAnalyzed(true)
        }, 1500)
    }

    if (!symptoms || symptoms.length < 3) {
        return null
    }

    return (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-xl border border-purple-200 dark:border-purple-800 p-4">
            <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Brain className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="font-semibold text-purple-900 dark:text-purple-100">AI Diagnosis Assistant</h3>
            </div>

            {!analyzed ? (
                <button
                    type="button"
                    onClick={analyzeSymptoms}
                    disabled={loading}
                    className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analyzing symptoms...
                        </>
                    ) : (
                        <>
                            <Lightbulb className="w-4 h-4" />
                            Get AI Suggestions
                        </>
                    )}
                </button>
            ) : suggestions.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                    <AlertTriangle className="w-5 h-5 mx-auto mb-2 text-yellow-500" />
                    No specific suggestions found. Please provide more detailed symptoms.
                </div>
            ) : (
                <div className="space-y-3">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        AI suggestions are for reference only. Clinical judgment is essential.
                    </p>

                    {suggestions.map((suggestion, idx) => (
                        <div
                            key={idx}
                            className="bg-white dark:bg-gray-900 rounded-lg p-3 border shadow-sm"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Stethoscope className="w-4 h-4 text-blue-600" />
                                    <span className="font-medium">{suggestion.condition}</span>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${suggestion.confidence >= 70 ? 'bg-green-100 text-green-700' :
                                        suggestion.confidence >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                    }`}>
                                    {suggestion.confidence}% match
                                </span>
                            </div>

                            <p className="text-xs text-muted-foreground mb-2">{suggestion.description}</p>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <p className="font-medium text-blue-600 mb-1">Recommended Tests:</p>
                                    <ul className="list-disc list-inside text-muted-foreground">
                                        {suggestion.recommendedTests.slice(0, 2).map((test, i) => (
                                            <li key={i}>{test}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <p className="font-medium text-green-600 mb-1">Suggested Medications:</p>
                                    <ul className="space-y-1">
                                        {suggestion.suggestedMedications.slice(0, 2).map((med, i) => (
                                            <li key={i}>
                                                <button
                                                    type="button"
                                                    onClick={() => onSelectMedication?.(med)}
                                                    className="text-left hover:text-green-600 hover:underline flex items-center gap-1"
                                                >
                                                    <Pill className="w-3 h-3" />
                                                    {med}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {onSelectDiagnosis && (
                                <button
                                    type="button"
                                    onClick={() => onSelectDiagnosis(suggestion.condition)}
                                    className="mt-2 w-full py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                                >
                                    Use this diagnosis
                                </button>
                            )}
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={() => { setAnalyzed(false); setSuggestions([]) }}
                        className="text-xs text-purple-600 hover:underline"
                    >
                        Re-analyze symptoms
                    </button>
                </div>
            )}
        </div>
    )
}

export default AIDiagnosisSuggestion
