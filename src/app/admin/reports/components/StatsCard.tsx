import React from "react";
import styles from "./Reports.module.css";

interface StatsCardProps {
  title: string;
  value: number;
  icon: string;
  color: "blue" | "green" | "purple" | "orange" | "red" | "teal";
}

export default function StatsCard({
  title,
  value,
  icon,
  color,
}: StatsCardProps) {
  return (
    <div
      className={`${styles.statsCard} ${styles[`statsCard${color.charAt(0).toUpperCase() + color.slice(1)}`]}`}
    >
      <div className={styles.statsIcon}>{icon}</div>
      <div className={styles.statsContent}>
        <h3>{title}</h3>
        <p className={styles.statsValue}>{value.toLocaleString()}</p>
      </div>
    </div>
  );
}
