// src/app/(user)/profile/components/sections/ProfileNavigation.tsx
import React from "react";
import styles from "../Profile.module.css";
import { ProfileTab } from "../../types/profile.types";

interface ProfileNavigationProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

export const ProfileNavigation: React.FC<ProfileNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <ul className={styles.profileOptionsNav}>
      <li
        className={activeTab === "viewResume" ? styles.active : ""}
        onClick={() => onTabChange("viewResume")}
      >
        Preview Resume
      </li>
      <li
        className={activeTab === "applications" ? styles.active : ""}
        onClick={() => onTabChange("applications")}
      >
        Applied Jobs
      </li>

      <li
        className={activeTab === "viewId" ? styles.active : ""}
        onClick={() => onTabChange("viewId")}
      >
        View ID
      </li>
    </ul>
  );
};
