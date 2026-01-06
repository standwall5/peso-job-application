"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "@/app/admin/Admin.module.css";
import Link from "next/link";
import { signout } from "@/lib/auth-actions";
import headerStyles from "@/components/Navbar.module.css";
import Dropdown, { DropdownItem } from "@/components/Dropdown";
import { AdminProfile } from "@/lib/types";
import { useSuperAdmin } from "@/app/admin/hooks/useSuperAdmin";
import ActionButton from "@/components/ActionButton";

const Header = () => {
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { isSuperAdmin } = useSuperAdmin();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowSettingsDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`${styles.header}`}>
      <ul>
        {/* 01/04/2026 remove home and message icons as they are not used */}
        {isSuperAdmin && (
          <li className={styles.superAdminText}>
            <p>Manage Admins</p>
          </li>
        )}

        <li>
          <div
            ref={profileRef}
            onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
            }}
          >
            {/* TODO: Remove PESO Logo and possibly dropdown and replace with a simple "Log Out" because that's the only function needed */}
            {/*<img
              src="/assets/pesoLogo.png"
              alt="PESO"
              style={{
                width: "2.2rem",
                height: "2.2rem",
                borderRadius: "50%",
                // border: "2px solid var(--accent)",
                objectFit: "cover",
                transition: "0.25s",
                filter: "none",
              }}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ width: "1.5rem", height: "1.5rem" }}
            >
              <path
                fillRule="evenodd"
                d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z"
                clipRule="evenodd"
              />
            </svg>
            <Dropdown isOpen={showSettingsDropdown} position="right">
              <DropdownItem
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
              >
                Logout
              </DropdownItem>
            </Dropdown>*/}
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
        </li>
      </ul>
    </div>
  );
};

export default Header;
