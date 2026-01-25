import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get applicant ID
    const { data: applicant, error: applicantError } = await supabase
      .from("applicants")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (applicantError || !applicant) {
      return NextResponse.json(
        { error: "Applicant not found" },
        { status: 404 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload PDF, DOCX, or image files." },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `resume-${applicant.id}-${timestamp}.${fileExt}`;
    const filePath = `${applicant.id}/${fileName}`;

    // Delete old resume files for this applicant
    const { data: existingFiles } = await supabase.storage
      .from('resumes')
      .list(applicant.id.toString());

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(f => `${applicant.id}/${f.name}`);
      await supabase.storage
        .from('resumes')
        .remove(filesToDelete);
    }

    // Upload new resume file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading resume:', uploadError);
      return NextResponse.json(
        { error: "Failed to upload resume file" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    // Update applicant record with resume URL
    const { error: updateError } = await supabase
      .from('applicants')
      .update({
        resume_url: urlData.publicUrl,
        resume_uploaded_at: new Date().toISOString(),
      })
      .eq('id', applicant.id);

    if (updateError) {
      console.error('Error updating applicant resume URL:', updateError);
      // Don't fail the request - file is uploaded successfully
    }

    return NextResponse.json({
      success: true,
      resumeUrl: urlData.publicUrl,
      fileName: fileName,
      message: "Resume uploaded successfully"
    });

  } catch (error) {
    console.error('Error in upload-resume route:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove resume
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get applicant ID
    const { data: applicant, error: applicantError } = await supabase
      .from("applicants")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (applicantError || !applicant) {
      return NextResponse.json(
        { error: "Applicant not found" },
        { status: 404 }
      );
    }

    // Delete all resume files for this applicant
    const { data: files } = await supabase.storage
      .from('resumes')
      .list(applicant.id.toString());

    if (files && files.length > 0) {
      const filesToDelete = files.map(f => `${applicant.id}/${f.name}`);
      const { error: deleteError } = await supabase.storage
        .from('resumes')
        .remove(filesToDelete);

      if (deleteError) {
        console.error('Error deleting resume files:', deleteError);
      }
    }

    // Update applicant record
    const { error: updateError } = await supabase
      .from('applicants')
      .update({
        resume_url: null,
        resume_uploaded_at: null,
      })
      .eq('id', applicant.id);

    if (updateError) {
      console.error('Error updating applicant record:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: "Resume deleted successfully"
    });

  } catch (error) {
    console.error('Error in delete resume route:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
