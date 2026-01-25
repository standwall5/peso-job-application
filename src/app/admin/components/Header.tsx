"use client";

import React, { useState, useEffect } from "react";
import styles from "@/app/admin/Admin.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signout } from "@/lib/auth-actions";
import { useSuperAdmin } from "@/app/admin/hooks/useSuperAdmin";
import { AdminProfileModal } from "./AdminProfileModal";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const Header = () => {
  const { isSuperAdmin } = useSuperAdmin();
  const pathname = usePathname();
  const router = useRouter();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [adminName, setAdminName] = useState<string>("");
  const [profileTimestamp, setProfileTimestamp] = useState(Date.now());

  // Load admin profile picture and name, check for incomplete profile
  useEffect(() => {
    const loadProfilePicture = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: admin } = await supabase
          .from("peso")
          .select("profile_picture_url, name, is_first_login")
          .eq("auth_id", user.id)
          .single();

        if (admin) {
          // Check if this is first login - should redirect to setup page
          if (admin.is_first_login) {
            console.log(
              "⚠️ [Header] First login detected, redirecting to setup",
            );
            router.push("/admin/setup-initial");
            return;
          }

          // Check if profile is incomplete (no profile picture)
          // This can happen if admin was invited but never completed setup
          const incomplete = !admin.profile_picture_url;
          setIsProfileIncomplete(incomplete);

          if (incomplete) {
            console.log(
              "⚠️ [Header] Incomplete profile detected - forcing modal",
            );
            setShowProfileModal(true);
          }

          if (admin.profile_picture_url) {
            setProfilePicture(admin.profile_picture_url);
          }
          if (admin.name) {
            setAdminName(admin.name);
          }
        }
      }
    };

    loadProfilePicture();
  }, [profileTimestamp, router]); // Re-fetch when timestamp changes

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
    console.log("📝 [Header] Opening profile modal");
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
        onClose={() => {
          // Only allow closing if profile is complete
          if (!isProfileIncomplete) {
            setShowProfileModal(false);
          } else {
            console.log("⚠️ [Header] Cannot close modal - profile incomplete");
          }
        }}
        currentPictureUrl={profilePicture}
        onProfileUpdate={(url) => {
          console.log("✅ [Header] Profile updated with new picture:", url);
          setProfilePicture(url);
          setProfileTimestamp(Date.now()); // Update timestamp to force refresh
          setIsProfileIncomplete(false); // Profile is now complete
        }}
        isForced={isProfileIncomplete}
      />
    </div>
  );
};

export default Header;
