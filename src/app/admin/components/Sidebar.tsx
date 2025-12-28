"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "@/app/admin/Admin.module.css";
import { getAdminProfileAction } from "@/app/admin/actions/admin.actions";

interface AdminProfile {
  id: number;
  name: string;
  is_superadmin: boolean;
  auth_id: string;
  email?: string;
}

const Sidebar = () => {
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const profile = await getAdminProfileAction();
        setAdminProfile(profile);
      } catch (error) {
        console.error("Error fetching admin profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  const handleToggle = (key: string) => {
    setOpenMenus((openMenus) =>
      openMenus.includes(key)
        ? openMenus.filter((k) => k !== key)
        : [...openMenus, key],
    );
  };

  const isSuperAdmin = adminProfile?.is_superadmin ?? false;

  if (loading) {
    return (
      <section className={styles.sideBar}>
        <div className={styles.sideBarPeso}>
          <img src="/assets/pesoLogo.png" alt="PESO" />
          <span>PESO</span>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.sideBar}>
      <div
        className={styles.sideBarPeso}
        style={{ cursor: "pointer" }}
        onClick={() => {
          if (isSuperAdmin) {
            router.push("/admin/manage-admin");
          } else {
            router.push("/admin");
          }
        }}
      >
        <img src="/assets/pesoLogo.png" alt="PESO" />
        <span>PESO</span>
      </div>
      <ul className={styles.sideBarList}>
        {/* Super Admin Only - Manage Staff */}
        {isSuperAdmin && (
          <>
            <li
              className={`${styles.menuItem} ${
                pathname === "/admin/manage-admin" ? styles.active : ""
              }`}
              onClick={() => {
                handleToggle("manageCompany");
                router.push("/admin/manage-admin");
              }}
            >
              <span>Manage Admins</span>
            </li>
            <li
              className={`${styles.menuItem} ${
                pathname === "/admin/create-admin" ? styles.active : ""
              }`}
              onClick={() => {
                handleToggle("manageCompany");
                router.push("/admin/create-admin");
              }}
            >
              <span>Create Admin Account</span>
            </li>
          </>

          // Kept incase dropdown styling is ever needed
          // <li
          //   className={styles.menuItem}
          //   onClick={() => handleToggle("manageStaff")}
          // >
          //   <span>Manage Staff</span>
          //   <ul
          //     className={`${styles.subMenu} ${
          //       openMenus.includes("manageStaff") ? styles.open : ""
          //     }`}
          //     onClick={(e) => e.stopPropagation()}
          //   >
          //     <li
          //       className={`${
          //         pathname === "/admin/manage-admin" ? styles.active : ""
          //       }`}
          //       onClick={() => router.push("/admin/manage-admin")}
          //     >
          //       Admins
          //     </li>
          //     <li
          //       className={`${
          //         pathname === "/admin/create-admin" ? styles.active : ""
          //       }`}
          //       onClick={() => router.push("/admin/create-admin")}
          //     >
          //       Create Admin Account
          //     </li>
          //   </ul>
          // </li>
        )}

        {/* Regular Admin Only - Other Menu Items */}
        {!isSuperAdmin && (
          <>
            <li
              className={`${styles.menuItem} ${
                pathname === "/admin/jobseekers" ||
                pathname === "/admin/referrals"
                  ? styles.active
                  : ""
              }`}
              onClick={() => {
                handleToggle("dashboard");
                router.push("/admin/jobseekers");
              }}
            >
              <span>Dashboard</span>
            </li>
            <li
              className={`${styles.menuItem} ${
                pathname === "/admin/company-profiles" ||
                pathname === "/admin/create-company"
                  ? styles.active
                  : ""
              }`}
              onClick={() => {
                handleToggle("manageCompany");
                router.push("/admin/company-profiles");
              }}
            >
              <span>Manage Company</span>
            </li>
            <li
              className={`${styles.menuItem} ${
                pathname === "/admin/reports" ? styles.active : ""
              }`}
              onClick={() => router.push("/admin/reports")}
            >
              <span>Reports & Analytics</span>
            </li>
          </>
        )}
      </ul>
    </section>
  );
};

export default Sidebar;
