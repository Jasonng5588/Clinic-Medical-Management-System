"use client"

import { XCircle } from "lucide-react"

interface EmptyStateProps {
    icon?: React.ReactNode
    title: string
    description?: string
    action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                {icon || <XCircle className="w-8 h-8 text-muted-foreground" />}
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            {description && (
                <p className="text-muted-foreground text-center max-w-md mb-4">
                    {description}
                </p>
            )}
            {action}
        </div>
    )
}
