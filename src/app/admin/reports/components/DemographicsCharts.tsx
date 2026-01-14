"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import styles from "./Reports.module.css";
import SectionExportButton from "./SectionExportButton";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { exportToCSV, exportToPDF } from "@/lib/utils/export";
import {
  AgeSexSummary,
  ApplicantTypeSummary,
} from "@/lib/db/services/analytics.service";
import { APPLICANT_TYPES } from "@/app/(auth)/signup/constants/form.constants";

const AGE_GROUP_ORDER = [
  "15-17",
  "18-19",
  "20-24",
  "25-34",
  "35-44",
  "45-59",
  "60 & above",
];

interface DemographicChartsProps {
  ageSexParanaque: AgeSexSummary[];
  ageSexNonParanaque: AgeSexSummary[];
  typeParanaque: ApplicantTypeSummary[];
  typeNonParanaque: ApplicantTypeSummary[];
}

const DemographicCharts: React.FC<DemographicChartsProps> = ({
  ageSexParanaque,
  ageSexNonParanaque,
  typeParanaque,
  typeNonParanaque,
}) => {
  const orderedAgeSexParanaque = AGE_GROUP_ORDER.map(
    (group) =>
      ageSexParanaque.find((row) => row.ageGroup === group) || {
        ageGroup: group,
        male: 0,
        female: 0,
        other: 0,
        total: 0,
      }
  );

  const orderedAgeSexNonParanaque = AGE_GROUP_ORDER.map(
    (group) =>
      ageSexNonParanaque.find((row) => row.ageGroup === group) || {
        ageGroup: group,
        male: 0,
        female: 0,
        other: 0,
        total: 0,
      }
  );

  const orderedTypeParanaque = APPLICANT_TYPES.map(
    (type) =>
      typeParanaque.find((row) => row.applicantType === type) || {
        applicantType: type,
        male: 0,
        female: 0,
        other: 0,
        total: 0,
      }
  );

  const orderedTypeNonParanaque = APPLICANT_TYPES.map(
    (type) =>
      typeNonParanaque.find((row) => row.applicantType === type) || {
        applicantType: type,
        male: 0,
        female: 0,
        other: 0,
        total: 0,
      }
  );

  const handleExportAgeSex = async (
    format: "xlsx" | "csv" | "pdf",
    _isParanaque: boolean
  ) => {
    const rows = AGE_GROUP_ORDER.map((ageGroup) => {
      const p = orderedAgeSexParanaque.find((r) => r.ageGroup === ageGroup) || {
        male: 0,
        female: 0,
        total: 0,
      };
      const np = orderedAgeSexNonParanaque.find(
        (r) => r.ageGroup === ageGroup
      ) || {
        male: 0,
        female: 0,
        total: 0,
      };
      const grandMale = (p.male || 0) + (np.male || 0);
      const grandFemale = (p.female || 0) + (np.female || 0);
      const grandTotal = (p.total || 0) + (np.total || 0);
      return [
        ageGroup,
        p.male || 0,
        p.female || 0,
        p.total || 0,
        np.male || 0,
        np.female || 0,
        np.total || 0,
        grandMale,
        grandFemale,
        grandTotal,
      ];
    });

    const totalP = {
      male: orderedAgeSexParanaque.reduce((sum, r) => sum + r.male, 0),
      female: orderedAgeSexParanaque.reduce((sum, r) => sum + r.female, 0),
      total: orderedAgeSexParanaque.reduce((sum, r) => sum + r.total, 0),
    };
    const totalNP = {
      male: orderedAgeSexNonParanaque.reduce((sum, r) => sum + r.male, 0),
      female: orderedAgeSexNonParanaque.reduce((sum, r) => sum + r.female, 0),
      total: orderedAgeSexNonParanaque.reduce((sum, r) => sum + r.total, 0),
    };
    const totalGrand = {
      male: totalP.male + totalNP.male,
      female: totalP.female + totalNP.female,
      total: totalP.total + totalNP.total,
    };
    rows.push([
      "TOTAL",
      totalP.male,
      totalP.female,
      totalP.total,
      totalNP.male,
      totalNP.female,
      totalNP.total,
      totalGrand.male,
      totalGrand.female,
      totalGrand.total,
    ]);

    if (format === "xlsx") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Age Bracket Summary");
      sheet.addRow([
        "",
        "PARANAQUE",
        "",
        "",
        "NON-PARANAQUE",
        "",
        "",
        "GRAND TOTAL",
        "",
        "",
      ]);
      sheet.addRow([
        "AGE",
        "Male",
        "Female",
        "Total",
        "Male",
        "Female",
        "Total",
        "Male",
        "Female",
        "Total",
      ]);
      sheet.mergeCells("B1:D1");
      sheet.mergeCells("E1:G1");
      sheet.mergeCells("H1:J1");
      rows.forEach((row) => sheet.addRow(row));
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(2).font = { bold: true };
      sheet.getRow(1).alignment = { horizontal: "center" };
      sheet.getRow(2).alignment = { horizontal: "center" };
      const totalRowIdx = sheet.rowCount;
      sheet.getRow(totalRowIdx).font = { bold: true };
      sheet.getRow(totalRowIdx).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF7F7D0" },
      };
      const buf = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buf]), "age_bracket_summary.xlsx");
      return;
    }

    const headers = [
      "Age",
      "Paranaque Male",
      "Paranaque Female",
      "Paranaque Total",
      "Non-Paranaque Male",
      "Non-Paranaque Female",
      "Non-Paranaque Total",
      "Grand Total Male",
      "Grand Total Female",
      "Grand Total Total",
    ];

    if (format === "csv") {
      exportToCSV({
        headers,
        rows,
        title: "Summary by Age Bracket and Sex",
        filename: "age_sex_summary",
      });
      return;
    }

    exportToPDF({
      headers,
      rows,
      title: "Summary by Age Bracket and Sex",
      filename: "age_sex_summary",
    });
  };

  const handleExportType = async (
    format: "xlsx" | "csv" | "pdf",
    _isParanaque: boolean
  ) => {
    const rows = APPLICANT_TYPES.map((type) => {
      const p = orderedTypeParanaque.find((r) => r.applicantType === type) || {
        male: 0,
        female: 0,
        total: 0,
      };
      const np = orderedTypeNonParanaque.find(
        (r) => r.applicantType === type
      ) || {
        male: 0,
        female: 0,
        total: 0,
      };
      const grandMale = (p.male || 0) + (np.male || 0);
      const grandFemale = (p.female || 0) + (np.female || 0);
      const grandTotal = (p.total || 0) + (np.total || 0);
      return [
        type as string,
        p.male || 0,
        p.female || 0,
        p.total || 0,
        np.male || 0,
        np.female || 0,
        np.total || 0,
        grandMale,
        grandFemale,
        grandTotal,
      ];
    });

    const totalP = {
      male: orderedTypeParanaque.reduce((sum, r) => sum + r.male, 0),
      female: orderedTypeParanaque.reduce((sum, r) => sum + r.female, 0),
      total: orderedTypeParanaque.reduce((sum, r) => sum + r.total, 0),
    };
    const totalNP = {
      male: orderedTypeNonParanaque.reduce((sum, r) => sum + r.male, 0),
      female: orderedTypeNonParanaque.reduce((sum, r) => sum + r.female, 0),
      total: orderedTypeNonParanaque.reduce((sum, r) => sum + r.total, 0),
    };
    const totalGrand = {
      male: totalP.male + totalNP.male,
      female: totalP.female + totalNP.female,
      total: totalP.total + totalNP.total,
    };
    rows.push([
      "TOTAL",
      totalP.male,
      totalP.female,
      totalP.total,
      totalNP.male,
      totalNP.female,
      totalNP.total,
      totalGrand.male,
      totalGrand.female,
      totalGrand.total,
    ]);

    if (format === "xlsx") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Applicant Type Summary");
      sheet.addRow([
        "",
        "PARANAQUE",
        "",
        "",
        "NON-PARANAQUE",
        "",
        "",
        "GRAND TOTAL",
        "",
        "",
      ]);
      sheet.addRow([
        "APPLICANT TYPE",
        "Male",
        "Female",
        "Total",
        "Male",
        "Female",
        "Total",
        "Male",
        "Female",
        "Total",
      ]);
      sheet.mergeCells("B1:D1");
      sheet.mergeCells("E1:G1");
      sheet.mergeCells("H1:J1");
      rows.forEach((row) => sheet.addRow(row));
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(2).font = { bold: true };
      sheet.getRow(1).alignment = { horizontal: "center" };
      sheet.getRow(2).alignment = { horizontal: "center" };
      const totalRowIdx = sheet.rowCount;
      sheet.getRow(totalRowIdx).font = { bold: true };
      sheet.getRow(totalRowIdx).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF7F7D0" },
      };
      const buf = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buf]), "applicant_type_summary.xlsx");
      return;
    }

    const headers = [
      "Applicant Type",
      "Paranaque Male",
      "Paranaque Female",
      "Paranaque Total",
      "Non-Paranaque Male",
      "Non-Paranaque Female",
      "Non-Paranaque Total",
      "Grand Total Male",
      "Grand Total Female",
      "Grand Total Total",
    ];

    if (format === "csv") {
      exportToCSV({
        headers,
        rows,
        title: "Summary by Jobseekers Application Type",
        filename: "applicant_type_summary",
      });
      return;
    }

    exportToPDF({
      headers,
      rows,
      title: "Summary by Jobseekers Application Type",
      filename: "applicant_type_summary",
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div className={styles.chartSection}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2>Summary by Age Bracket and Sex - Paranaque Residents</h2>
          <SectionExportButton
            onExport={(format) => handleExportAgeSex(format, false)}
            sectionTitle="Age/Sex Summary"
          />
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={orderedAgeSexParanaque}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="ageGroup"
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "0.375rem",
              }}
            />
            <Legend />
            <Bar dataKey="male" fill="#60a5fa" name="Male" stackId="stack" />
            <Bar
              dataKey="female"
              fill="#f9a8d4"
              name="Female"
              stackId="stack"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartSection}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2>Summary by Age Bracket and Sex - Non-Paranaque Residents</h2>
          <SectionExportButton
            onExport={(format) => handleExportAgeSex(format, false)}
            sectionTitle="Age/Sex Summary (Non-Paranaque)"
          />
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={orderedAgeSexNonParanaque}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="ageGroup"
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "0.375rem",
              }}
            />
            <Legend />
            <Bar dataKey="male" fill="#60a5fa" name="Male" stackId="stack" />
            <Bar
              dataKey="female"
              fill="#f9a8d4"
              name="Female"
              stackId="stack"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartSection}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2>Summary by Jobseekers Application Type - Paranaque Residents</h2>
          <SectionExportButton
            onExport={(format) => handleExportType(format, true)}
            sectionTitle="Application Type Summary (Paranaque)"
          />
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={orderedTypeParanaque}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="applicantType"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "0.375rem",
              }}
            />
            <Legend />
            <Bar dataKey="male" fill="#60a5fa" name="Male" stackId="stack" />
            <Bar
              dataKey="female"
              fill="#f9a8d4"
              name="Female"
              stackId="stack"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartSection}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2>
            Summary by Jobseekers Application Type - Non-Paranaque Residents
          </h2>
          <SectionExportButton
            onExport={(format) => handleExportType(format, false)}
            sectionTitle="Application Type Summary (Non-Paranaque)"
          />
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={orderedTypeNonParanaque}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="applicantType"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "0.375rem",
              }}
            />
            <Legend />
            <Bar dataKey="male" fill="#60a5fa" name="Male" stackId="stack" />
            <Bar
              dataKey="female"
              fill="#f9a8d4"
              name="Female"
              stackId="stack"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DemographicCharts;
