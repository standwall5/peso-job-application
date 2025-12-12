"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "@/app/admin/Admin.module.css";

const Sidebar = () => {
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  const handleToggle = (key: string) => {
    setOpenMenus((openMenus) =>
      openMenus.includes(key)
        ? openMenus.filter((k) => k !== key)
        : [...openMenus, key],
    );
  };
  console.log("PATHNAME:", pathname);

  return (
    <section className={styles.sideBar}>
      <div className={styles.sideBarPeso}>
        <img src="/assets/pesoLogo.png" alt="PESO" />
        <span>PESO</span>
      </div>
      <ul className={styles.sideBarList}>
        <li
          className={`${styles.menuItem} ${
            pathname === "/admin/jobseekers" || pathname === "/admin/referrals"
              ? styles.active
              : ""
          }`}
          onClick={() => {
            handleToggle("dashboard");
            router.push("/admin/jobseekers");
          }}
        >
          <span
          // If the opened menuItem right now is "dashboard" then, (then is the "?") we set openMenu to null so that it closes
          >
            Dashboard
          </span>

          {/* If openMenu is null, this wont show; it only shows when openMenu is equal to "dashboard" */}
          {/*<ul
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
                pathname === "/admin/referrals" ? styles.active : ""
              }`}
              onClick={() => router.push("/admin/referrals")}
            >
              Referrals
            </li>
          </ul>*/}
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
          {/* <ul
            className={`${styles.subMenu} ${
              openMenus.includes("manageCompany") ? styles.open : ""
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <li
              className={`${
                pathname === "/admin/company-profiles" ? styles.active : ""
              }`}
              onClick={() => router.push("/admin/company-profiles")}
            >
              Company Profiles
            </li>
            <li
              className={`${
                pathname === "/admin/create-company" ? styles.active : ""
              }`}
              onClick={() => router.push("/admin/create-company")}
            >
              Create Company Profile
            </li>
          </ul> */}
        </li>
        <li className={styles.menuItem}>
          <span>Reports & Analytics</span>
        </li>

        {/* If super /admin */}
        <li
          className={styles.menuItem}
          onClick={() => handleToggle("manageStaff")}
        >
          <span>Manage Staff</span>
          <ul
            className={`${styles.subMenu} ${
              openMenus.includes("manageStaff") ? styles.open : ""
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <li
              className={`${
                pathname === "/admin/manage-admin" ? styles.active : ""
              }`}
              onClick={() => router.push("/admin/manage-admin")}
            >
              Admins
            </li>
            <li
              className={`${
                pathname === "/admin/create-admin" ? styles.active : ""
              }`}
              onClick={() => router.push("/admin/create-admin")}
            >
              Create Admin Account
            </li>
          </ul>
        </li>
      </ul>
    </section>
  );
};

export default Sidebar;
