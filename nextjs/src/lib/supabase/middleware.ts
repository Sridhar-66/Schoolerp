import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )

                    supabaseResponse = NextResponse.next({
                        request,
                    })

                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT:
    // Do not run code between createServerClient and supabase.auth.getUser()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const url = request.nextUrl.clone()
    const path = url.pathname

    // 1. Guest Protection
    // Redirect unauthenticated users trying to access protected routes

    if (
        !user &&
        (
            path.startsWith('/admin') ||
            path.startsWith('/teacher') ||
            path.startsWith('/student') ||
            path.startsWith('/app')
        )
    ) {
        url.pathname = '/auth/login'
        return NextResponse.redirect(url)
    }

    // 2. Role Protection
    // Check database role and block unauthorized access

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const userRole = profile?.role

        // If no role exists
        if (!userRole) {
            url.pathname = '/auth/login'
            return NextResponse.redirect(url)
        }

        // Admin route protection
        if (path.startsWith('/admin') && userRole !== 'admin') {
            url.pathname = `/${userRole}/dashboard`
            return NextResponse.redirect(url)
        }

        // Teacher route protection
        if (path.startsWith('/teacher') && userRole !== 'teacher') {
            url.pathname = `/${userRole}/dashboard`
            return NextResponse.redirect(url)
        }

        // Student route protection
        if (path.startsWith('/student') && userRole !== 'student') {
            url.pathname = `/${userRole}/dashboard`
            return NextResponse.redirect(url)
        }

        // Redirect logged-in users away from auth pages
        if (
            path === '/auth/login' ||
            path === '/auth/register'
        ) {
            url.pathname = `/${userRole}/dashboard`
            return NextResponse.redirect(url)
        }
    }

    // Return synchronized response
    return supabaseResponse
}