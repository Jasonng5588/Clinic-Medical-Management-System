import { z } from "zod"

export const consultationSchema = z.object({
    patient_id: z.string().uuid("Invalid patient"),
    doctor_id: z.string().uuid("Invalid doctor"),
    appointment_id: z.string().uuid().optional(),
    chief_complaint: z.string().min(1, "Chief complaint is required"),
    symptoms: z.string().optional(),
    vital_signs: z.object({
        blood_pressure: z.string().optional(),
        heart_rate: z.string().optional(),
        temperature: z.string().optional(),
        weight: z.string().optional(),
        height: z.string().optional(),
        respiratory_rate: z.string().optional(),
        oxygen_saturation: z.string().optional(),
    }).optional(),
    diagnosis: z.string().min(1, "Diagnosis is required"),
    treatment_plan: z.string().optional(),
    notes: z.string().optional(),
    follow_up_date: z.string().optional(),
})

export type ConsultationFormData = z.infer<typeof consultationSchema>
