"use server";

import {
  getDashboardStats,
  getApplicationStatusBreakdown,
  getPopularJobs,
  getApplicantDemographics,
  getExamPerformance,
  getApplicationTrends,
  getCompanyPerformance,
} from "@/lib/db/services/analytics.service";

export async function getDashboardStatsAction() {
  try {
    return await getDashboardStats();
  } catch (error) {
    console.error("Failed to get dashboard stats:", error);
    return {
      totalApplicants: 0,
      totalApplications: 0,
      totalJobs: 0,
      totalCompanies: 0,
      pendingApplications: 0,
      activeJobs: 0,
    };
  }
}

export async function getApplicationStatusBreakdownAction() {
  try {
    return await getApplicationStatusBreakdown();
  } catch (error) {
    console.error("Failed to get status breakdown:", error);
    return [];
  }
}

export async function getPopularJobsAction(limit: number = 10) {
  try {
    return await getPopularJobs(limit);
  } catch (error) {
    console.error("Failed to get popular jobs:", error);
    return [];
  }
}

export async function getApplicantDemographicsAction() {
  try {
    return await getApplicantDemographics();
  } catch (error) {
    console.error("Failed to get demographics:", error);
    return null;
  }
}

export async function getExamPerformanceAction() {
  try {
    return await getExamPerformance();
  } catch (error) {
    console.error("Failed to get exam performance:", error);
    return [];
  }
}

export async function getApplicationTrendsAction(days: number = 30) {
  try {
    return await getApplicationTrends(days);
  } catch (error) {
    console.error("Failed to get application trends:", error);
    return [];
  }
}

export async function getCompanyPerformanceAction() {
  try {
    return await getCompanyPerformance();
  } catch (error) {
    console.error("Failed to get company performance:", error);
    return [];
  }
}
