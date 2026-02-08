import { z } from "zod"

export const patientSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z.string().min(10, "Phone number is required"),
    gender: z.enum(["male", "female", "other"]).optional(),
    date_of_birth: z.string().min(1, "Date of birth is required"),
    blood_group: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().default("Malaysia"),
    emergency_contact_name: z.string().optional(),
    emergency_contact_phone: z.string().optional(),
    emergency_contact_relation: z.string().optional(),
    medical_history: z.string().optional(),
    allergies: z.string().optional(),
    chronic_conditions: z.string().optional(),
})

export type PatientFormData = z.infer<typeof patientSchema>
