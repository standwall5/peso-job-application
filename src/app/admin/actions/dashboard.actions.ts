"use server";

import {
  getDashboardOverview,
  getMonthlyApplicationData,
  getMonthlyReferralData,
  getAvailableYears,
} from "@/lib/db/services/dashboard.service";

export async function getDashboardOverviewAction() {
  try {
    return await getDashboardOverview();
  } catch (error) {
    console.error("Failed to get dashboard overview:", error);
    return {
      totalJobseekers: 0,
      totalApplications: 0,
      totalCompanies: 0,
      totalJobsListed: 0,
    };
  }
}

export async function getMonthlyApplicationDataAction(year: number) {
  try {
    return await getMonthlyApplicationData(year);
  } catch (error) {
    console.error("Failed to get monthly application data:", error);
    return [];
  }
}

export async function getMonthlyReferralDataAction(year: number) {
  try {
    return await getMonthlyReferralData(year);
  } catch (error) {
    console.error("Failed to get monthly referral data:", error);
    return [];
  }
}

export async function getAvailableYearsAction() {
  try {
    return await getAvailableYears();
  } catch (error) {
    console.error("Failed to get available years:", error);
    return [new Date().getFullYear()];
  }
}
