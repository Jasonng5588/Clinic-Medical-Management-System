import jsPDF from "jspdf"
import { Prescription, PrescriptionItem } from "@/types"
import { formatDate } from "@/lib/utils"

export async function generatePrescriptionPDF(
    prescription: Prescription & { items?: PrescriptionItem[] },
    clinicInfo: {
        name: string
        address: string
        phone: string
    }
) {
    const doc = new jsPDF()

    // Header
    doc.setFontSize(18)
    doc.setTextColor(20, 184, 166)
    doc.text(clinicInfo.name, 105, 20, { align: "center" })

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(clinicInfo.address, 105, 28, { align: "center" })
    doc.text(clinicInfo.phone, 105, 34, { align: "center" })

    // Title
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text("PRESCRIPTION", 105, 50, { align: "center" })

    // Prescription details
    doc.setFontSize(10)
    doc.text(`Prescription #: ${prescription.prescription_number}`, 20, 60)
    doc.text(`Date: ${formatDate(prescription.prescription_date)}`, 20, 66)

    // Patient info
    doc.setFontSize(12)
    doc.setFont(undefined, "bold")
    doc.text("Patient:", 20, 78)
    doc.setFont(undefined, "normal")
    doc.setFontSize(10)
    if (prescription.patient) {
        doc.text(
            `${prescription.patient.first_name} ${prescription.patient.last_name}`,
            20,
            84
        )
        doc.text(`Age: ${prescription.patient.age} years`, 20, 90)
    }

    // Doctor info
    doc.setFontSize(12)
    doc.setFont(undefined, "bold")
    doc.text("Prescribed by:", 120, 78)
    doc.setFont(undefined, "normal")
    doc.setFontSize(10)
    if (prescription.doctor) {
        doc.text(
            `Dr. ${prescription.doctor.first_name} ${prescription.doctor.last_name}`,
            120,
            84
        )
        if (prescription.doctor.specialization) {
            doc.text(prescription.doctor.specialization, 120, 90)
        }
        if (prescription.doctor.license_number) {
            doc.text(`License: ${prescription.doctor.license_number}`, 120, 96)
        }
    }

    // Rx symbol
    doc.setFontSize(24)
    doc.text("Rx", 20, 110)

    // Medications
    let yPos = 120
    doc.setFontSize(11)

    prescription.items?.forEach((item, index) => {
        // Medicine name
        doc.setFont(undefined, "bold")
        doc.text(
            `${index + 1}. ${item.medicine?.name || "Medicine"}`,
            25,
            yPos
        )

        yPos += 6
        doc.setFont(undefined, "normal")
        doc.setFontSize(10)

        // Details
        doc.text(`   Dosage: ${item.dosage}`, 25, yPos)
        yPos += 5
        doc.text(`   Frequency: ${item.frequency}`, 25, yPos)
        yPos += 5
        doc.text(`   Duration: ${item.duration}`, 25, yPos)
        yPos += 5
        doc.text(`   Quantity: ${item.quantity} ${item.medicine?.unit || "units"}`, 25, yPos)

        if (item.instructions) {
            yPos += 5
            doc.text(`   Instructions: ${item.instructions}`, 25, yPos)
        }

        yPos += 10
    })

    // Notes
    if (prescription.notes) {
        doc.setFont(undefined, "bold")
        doc.text("Additional Notes:", 20, yPos)
        yPos += 6
        doc.setFont(undefined, "normal")
        const splitNotes = doc.splitTextToSize(prescription.notes, 170)
        doc.text(splitNotes, 20, yPos)
    }

    // Signature line
    doc.setFontSize(10)
    doc.text("_________________________", 120, 260)
    doc.text("Doctor's Signature", 120, 268)

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text("This is a computer-generated prescription.", 105, 285, {
        align: "center",
    })

    // Save
    doc.save(`${prescription.prescription_number}.pdf`)
}
