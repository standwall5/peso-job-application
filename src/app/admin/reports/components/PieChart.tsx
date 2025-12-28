import React from "react";
import styles from "./Reports.module.css";

interface PieChartProps {
  data: { status: string; count: number; percentage?: number }[];
}

export default function PieChart({ data }: PieChartProps) {
  const colors = [
    "#4F46E5",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
  ];

  const total = data.reduce((sum, item) => sum + item.count, 0);
  let currentAngle = 0;

  return (
    <div className={styles.pieChartContainer}>
      <svg viewBox="0 0 100 100" className={styles.pieChart}>
        {data.map((item, index) => {
          const percentage = (item.count / total) * 100;
          const angle = (percentage / 100) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;

          currentAngle = endAngle;

          const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
          const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
          const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
          const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

          const largeArcFlag = angle > 180 ? 1 : 0;

          const pathData = [
            `M 50 50`,
            `L ${x1} ${y1}`,
            `A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `Z`,
          ].join(" ");

          return (
            <path
              key={index}
              d={pathData}
              fill={colors[index % colors.length]}
              stroke="white"
              strokeWidth="0.5"
            />
          );
        })}
      </svg>
      <div className={styles.pieChartLegend}>
        {data.map((item, index) => (
          <div key={index} className={styles.legendItem}>
            <span
              className={styles.legendColor}
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className={styles.legendLabel}>
              {item.status}: {item.count} (
              {Math.round((item.count / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
