"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "@/app/admin/Admin.module.css";
import { useSuperAdmin } from "@/app/admin/hooks/useSuperAdmin";

const Sidebar = () => {
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  // const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { loading, isSuperAdmin } = useSuperAdmin();

  const handleToggle = (key: string) => {
    setOpenMenus((openMenus) =>
      openMenus.includes(key)
        ? openMenus.filter((k) => k !== key)
        : [...openMenus, key]
    );
  };

  if (loading) {
    return (
      // <section className={styles.sideBar}>
      //   <div className={styles.sideBarPeso}>
      //     <img src="/assets/pesoLogo.png" alt="PESO" />
      //     <span>PESO</span>
      //   </div>
      // </section>
      null
    );
  }

  // Super Admin Only - Manage Staff - Sidebar has no use, therefore nothing should be returned
  if (isSuperAdmin) {
    return null;
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
                openMenus.includes("dashboard") ? styles.active : ""
              }`}
              onClick={() => handleToggle("dashboard")}
            >
              <span>Dashboard</span>
              <ul
                className={`${styles.subMenu} ${
                  openMenus.includes("dashboard") ? styles.open : ""
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <li
                  className={`${
                    pathname === "/admin/jobseekers" ? styles.active : ""
                  }`}
                  onClick={() => router.push("/admin/jobseekers")}
                >
                  Jobseekers
                </li>
                <li
                  className={`${
                    pathname === "/admin/deployed-jobseekers"
                      ? styles.active
                      : ""
                  }`}
                  onClick={() => router.push("/admin/deployed-jobseekers")}
                >
                  Deployed Jobseekers
                </li>
                <li
                  className={`${
                    pathname === "/admin/archived-jobseekers"
                      ? styles.active
                      : ""
                  }`}
                  onClick={() => router.push("/admin/archived-jobseekers")}
                >
                  Archived Jobseekers
                </li>
              </ul>
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
