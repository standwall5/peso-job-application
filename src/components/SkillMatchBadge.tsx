import React from "react";
import styles from "./SkillMatchBadge.module.css";

interface SkillMatchBadgeProps {
  percentage: number;
  size?: "small" | "medium" | "large";
}

export default function SkillMatchBadge({
  percentage,
  size = "medium",
}: SkillMatchBadgeProps) {
  const getColor = () => {
    if (percentage >= 80) return "green";
    if (percentage >= 60) return "blue";
    if (percentage >= 40) return "yellow";
    return "gray";
  };

  const getLabel = () => {
    if (percentage >= 80) return "Excellent Match";
    if (percentage >= 60) return "Good Match";
    if (percentage >= 40) return "Fair Match";
    if (percentage > 0) return "Some Match";
    return "No Match";
  };

  if (percentage === 0) return null;

  return (
    <div className={`${styles.badge} ${styles[getColor()]} ${styles[size]}`}>
      <span className={styles.percentage}>{percentage}%</span>
      <span className={styles.label}>{getLabel()}</span>
    </div>
  );
}
