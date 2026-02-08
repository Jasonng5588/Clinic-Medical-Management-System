"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        phone: "",
        role: "receptionist" as const,
    })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            // Validate passwords match
            if (formData.password !== formData.confirmPassword) {
                throw new Error("Passwords do not match")
            }

            if (formData.password.length < 6) {
                throw new Error("Password must be at least 6 characters")
            }

            const supabase = createClient()

            // Step 1: Sign up user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                    },
                },
            })

            if (authError) throw authError

            if (!authData.user) {
                throw new Error("Registration failed - no user created")
            }

            // Step 2: Create staff profile
            const { error: profileError } = await supabase
                .from("staff_profiles")
                .insert({
                    id: authData.user.id,
                    role: formData.role,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    is_active: true,
                })

            if (profileError) {
                console.error("Profile creation error:", profileError)
                // Even if profile creation fails, user is created
                // They can still login but without full profile
            }

            setSuccess(true)

            // Wait 2 seconds then redirect to login
            setTimeout(() => {
                router.push("/login")
            }, 2000)

        } catch (err: any) {
            console.error("Registration error:", err)

            // Handle specific error cases with user-friendly messages
            const errorMessage = err.message?.toLowerCase() || ""

            if (errorMessage.includes("rate limit") || errorMessage.includes("too many requests")) {
                setError("Too many registration attempts. Please wait a few minutes and try again.")
            } else if (errorMessage.includes("already registered") || errorMessage.includes("already exists")) {
                setError("This email is already registered. Please use a different email or try logging in.")
            } else if (errorMessage.includes("invalid email")) {
                setError("Please enter a valid email address.")
            } else if (errorMessage.includes("weak password")) {
                setError("Password is too weak. Please use a stronger password with at least 6 characters.")
            } else {
                setError(err.message || "Failed to register. Please try again.")
            }
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
                <div className="w-full max-w-md">
                    <div className="bg-card rounded-2xl shadow-lg p-8 border text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-green-600 mb-2">Registration Successful!</h2>
                        <p className="text-muted-foreground mb-4">
                            Your account has been created successfully.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Redirecting to login page...
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary mb-2">HealthCare Plus</h1>
                    <p className="text-muted-foreground">Clinic Management System</p>
                </div>

                <div className="bg-card rounded-2xl shadow-lg p-8 border">
                    <div className="flex items-center gap-2 mb-6">
                        <Link href="/login" className="text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h2 className="text-2xl font-semibold">Create Account</h2>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">First Name</label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="John"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Last Name</label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="+60123456789"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Role</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            >
                                <option value="receptionist">Receptionist</option>
                                <option value="nurse">Nurse</option>
                                <option value="doctor">Doctor</option>
                                <option value="accountant">Accountant</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Confirm Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? "Creating account..." : "Create Account"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">Already have an account? </span>
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
