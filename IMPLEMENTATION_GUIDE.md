# IMPLEMENTATION GUIDE - Remaining Features

## Overview
This guide provides detailed implementation instructions for all pending features in the PESO Job Application System. Each section includes database changes, API routes, components, and testing steps.

---

## 🔧 FEATURE 1: Admin Profile Pictures

### Priority: MEDIUM
### Estimated Time: 2-3 hours
### Complexity: Low-Medium

---

### 1.1 Database Changes

#### Create Migration File: `migrations/add_admin_profile_picture.sql`

```sql
-- Add profile_picture_url column to admins table
ALTER TABLE admins 
ADD COLUMN profile_picture_url TEXT;

-- Create storage bucket for admin profile pictures (run in Supabase Dashboard > Storage)
-- Bucket name: admin-profiles
-- Settings: Private, Max file size: 5MB

-- Create storage policy for admin profile pictures
CREATE POLICY "Admins can upload their own profile pictures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'admin-profiles' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view their own profile pictures"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'admin-profiles');

CREATE POLICY "Admins can update their own profile pictures"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'admin-profiles'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can delete their own profile pictures"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'admin-profiles'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

### 1.2 API Route: Upload Profile Picture

#### File: `src/app/api/admin/profile-picture/route.ts`

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get current admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get admin record
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("id, profile_picture_url")
      .eq("user_id", user.id)
      .single();

    if (adminError || !admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Delete old profile picture if exists
    if (admin.profile_picture_url) {
      const oldPath = admin.profile_picture_url.split("/").pop();
      if (oldPath) {
        await supabase.storage
          .from("admin-profiles")
          .remove([`${user.id}/${oldPath}`]);
      }
    }

    // Upload new file
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("admin-profiles")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("admin-profiles")
      .getPublicUrl(filePath);

    // Update admin record
    const { error: updateError } = await supabase
      .from("admins")
      .update({ profile_picture_url: urlData.publicUrl })
      .eq("id", admin.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("id, profile_picture_url")
      .eq("user_id", user.id)
      .single();

    if (adminError || !admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    if (admin.profile_picture_url) {
      const oldPath = admin.profile_picture_url.split("/").pop();
      if (oldPath) {
        await supabase.storage
          .from("admin-profiles")
          .remove([`${user.id}/${oldPath}`]);
      }
    }

    const { error: updateError } = await supabase
      .from("admins")
      .update({ profile_picture_url: null })
      .eq("id", admin.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to remove profile picture" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

### 1.3 Component: Profile Picture Upload

#### File: `src/app/admin/components/ProfilePictureUpload.tsx`

```typescript
"use client";

import React, { useState, useRef } from "react";
import styles from "./ProfilePictureUpload.module.css";
import Image from "next/image";

