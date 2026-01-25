import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Server-side text extraction functions
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Simple PDF text extraction using basic parsing
    const text = buffer.toString('utf-8');

    // Extract visible text (basic implementation)
    // For production, consider using pdf-parse or pdfjs-dist
    const textMatches = text.match(/\(([^)]+)\)/g);
    if (textMatches) {
      return textMatches
        .map(match => match.slice(1, -1))
        .join(' ')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '')
        .trim();
    }

    // Fallback: try to extract any readable text
    return text
      .replace(/[^\x20-\x7E\n]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    // Basic DOCX extraction by looking for XML content
    const text = buffer.toString('utf-8');

    // Extract text from word/document.xml structure
    const textMatches = text.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
    if (textMatches) {
      return textMatches
        .map(match => {
          const content = match.match(/>([^<]+)</);
          return content ? content[1] : '';
        })
        .join(' ')
        .trim();
    }

    // Fallback
    return text
      .replace(/[^\x20-\x7E\n]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  } catch (error) {
    console.error('Error extracting DOCX text:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

async function extractTextFromImage(buffer: Buffer): Promise<string> {
  try {
    // For image OCR, we'll use a simpler approach
    // In production, integrate Tesseract.js or cloud OCR service

    // Return instruction for manual entry
    return `[Image uploaded - Please manually enter resume details below]\n\nNote: Automatic text extraction from images is being processed. Please review and update all fields manually.`;
  } catch (error) {
    console.error('Error extracting image text:', error);
    throw new Error('Failed to extract text from image');
  }
}

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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as Blob;
    const fileType = formData.get('fileType') as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Convert blob to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = '';

    // Extract text based on file type
    switch (fileType) {
      case 'pdf':
        extractedText = await extractTextFromPDF(buffer);
        break;
      case 'docx':
        extractedText = await extractTextFromDOCX(buffer);
        break;
      case 'image':
        extractedText = await extractTextFromImage(buffer);
        break;
      default:
        return NextResponse.json(
          { error: "Unsupported file type" },
          { status: 400 }
        );
    }

    // Clean up extracted text
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();

    if (!extractedText || extractedText.length < 10) {
      return NextResponse.json(
        {
          error: "Could not extract text from file",
          text: "Please manually enter your resume information below.",
          warning: "Automatic extraction failed"
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      text: extractedText,
      length: extractedText.length
    });

  } catch (error) {
    console.error('Error in parse-resume route:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        text: "Error processing file. Please enter resume details manually."
      },
      { status: 500 }
    );
  }
}
