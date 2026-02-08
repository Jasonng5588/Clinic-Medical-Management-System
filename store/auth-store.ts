import { create } from "zustand"
import { StaffProfile, UserRole } from "@/types"

interface AuthState {
    user: StaffProfile | null
    role: UserRole | null
    isLoading: boolean
    setUser: (user: StaffProfile | null) => void
    setRole: (role: UserRole | null) => void
    setLoading: (loading: boolean) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    role: null,
    isLoading: true,
    setUser: (user) => set({ user }),
    setRole: (role) => set({ role }),
    setLoading: (loading) => set({ isLoading: loading }),
    logout: () => set({ user: null, role: null }),
}))
