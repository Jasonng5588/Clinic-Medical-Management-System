import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = "MYR"): string {
    return new Intl.NumberFormat("en-MY", {
        style: "currency",
        currency: currency,
    }).format(amount)
}

export function formatDate(date: string | Date, formatStr: string = "dd MMM yyyy"): string {
    const dateObj = typeof date === "string" ? parseISO(date) : date
    return format(dateObj, formatStr)
}

export function formatDateTime(date: string | Date): string {
    const dateObj = typeof date === "string" ? parseISO(date) : date
    return format(dateObj, "dd MMM yyyy, hh:mm a")
}

export function formatTime(time: string): string {
    const [hours, minutes] = time.split(":")
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
}

export function calculateAge(dateOfBirth: string | Date): number {
    const today = new Date()
    const birthDate = typeof dateOfBirth === "string" ? parseISO(dateOfBirth) : dateOfBirth
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
    }

    return age
}

export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null
            func(...args)
        }

        if (timeout) {
            clearTimeout(timeout)
        }
        timeout = setTimeout(later, wait)
    }
}

export function generateUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function truncate(str: string, length: number): string {
    if (str.length <= length) return str
    return str.slice(0, length) + "..."
}

export function capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export function getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function phoneNumber(phone: string): string {
    // Format Malaysian phone numbers
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.startsWith("60")) {
        return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`
    }
    return phone
}

export function validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
}

export function validatePhone(phone: string): boolean {
    const re = /^\+?[\d\s-()]+$/
    return re.test(phone) && phone.replace(/\D/g, "").length >= 10
}

export function getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
        // Appointment statuses
        scheduled: "bg-blue-100 text-blue-700",
        confirmed: "bg-green-100 text-green-700",
        in_progress: "bg-yellow-100 text-yellow-700",
        completed: "bg-gray-100 text-gray-700",
        cancelled: "bg-red-100 text-red-700",
        no_show: "bg-orange-100 text-orange-700",

        // Payment statuses
        pending: "bg-yellow-100 text-yellow-700",
        paid: "bg-green-100 text-green-700",
        failed: "bg-red-100 text-red-700",
        refunded: "bg-purple-100 text-purple-700",

        // Invoice statuses
        draft: "bg-gray-100 text-gray-700",
        sent: "bg-blue-100 text-blue-700",
        overdue: "bg-red-100 text-red-700",

        // Queue statuses
        waiting: "bg-yellow-100 text-yellow-700",
        called: "bg-blue-100 text-blue-700",
        serving: "bg-green-100 text-green-700",
    }

    return statusColors[status] || "bg-gray-100 text-gray-700"
}

export function downloadAsCSV(data: any[], filename: string): void {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvContent = [
        headers.join(","),
        ...data.map(row =>
            headers.map(header => {
                const cell = row[header] ?? ""
                // Escape commas and quotes
                return typeof cell === "string" && (cell.includes(",") || cell.includes('"'))
                    ? `"${cell.replace(/"/g, '""')}"`
                    : cell
            }).join(",")
        ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
