import { z } from "zod"

export const medicineSchema = z.object({
    name: z.string().min(1, "Medicine name is required"),
    generic_name: z.string().optional(),
    brand_name: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    form: z.string().min(1, "Form is required"),
    strength: z.string().min(1, "Strength is required"),
    unit: z.string().min(1, "Unit is required"),
    manufacturer: z.string().optional(),
    description: z.string().optional(),
    price_per_unit: z.number().min(0, "Price must be positive"),
    current_stock: z.number().int().min(0, "Stock must be non-negative"),
    reorder_level: z.number().int().min(1, "Reorder level must be at least 1"),
})

export type MedicineFormData = z.infer<typeof medicineSchema>
