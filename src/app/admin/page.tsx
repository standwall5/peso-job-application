"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OneEightyRing from "@/components/OneEightyRing";
import { getAdminProfileAction } from "./actions/admin.actions";
import DashboardStats from "./components/DashboardStats";
import DashboardChart from "./components/DashboardChart";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const profile = await getAdminProfileAction();
        setIsSuperAdmin(profile.is_superadmin);

        // Redirect super admins only
        if (profile.is_superadmin) {
          router.push("/admin/manage-admin");
        }
      } catch (error) {
        console.error("Error checking admin role:", error);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [router]);

  if (loading) {
    return (
      <section style={{ alignSelf: "center", padding: "2rem" }}>
        <OneEightyRing height={64} width={64} color="var(--accent)" />
      </section>
    );
  }

  // For super admins, show nothing (they're being redirected)
  if (isSuperAdmin) {
    return null;
  }

  // For regular admins, show the dashboard welcome
  return (
    <section style={{ padding: "2rem" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <h1
          style={{
            marginBottom: "1rem",
            fontSize: "2rem",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          Welcome to PESO Admin Interface
        </h1>
        <p
          style={{
            marginBottom: "2rem",
            color: "var(--text-secondary)",
            fontSize: "1rem",
            lineHeight: "1.6",
          }}
        >
          Get a quick overview of your system or select a menu item from the
          sidebar to get started.
        </p>

        {/* Quick Action Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            marginBottom: "3rem",
          }}
        >
          <div
            onClick={() => router.push("/admin/jobseekers")}
            style={{
              padding: "1.5rem",
              background: "#ffffff",
              borderRadius: "1.25rem",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
              border: "1px solid rgba(52, 152, 219, 0.1)",
              cursor: "pointer",
              transition:
                "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
              willChange: "transform",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow =
                "0 8px 24px rgba(52, 152, 219, 0.15)";
              e.currentTarget.style.borderColor = "rgba(52, 152, 219, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(0, 0, 0, 0.08)";
              e.currentTarget.style.borderColor = "rgba(52, 152, 219, 0.1)";
            }}
          >
            <div style={{ marginBottom: "1rem" }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  color: "var(--accent)",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"
                />
              </svg>
            </div>
            <h3
              style={{
                marginBottom: "0.5rem",
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              Dashboard
            </h3>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.875rem",
                lineHeight: "1.6",
              }}
            >
              View and manage jobseekers
            </p>
          </div>

          <div
            onClick={() => router.push("/admin/company-profiles")}
            style={{
              padding: "1.5rem",
              background: "#ffffff",
              borderRadius: "1.25rem",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
              border: "1px solid rgba(52, 152, 219, 0.1)",
              cursor: "pointer",
              transition:
                "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
              willChange: "transform",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow =
                "0 8px 24px rgba(52, 152, 219, 0.15)";
              e.currentTarget.style.borderColor = "rgba(52, 152, 219, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(0, 0, 0, 0.08)";
              e.currentTarget.style.borderColor = "rgba(52, 152, 219, 0.1)";
            }}
          >
            <div style={{ marginBottom: "1rem" }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  color: "var(--accent)",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
                />
              </svg>
            </div>
            <h3
              style={{
                marginBottom: "0.5rem",
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              Manage Company
            </h3>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.875rem",
                lineHeight: "1.6",
              }}
            >
              Manage company profiles and job postings
            </p>
          </div>

          <div
            onClick={() => router.push("/admin/reports")}
            style={{
              padding: "1.5rem",
              background: "#ffffff",
              borderRadius: "1.25rem",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
              border: "1px solid rgba(52, 152, 219, 0.1)",
              cursor: "pointer",
              transition:
                "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
              willChange: "transform",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow =
                "0 8px 24px rgba(52, 152, 219, 0.15)";
              e.currentTarget.style.borderColor = "rgba(52, 152, 219, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(0, 0, 0, 0.08)";
              e.currentTarget.style.borderColor = "rgba(52, 152, 219, 0.1)";
            }}
          >
            <div style={{ marginBottom: "1rem" }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  color: "var(--accent)",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z"
                />
              </svg>
            </div>
            <h3
              style={{
                marginBottom: "0.5rem",
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              Reports & Analytics
            </h3>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.875rem",
                lineHeight: "1.6",
              }}
            >
              View analytics and generate reports
            </p>
          </div>
        </div>

        {/* Dashboard Statistics */}
        <DashboardStats />

        {/* Dashboard Chart */}
        <div
          style={{
            marginTop: "3rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <DashboardChart />
        </div>
      </div>
    </section>
  );
}
