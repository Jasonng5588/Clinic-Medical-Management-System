import { z } from "zod"

export const invoiceSchema = z.object({
    patient_id: z.string().uuid("Invalid patient"),
    consultation_id: z.string().uuid().optional(),
    invoice_date: z.string().min(1, "Invoice date is required"),
    due_date: z.string().optional(),
    discount_percentage: z.number().min(0).max(100).default(0),
    tax_percentage: z.number().min(0).max(100).default(0),
    notes: z.string().optional(),
})

export const invoiceItemSchema = z.object({
    item_type: z.string().min(1, "Item type is required"),
    description: z.string().min(1, "Description is required"),
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
    unit_price: z.number().min(0, "Price must be positive"),
})

export type InvoiceFormData = z.infer<typeof invoiceSchema>
export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>
