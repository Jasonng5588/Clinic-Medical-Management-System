"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/auth-store"
import { FileText, Plus, Edit, Trash2, Copy, Loader2, X, Search } from "lucide-react"
import Link from "next/link"

interface Template {
    id: string
    name: string
    description: string
    content: {
        diagnosis?: string
        symptoms?: string
        assessment?: string
        plan?: string
        prescriptions?: any[]
    }
    category: string
    created_at: string
}

const defaultTemplates: Template[] = [
    {
        id: "1",
        name: "Common Cold / Flu",
        description: "Standard template for viral upper respiratory infections",
        category: "Respiratory",
        content: {
            diagnosis: "Acute viral upper respiratory infection (Common Cold)",
            symptoms: "Runny nose, sore throat, mild fever, body aches, fatigue",
            assessment: "Patient presents with typical symptoms of viral URTI. No signs of bacterial infection.",
            plan: "Rest and hydration. Symptomatic treatment with paracetamol for fever. Follow up if symptoms worsen or persist beyond 7 days.",
        },
        created_at: new Date().toISOString(),
    },
    {
        id: "2",
        name: "Gastritis",
        description: "Template for stomach inflammation and acid reflux",
        category: "Gastric",
        content: {
            diagnosis: "Acute Gastritis",
            symptoms: "Epigastric pain, nausea, bloating, loss of appetite",
            assessment: "Patient reports gastric discomfort worsened by spicy foods and stress. No alarm symptoms.",
            plan: "PPI therapy for 2 weeks. Dietary modifications - avoid spicy, acidic foods. Stress management. Review in 2 weeks.",
        },
        created_at: new Date().toISOString(),
    },
    {
        id: "3",
        name: "Hypertension Follow-up",
        description: "Routine follow-up for blood pressure management",
        category: "Cardiovascular",
        content: {
            diagnosis: "Essential Hypertension - Follow-up",
            symptoms: "Usually asymptomatic. Occasional headaches reported.",
            assessment: "Blood pressure controlled/uncontrolled on current medication. No end-organ damage signs.",
            plan: "Continue current antihypertensive regimen. Lifestyle modifications. Salt restriction. Regular exercise. Follow up in 1 month.",
        },
        created_at: new Date().toISOString(),
    },
    {
        id: "4",
        name: "Diabetes Review",
        description: "Periodic diabetes management review",
        category: "Endocrine",
        content: {
            diagnosis: "Type 2 Diabetes Mellitus - Review",
            symptoms: "Monitor for polyuria, polydipsia, numbness in extremities",
            assessment: "HbA1c and fasting glucose to be checked. Foot examination performed. Eye screening due.",
            plan: "Adjust oral hypoglycemic agents as needed. Dietary counseling. Annual eye and foot screening. Follow up with lab results.",
        },
        created_at: new Date().toISOString(),
    },
    {
        id: "5",
        name: "Skin Allergy / Urticaria",
        description: "Template for allergic skin reactions",
        category: "Dermatology",
        content: {
            diagnosis: "Acute Urticaria (Allergic Skin Reaction)",
            symptoms: "Itchy raised welts, redness, possible facial swelling",
            assessment: "Acute allergic reaction. No respiratory distress. Trigger identified/unknown.",
            plan: "Antihistamine therapy. Avoid known triggers. Cool compresses for relief. Return immediately if difficulty breathing.",
        },
        created_at: new Date().toISOString(),
    },
]

export default function ConsultationTemplatesPage() {
    const { user } = useAuthStore()
    const [templates, setTemplates] = useState<Template[]>(defaultTemplates)
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [showCreateModal, setShowCreateModal] = useState(false)

    const categories = ["all", ...new Set(templates.map(t => t.category))]

    const filteredTemplates = templates.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === "all" || t.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const handleUseTemplate = (template: Template) => {
        // Store template in sessionStorage for use in new consultation
        sessionStorage.setItem("consultationTemplate", JSON.stringify(template.content))
        window.location.href = "/consultations/new"
    }

    const handleDelete = (id: string) => {
        if (confirm("Delete this template?")) {
            setTemplates(templates.filter(t => t.id !== id))
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Consultation Templates</h1>
                    <p className="text-muted-foreground">Pre-defined templates for common consultations</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                    <Plus className="w-4 h-4" />
                    Create Template
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background"
                    />
                </div>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2.5 border rounded-lg bg-background"
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat}>
                            {cat === "all" ? "All Categories" : cat}
                        </option>
                    ))}
                </select>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map(template => (
                    <div key={template.id} className="bg-card rounded-xl border p-5 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <span className="px-2 py-1 rounded-full text-xs bg-accent">{template.category}</span>
                        </div>
                        <h3 className="font-semibold mb-1">{template.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{template.description}</p>

                        <div className="flex items-center justify-between pt-3 border-t">
                            <button
                                onClick={() => handleUseTemplate(template)}
                                className="flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                                <Copy className="w-4 h-4" />
                                Use Template
                            </button>
                            <div className="flex gap-1">
                                <button className="p-1.5 hover:bg-accent rounded">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(template.id)}
                                    className="p-1.5 hover:bg-red-100 text-red-600 rounded"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No templates found</p>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <CreateTemplateModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={(template) => {
                        setTemplates([...templates, { ...template, id: Date.now().toString(), created_at: new Date().toISOString() }])
                        setShowCreateModal(false)
                    }}
                />
            )}
        </div>
    )
}

function CreateTemplateModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (template: any) => void }) {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "General",
        content: {
            diagnosis: "",
            symptoms: "",
            assessment: "",
            plan: "",
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSuccess(formData)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Create Template</h2>
                    <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Template Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border bg-background"
                            >
                                <option>General</option>
                                <option>Respiratory</option>
                                <option>Gastric</option>
                                <option>Cardiovascular</option>
                                <option>Endocrine</option>
                                <option>Dermatology</option>
                                <option>Orthopedic</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg border bg-background"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Default Diagnosis</label>
                        <textarea
                            value={formData.content.diagnosis}
                            onChange={(e) => setFormData({ ...formData, content: { ...formData.content, diagnosis: e.target.value } })}
                            rows={2}
                            className="w-full px-4 py-2.5 rounded-lg border bg-background resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Common Symptoms</label>
                        <textarea
                            value={formData.content.symptoms}
                            onChange={(e) => setFormData({ ...formData, content: { ...formData.content, symptoms: e.target.value } })}
                            rows={2}
                            className="w-full px-4 py-2.5 rounded-lg border bg-background resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Assessment</label>
                        <textarea
                            value={formData.content.assessment}
                            onChange={(e) => setFormData({ ...formData, content: { ...formData.content, assessment: e.target.value } })}
                            rows={2}
                            className="w-full px-4 py-2.5 rounded-lg border bg-background resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Treatment Plan</label>
                        <textarea
                            value={formData.content.plan}
                            onChange={(e) => setFormData({ ...formData, content: { ...formData.content, plan: e.target.value } })}
                            rows={2}
                            className="w-full px-4 py-2.5 rounded-lg border bg-background resize-none"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 border rounded-lg">Cancel</button>
                        <button type="submit" className="px-6 py-2.5 bg-primary text-white rounded-lg">Create Template</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
