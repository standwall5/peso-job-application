// src/lib/utils/export.ts

import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import "jspdf-autotable";
import type { CellHookData } from "jspdf-autotable";

// Extend jsPDF type to include autoTable
interface AutoTableStyles {
  fontSize?: number;
  cellPadding?: number;
  fillColor?: number[];
  textColor?: number | number[];
  fontStyle?: string;
}

interface AutoTableMargin {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: {
      head?: (string | number | { [key: string]: any })[][];
      body?: (string | number)[][];
      startY?: number;
      styles?: AutoTableStyles;
      headStyles?: AutoTableStyles;
      alternateRowStyles?: AutoTableStyles;
      margin?: AutoTableMargin;
      columnStyles?: {
        [key: number]: AutoTableStyles & {
          cellWidth?: number;
          halign?: string;
        };
      };
      didParseCell?: (data: CellHookData) => void;
    }) => jsPDF;
    lastAutoTable?: { finalY: number };
  }
}

export interface ExportData {
  headers: string[];
  rows: (string | number)[][];
  title?: string;
  filename?: string;
}

export interface ChartExportData {
  title: string;
  data: {
    label: string;
    value: number;
  }[];
}

/**
 * Export data to Excel (XLSX) format using ExcelJS
 */
export const exportToXLSX = async (data: ExportData) => {
  const { headers, rows, filename = "export" } = data;

  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Data");

  // Add headers
  worksheet.addRow(headers);

  // Style headers
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF3498DB" },
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };

  // Add data rows
  rows.forEach((row) => {
    worksheet.addRow(row);
  });

  // Auto-size columns
  worksheet.columns.forEach((column, index) => {
    let maxLength = headers[index]?.toString().length || 10;
    rows.forEach((row) => {
      const cellLength = row[index]?.toString().length || 0;
      if (cellLength > maxLength) {
        maxLength = cellLength;
      }
    });
    column.width = Math.min(maxLength + 2, 50);
  });

  // Add borders to all cells
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // Generate and download file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Export data to CSV format
 */
export const exportToCSV = (data: ExportData) => {
  const { headers, rows, filename = "export" } = data;

  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) => {
          // Escape quotes and wrap in quotes if contains comma
          const cellStr = String(cell);
          if (
            cellStr.includes(",") ||
            cellStr.includes('"') ||
            cellStr.includes("\n")
          ) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(",")
    ),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export data to PDF format
 */
export const exportToPDF = (data: ExportData) => {
  const { headers, rows, title = "Report", filename = "export" } = data;

  // Create PDF document
  const doc = new jsPDF({
    orientation: headers.length > 5 ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });

  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 20);

  // Add date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

  // Add table
  doc.autoTable({
    head: [headers],
    body: rows,
    startY: 35,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [52, 152, 219],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: 35 },
  });

  // Save PDF
  doc.save(`${filename}.pdf`);
};

/**
 * Export chart data to Excel with formatting
 */
export const exportChartToXLSX = async (chartData: ChartExportData) => {
  const { title, data } = chartData;

  const headers = ["Label", "Value"];
  const rows = data.map((item) => [item.label, item.value]);

  await exportToXLSX({
    headers,
    rows,
    title,
    filename: title.toLowerCase().replace(/\s+/g, "_"),
  });
};

/**
 * Export multiple sheets to Excel using ExcelJS
 */
export const exportMultipleToXLSX = async (
  sheets: { name: string; data: ExportData }[],
  filename = "multi_sheet_export"
) => {
  const workbook = new ExcelJS.Workbook();

  sheets.forEach(({ name, data }) => {
    const { headers, rows } = data;
    const worksheet = workbook.addWorksheet(name.substring(0, 31));

    // Add headers
    worksheet.addRow(headers);

    // Style headers
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF3498DB" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };

    // Add data rows
    rows.forEach((row) => {
      worksheet.addRow(row);
    });

    // Auto-size columns
    worksheet.columns.forEach((column, index) => {
      let maxLength = headers[index]?.toString().length || 10;
      rows.forEach((row) => {
        const cellLength = row[index]?.toString().length || 0;
        if (cellLength > maxLength) {
          maxLength = cellLength;
        }
      });
      column.width = Math.min(maxLength + 2, 50);
    });

    // Add borders to all cells
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });
  });

  // Generate and download file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Export comprehensive report to PDF with multiple sections
 */
