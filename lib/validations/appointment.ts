import { z } from "zod"

export const appointmentSchema = z.object({
    patient_id: z.string().uuid("Invalid patient"),
    doctor_id: z.string().uuid("Invalid doctor"),
    service_id: z.string().uuid().optional(),
    appointment_date: z.string().min(1, "Date is required"),
    appointment_time: z.string().min(1, "Time is required"),
    duration_minutes: z.number().min(15).max(480).default(30),
    reason_for_visit: z.string().optional(),
    notes: z.string().optional(),
})

export type AppointmentFormData = z.infer<typeof appointmentSchema>
