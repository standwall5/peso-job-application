// src/app/(user)/profile/components/sections/ProfileNavigation.tsx
import React from "react";
import styles from "./ProfileNavigation.module.css";
import { ProfileTab } from "../../../types/profile.types";
import {
  UserCircleIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";

const NAV_ITEMS: Array<{
  tab: ProfileTab;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}> = [
  { tab: "profileDetails", label: "My Profile", Icon: UserCircleIcon },
  { tab: "viewResume", label: "Preview Resume", Icon: DocumentTextIcon },
  { tab: "applications", label: "Applied Jobs", Icon: BriefcaseIcon },
  { tab: "viewId", label: "View ID", Icon: IdentificationIcon },
];

interface ProfileNavigationProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

export const ProfileNavigation: React.FC<ProfileNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const handleNavKeyDown = (
    event: React.KeyboardEvent<HTMLLIElement>,
    tab: ProfileTab,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onTabChange(tab);
    }
  };

  return (
    <ul className={styles.profileOptionsNav}>
      {NAV_ITEMS.map(({ tab, label, Icon }) => {
        const isActive = activeTab === tab;

        return (
          <li
            key={tab}
            className={isActive ? styles.active : ""}
            onClick={() => onTabChange(tab)}
            onKeyDown={(event) => handleNavKeyDown(event, tab)}
            role="button"
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            tabIndex={0}
          >
            <Icon style={{ width: "1.25rem", height: "1.25rem" }} />
            <span style={{ opacity: 1, maxWidth: "none" }}>{label}</span>
          </li>
        );
      })}
    </ul>
  );
};
