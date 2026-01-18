"use client";

import { useEffect, useState } from "react";
import "@/app/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AdminChatWidget from "@/components/chat/AdminChatWidget";
import { AdminProfileModal } from "./components/AdminProfileModal";
import { getAdminProfileAction } from "@/app/admin/actions/admin.actions";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const profile = await getAdminProfileAction();
        setIsSuperAdmin(profile.is_superadmin);

        // Check if this is first login (for ALL admins including super admins)
        if (profile.is_first_login) {
          setShowFirstLoginModal(true);
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

      {/* First Login Modal */}
      <AdminProfileModal
        isOpen={showFirstLoginModal}
        onClose={() => setShowFirstLoginModal(false)}
        currentPictureUrl={profilePicture}
        onProfileUpdate={(url) => setProfilePicture(url)}
        isFirstLogin={true}
      />
    </div>
  );
}
