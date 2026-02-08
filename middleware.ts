import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
    // Allow login and auth pages without checking session
    if (request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/register')) {
        return NextResponse.next()
    }

    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - api routes that don't need auth
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}
