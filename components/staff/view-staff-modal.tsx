"use client"

import { X, Mail, Phone, Calendar, Briefcase, FileText } from "lucide-react"

interface Staff {
    id: string; first_name: string; last_name: string; email: string; phone: string | null
    role: string; gender: string | null; date_of_birth: string | null; address: string | null
    qualification: string | null; specialization: string | null; license_number: string | null
    hire_date: string | null; is_active: boolean; department: string | null
    emergency_contact_name: string | null; emergency_contact_phone: string | null
    ic_number: string | null; staff_id: string | null; employment_status: string | null
}

export function ViewStaffModal({ isOpen, staff, onClose }: { isOpen: boolean; staff: Staff; onClose: () => void }) {
    if (!isOpen) return null

    const InfoItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
        <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium">{value}</p></div>
        </div>
    )

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Staff Profile</h2>
                    <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">{staff.first_name?.[0]}{staff.last_name?.[0]}</div>
                        <div>
                            <h3 className="text-xl font-bold">{staff.first_name} {staff.last_name}</h3>
                            <p className="text-muted-foreground capitalize">{staff.role.replace("_", " ")}</p>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${staff.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{staff.is_active ? "Active" : "Inactive"}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <InfoItem icon={Mail} label="Email" value={staff.email} />
                        <InfoItem icon={Phone} label="Phone" value={staff.phone || "-"} />
                        <InfoItem icon={Calendar} label="Date of Birth" value={staff.date_of_birth ? new Date(staff.date_of_birth).toLocaleDateString() : "-"} />
                        <InfoItem icon={FileText} label="IC/Passport" value={staff.ic_number || "-"} />
                        <InfoItem icon={Briefcase} label="Staff ID" value={staff.staff_id || "-"} />
                        <InfoItem icon={Briefcase} label="Department" value={staff.department || "-"} />
                        <InfoItem icon={FileText} label="Qualification" value={staff.qualification || "-"} />
                        <InfoItem icon={FileText} label="Specialization" value={staff.specialization || "-"} />
                        <InfoItem icon={FileText} label="License" value={staff.license_number || "-"} />
                        <InfoItem icon={Calendar} label="Hire Date" value={staff.hire_date ? new Date(staff.hire_date).toLocaleDateString() : "-"} />
                    </div>

                    {staff.address && <div className="p-4 bg-accent rounded-lg"><p className="text-sm font-medium text-muted-foreground mb-1">Address</p><p>{staff.address}</p></div>}
                    {staff.emergency_contact_name && <div className="p-4 bg-accent rounded-lg"><p className="text-sm font-medium text-muted-foreground mb-1">Emergency Contact</p><p>{staff.emergency_contact_name} - {staff.emergency_contact_phone}</p></div>}
                </div>
            </div>
        </div>
    )
}