interface ProfilePictureUploadProps {
  currentPictureUrl?: string | null;
  onUploadSuccess?: (url: string) => void;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentPictureUrl,
  onUploadSuccess,
}) => {
  const [preview, setPreview] = useState<string | null>(currentPictureUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Only JPG, PNG, and WebP are allowed.");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File too large. Maximum size is 5MB.");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/profile-picture", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload");
      }

      setPreview(data.url);
      if (onUploadSuccess) {
        onUploadSuccess(data.url);
      }
      
      // Show success message
      alert("Profile picture updated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm("Are you sure you want to remove your profile picture?")) {
      return;
    }

    setUploading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/profile-picture", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove picture");
      }

      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      alert("Profile picture removed successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.preview}>
        {preview ? (
          <img
            src={preview}
            alt="Profile preview"
            className={styles.previewImage}
          />
        ) : (
          <div className={styles.placeholder}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={styles.placeholderIcon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className={styles.fileInput}
          disabled={uploading}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className={styles.button}
          disabled={uploading}
        >
          {preview ? "Change Picture" : "Upload Picture"}
        </button>

        {preview && (
          <>
            <button
              onClick={handleUpload}
              className={`${styles.button} ${styles.buttonPrimary}`}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Save"}
            </button>

            <button
              onClick={handleRemove}
              className={`${styles.button} ${styles.buttonDanger}`}
              disabled={uploading}
            >
              Remove
            </button>
          </>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}
      
      <p className={styles.hint}>
        Accepted formats: JPG, PNG, WebP. Max size: 5MB.
      </p>
    </div>
  );
};
```

---

### 1.4 CSS File: Profile Picture Upload Styles

#### File: `src/app/admin/components/ProfilePictureUpload.module.css`

```css
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
}

.preview {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--accent);
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.previewImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
}

.placeholderIcon {
  width: 4rem;
  height: 4rem;
  color: #9ca3af;
}

.controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.fileInput {
  display: none;
}

.button {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.button:hover:not(:disabled) {
  background: #f9fafb;
  border-color: var(--accent);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.buttonPrimary {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.buttonPrimary:hover:not(:disabled) {
  background: #059669;
}

.buttonDanger {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.buttonDanger:hover:not(:disabled) {
  background: #dc2626;
}

.error {
  color: #ef4444;
  font-size: 0.875rem;
  margin: 0;
}

.hint {
  color: #6b7280;
  font-size: 0.75rem;
  margin: 0;
  text-align: center;
}
```

---

### 1.5 Update Header Component

#### File: `src/app/admin/components/Header.tsx` (Update existing)

Add this after the existing imports:
```typescript
import { ProfilePictureUpload } from "./ProfilePictureUpload";
```

Add state for profile modal:
```typescript
const [showProfileModal, setShowProfileModal] = useState(false);
const [profilePicture, setProfilePicture] = useState<string | null>(null);
```

Add this button in the headerActions section:
```typescript
<ActionButton
  onClick={() => setShowProfileModal(true)}
  icon={
    profilePicture ? (
      <img 
        src={profilePicture} 
        alt="Profile" 
        style={{ 
          width: "2rem", 
          height: "2rem", 
          borderRadius: "50%", 
          objectFit: "cover" 
        }} 
      />
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
        />
      </svg>
    )
  }
  variant="outline"
>
  Profile Picture
</ActionButton>
```

Add modal before closing tag:
```typescript
{showProfileModal && (
  <div className={styles.modal}>
    <div className={styles.modalContent}>
      <div className={styles.modalHeader}>
        <h3>Profile Picture</h3>
        <button onClick={() => setShowProfileModal(false)}>×</button>
      </div>
      <ProfilePictureUpload
        currentPictureUrl={profilePicture}
        onUploadSuccess={(url) => {
          setProfilePicture(url);
          setShowProfileModal(false);
        }}
      />
    </div>
  </div>
)}
```

---

## 🔧 FEATURE 2: Individual Report Exports

### Priority: MEDIUM
### Estimated Time: 4-6 hours
### Complexity: Medium-High

---

### 2.1 Install Required Package

```bash
npm install xlsx
```

---

### 2.2 Create XLSX Utility

#### File: `src/lib/utils/xlsx-export.ts`

```typescript
import * as XLSX from "xlsx";

interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

interface ExcelOptions {
  title?: string;
  subtitle?: string;
  columns: ExcelColumn[];
  data: any[];
  filename: string;
  includeChart?: boolean;
}

export function exportToExcel(options: ExcelOptions) {
  const { title, subtitle, columns, data, filename } = options;

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws_data: any[][] = [];

  // Add title rows
  let startRow = 0;
  if (title) {
    ws_data.push([title]);
    startRow++;
  }
  if (subtitle) {
    ws_data.push([subtitle]);
    ws_data.push([]); // Empty row
    startRow += 2;
  }

  // Add headers
  ws_data.push(columns.map(col => col.header));

  // Add data rows
  data.forEach(row => {
    ws_data.push(columns.map(col => row[col.key] ?? ""));
  });

  // Create worksheet from data
  const ws = XLSX.utils.aoa_to_sheet(ws_data);

  // Set column widths
  ws["!cols"] = columns.map(col => ({ wch: col.width || 15 }));

  // Style title (bold, larger font)
  if (title && ws["A1"]) {
    ws["A1"].s = {
      font: { bold: true, sz: 16 },
      alignment: { horizontal: "center" },
    };
  }

  // Style subtitle
  if (subtitle && ws["A2"]) {
    ws["A2"].s = {
      font: { italic: true, sz: 12 },
      alignment: { horizontal: "center" },
    };
  }

  // Style header row
  const headerRow = startRow + 1;
  columns.forEach((col, idx) => {
    const cellRef = XLSX.utils.encode_cell({ r: headerRow, c: idx });
    if (ws[cellRef]) {
      ws[cellRef].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "10B981" } },
        alignment: { horizontal: "center" },
      };
    }
  });

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Report");

  // Generate Excel file
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`);
}

// Age & Gender Summary Export
export function exportAgeSexSummary(data: any[], includeParanaque: boolean) {
  const columns: ExcelColumn[] = [
    { header: "Age Bracket", key: "ageBracket", width: 20 },
    { header: "Male", key: "male", width: 15 },
    { header: "Female", key: "female", width: 15 },
    { header: "Other", key: "other", width: 15 },
    { header: "Total", key: "total", width: 15 },
    { header: "Percentage", key: "percentage", width: 15 },
  ];

  const title = "PESO - Age & Gender Summary Report";
  const subtitle = includeParanaque
    ? "Parañaque Residents Only"
    : "All Locations";

  exportToExcel({
    title,
    subtitle,
    columns,
    data,
    filename: "age_gender_summary",
  });
}

// Application Trends Export
export function exportApplicationTrends(data: any[]) {
  const columns: ExcelColumn[] = [
    { header: "Month", key: "month", width: 20 },
    { header: "Applications", key: "applications", width: 15 },
    { header: "Deployed", key: "deployed", width: 15 },
    { header: "Rejected", key: "rejected", width: 15 },
    { header: "In Progress", key: "inProgress", width: 15 },
    { header: "Success Rate", key: "successRate", width: 15 },
  ];

  exportToExcel({
    title: "PESO - Application Trends Report",
    subtitle: `Generated on ${new Date().toLocaleDateString()}`,
    columns,
    data,
    filename: "application_trends",
  });
}

// Employment Status Export
export function exportEmploymentStatus(data: any[]) {
  const columns: ExcelColumn[] = [
    { header: "Status", key: "status", width: 20 },
    { header: "Count", key: "count", width: 15 },
    { header: "Percentage", key: "percentage", width: 15 },
  ];

  exportToExcel({
    title: "PESO - Employment Status Report",
    subtitle: `Generated on ${new Date().toLocaleDateString()}`,
    columns,
    data,
    filename: "employment_status",
  });
}

// Applicant Type Distribution Export
export function exportApplicantTypes(data: any[]) {
  const columns: ExcelColumn[] = [
    { header: "Applicant Type", key: "type", width: 30 },
    { header: "Count", key: "count", width: 15 },
    { header: "Percentage", key: "percentage", width: 15 },
  ];

  exportToExcel({
    title: "PESO - Applicant Type Distribution",
    subtitle: `Generated on ${new Date().toLocaleDateString()}`,
    columns,
    data,
    filename: "applicant_types",
  });
}

// Place of Assignment Export
export function exportPlaceAssignment(data: any[]) {
  const columns: ExcelColumn[] = [
    { header: "Place of Assignment", key: "place", width: 25 },
    { header: "Count", key: "count", width: 15 },
    { header: "Percentage", key: "percentage", width: 15 },
  ];

  exportToExcel({
    title: "PESO - Place of Assignment Summary",
    subtitle: `Generated on ${new Date().toLocaleDateString()}`,
    columns,
    data,
    filename: "place_assignment",
  });
}
```

---

### 2.3 Update Reports Page

#### File: `src/app/admin/reports/components/Reports.tsx` (Add export buttons)

Import the export functions:
```typescript
import {
  exportAgeSexSummary,
  exportApplicationTrends,
  exportEmploymentStatus,
  exportApplicantTypes,
  exportPlaceAssignment,
} from "@/lib/utils/xlsx-export";
```

Add export buttons for each report section:
```typescript
<button
  onClick={() => exportAgeSexSummary(ageSexData, includeParanaque)}
  className={styles.exportButton}
>
  Export Age & Gender Report
</button>

<button
  onClick={() => exportApplicationTrends(trendsData)}
  className={styles.exportButton}
>
  Export Trends Report
</button>

// ... and so on for each report type
```

---

## 🔧 FEATURE 3: Exam System Refactor

### Priority: HIGH
### Estimated Time: 6-8 hours
### Complexity: High

---

### 3.1 Database Changes

#### Create Migration: `migrations/single_exam_system.sql`

```sql
-- Backup existing exams table
CREATE TABLE exams_backup AS SELECT * FROM exams;
CREATE TABLE questions_backup AS SELECT * FROM questions;
CREATE TABLE choices_backup AS SELECT * FROM choices;

-- Create single general exam
INSERT INTO exams (title, description, date_created)
VALUES (
  'General Pre-screening Questions',
  'Standard evaluation questions for all job applications',
  NOW()
)
ON CONFLICT DO NOTHING;

-- Get the general exam ID
DO $$
DECLARE
  general_exam_id INT;
BEGIN
  SELECT id INTO general_exam_id FROM exams WHERE title = 'General Pre-screening Questions' LIMIT 1;

  -- Delete old questions for this exam if any
  DELETE FROM questions WHERE exam_id = general_exam_id;

  -- Insert 5 general questions
  INSERT INTO questions (exam_id, question_text, question_type, position) VALUES
  (general_exam_id, 'How do you prioritize tasks when you have multiple deadlines?', 'mcq', 1),
  (general_exam_id, 'Describe a time when you had to work under pressure. How did you handle it?', 'paragraph', 2),
  (general_exam_id, 'What does professionalism mean to you in the workplace?', 'mcq', 3),
  (general_exam_id, 'How do you ensure clear communication with team members and supervisors?', 'paragraph', 4),
  (general_exam_id, 'Describe your approach to solving unexpected problems at work.', 'paragraph', 5);

  -- Add choices for MCQ questions
  INSERT INTO choices (question_id, choice_text, position)
  SELECT q.id, choice.text, choice.pos
  FROM questions q
  CROSS JOIN LATERAL (
    VALUES
      ('I make a detailed schedule and stick to it', 1),
      ('I work on the most urgent tasks first', 2),
      ('I ask for help when needed', 3),
      ('I work on what interests me most first', 4)
  ) AS choice(text, pos)
  WHERE q.question_text = 'How do you prioritize tasks when you have multiple deadlines?';

  INSERT INTO choices (question_id, choice_text, position)
  SELECT q.id, choice.text, choice.pos
  FROM questions q
  CROSS JOIN LATERAL (
    VALUES
      ('Being respectful and punctual', 1),
      ('Following company rules only', 2),
      ('Maintaining high work quality and ethics', 3),
      ('Getting work done regardless of method', 4)
  ) AS choice(text, pos)
  WHERE q.question_text = 'What does professionalism mean to you in the workplace?';

  -- Update all jobs to use the general exam
  UPDATE jobs SET exam_id = general_exam_id;

  -- Optional: Remove old unused exams (be careful!)
  -- DELETE FROM exams WHERE id != general_exam_id;

END $$;
```

---

### 3.2 Update Exam Component

#### File: `src/app/admin/company-profiles/components/exam/Exam.tsx` (Simplify)

```typescript
"use client";

import React, { useState, useEffect } from "react";
import styles from "./Exams.module.css";

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  position: number;
}

interface ExamProps {
  exam: any;
  fetchExams: () => void;
}

const Exam: React.FC<ExamProps> = ({ exam, fetchExams }) => {
  const [questions, setQuestions] = useState<Question[]>(exam?.questions || []);
  const [editMode, setEditMode] = useState(false);

  const maxQuestions = 5;

  useEffect(() => {
    if (exam?.questions) {
      setQuestions(exam.questions);
    }
  }, [exam]);

  return (
    <div className={styles.examContainer}>
      <div className={styles.header}>
        <h2>General Pre-screening Questions</h2>
        <p className={styles.subtitle}>
          These questions will be used for all job applications
        </p>
      </div>

      {!editMode ? (
        // Preview Mode
        <div className={styles.preview}>
          <div className={styles.questionsList}>
            {questions.map((q, idx) => (
              <div key={q.id} className={styles.questionCard}>
                <div className={styles.questionNumber}>Question {idx + 1}</div>
                <div className={styles.questionText}>{q.question_text}</div>
                <div className={styles.questionType}>
                  Type: {q.question_type === "mcq" ? "Multiple Choice" : "Text Response"}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setEditMode(true)}
            className={styles.editButton}
          >
            Edit Questions
          </button>
        </div>
      ) : (
        // Edit Mode
        <div className={styles.editMode}>
          <div className={styles.notice}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
            <div>