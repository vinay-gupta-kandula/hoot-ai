import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    const email = user.email

    if (!email) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    const [studentRes, mentorRes, mainMentorRes] = await Promise.all([
        supabaseAdmin.from('students').select('id').eq('email', email).single(),
        supabaseAdmin.from('mentors').select('id').eq('email', email).single(),
        supabaseAdmin.from('main_mentors').select('id').eq('email', email).single(),
    ])

    let role: 'student' | 'mentor' | 'main_mentor' | null = null
    if (studentRes.data) role = 'student'
    else if (mentorRes.data) role = 'mentor'
    else if (mainMentorRes.data) role = 'main_mentor'

    if (!role) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    const path = request.nextUrl.pathname

    // Role‑based redirects for dashboard sub‑routes
    if (path.startsWith('/dashboard/student') && (role === 'mentor' || role === 'main_mentor')) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard/mentor'
        return NextResponse.redirect(url)
    }

    if (path.startsWith('/dashboard/mentor') && role === 'student') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard/student'
        return NextResponse.redirect(url)
    }

    // Catch‑all for /dashboard → redirect to role‑specific dashboard
    if (path === '/dashboard') {
        const url = request.nextUrl.clone()
        if (role === 'student') url.pathname = '/dashboard/student'
        else if (role === 'mentor') url.pathname = '/dashboard/mentor'
        else if (role === 'main_mentor') url.pathname = '/dashboard/main-mentor'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

export const config = {
    matcher: ['/dashboard/:path*'],
}