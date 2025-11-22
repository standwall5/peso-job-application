import React, { ReactNode } from "react";
import styles from "./Dropdown.module.css";

interface DropdownProps {
  children: ReactNode;
  className?: string;
  isOpen: boolean;
  position?: "left" | "center" | "right";
}

export default function Dropdown({
  children,
  className = "",
  isOpen,
  position = "left",
}: DropdownProps) {
  if (!isOpen) return null;

  return (
    <div className={`${styles.dropdown} ${styles[position]} ${className}`}>
      {children}
    </div>
  );
}

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  icon?: ReactNode;
}

export function DropdownItem({
  children,
  onClick,
  href,
  className = "",
  icon,
}: DropdownItemProps) {
  const content = (
    <>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.text}>{children}</span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={`${styles.dropdownItem} ${className}`}
        onClick={onClick}
      >
        {content}
      </a>
    );
  }

  return (
    <div
      className={`${styles.dropdownItem} ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick?.();
        }
      }}
    >
      {content}
    </div>
  );
}

interface DropdownDividerProps {
  className?: string;
}

export function DropdownDivider({ className = "" }: DropdownDividerProps) {
  return <div className={`${styles.divider} ${className}`} />;
}
