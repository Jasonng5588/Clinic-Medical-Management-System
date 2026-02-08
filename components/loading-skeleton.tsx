export function LoadingSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-muted rounded-2xl" />
                ))}
            </div>
            <div className="h-64 bg-muted rounded-2xl" />
        </div>
    )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
            ))}
        </div>
    )
}

export function CardSkeleton() {
    return (
        <div className="bg-card rounded-2xl p-6 border animate-pulse">
            <div className="h-6 bg-muted rounded w-1/3 mb-4" />
            <div className="h-4 bg-muted rounded w-1/2 mb-2" />
            <div className="h-4 bg-muted rounded w-2/3" />
        </div>
    )
}
