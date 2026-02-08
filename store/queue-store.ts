import { create } from "zustand"
import { Queue } from "@/types"

interface QueueState {
    queues: Queue[]
    currentQueue: Queue | null
    setQueues: (queues: Queue[]) => void
    addQueue: (queue: Queue) => void
    updateQueue: (id: string, updates: Partial<Queue>) => void
    removeQueue: (id: string) => void
    setCurrentQueue: (queue: Queue | null) => void
}

export const useQueueStore = create<QueueState>((set) => ({
    queues: [],
    currentQueue: null,
    setQueues: (queues) => set({ queues }),
    addQueue: (queue) =>
        set((state) => ({
            queues: [...state.queues, queue],
        })),
    updateQueue: (id, updates) =>
        set((state) => ({
            queues: state.queues.map((q) => (q.id === id ? { ...q, ...updates } : q)),
        })),
    removeQueue: (id) =>
        set((state) => ({
            queues: state.queues.filter((q) => q.id !== id),
        })),
    setCurrentQueue: (queue) => set({ currentQueue: queue }),
}))
