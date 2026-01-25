"use client";

import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  getMonthlyApplicationDataAction,
  getMonthlyReferralDataAction,
  getAvailableYearsAction,
} from "@/app/admin/actions/dashboard.actions";
import OneEightyRing from "@/components/OneEightyRing";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels,
);

const DashboardChart = () => {
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [years, setYears] = useState<number[]>([]);
  const [applicationsData, setApplicationsData] = useState<number[]>([]);
  const [referralsData, setReferralsData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchYears = async () => {
      const availableYears = await getAvailableYearsAction();
      setYears(availableYears);
      if (availableYears.length > 0) {
        setSelectedYear(availableYears[0]); // Most recent year
      }
    };

    fetchYears();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [applications, referrals] = await Promise.all([
          getMonthlyApplicationDataAction(selectedYear),
          getMonthlyReferralDataAction(selectedYear),
        ]);

        setApplicationsData(applications.map((d) => d.applications));
        setReferralsData(referrals.map((d) => d.applications));
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedYear) {
      fetchData();
    }
  }, [selectedYear]);

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
        data: applicationsData,
        borderColor: "#2bb3a8",
        backgroundColor: "rgba(43, 179, 168, 0.1)",
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "#2bb3a8",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        fill: true,
        tension: 0.4,
      },
      {
        label: "Referrals",
        data: referralsData,
        borderColor: "#1278d4",
        backgroundColor: "rgba(18, 120, 212, 0.1)",
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "#1278d4",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 15,
        },
      },
      title: {
        display: true,
        text: "Monthly Application and Referral Trends",
        font: {
          size: 16,
          weight: "bold" as const,
        },
        padding: 20,
      },
      datalabels: {
        display: false, // Disable data labels for cleaner line chart
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: "bold" as const,
        },
        bodyFont: {
          size: 13,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 12,
          },
          precision: 0, // Whole numbers only
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  };

  if (loading) {
    return (
      <div
        style={{
          padding: 24,
          borderRadius: 8,
          height: "30rem",
          width: "70rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <OneEightyRing height={64} width={64} color="var(--accent)" />
      </div>
    );
  }

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
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          style={{ padding: "4px 12px", borderRadius: 4 }}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <Line data={data} options={options} />
      <p style={{ marginTop: "1rem", textAlign: "center", color: "#6b7280" }}>
        Application & Referral Trend Reports
      </p>
    </div>
  );
};

export default DashboardChart;
