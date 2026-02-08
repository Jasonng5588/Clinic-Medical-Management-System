import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Invoice, InvoiceItem } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"

export async function generateInvoicePDF(
    invoice: Invoice & { items?: InvoiceItem[] },
    clinicInfo: {
        name: string
        address: string
        phone: string
        email: string
    }
) {
    const doc = new jsPDF()

    // Header
    doc.setFontSize(20)
    doc.setTextColor(20, 184, 166) // Primary teal color
    doc.text(clinicInfo.name, 20, 20)

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(clinicInfo.address, 20, 28)
    doc.text(`Phone: ${clinicInfo.phone}`, 20, 34)
    doc.text(`Email: ${clinicInfo.email}`, 20, 40)

    // Invoice title
    doc.setFontSize(24)
    doc.setTextColor(0, 0, 0)
    doc.text("INVOICE", 150, 20)

    // Invoice details
    doc.setFontSize(10)
    doc.text(`Invoice #: ${invoice.invoice_number}`, 150, 28)
    doc.text(`Date: ${formatDate(invoice.invoice_date)}`, 150, 34)
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 150, 40)

    // Patient details
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text("Bill To:", 20, 55)
    doc.setFontSize(10)
    if (invoice.patient) {
        doc.text(
            `${invoice.patient.first_name} ${invoice.patient.last_name}`,
            20,
            62
        )
        if (invoice.patient.address) {
            doc.text(invoice.patient.address, 20, 68)
        }
        if (invoice.patient.phone) {
            doc.text(`Phone: ${invoice.patient.phone}`, 20, 74)
        }
    }

    // Items table
    const tableData = (invoice.items || []).map((item) => [
        item.description,
        item.quantity,
        formatCurrency(item.unit_price),
        formatCurrency(item.total_price),
    ])

    autoTable(doc, {
        startY: 90,
        head: [["Description", "Qty", "Unit Price", "Total"]],
        body: tableData,
        theme: "grid",
        headStyles: {
            fillColor: [20, 184, 166],
            textColor: [255, 255, 255],
        },
        styles: {
            fontSize: 10,
        },
    })

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY || 90
    const rightX = 150

    doc.setFontSize(10)
    doc.text("Subtotal:", rightX, finalY + 10)
    doc.text(formatCurrency(invoice.subtotal), rightX + 40, finalY + 10, {
        align: "right",
    })

    if (invoice.discount_amount > 0) {
        doc.text(
            `Discount (${invoice.discount_percentage}%):`,
            rightX,
            finalY + 16
        )
        doc.text(
            `- ${formatCurrency(invoice.discount_amount)}`,
            rightX + 40,
            finalY + 16,
            { align: "right" }
        )
    }

    if (invoice.tax_amount > 0) {
        doc.text(`Tax (${invoice.tax_percentage}%):`, rightX, finalY + 22)
        doc.text(formatCurrency(invoice.tax_amount), rightX + 40, finalY + 22, {
            align: "right",
        })
    }

    // Total
    doc.setFontSize(12)
    doc.setFont(undefined, "bold")
    doc.text("Total:", rightX, finalY + 30)
    doc.text(formatCurrency(invoice.total_amount), rightX + 40, finalY + 30, {
        align: "right",
    })

    // Payment info
    if (invoice.paid_amount > 0) {
        doc.setFont(undefined, "normal")
        doc.setFontSize(10)
        doc.text("Paid:", rightX, finalY + 36)
        doc.text(formatCurrency(invoice.paid_amount), rightX + 40, finalY + 36, {
            align: "right",
        })

        doc.setFont(undefined, "bold")
        doc.text("Balance:", rightX, finalY + 42)
        doc.text(formatCurrency(invoice.balance), rightX + 40, finalY + 42, {
            align: "right",
        })
    }

    // Footer
    doc.setFont(undefined, "normal")
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text("Thank you for your trust in our services!", 105, 280, {
        align: "center",
    })

    // Save
    doc.save(`${invoice.invoice_number}.pdf`)
}
