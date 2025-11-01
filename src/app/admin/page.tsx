import React from "react";
import DashboardStats from "./components/DashboardStats";
import DashboardChart from "./components/DashboardChart";
import styles from "./components/Dashboard.module.css";

const page = () => {
  return (
    <div className={styles.dashboardContainer}>
      <DashboardStats />
      <DashboardChart />
    </div>
  );
};

export default page;
