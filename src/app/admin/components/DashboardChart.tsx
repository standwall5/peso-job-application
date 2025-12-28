"use client";

import React, { useState, useEffect } from "react";
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
import {
  getMonthlyApplicationDataAction,
  getMonthlyReferralDataAction,
  getAvailableYearsAction,
} from "@/app/admin/actions/dashboard.actions";
import OneEightyRing from "@/components/OneEightyRing";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
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
        backgroundColor: "#2bb3a8",
        stack: "Stack 0",
      },
      {
        label: "Referrals",
        data: referralsData,
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
          weight: "bold" as const,
        },
        formatter: function (value: number) {
          return value || "";
        },
      },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true },
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
      <Bar data={data} options={options} />
      <p style={{ marginTop: "1rem" }}>Application & Referral Reports</p>
    </div>
  );
};

export default DashboardChart;
