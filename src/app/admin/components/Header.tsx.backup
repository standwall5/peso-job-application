"use client";

import React from "react";
import styles from "@/app/admin/Admin.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signout } from "@/lib/auth-actions";
import { useSuperAdmin } from "@/app/admin/hooks/useSuperAdmin";
import ActionButton from "@/components/ActionButton";

const Header = () => {
  const { isSuperAdmin } = useSuperAdmin();
  const pathname = usePathname();

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

      {/* Logout Button */}
      <div className={styles.headerActions}>
        <ActionButton
          onClick={signout}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          }
          variant="outline"
        >
          Logout
        </ActionButton>
      </div>
    </div>
  );
};

export default Header;
