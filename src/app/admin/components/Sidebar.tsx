"use client";

import React, { useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import styles from "@/app/admin/Admin.module.css";
import { useSuperAdmin } from "@/app/admin/hooks/useSuperAdmin";

const Sidebar = () => {
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    return null;
  }

  // Super Admin Only - Manage Staff - Sidebar has no use, therefore nothing should be returned
  if (isSuperAdmin) {
    return null;
  }

  return (
    <>
      {/* Mobile Burger Button */}
      <button
        className={styles.burgerButton}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <span className={styles.burgerLine}></span>
        <span className={styles.burgerLine}></span>
        <span className={styles.burgerLine}></span>
      </button>

      {/* Backdrop overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className={styles.mobileBackdrop}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <section
        className={`${styles.sideBar} ${isExpanded ? styles.expanded : styles.collapsed} ${mobileMenuOpen ? styles.mobileOpen : ""}`}
      >
        {/* Logo and Hamburger Toggle */}
        <div className={styles.sideBarHeader}>
          <div
            className={styles.sideBarPeso}
            style={{ cursor: "pointer" }}
            onClick={() => {
              router.push("/admin");
              setMobileMenuOpen(false);
            }}
          >
            <Image
              src="/assets/pesoLogo.png"
              alt="PESO"
              width={48}
              height={48}
              priority
            />
            {isExpanded && <span>PESO</span>}
          </div>

          {/* Desktop Hamburger Toggle */}
          <button
            className={`${styles.toggleButton} ${isExpanded ? styles.expanded : styles.collapsed}`}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label="Toggle sidebar"
            title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {/* Heroicon: Bars3 */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className={styles.hamburgerIcon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>

        <ul className={styles.sideBarList}>
          {/* Dashboard with Dropdown */}
          <li
            className={`${styles.menuItem} ${
              openMenus.includes("dashboard") ? styles.active : ""
            }`}
            onClick={() => isExpanded && handleToggle("dashboard")}
            title={!isExpanded ? "Dashboard" : ""}
          >
            <div className={styles.menuItemContent}>
              {/* Heroicon: ChartBarSquare */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={styles.menuIcon}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"
                />
              </svg>
              {isExpanded && (
                <>
                  <span>Dashboard</span>
                  {/* Heroicon: ChevronDown */}
                  {/*className={`${styles.dropdownIcon} ${openMenus.includes("dashboard") ? styles.rotated : ""}`}*/}
                  <svg
                    className={`${styles.dropdownIcon} ${openMenus.includes("dashboard") ? styles.rotated : ""}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </>
              )}
            </div>
            {isExpanded && (
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
            )}
          </li>

          {/* Manage Company */}
          <li
            className={`${styles.menuItem} ${
              pathname === "/admin/company-profiles" ||
              pathname === "/admin/create-company"
                ? styles.active
                : ""
            }`}
            onClick={() => {
              router.push("/admin/company-profiles");
              setMobileMenuOpen(false);
            }}
            title={!isExpanded ? "Manage Company" : ""}
          >
            <div className={styles.menuItemContent}>
              {/* Heroicon: BuildingOffice2 */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={styles.menuIcon}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
                />
              </svg>
              {isExpanded && <span>Manage Company</span>}
            </div>
          </li>

          {/* Reports & Analytics */}
          <li
            className={`${styles.menuItem} ${
              pathname === "/admin/reports" ? styles.active : ""
            }`}
            onClick={() => {
              router.push("/admin/reports");
              setMobileMenuOpen(false);
            }}
            title={!isExpanded ? "Reports & Analytics" : ""}
          >
            <div className={styles.menuItemContent}>
              {/* Heroicon: ChartPie */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={styles.menuIcon}
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
              {isExpanded && <span>Reports & Analytics</span>}
            </div>
          </li>
        </ul>
      </section>
    </>
  );
};

export default Sidebar;
