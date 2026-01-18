"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * AuthRedirect Component
 * Redirects logged-in admins away from auth pages (login, signup, etc.)
 * Should be used in (auth) layout to prevent admins from accessing unauthenticated pages
 */
export default function AuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkAuthAndRedirect() {
      try {
        // Check if user is logged in
        const response = await fetch("/api/getUser");
        const data = await response.json();

        // If user exists and no error
        if (data && !data.error) {
          // Check if user is an admin
          const adminCheckResponse = await fetch("/api/admin/check");
          const adminData = await adminCheckResponse.json();

          // If user is admin, redirect to admin dashboard
          if (adminData.isAdmin) {
            console.log(
              "[AuthRedirect] Admin detected on auth page, redirecting to /admin"
            );
            router.replace("/admin");
            return;
          }

          // If user is regular applicant and on login/signup, redirect to home
          const authPages = ["/login", "/signup"];
          if (authPages.includes(pathname)) {
            console.log(
              "[AuthRedirect] Authenticated user on auth page, redirecting to /"
            );
            router.replace("/");
            return;
          }
        }
      } catch (error) {
        console.error("[AuthRedirect] Error checking auth status:", error);
      } finally {
        setIsChecking(false);
      }
    }

    checkAuthAndRedirect();
  }, [pathname, router]);

  // Show nothing while checking (or you can show a loading spinner)
  if (isChecking) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255, 255, 255, 0.9)",
          zIndex: 9999,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #667eea",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <style jsx>{`
            @keyframes spin {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return null;
}
