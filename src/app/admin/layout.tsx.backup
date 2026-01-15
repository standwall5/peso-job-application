"use client";

import { useEffect, useState } from "react";
import "@/app/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AdminChatWidget from "@/components/chat/AdminChatWidget";
import { getAdminProfileAction } from "@/app/admin/actions/admin.actions";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const profile = await getAdminProfileAction();
        setIsSuperAdmin(profile.is_superadmin);
      } catch (error) {
        console.error("Error fetching admin profile:", error);
        setIsSuperAdmin(false);
      }
    };

    checkAdminRole();
  }, []);

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="admin-content">{children}</main>
      </div>

      {/* Floating Admin Chat Widget - Only for regular admins */}
      {isSuperAdmin === false && <AdminChatWidget />}
    </div>
  );
}