export const exportComprehensiveReportToPDF = (sections: {
  title: string;
  stats?: { label: string; value: string | number }[];
  tables?: ExportData[];
  charts?: ChartExportData[];
}) => {
  const { title, stats, tables, charts } = sections;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let currentY = 20;

  // Title
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, currentY);
  currentY += 10;

  // Date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, currentY);
  currentY += 15;

  // Stats section
  if (stats && stats.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Overview Statistics", 14, currentY);
    currentY += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    stats.forEach((stat) => {
      doc.text(`${stat.label}: ${stat.value}`, 20, currentY);
      currentY += 6;
    });
    currentY += 5;
  }

  // Tables section
  if (tables && tables.length > 0) {
    tables.forEach((table) => {
      // Check if we need a new page
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      if (table.title) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(table.title, 14, currentY);
        currentY += 8;
      }

      doc.autoTable({
        head: [table.headers],
        body: table.rows,
        startY: currentY,
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [52, 152, 219],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });

      currentY = (doc.lastAutoTable?.finalY ?? currentY) + 10;
    });
  }

  // Charts section (as data tables)
  if (charts && charts.length > 0) {
    charts.forEach((chart) => {
      // Check if we need a new page
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(chart.title, 14, currentY);
      currentY += 8;

      const chartHeaders = ["Label", "Value"];
      const chartRows = chart.data.map((item) => [item.label, item.value]);

      doc.autoTable({
        head: [chartHeaders],
        body: chartRows,
        startY: currentY,
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [52, 152, 219],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });

      currentY = (doc.lastAutoTable?.finalY ?? currentY) + 10;
    });
  }

  doc.save(`${title.toLowerCase().replace(/\s+/g, "_")}.pdf`);
};

/**
 * Format date for export
 */
export const formatDateForExport = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Format number for export
 */
export const formatNumberForExport = (num: number, decimals = 2): string => {
  return num.toFixed(decimals);
};

// Update your export utilities to handle the table format for summary tables

// Add this new interface for summary table exports
interface SummaryTableExportData {
  title: string;
  data: {
    label: string;
    paranaque: {
      male: number;
      female: number;
      other: number;
      total: number;
    };
    nonParanaque: {
      male: number;
      female: number;
      other: number;
      total: number;
    };
    grandTotal: {
      male: number;
      female: number;
      other: number;
      total: number;
    };
  }[];
}

// New function for summary table Excel export using ExcelJS only
export async function exportSummaryTableToXLSX(
  summaryData: SummaryTableExportData,
  filename: string
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Summary");

  // Prepare header
  const headers = [
    summaryData.title.includes("Age") ? "AGE" : "APPLICANT TYPE",
    "PARAÑAQUE Male",
    "PARAÑAQUE Female",
    "PARAÑAQUE Total",
    "NON-PARAÑAQUE Male",
    "NON-PARAÑAQUE Female",
    "NON-PARAÑAQUE Total",
    "GRAND TOTAL Male",
    "GRAND TOTAL Female",
    "GRAND TOTAL Total",
  ];
  worksheet.addRow(headers);
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF3498DB" },
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };

  // Add data rows
  summaryData.data.forEach((row) => {
    worksheet.addRow([
      row.label,
      row.paranaque.male,
      row.paranaque.female,
      row.paranaque.total,
      row.nonParanaque.male,
      row.nonParanaque.female,
      row.nonParanaque.total,
      row.grandTotal.male,
      row.grandTotal.female,
      row.grandTotal.total,
    ]);
  });
  // Add totals row
  worksheet.addRow([
    "TOTAL",
    summaryData.data.reduce((sum, row) => sum + row.paranaque.male, 0),
    summaryData.data.reduce((sum, row) => sum + row.paranaque.female, 0),
    summaryData.data.reduce((sum, row) => sum + row.paranaque.total, 0),
    summaryData.data.reduce((sum, row) => sum + row.nonParanaque.male, 0),
    summaryData.data.reduce((sum, row) => sum + row.nonParanaque.female, 0),
    summaryData.data.reduce((sum, row) => sum + row.nonParanaque.total, 0),
    summaryData.data.reduce((sum, row) => sum + row.grandTotal.male, 0),
    summaryData.data.reduce((sum, row) => sum + row.grandTotal.female, 0),
    summaryData.data.reduce((sum, row) => sum + row.grandTotal.total, 0),
  ]);

  // Auto-size columns
  worksheet.columns.forEach((column, index) => {
    let maxLength = headers[index]?.toString().length || 10;
    worksheet.eachRow((row, rowNumber) => {
      const cellLength = row.getCell(index + 1).value?.toString().length || 0;
      if (cellLength > maxLength) {
        maxLength = cellLength;
      }
    });
    column.width = Math.min(maxLength + 2, 50);
  });

  // Add borders to all cells
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // Generate and download file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}

