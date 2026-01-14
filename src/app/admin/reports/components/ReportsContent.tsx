"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./Reports.module.css";
import { getReportsDataAction } from "../actions/reports.actions";
import {
  DashboardStats,
  ApplicationStatusBreakdown,
  PopularJob,
  ApplicantDemographics,
  ExamPerformance,
  ApplicationTrend,
  CompanyPerformance,
  ApplicantTypeSummary,
  AgeSexSummary,
} from "@/lib/db/services/analytics.service";
import StatsCard from "./StatsCard";
import {
  UsersIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  ClockIcon,
  BuildingOffice2Icon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/solid";
import PieChart from "./PieChart";
import BarChart from "./BarChart";
import LineChart from "./LineChart";
import TableView from "./TableView";
import OneEightyRing from "@/components/OneEightyRing";
import ExportButton from "./ExportButton";
import {
  exportToCSV,
  exportComprehensiveReportToPDF,
  exportMultipleToXLSX,
} from "@/lib/utils/export";

import DemographicCharts from "./DemographicsCharts";

export default function ReportsContent() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statusBreakdown, setStatusBreakdown] = useState<
    ApplicationStatusBreakdown[]
  >([]);
  const [popularJobs, setPopularJobs] = useState<PopularJob[]>([]);
  const [demographics, setDemographics] =
    useState<ApplicantDemographics | null>(null);
  const [examPerformance, setExamPerformance] = useState<ExamPerformance[]>([]);
  const [trends, setTrends] = useState<ApplicationTrend[]>([]);
  const [companyPerformance, setCompanyPerformance] = useState<
    CompanyPerformance[]
  >([]);
  const [ageSexParanaque, setAgeSexParanaque] = useState<AgeSexSummary[]>([]);
  const [ageSexNonParanaque, setAgeSexNonParanaque] = useState<
    AgeSexSummary[]
  >([]);
  const [typeParanaque, setTypeParanaque] = useState<
    ApplicantTypeSummary[]
  >([]);
  const [typeNonParanaque, setTypeNonParanaque] = useState<
    ApplicantTypeSummary[]
  >([]);
  const [timeRange, setTimeRange] = useState(30);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const reportData = await getReportsDataAction(timeRange);

      setStats(reportData.stats);
      setStatusBreakdown(reportData.statusBreakdown);
      setPopularJobs(reportData.popularJobs);
      setDemographics(reportData.demographics);
      setExamPerformance(reportData.examPerformance);
      setTrends(reportData.trends);
      setCompanyPerformance(reportData.companyPerformance);

      setAgeSexParanaque(reportData.ageSexParanaque);
      const ageSexNonP = reportData.ageSexAll.map((all) => {
        const p = reportData.ageSexParanaque.find(
          (row) => row.ageGroup === all.ageGroup
        );
        return {
          ageGroup: all.ageGroup,
          male: all.male - (p?.male || 0),
          female: all.female - (p?.female || 0),
          other: all.other - (p?.other || 0),
          total: all.total - (p?.total || 0),
        };
      });
      setAgeSexNonParanaque(ageSexNonP);

      setTypeParanaque(reportData.applicantTypeParanaque);
      const typeNonP = reportData.applicantTypeAll.map((all) => {
        const p = reportData.applicantTypeParanaque.find(
          (row) => row.applicantType === all.applicantType
        );
        return {
          applicantType: all.applicantType,
          male: all.male - (p?.male || 0),
          female: all.female - (p?.female || 0),
          other: all.other - (p?.other || 0),
          total: all.total - (p?.total || 0),
        };
      });
      setTypeNonParanaque(typeNonP);
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleExport = async (format: "xlsx" | "csv" | "pdf") => {
    if (format === "pdf") {
      exportComprehensiveReport();
    } else if (format === "xlsx") {
      await exportAllDataToExcel();
    } else if (format === "csv") {
      exportAllDataToCSV();
    }
  };

  const exportComprehensiveReport = () => {
    const statsData = [
      { label: "Total Applicants", value: stats?.totalApplicants || 0 },
      { label: "Total Applications", value: stats?.totalApplications || 0 },
      { label: "Active Jobs", value: stats?.activeJobs || 0 },
      { label: "Pending Applications", value: stats?.pendingApplications || 0 },
      { label: "Total Companies", value: stats?.totalCompanies || 0 },
      { label: "Total Jobs Posted", value: stats?.totalJobs || 0 },
    ];

    const tables = [
      {
        title: "Application Status Distribution",
        headers: ["Status", "Count"],
        rows: statusBreakdown.map((item) => [item.status, item.count]),
      },
      {
        title: "Most Popular Jobs",
        headers: ["Job Title", "Company", "Applications"],
        rows: popularJobs.map((job) => [
          job.job_title,
          job.company_name,
          job.application_count,
        ]),
      },
      {
        title: "Exam Performance",
        headers: ["Exam Title", "Total Attempts", "Avg Score", "Pass Rate"],
        rows: examPerformance.map((exam) => [
          exam.exam_title,
          exam.total_attempts,
          `${exam.average_score}%`,
          `${exam.pass_rate}%`,
        ]),
      },
      {
        title: "Company Performance",
        headers: [
          "Company",
          "Jobs Posted",
          "Total Applications",
          "Avg per Job",
        ],
        rows: companyPerformance.map((company) => [
          company.company_name,
          company.total_jobs,
          company.total_applications,
          company.avg_applications_per_job,
        ]),
      },
    ];

    const charts = [
      {
        title: "Gender Distribution",
        data: demographics
          ? [
              { label: "Male", value: demographics.sex.male },
              { label: "Female", value: demographics.sex.female },
              { label: "Other", value: demographics.sex.other },
            ]
          : [],
      },
      {
        title: "Applicant Type Distribution",
        data: demographics
          ? [
              { label: "Regular", value: demographics.applicantType.regular },
              { label: "PWD", value: demographics.applicantType.pwd },
              { label: "Senior", value: demographics.applicantType.senior },
              {
                label: "Indigenous",
                value: demographics.applicantType.indigenous,
              },
            ]
          : [],
      },
    ];

    exportComprehensiveReportToPDF({
      title: "PESO Reports & Analytics",
      stats: statsData,
      tables,
      charts,
    });
  };

  const exportAllDataToExcel = async () => {
    const sheets = [
      {
        name: "Overview Stats",
        data: {
          headers: ["Metric", "Value"],
          rows: [
            ["Total Applicants", stats?.totalApplicants || 0],
            ["Total Applications", stats?.totalApplications || 0],
            ["Active Jobs", stats?.activeJobs || 0],
            ["Pending Applications", stats?.pendingApplications || 0],
            ["Total Companies", stats?.totalCompanies || 0],
            ["Total Jobs Posted", stats?.totalJobs || 0],
          ],
        },
      },
      {
        name: "Application Status",
        data: {
          headers: ["Status", "Count"],
          rows: statusBreakdown.map((item) => [item.status, item.count]),
        },
      },
      {
        name: "Popular Jobs",
        data: {
          headers: ["Job Title", "Company", "Applications"],
          rows: popularJobs.map((job) => [
            job.job_title,
            job.company_name,
            job.application_count,
          ]),
        },
      },
      {
        name: "Exam Performance",
        data: {
          headers: ["Exam Title", "Total Attempts", "Avg Score", "Pass Rate"],
          rows: examPerformance.map((exam) => [
            exam.exam_title,
            exam.total_attempts,
            exam.average_score,
            exam.pass_rate,
          ]),
        },
      },
      {
        name: "Company Performance",
        data: {
          headers: [
            "Company",
            "Jobs Posted",
            "Total Applications",
            "Avg per Job",
          ],
          rows: companyPerformance.map((company) => [
            company.company_name,
            company.total_jobs,
            company.total_applications,
            company.avg_applications_per_job,
          ]),
        },
      },
    ];

    await exportMultipleToXLSX(sheets, "peso_reports_analytics");
  };

  const exportAllDataToCSV = () => {
    // Export the main popular jobs table as CSV
    exportToCSV({
      headers: ["Job Title", "Company", "Applications"],
      rows: popularJobs.map((job) => [
        job.job_title,
        job.company_name,
        job.application_count,
      ]),
      filename: "popular_jobs_report",
    });
  };

  if (loading) {
    return (
      <section style={{ alignSelf: "center" }}>
        <OneEightyRing height={64} width={64} color="var(--accent)" />
      </section>
    );
  }

  return (
    <div className={styles.reportsContainer}>
      <div className={styles.header}>
        <h1>Reports & Analytics</h1>
        <div className={styles.filters}>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className={styles.timeRangeSelect}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
          <ExportButton onExport={handleExport} disabled={loading} />
        </div>
      </div>

      {/* Overview Stats */}
      <div className={styles.statsGrid}>
        <StatsCard
          title="Total Applicants"
          value={stats?.totalApplicants || 0}
          icon={<UsersIcon className="h-7 w-7 text-blue-500" />}
          color="blue"
        />
        <StatsCard
          title="Total Applications"
          value={stats?.totalApplications || 0}
          icon={<DocumentTextIcon className="h-7 w-7 text-green-500" />}
          color="green"
        />
        <StatsCard
          title="Active Jobs"
          value={stats?.activeJobs || 0}
          icon={<BriefcaseIcon className="h-7 w-7 text-purple-500" />}
          color="purple"
        />
        <StatsCard
          title="Pending Applications"
          value={stats?.pendingApplications || 0}
          icon={<ClockIcon className="h-7 w-7 text-orange-500" />}
          color="orange"
        />
        <StatsCard
          title="Total Companies"
          value={stats?.totalCompanies || 0}
          icon={<BuildingOffice2Icon className="h-7 w-7 text-red-500" />}
          color="red"
        />
        <StatsCard
          title="Total Jobs Posted"
          value={stats?.totalJobs || 0}
          icon={<ClipboardDocumentListIcon className="h-7 w-7 text-teal-500" />}
          color="teal"
        />
      </div>

      {/* Demographics */}
      <DemographicCharts
        ageSexParanaque={ageSexParanaque}
        ageSexNonParanaque={ageSexNonParanaque}
        typeParanaque={typeParanaque}
        typeNonParanaque={typeNonParanaque}
      />

      {/* Application Status Breakdown */}
      <div className={styles.chartSection}>
        <h2>Application Status Distribution</h2>
        <PieChart data={statusBreakdown} />
      </div>

      {/* Application Trends */}
      <div className={styles.chartSection}>
        <h2>Application Trends</h2>
        <LineChart data={trends} />
      </div>

      {/* Popular Jobs */}
      <div className={styles.chartSection}>
        <h2>Most Popular Jobs</h2>
        <BarChart
          data={popularJobs.map((job) => ({
            label: job.job_title,
            value: job.application_count,
          }))}
        />
        <TableView
          headers={["Job Title", "Company", "Applications"]}
          rows={popularJobs.map((job) => [
            job.job_title,
            job.company_name,
            job.application_count,
          ])}
        />
      </div>

      {/* Demographics */}
      {demographics && (
        <>
          <div className={styles.chartSection}>
            <h2>Applicant Demographics - Gender</h2>
            <PieChart
              data={[
                { status: "Male", count: demographics.sex.male },
                { status: "Female", count: demographics.sex.female },
                { status: "Other", count: demographics.sex.other },
              ]}
            />
          </div>

          <div className={styles.chartSection}>
            <h2>Applicant Type Distribution</h2>
            <BarChart
              data={[
                { label: "Regular", value: demographics.applicantType.regular },
                { label: "PWD", value: demographics.applicantType.pwd },
                { label: "Senior", value: demographics.applicantType.senior },
                {
                  label: "Indigenous",
                  value: demographics.applicantType.indigenous,
                },
              ]}
            />
          </div>

          <div className={styles.chartSection}>
            <h2>Age Distribution</h2>
            <BarChart
              data={Object.entries(demographics.ageGroups).map(
                ([range, count]) => ({
                  label: range,
                  value: count as number,
                })
              )}
            />
          </div>
        </>
      )}

      {/* Exam Performance */}
      <div className={styles.chartSection}>
        <h2>Exam Performance</h2>
        <TableView
          headers={["Exam Title", "Total Attempts", "Avg Score", "Pass Rate"]}
          rows={examPerformance.map((exam) => [
            exam.exam_title,
            exam.total_attempts,
            `${exam.average_score}%`,
            `${exam.pass_rate}%`,
          ])}
        />
      </div>

      {/* Company Performance */}
      <div className={styles.chartSection}>
        <h2>Company Performance</h2>
        <TableView
          headers={[
            "Company",
            "Jobs Posted",
            "Total Applications",
            "Avg per Job",
          ]}
          rows={companyPerformance.map((company) => [
            company.company_name,
            company.total_jobs,
            company.total_applications,
            company.avg_applications_per_job,
          ])}
        />
      </div>
    </div>
  );
}
