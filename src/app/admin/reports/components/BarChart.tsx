import React from "react";
import styles from "./Reports.module.css";

interface BarChartProps {
  data: { label: string; value: number }[];
}

export default function BarChart({ data }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={styles.barChartContainer}>
      {data.map((item, index) => {
        const percentage = (item.value / maxValue) * 100;
        return (
          <div key={index} className={styles.barItem}>
            <div className={styles.barLabel}>{item.label}</div>
            <div className={styles.barWrapper}>
              <div className={styles.bar} style={{ width: `${percentage}%` }}>
                <span className={styles.barValue}>{item.value}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