// New function for summary table CSV export
export function exportSummaryTableToCSV(
  summaryData: SummaryTableExportData,
  filename: string
) {
  const labelType = summaryData.title.includes("Age")
    ? "AGE"
    : "APPLICANT TYPE";

  let csvContent = `${labelType},PARAÑAQUE Male,PARAÑAQUE Female,PARAÑAQUE Total,NON-PARAÑAQUE Male,NON-PARAÑAQUE Female,NON-PARAÑAQUE Total,GRAND TOTAL Male,GRAND TOTAL Female,GRAND TOTAL Total\n`;

  // Calculate totals
  const totals = {
    paranaque: {
      male: summaryData.data.reduce((sum, row) => sum + row.paranaque.male, 0),
      female: summaryData.data.reduce(
        (sum, row) => sum + row.paranaque.female,
        0
      ),
      total: summaryData.data.reduce(
        (sum, row) => sum + row.paranaque.total,
        0
      ),
    },
    nonParanaque: {
      male: summaryData.data.reduce(
        (sum, row) => sum + row.nonParanaque.male,
        0
      ),
      female: summaryData.data.reduce(
        (sum, row) => sum + row.nonParanaque.female,
        0
      ),
      total: summaryData.data.reduce(
        (sum, row) => sum + row.nonParanaque.total,
        0
      ),
    },
    grandTotal: {
      male: summaryData.data.reduce((sum, row) => sum + row.grandTotal.male, 0),
      female: summaryData.data.reduce(
        (sum, row) => sum + row.grandTotal.female,
        0
      ),
      total: summaryData.data.reduce(
        (sum, row) => sum + row.grandTotal.total,
        0
      ),
    },
  };

  summaryData.data.forEach((row) => {
    csvContent += `${row.label},${row.paranaque.male},${row.paranaque.female},${row.paranaque.total},${row.nonParanaque.male},${row.nonParanaque.female},${row.nonParanaque.total},${row.grandTotal.male},${row.grandTotal.female},${row.grandTotal.total}\n`;
  });

  // Add totals
  csvContent += `TOTAL,${totals.paranaque.male},${totals.paranaque.female},${totals.paranaque.total},${totals.nonParanaque.male},${totals.nonParanaque.female},${totals.nonParanaque.total},${totals.grandTotal.male},${totals.grandTotal.female},${totals.grandTotal.total}\n`;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
}

// New function for summary table PDF export
export function exportSummaryTableToPDF(
  summaryData: SummaryTableExportData,
  filename: string
) {
  const doc = new jsPDF("landscape");

  const labelType = summaryData.title.includes("Age")
    ? "AGE"
    : "APPLICANT TYPE";

  // Add title
  doc.setFontSize(16);
  doc.text(summaryData.title, 14, 15);

  // Calculate totals
  const totals = {
    paranaque: {
      male: summaryData.data.reduce((sum, row) => sum + row.paranaque.male, 0),
      female: summaryData.data.reduce(
        (sum, row) => sum + row.paranaque.female,
        0
      ),
      total: summaryData.data.reduce(
        (sum, row) => sum + row.paranaque.total,
        0
      ),
    },
    nonParanaque: {
      male: summaryData.data.reduce(
        (sum, row) => sum + row.nonParanaque.male,
        0
      ),
      female: summaryData.data.reduce(
        (sum, row) => sum + row.nonParanaque.female,
        0
      ),
      total: summaryData.data.reduce(
        (sum, row) => sum + row.nonParanaque.total,
        0
      ),
    },
    grandTotal: {
      male: summaryData.data.reduce((sum, row) => sum + row.grandTotal.male, 0),
      female: summaryData.data.reduce(
        (sum, row) => sum + row.grandTotal.female,
        0
      ),
      total: summaryData.data.reduce(
        (sum, row) => sum + row.grandTotal.total,
        0
      ),
    },
  };

  // Prepare table data
  const tableData = summaryData.data.map((row) => [
    row.label,
    row.paranaque.male,
    row.paranaque.female,
    row.paranaque.total,
    row.nonParanaque.male,
    row.nonParanaque.female,
    row.nonParanaque.total,
    row.grandTotal.male,
    row.grandTotal.female,
    row.grandTotal.total,
  ]);

  // Add totals row
  tableData.push([
    "TOTAL",
    totals.paranaque.male,
    totals.paranaque.female,
    totals.paranaque.total,
    totals.nonParanaque.male,
    totals.nonParanaque.female,
    totals.nonParanaque.total,
    totals.grandTotal.male,
    totals.grandTotal.female,
    totals.grandTotal.total,
  ]);

  doc.autoTable({
    startY: 25,
    head: [
      [
        {
          content: labelType,
          rowSpan: 2,
          styles: { halign: "center", valign: "middle" },
        },
        {
          content: "PARAÑAQUE",
          colSpan: 3,
          styles: { halign: "center", fillColor: [212, 237, 218] },
        },
        {
          content: "NON-PARAÑAQUE",
          colSpan: 3,
          styles: { halign: "center", fillColor: [209, 236, 241] },
        },
        {
          content: "GRAND TOTAL",
          colSpan: 3,
          styles: { halign: "center", fillColor: [248, 215, 218] },
        },
      ],
      [
        "Male",
        "Female",
        "Total",
        "Male",
        "Female",
        "Total",
        "Male",
        "Female",
        "Total",
      ],
    ],
    body: tableData,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [233, 236, 239],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 30 },
      1: { halign: "center", cellWidth: 20 },
      2: { halign: "center", cellWidth: 20 },
      3: { halign: "center", cellWidth: 20, fontStyle: "bold" },
      4: { halign: "center", cellWidth: 20 },
      5: { halign: "center", cellWidth: 20 },
      6: { halign: "center", cellWidth: 20, fontStyle: "bold" },
      7: { halign: "center", cellWidth: 20 },
      8: { halign: "center", cellWidth: 20 },
      9: { halign: "center", cellWidth: 20, fontStyle: "bold" },
    },
    didParseCell: function (data: CellHookData) {
      // Make the totals row bold
      if (data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [248, 249, 250];
      }
    },
  });

  doc.save(`${filename}.pdf`);
}
