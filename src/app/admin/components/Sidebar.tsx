"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "@/app/admin/Admin.module.css";
import { useSuperAdmin } from "@/app/admin/hooks/useSuperAdmin";

const Sidebar = () => {
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { loading, isSuperAdmin } = useSuperAdmin();

  const handleToggle = (key: string) => {
    setOpenMenus((openMenus) =>
      openMenus.includes(key)
        ? openMenus.filter((k) => k !== key)
        : [...openMenus, key],
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
    <>
      {/* Burger Button */}
      <button
        className={styles.burgerButton}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <span className={styles.burgerLine}></span>
        <span className={styles.burgerLine}></span>
        <span className={styles.burgerLine}></span>
      </button>

      {/* Backdrop overlay */}
      {mobileMenuOpen && (
        <div
          className={styles.mobileBackdrop}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <section
        className={`${styles.sideBar} ${mobileMenuOpen ? styles.mobileOpen : ""}`}
      >
        <div
          className={styles.sideBarPeso}
          style={{ cursor: "pointer" }}
          onClick={() => {
            if (isSuperAdmin) {
              router.push("/admin/manage-admin");
            } else {
              router.push("/admin");
            }
            setMobileMenuOpen(false);
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
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  Dashboard
                  <svg
                    className={`${styles.dropdownIcon} ${openMenus.includes("dashboard") ? styles.rotated : ""}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    style={{ width: "1.25rem", height: "1.25rem" }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
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
                    onClick={() => {
                      router.push("/admin/jobseekers");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Jobseekers
                  </li>
                  <li
                    className={`${
                      pathname === "/admin/deployed-jobseekers"
                        ? styles.active
                        : ""
                    }`}
                    onClick={() => {
                      router.push("/admin/deployed-jobseekers");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Deployed Jobseekers
                  </li>
                  <li
                    className={`${
                      pathname === "/admin/archived-jobseekers"
                        ? styles.active
                        : ""
                    }`}
                    onClick={() => {
                      router.push("/admin/archived-jobseekers");
                      setMobileMenuOpen(false);
                    }}
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
                  setMobileMenuOpen(false);
                }}
              >
                <span>Manage Company</span>
              </li>
              <li
                className={`${styles.menuItem} ${
                  pathname === "/admin/reports" ? styles.active : ""
                }`}
                onClick={() => {
                  router.push("/admin/reports");
                  setMobileMenuOpen(false);
                }}
              >
                <span>Reports & Analytics</span>
              </li>
            </>
          )}
        </ul>
      </section>
    </>
  );
};

export default Sidebar;
