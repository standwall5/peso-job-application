import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Development fallback: if Supabase env vars are missing, skip auth logic
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/error?reason=missing-env-vars";
    return NextResponse.redirect(url);
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const publicPaths = [
    "/login",
    "/signup",
    "/auth",
    "/error",
    "/logout",
    "/job-opportunities",
    "/how-it-works",
    "/about",
    "/search",
  ];

  // Allow all API routes to pass through
  if (pathname.startsWith("/api/")) {
    return supabaseResponse;
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return supabaseResponse;
  }

  // If user is NOT authenticated
  if (!user) {
    // Allow access to public paths
    if (publicPaths.some((p) => pathname.startsWith(p))) {
      return supabaseResponse;
    }

    // Redirect to login for protected pages
    const url = request.nextUrl.clone();
    url.pathname = "/job-opportunities";
    url.searchParams.set("redirect", pathname); // Save where they wanted to go
    return NextResponse.redirect(url);
  }

  // If user IS authenticated, check their role
  const { data: pesoUser } = await supabase
    .from("peso")
    .select("id, is_superadmin")
    .eq("auth_id", user.id)
    .single();

  // If user is a PESO admin
  if (pesoUser) {
    // Redirect admins away from auth pages (login, signup, etc.)
    const authPages = ["/login", "/signup", "/auth"];
    if (publicPaths.some((p) => pathname.startsWith(p))) {
      const url = request.nextUrl.clone();
      url.pathname = pesoUser.is_superadmin ? "/admin/manage-admin" : "/admin";
      return NextResponse.redirect(url);
    }

    const isSuperAdmin = pesoUser.is_superadmin;

    // Super admin specific paths
    const superAdminPaths = [
      "/admin/manage-admin",
      "/admin/create-admin",
      "/admin/archived-admins",
    ];
    const regularAdminPaths = [
      "/admin/jobseekers",
      "/admin/archived-jobseekers",
      "/admin/company-profiles",
      "/admin/reports",
      "/admin/create-company",
      "/admin/setup-password",
    ];

    if (isSuperAdmin) {
      // Super admin trying to access regular admin pages or base /admin
      if (
        regularAdminPaths.some((p) => pathname.startsWith(p)) ||
        pathname === "/admin"
      ) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/manage-admin";
        return NextResponse.redirect(url);
      }

      // Super admin trying to access applicant pages
      if (pathname === "/" || pathname.startsWith("/profile")) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/manage-admin";
        return NextResponse.redirect(url);
      }
    } else {
      // Regular admin trying to access super admin pages
      if (superAdminPaths.some((p) => pathname.startsWith(p))) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin";
        return NextResponse.redirect(url);
      }

      // Regular admin trying to access applicant pages
      if (pathname === "/" || pathname.startsWith("/profile")) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin";
        return NextResponse.redirect(url);
      }
    }

    // Allow PESO admins to access admin routes
    return supabaseResponse;
  }

  // If user is a regular applicant (NOT a PESO user)
  // Redirect from auth pages to home/job-opportunities
  const authPages = ["/login", "/signup", "/auth"];
  if (authPages.some((p) => pathname.startsWith(p)) || pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/job-opportunities";
    return NextResponse.redirect(url);
  }

  // Block access to admin pages
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/how-it-works") ||
    pathname.startsWith("/forgot-password")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/job-opportunities";
    return NextResponse.redirect(url);
  }

  // Allow applicants to access all other routes
  return supabaseResponse;
}
