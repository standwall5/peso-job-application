"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "@/app/globals.css";
import "./adminLayout.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "@/components/Footer";
import AdminChatWidget from "@/components/chat/AdminChatWidget";
import { getAdminProfileAction } from "@/app/admin/actions/admin.actions";
import { AdminChatProvider, useAdminChat } from "@/contexts/AdminChatContext";

function AdminLayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const { chatWidgetRef } = useAdminChat();

  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const profile = await getAdminProfileAction();
        setIsSuperAdmin(profile.is_superadmin);

        // If this is first login, redirect to setup page
        if (profile.is_first_login) {
          router.push("/admin/setup-initial");
          return;
        }

        if (profile.profile_picture_url) {
          setProfilePicture(profile.profile_picture_url);
        }
      } catch (error) {
        console.error("Error fetching admin profile:", error);
        setIsSuperAdmin(false);
      }
    };

    checkAdminRole();
  }, [router]);

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="admin-content">{children}</main>
        <Footer />
      </div>

      {/* Floating Admin Chat Widget - Only for regular admins */}
      {isSuperAdmin === false && <AdminChatWidget ref={chatWidgetRef} />}
    </div>
  );
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminChatProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminChatProvider>
  );
}
