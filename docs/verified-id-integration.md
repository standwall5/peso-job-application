# Verified Government ID Integration

This document describes how to add a "Verified Government ID" tab to the job application process, including UI, backend, and database integration.

---

## 1. UI/UX Design

### Tab Navigation

- Add a new tab in the application modal navigation (beside "Preview Resume" and "Exam"):
  - **Label:** "Verified Government ID"

### Step 1: Upload Front and Back of ID

- Show two file inputs (or drag-and-drop areas):
  - **Front of ID** (image)
  - **Back of ID** (image)
- Accept only image files (`.jpg`, `.jpeg`, `.png`).
- Optionally, add a dropdown or text input for the user to specify the ID type (e.g., Passport, PhilHealth, UMID, Driver’s License, etc.).

### Step 2: Upload Selfie with ID

- After both images are uploaded, show a third file input:
  - **Selfie with ID** (image)
  - Instructions: "Take a clear photo of yourself holding the ID, with your face and the ID visible."

### Step 3: Submit

- Only enable the submit button when all three images are uploaded.
- On submit, upload all images to Supabase Storage and save the metadata in the database.

---

## 2. Optional: Face/ID Detection

- For basic validation, you can use [face-api.js](https://github.com/justadudewhohacks/face-api.js) or [@vladmandic/face-api](https://www.npmjs.com/package/@vladmandic/face-api) for face detection in the selfie.
- For ID detection, there are no free, reliable open-source libraries for PH IDs, so just ensure the file is an image and optionally preview it for the user.

---

## 3. Supabase Database Schema

### SQL to Create the Table

```sql
create table verified_ids (
  id bigserial primary key,
  applicant_id bigint references applicants(id) not null,
  job_id integer references jobs(id) not null,
  id_type text,
  id_front_url text not null,
  id_back_url text not null,
  selfie_with_id_url text not null,
  status text default 'pending', -- pending, approved, rejected
  submitted_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewer_id uuid references auth.users(id)
);

```

- `status` can be used for admin review.
- `reviewer_id` and `reviewed_at` are for future admin actions.

---

## 4. Supabase Storage

- Create a bucket named `verified-ids` (or similar).
- Store images under folders like: `applicant_{applicant_id}/job_{job_id}/front.jpg`, `back.jpg`, `selfie.jpg`.

---

## 5. API Endpoint Example (`/api/verified-id/submit`)

```ts
// /api/verified-id/submit/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const formData = await req.formData();

  const jobId = formData.get("jobId");
  const idType = formData.get("idType");
  const idFront = formData.get("idFront") as File;
  const idBack = formData.get("idBack") as File;
  const selfie = formData.get("selfie") as File;

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Get applicant_id
  const { data: applicantData } = await supabase
    .from("applicants")
    .select("id")
    .eq("auth_id", user.id)
    .single();
  if (!applicantData) return NextResponse.json({ error: "Applicant not found" }, { status: 404 });

  const applicantId = applicantData.id;

  // Upload files to Supabase Storage
  const folder = `applicant_${applicantId}/job_${jobId}`;
  const [frontRes, backRes, selfieRes] = await Promise.all([
    supabase.storage.from("verified-ids").upload(`${folder}/front.jpg`, idFront, { upsert: true }),
    supabase.storage.from("verified-ids").upload(`${folder}/back.jpg`, idBack, { upsert: true }),
    supabase.storage.from("verified-ids").upload(`${folder}/selfie.jpg`, selfie, { upsert: true }),
  ]);

  if (frontRes.error || backRes.error || selfieRes.error) {
    return NextResponse.json({ error: "Failed to upload images" }, { status: 500 });
  }

  // Save record in DB
  const { error } = await supabase.from("verified_ids").insert({
    applicant_id: applicantId,
    job_id: jobId,
    id_type: idType,
    id_front_url: frontRes.data.path,
    id_back_url: backRes.data.path,
    selfie_with_id_url: selfieRes.data.path,
    status: "pending",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
```

---

## 6. Frontend Integration Steps

```ts
// peso-job-application/src/app/(user)/job-opportunities/[companyId]/components/VerifiedIdUpload.tsx
import React, { useState } from "react";
import Button from "@/components/Button";

const idTypes = [
  "PhilHealth",
  "UMID",
  "Driver’s License",
  "Passport",
  "Voter’s ID",
  "PRC ID",
  "SSS",
  "TIN",
  "Postal ID",
  "Other",
];

export default function VerifiedIdUpload({ jobId, onSubmitted }: { jobId: number, onSubmitted?: () => void }) {
  const [idType, setIdType] = useState("");
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<{ front?: string; back?: string; selfie?: string }>({});
  const [message, setMessage] = useState<string | null>(null);

  // Preview images
  const handleFileChange = (file: File, type: "front" | "back" | "selfie") => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview((prev) => ({ ...prev, [type]: e.target?.result as string }));
    };
    reader.readAsDataURL(file);
    if (type === "front") setIdFront(file);
    if (type === "back") setIdBack(file);
    if (type === "selfie") setSelfie(file);
  };

  const canProceedStep1 = !!idFront && !!idBack && !!idType;
  const canSubmit = !!idFront && !!idBack && !!selfie && !!idType;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("jobId", String(jobId));
    formData.append("idType", idType);
    formData.append("idFront", idFront!);
    formData.append("idBack", idBack!);
    formData.append("selfie", selfie!);

    const res = await fetch("/api/verified-id/submit", {
      method: "POST",
      body: formData,
    });
    const result = await res.json();
    setSubmitting(false);
    if (result.success) {
      setMessage("ID submitted successfully! Pending review.");
      if (onSubmitted) onSubmitted();
    } else {
      setMessage(result.error || "Submission failed.");
    }
  };

  return (
    <div>
      <h3>Verified Government ID Submission</h3>
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <>
            <label>
              ID Type:
              <select value={idType} onChange={e => setIdType(e.target.value)} required>
                <option value="">Select ID Type</option>
                {idTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>
            <br />
            <label>
              Front of ID:
              <input
                type="file"
                accept="image/*"
                onChange={e => e.target.files && handleFileChange(e.target.files[0], "front")}
                required
              />
            </label>
            {preview.front && <img src={preview.front} alt="Front Preview" style={{ maxWidth: 200, margin: 8 }} />}
            <br />
            <label>
              Back of ID:
              <input
                type="file"
                accept="image/*"
                onChange={e => e.target.files && handleFileChange(e.target.files[0], "back")}
                required
              />
            </label>
            {preview.back && <img src={preview.back} alt="Back Preview" style={{ maxWidth: 200, margin: 8 }} />}
            <br />
            <Button type="button" variant="primary" disabled={!canProceedStep1} onClick={() => setStep(2)}>
              Next: Upload Selfie with ID
            </Button>
          </>
        )}
        {step === 2 && (
          <>
            <label>
              Selfie with ID:
              <input
                type="file"
                accept="image/*"
                onChange={e => e.target.files && handleFileChange(e.target.files[0], "selfie")}
                required
              />
            </label>
            {preview.selfie && <img src={preview.selfie} alt="Selfie Preview" style={{ maxWidth: 200, margin: 8 }} />}
            <br />
            <Button type="button" variant="secondary" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="submit" variant="success" disabled={!canSubmit || submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </>
        )}
      </form>
      {message && <div style={{ marginTop: 16 }}>{message}</div>}
      <div style={{ marginTop: 16, fontSize: "0.95em", color: "#666" }}>
        <b>Instructions:</b> <br />
        1. Upload clear images of the front and back of your valid government-issued ID.<br />
        2. Upload a selfie of you holding the same ID, with your face and the ID visible.<br />
        3. Only image files are accepted.
      </div>
    </div>
  );
}


```

1. **Add a new tab** in your modal navigation:  
   - Label: "Verified Government ID"
   - Set `applicationSelect` to `"verifiedId"` when clicked.

2. **Create a new component** (e.g., `VerifiedIdUpload.tsx`) with:
   - Step 1: Two file inputs for front/back of ID
   - Step 2: One file input for selfie with ID
   - Step 3: Submit button (disabled until all files are present)
   - On submit, use `FormData` and POST to `/api/verified-id/submit`

3. **Show upload progress and preview images** before submission.

4. **After submission**, show a "pending review" message.

---

## 7. Example: How to Use the API from the Frontend

```ts
const formData = new FormData();
formData.append("jobId", selectedJob.id);
formData.append("idType", idType);
formData.append("idFront", idFrontFile);
formData.append("idBack", idBackFile);
formData.append("selfie", selfieFile);

const response = await fetch("/api/verified-id/submit", {
  method: "POST",
  body: formData,
});
const result = await response.json();
if (result.success) {
  // Show success message
}
```

---

## 8. Optional: Face Detection

- If you want to add face detection, use [@vladmandic/face-api](https://www.npmjs.com/package/@vladmandic/face-api) in the frontend to check if a face is visible in the selfie before allowing submission.
- This is optional and not required for basic functionality.

---

## 9. Admin Review (Future)

- You can later add an admin dashboard to review, approve, or reject submitted IDs.

---

**You now have a full plan for adding a government ID verification step to your application process, including UI, backend, and database!**
