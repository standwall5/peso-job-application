# Export Dependencies Installation

## Required Packages

To enable the export functionality (XLSX, CSV, PDF) for Reports & Analytics, you need to install the following packages:

## Installation Commands

Run these commands in your project root directory:

```bash
npm install exceljs jspdf jspdf-autotable
```

OR if using yarn:

```bash
yarn add exceljs jspdf jspdf-autotable
```

OR if using pnpm:

```bash
pnpm add exceljs jspdf jspdf-autotable
```

## Package Details

### 1. **exceljs**
- **Purpose**: Excel file generation and parsing (secure alternative to xlsx)
- **Version**: Latest stable
- **Used for**: Creating `.xlsx` files with advanced formatting
- **Documentation**: https://github.com/exceljs/exceljs
- **Security**: No known vulnerabilities, actively maintained
- **Features**: Better formatting, styles, borders, colors

### 2. **jspdf**
- **Purpose**: PDF generation
- **Version**: Latest stable
- **Used for**: Creating PDF documents
- **Documentation**: https://github.com/parallax/jsPDF

### 3. **jspdf-autotable**
- **Purpose**: Table generation for jsPDF
- **Version**: Latest stable
- **Used for**: Creating formatted tables in PDF reports
- **Documentation**: https://github.com/simonbengtsson/jsPDF-AutoTable

## Why ExcelJS Instead of xlsx?

We use **ExcelJS** instead of the popular `xlsx` (SheetJS) library because:

✅ **No Security Vulnerabilities** - ExcelJS has no known CVEs
✅ **Better Formatting** - Supports colors, borders, fonts, alignment
✅ **Actively Maintained** - Regular updates and bug fixes
✅ **TypeScript Support** - Built-in TypeScript definitions
✅ **Professional Output** - More control over cell styling

**Note**: The `xlsx` package has known security issues:
- CVE: Prototype Pollution (GHSA-4r6h-8v6p-xvw6)
- CVE: Regular Expression Denial of Service (GHSA-5pgg-2g8v-p4x9)

## Type Definitions

TypeScript definitions are included with these packages. No additional installation needed.

## Verification

After installation, verify the packages are installed by checking your `package.json`:

```json
{
  "dependencies": {
    "exceljs": "^4.4.0",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.0"
  }
}
```

## Usage

Once installed, the export functionality will be available in:
- `/admin/reports` - Main Reports & Analytics page

### Export Formats

1. **Excel (.xlsx)**: Multi-sheet workbook with styled headers and borders
2. **CSV (.csv)**: Plain text format for Popular Jobs data
3. **PDF (.pdf)**: Comprehensive formatted report with all sections

## Troubleshooting

### Module Not Found Error
If you see `Module not found: Can't resolve 'exceljs'`:
- Make sure you ran the install command
- Restart your development server: `npm run dev`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### TypeScript Errors
If you see type errors:
- Restart your TypeScript server in your IDE
- Clear .next folder: `rm -rf .next`

### Build Errors
If you encounter build errors:
- Clear your `.next` folder: `rm -rf .next`
- Reinstall dependencies: `npm install`
- Rebuild: `npm run build`

### Audit Warnings
If `npm audit` shows warnings:
- ExcelJS should have no vulnerabilities
- jsPDF may show low-severity warnings (these are acceptable)
- Run `npm audit fix` if needed (without --force)

## File Structure

After implementation, you should have:

```
src/
├── lib/
│   └── utils/
│       └── export.ts              # Export utility functions
└── app/
    └── admin/
        └── reports/
            └── components/
                ├── ExportButton.tsx      # Export dropdown button
                └── ReportsContent.tsx    # Updated with export handlers
```

## Testing

To test the export functionality:

1. Navigate to `/admin/reports`
2. Click the "Export" button in the top right
3. Select a format (XLSX, CSV, or PDF)
4. The file should download automatically

## Features

### Excel Export (ExcelJS)
- Multiple sheets with organized data
- Styled headers (blue background, white text, bold)
- Auto-sized columns
- Cell borders for professional appearance
- All statistics and tables included
- Better formatting than xlsx library

### CSV Export
- Compatible with all spreadsheet applications
- UTF-8 encoding
- Properly escaped values
- No dependencies on xlsx

### PDF Export
- Professional formatting
- Tables with alternating row colors
- Page headers and generation timestamp
- Automatic page breaks

## Performance

- **ExcelJS**: Slightly slower than xlsx but more features
- **File Size**: Similar to xlsx output
- **Memory**: Efficient, handles large datasets
- **Browser Support**: All modern browsers

## Next Steps

After installing dependencies:
1. Run `npm install exceljs jspdf jspdf-autotable`
2. Remove old xlsx package: `npm uninstall xlsx`
3. Restart your development server: `npm run dev`
4. Navigate to the Reports page
5. Test each export format
6. Verify downloaded files open correctly

## Security Best Practices

✅ Use ExcelJS (secure) instead of xlsx (vulnerable)
✅ Keep packages updated: `npm update`
✅ Run regular audits: `npm audit`
✅ Check for updates: `npm outdated`

## Notes

- Large datasets may take a few seconds to export
- Excel generation is done client-side (no server required)
- All exports happen in the browser
- No data is sent to external servers
- ExcelJS provides better formatting than xlsx