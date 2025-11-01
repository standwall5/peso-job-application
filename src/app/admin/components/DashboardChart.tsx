"use client";

import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const yearlyData = {
  2024: {
    applications: [10, 15, 8, 12, 7, 9, 11, 13, 10, 14, 12, 8],
    referrals: [4, 7, 3, 6, 5, 4, 6, 8, 5, 7, 6, 3],
  },
  2025: {
    applications: [12, 19, 3, 5, 2, 3, 7, 8, 6, 9, 10, 4],
    referrals: [5, 9, 2, 8, 6, 4, 3, 7, 5, 6, 8, 2],
  },
};

const years = Object.keys(yearlyData);

const DashboardChart = () => {
  const [selectedYear, setSelectedYear] =
    useState<keyof typeof yearlyData>(2025);

  const data = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Applications",
        data: yearlyData[selectedYear].applications,
        backgroundColor: "#2bb3a8",
        stack: "Stack 0",
      },
      {
        label: "Referrals",
        data: yearlyData[selectedYear].referrals,
        backgroundColor: "#1278d4",
        stack: "Stack 0",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: "Monthly Application and Referral Statistics",
      },
      datalabels: {
        anchor: "end" as const,
        align: "start" as const,
        color: "#d3fff9ff",
        font: {
          weight: "bold",
        },
        formatter: function (value: number) {
          return value;
        },
      },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true },
    },
  };

  return (
    <div
      style={{
        padding: 24,
        borderRadius: 8,
        height: "30rem",
        width: "70rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="year-select" style={{ marginRight: 8 }}>
          Year
        </label>
        <select
          id="year-select"
          value={selectedYear}
          onChange={(e) =>
            setSelectedYear(Number(e.target.value) as keyof typeof yearlyData)
          }
          style={{ padding: "4px 12px", borderRadius: 4 }}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <Bar data={data} options={options} />
      <p style={{ marginTop: "1rem" }}>Referral Reports</p>
    </div>
  );
};

export default DashboardChart;
