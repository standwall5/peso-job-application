"use client";

import React, { useState, useEffect } from "react";
import styles from "@/app/admin/Admin.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signout } from "@/lib/auth-actions";
import { useSuperAdmin } from "@/app/admin/hooks/useSuperAdmin";
import { AdminProfileModal } from "./AdminProfileModal";
import { createClient } from "@/utils/supabase/client";

const Header = () => {
  const { isSuperAdmin } = useSuperAdmin();
  const pathname = usePathname();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [adminName, setAdminName] = useState<string>("");
  const [profileTimestamp, setProfileTimestamp] = useState(Date.now());

  // Load admin profile picture and name
  useEffect(() => {
    const loadProfilePicture = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: admin } = await supabase
          .from("peso")
          .select("profile_picture_url, name")
          .eq("auth_id", user.id)
          .single();

        if (admin?.profile_picture_url) {
          setProfilePicture(admin.profile_picture_url);
        }
        if (admin?.name) {
          setAdminName(admin.name);
        }
      }
    };

    loadProfilePicture();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(`.${styles.profileDropdownContainer}`)) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showProfileDropdown]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(`.${styles.profileDropdownContainer}`)) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showProfileDropdown]);

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleOpenProfileModal = () => {
    setShowProfileDropdown(false);
    setShowProfileModal(true);
  };

  const handleLogout = async () => {
    setShowProfileDropdown(false);
    await signout();
  };

  return (
    <div className={`${styles.header}`}>
      {/* Tab Navigation for Super Admins */}
      {isSuperAdmin && (
        <div className={styles.tabNavigation}>
          <Link
            href="/admin/manage-admin"
            className={
              pathname === "/admin/manage-admin"
                ? `${styles.tab} ${styles.tabActive}`
                : styles.tab
            }
          >
            MANAGE STAFF
          </Link>
          <Link
            href="/admin/archived-admins"
            className={
              pathname === "/admin/archived-admins"
                ? `${styles.tab} ${styles.tabActive}`
                : styles.tab
            }
          >
            ARCHIVED STAFF
          </Link>
        </div>
      )}

      {/* Header Actions */}
      <div className={styles.headerActions}>
        {/* Profile Icon with Dropdown */}
        <div className={`${styles.profileDropdownContainer}`}>
          <button
            onClick={handleProfileClick}
            className={styles.profileIconButton}
            title={adminName || "Profile"}
          >
            {profilePicture ? (
              <img
                src={`${profilePicture}?t=${profileTimestamp}`}
                alt="Profile"
                className={styles.profileImage}
              />
            ) : (
              <div className={styles.profilePlaceholder}>
                {adminName ? adminName.charAt(0).toUpperCase() : "A"}
              </div>
            )}
          </button>

          {/* Dropdown Menu */}
          {showProfileDropdown && (
            <div className={styles.profileDropdown}>
              <div className={styles.dropdownHeader}>
                <div className={styles.dropdownProfileImage}>
                  {profilePicture ? (
                    <img
                      src={`${profilePicture}?t=${profileTimestamp}`}
                      alt="Profile"
                    />
                  ) : (
                    <div className={styles.dropdownProfilePlaceholder}>
                      {adminName ? adminName.charAt(0).toUpperCase() : "A"}
                    </div>
                  )}
                </div>
                <div className={styles.dropdownUserInfo}>
                  <p className={styles.dropdownName}>{adminName || "Admin"}</p>
                  <p className={styles.dropdownRole}>
                    {isSuperAdmin ? "Super Admin" : "Admin"}
                  </p>
                </div>
              </div>
              <div className={styles.dropdownDivider} />
              <button
                onClick={handleOpenProfileModal}
                className={styles.dropdownItem}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={styles.dropdownIcon}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
                Profile
              </button>
              <div className={styles.dropdownDivider} />
              <button onClick={handleLogout} className={styles.dropdownItem}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={styles.dropdownIcon}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                  />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal (AD01) */}
      <AdminProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        currentPictureUrl={profilePicture}
        onProfileUpdate={(url) => {
          setProfilePicture(url);
          setProfileTimestamp(Date.now()); // Update timestamp to force refresh
        }}
      />
    </div>
  );
};

export default Header;
