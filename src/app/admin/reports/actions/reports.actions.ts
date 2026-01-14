"use server";

import {
  getDashboardStats,
  getApplicationStatusBreakdown,
  getPopularJobs,
  getApplicantDemographics,
  getExamPerformance,
  getApplicationTrends,
  getApplicationTrendsByMonth,
  getCompanyPerformance,
  getAgeSexSummary,
  getApplicantTypeSummary,
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

export async function getApplicantDemographicsAction(
  filterByParanaque: boolean = false
) {
  try {
    return await getApplicantDemographics(filterByParanaque);
  } catch (error) {
    console.error("Failed to get demographics:", error);
    return null;
  }
}

export async function getAgeSexSummaryAction(
  filterByParanaque: boolean = false
) {
  try {
    return await getAgeSexSummary(filterByParanaque);
  } catch (error) {
    console.error("Failed to get age/sex summary:", error);
    return [];
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

export async function getApplicationTrendsByMonthAction(months: number = 12) {
  try {
    return await getApplicationTrendsByMonth(months);
  } catch (error) {
    console.error("Failed to get monthly application trends:", error);
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

export async function getApplicantTypeSummaryAction(
  filterByParanaque: boolean = false
) {
  try {
    return await getApplicantTypeSummary(filterByParanaque);
  } catch (error) {
    console.error("Failed to get applicant type summary:", error);
    return [];
  }
}

export async function getReportsDataAction(timeRange: number = 30) {
  try {
    const [
      stats,
      statusBreakdown,
      popularJobs,
      demographics,
      examPerformance,
      trends,
      companyPerformance,
      ageSexParanaque,
      ageSexAll,
      applicantTypeParanaque,
      applicantTypeAll,
    ] = await Promise.all([
      getDashboardStats(),
      getApplicationStatusBreakdown(),
      getPopularJobs(10),
      getApplicantDemographics(),
      getExamPerformance(),
      getApplicationTrends(timeRange),
      getCompanyPerformance(),
      getAgeSexSummary(true),
      getAgeSexSummary(false),
      getApplicantTypeSummary(true),
      getApplicantTypeSummary(false),
    ]);

    return {
      stats,
      statusBreakdown,
      popularJobs,
      demographics,
      examPerformance,
      trends,
      companyPerformance,
      ageSexParanaque,
      ageSexAll,
      applicantTypeParanaque,
      applicantTypeAll,
    };
  } catch (error) {
    console.error("Failed to get reports data:", error);
    return {
      stats: {
        totalApplicants: 0,
        totalApplications: 0,
        totalJobs: 0,
        totalCompanies: 0,
        pendingApplications: 0,
        activeJobs: 0,
      },
      statusBreakdown: [],
      popularJobs: [],
      demographics: null,
      examPerformance: [],
      trends: [],
      companyPerformance: [],
      ageSexParanaque: [],
      ageSexAll: [],
      applicantTypeParanaque: [],
      applicantTypeAll: [],
    };
  }
}
