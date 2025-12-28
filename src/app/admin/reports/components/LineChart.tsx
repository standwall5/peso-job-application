import React from "react";
import styles from "./Reports.module.css";

interface LineChartProps {
  data: { date: string; count: number }[];
}

export default function LineChart({ data }: LineChartProps) {
  if (!data || data.length === 0) {
    return <div className={styles.noData}>No data available</div>;
  }

  const maxValue = Math.max(...data.map((d) => d.count), 1);
  const width = 800;
  const height = 300;
  const padding = 40;

  const xStep = (width - padding * 2) / (data.length - 1 || 1);
  const yScale = (height - padding * 2) / maxValue;

  const points = data.map((item, index) => {
    const x = padding + index * xStep;
    const y = height - padding - item.count * yScale;
    return { x, y, ...item };
  });

  const pathData = points
    .map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      return `L ${point.x} ${point.y}`;
    })
    .join(" ");

  return (
    <div className={styles.lineChartContainer}>
      <svg viewBox={`0 0 ${width} ${height}`} className={styles.lineChart}>
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = padding + ((height - padding * 2) / 4) * i;
          return (
            <line
              key={i}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          );
        })}

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke="#4F46E5"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="5"
            fill="#4F46E5"
            stroke="white"
            strokeWidth="2"
          />
        ))}

        {/* X-axis labels */}
        {points.map((point, index) => {
          if (index % Math.ceil(points.length / 10) === 0) {
            return (
              <text
                key={index}
                x={point.x}
                y={height - 10}
                textAnchor="middle"
                fontSize="12"
                fill="#6B7280"
              >
                {new Date(point.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </text>
            );
          }
          return null;
        })}

        {/* Y-axis labels */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = padding + ((height - padding * 2) / 4) * i;
          const value = Math.round(maxValue - (maxValue / 4) * i);
          return (
            <text
              key={i}
              x={20}
              y={y + 5}
              textAnchor="middle"
              fontSize="12"
              fill="#6B7280"
            >
              {value}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
