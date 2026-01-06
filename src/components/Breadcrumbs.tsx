"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Breadcrumbs.module.css";

interface BreadcrumbProps {
  customLabels?: Record<string, string>;
}

export default function Breadcrumbs({ customLabels = {} }: BreadcrumbProps) {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter((segment) => segment);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
    const label = customLabels[segment] || segment.replace(/-/g, " ");
    const isLast = index === pathSegments.length - 1;

    return { path, label, isLast };
  });

  if (breadcrumbs.length === 0) return null;

  return (
    <nav className={styles.breadcrumbs}>
      <Link href="/">Home</Link>
      {breadcrumbs.map((crumb) => (
        <React.Fragment key={crumb.path}>
          <span className={styles.separator}>/</span>
          {crumb.isLast ? (
            <span className={styles.current}>{crumb.label}</span>
          ) : (
            <Link href={crumb.path}>{crumb.label}</Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
