// src/lib/utils/resume-parser.ts
import Tesseract from "tesseract.js";

export interface ParsedResumeData {
  // Personal Information
  name?: string;
  email?: string;
  phone?: string;
  address?: string;

  // Education
  education?: {
    school?: string;
    degree?: string;
    attainment?: string;
    location?: string;
    start_date?: string;
    end_date?: string;
  };

  // Work Experience
  work_experiences?: Array<{
    company: string;
    position: string;
    location: string;
    start_date: string;
    end_date: string;
  }>;

  // Skills
  skills?: string[];

  // Profile/Summary
  profile_introduction?: string;

  // Raw text for manual review
  rawText?: string;
}

/**
 * Extract text from different file types
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  try {
    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      return await extractTextFromPDF(file);
    } else if (
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx")
    ) {
      return await extractTextFromDOCX(file);
    } else if (fileType.startsWith("image/")) {
      return await extractTextFromImage(file);
    } else {
      throw new Error(
        "Unsupported file type. Please upload PDF, DOCX, or image files.",
      );
    }
  } catch (error) {
    console.error("Error extracting text from file:", error);
    throw error;
  }
}

/**
 * Extract text from PDF using browser's built-in capabilities
 */
async function extractTextFromPDF(file: File): Promise<string> {
  // For client-side, we'll read the file and send to server
  // This is a placeholder - actual PDF parsing happens server-side
  const arrayBuffer = await file.arrayBuffer();
  const text = await sendToServerForParsing(arrayBuffer, "pdf");
  return text;
}

/**
 * Extract text from DOCX
 */
async function extractTextFromDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const text = await sendToServerForParsing(arrayBuffer, "docx");
  return text;
}

/**
 * Extract text from image using OCR (Tesseract.js)
 */
async function extractTextFromImage(file: File): Promise<string> {
  try {
    console.log("Starting OCR processing with Tesseract.js...");

    const result = await Tesseract.recognize(file, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    console.log("OCR completed successfully");
    return result.data.text;
  } catch (error) {
    console.error("Tesseract OCR error:", error);
    throw new Error("Failed to extract text from image using OCR");
  }
}

/**
 * Send file to server for parsing
 */
async function sendToServerForParsing(
  arrayBuffer: ArrayBuffer,
  fileType: "pdf" | "docx" | "image",
): Promise<string> {
  const formData = new FormData();
  const blob = new Blob([arrayBuffer]);
  formData.append("file", blob);
  formData.append("fileType", fileType);

  const response = await fetch("/api/parse-resume", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to parse resume");
  }

  const data = await response.json();
  return data.text;
}

/**
 * Parse resume text into structured data
 */
export function parseResumeText(text: string): ParsedResumeData {
  const parsed: ParsedResumeData = {
    rawText: text,
  };

  // Extract email - improved pattern
  const emailMatch = text.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  );
  if (emailMatch) {
    parsed.email = emailMatch[0].toLowerCase();
  }

  // Extract phone number (Philippine format with better patterns)
  const phonePatterns = [
    // Philippine mobile: +63 9XX XXX XXXX or 09XX XXX XXXX
    /(?:\+63|0063)[\s.-]?9\d{2}[\s.-]?\d{3}[\s.-]?\d{4}/,
    /09\d{2}[\s.-]?\d{3}[\s.-]?\d{4}/,
    // Philippine landline: (02) XXXX XXXX or 02-XXXX-XXXX
    /\(0?2\)[\s.-]?\d{3,4}[\s.-]?\d{4}/,
    /0?2[\s.-]?\d{3,4}[\s.-]?\d{4}/,
    // Generic international format
    /\+\d{1,3}[\s.-]?\d{3}[\s.-]?\d{3,4}[\s.-]?\d{4}/,
    // Generic format with parentheses
    /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/,
  ];

  for (const pattern of phonePatterns) {
    const phoneMatch = text.match(pattern);
    if (phoneMatch) {
      // Normalize phone number - keep only digits and + sign
      let phone = phoneMatch[0].replace(/[\s.\-()]/g, "");
      // Ensure Philippine numbers start with +63 or 0
      if (phone.startsWith("63") && !phone.startsWith("+")) {
        phone = "+" + phone;
      }
      parsed.phone = phone;
      break;
    }
  }

  // Extract name (improved to handle various formats including Filipino names)
  const namePatterns = [
    // After "Name:" label
    /(?:Name|Full Name):\s*([A-Z][a-zA-Z\s.',-]{2,50}?)(?:\n|$|,)/i,
    // First line that looks like a name (2-4 capitalized words)
    /^([A-Z][a-z]+(?:\s+(?:de|del|dela|[A-Z])[a-z]*){1,3}(?:\s+[A-Z][a-z]+){0,2})$/m,
    // Name in all caps
    /^([A-Z\s]{5,50})$/m,
  ];

  for (const pattern of namePatterns) {
    const nameMatch = text.match(pattern);
    if (nameMatch && nameMatch[1]) {
      const name = nameMatch[1].trim();
      // Filter out common false positives
      const invalidNames =
        /^(RESUME|CURRICULUM|VITAE|CV|OBJECTIVE|SUMMARY|EDUCATION|EXPERIENCE|SKILLS)/i;
      if (!invalidNames.test(name) && name.length >= 5 && name.length <= 50) {
        parsed.name = name;
        break;
      }
    }
  }

  // Extract skills with more keywords
  const skillsSection = extractSection(text, [
    "skills",
    "technical skills",
    "core competencies",
    "competencies",
    "expertise",
    "proficiencies",
    "key skills",
    "professional skills",
  ]);
  if (skillsSection) {
    parsed.skills = extractSkills(skillsSection);
  }

  // Extract education with more keywords
  const educationSection = extractSection(text, [
    "education",
    "educational background",
    "academic background",
    "academic qualifications",
    "educational attainment",
    "academic history",
  ]);
  if (educationSection) {
    parsed.education = parseEducation(educationSection);
  }

  // Extract work experience with more keywords
  const experienceSection = extractSection(text, [
    "work experience",
    "professional experience",
    "employment history",
    "experience",
    "work history",
    "career history",
    "professional background",
    "employment",
  ]);
  if (experienceSection) {
    parsed.work_experiences = parseWorkExperience(experienceSection);
  }

  // Extract profile/summary
  const summarySection = extractSection(text, [
    "summary",
    "profile",
    "objective",
    "professional summary",
    "about me",
  ]);
  if (summarySection) {
    parsed.profile_introduction = summarySection.trim();
  }

  return parsed;
}

/**
 * Extract a section from resume text
 */
function extractSection(text: string, keywords: string[]): string | null {
  const lines = text.split("\n");
  let sectionStart = -1;
  let sectionEnd = -1;

  // Find section start - match whole line or line starting with keyword
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim();
    // Check if line is exactly the keyword or starts with it (case-insensitive)
    if (
      keywords.some((keyword) => {
        const keywordLower = keyword.toLowerCase();
        return (
          line === keywordLower ||
          line === keywordLower + ":" ||
          line.startsWith(keywordLower + " ") ||
          line.startsWith(keywordLower + ":")
        );
      })
    ) {
      sectionStart = i + 1;
      break;
    }
  }

  if (sectionStart === -1) return null;

  // Find section end (next major heading or end of document)
  const commonHeadings = [
    "skills",
    "education",
    "experience",
    "work experience",
    "employment",
    "summary",
    "objective",
    "profile",
    "certifications",
    "references",
    "languages",
    "awards",
    "achievements",
    "projects",
    "interests",
  ];

  const headingPatterns = [
    /^[A-Z\s]{3,}$/, // All caps heading
    /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*:?$/, // Title case heading
  ];

  for (let i = sectionStart; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineLower = line.toLowerCase();

    // Check if it's a known section heading
    const isKnownHeading = commonHeadings.some(
      (heading) =>
        lineLower === heading ||
        lineLower === heading + ":" ||
        lineLower.startsWith(heading + " "),
    );

    if (
      line.length > 0 &&
      (isKnownHeading || headingPatterns.some((pattern) => pattern.test(line)))
    ) {
      sectionEnd = i;
      break;
    }
  }

  if (sectionEnd === -1) sectionEnd = lines.length;

  return lines.slice(sectionStart, sectionEnd).join("\n").trim();
}

/**
 * Extract skills from skills section
 */
function extractSkills(skillsText: string): string[] {
  const skills: string[] = [];

  // Split by common delimiters
  const delimiters = [",", "•", "·", "|", "\n", ";", "–", "-"];
  let splitSkills = [skillsText];

  for (const delimiter of delimiters) {
    const temp: string[] = [];
    for (const item of splitSkills) {
      temp.push(...item.split(delimiter));
    }
    splitSkills = temp;
  }

  // Clean and filter skills
  for (const skill of splitSkills) {
    let cleaned = skill.trim();

    // Remove common prefixes/bullets
    cleaned = cleaned.replace(/^[\d.)\-•·∙▪▫■□●○◆◇★☆]+\s*/, "");

    // Remove trailing punctuation
    cleaned = cleaned.replace(/[.:;,]+$/, "");

    // Filter out invalid skills
    const isValid =
      cleaned.length >= 2 &&
      cleaned.length <= 50 &&
      !/^(and|or|the|with)$/i.test(cleaned);

    if (isValid) {
      skills.push(cleaned);
    }
  }

  // Remove duplicates (case-insensitive)
  const uniqueSkills = skills.filter(
    (skill, index, self) =>
      self.findIndex((s) => s.toLowerCase() === skill.toLowerCase()) === index,
  );

  return uniqueSkills;
}

/**
 * Parse education section
 */
function parseEducation(educationText: string): ParsedResumeData["education"] {
  const education: ParsedResumeData["education"] = {};

  // Extract degree (improved patterns including Philippine degrees)
  const degreePatterns = [
    /Bachelor\s+of\s+Science\s+in\s+[^,\n.]{3,50}/i,
    /Bachelor\s+of\s+Arts\s+in\s+[^,\n.]{3,50}/i,
    /Bachelor[^,\n.]{3,50}/i,
    /Master\s+of\s+Science\s+in\s+[^,\n.]{3,50}/i,
    /Master\s+of\s+Arts\s+in\s+[^,\n.]{3,50}/i,
    /Master[^,\n.]{3,50}/i,
    /(?:PhD|Ph\.D\.|Doctor of Philosophy)[^,\n.]{0,50}/i,
    /Associate[^,\n.]{3,50}/i,
    /Diploma\s+in\s+[^,\n.]{3,50}/i,
    /BS\s*[A-Z]{2,}[^,\n.]{0,40}/i,
    /BA\s*[A-Z]{2,}[^,\n.]{0,40}/i,
    /MS\s*[A-Z]{2,}[^,\n.]{0,40}/i,
    /MA\s*[A-Z]{2,}[^,\n.]{0,40}/i,
    /Certificate\s+in\s+[^,\n.]{3,50}/i,
  ];

  for (const pattern of degreePatterns) {
    const match = educationText.match(pattern);
    if (match) {
      education.degree = match[0].trim().replace(/\s+/g, " ");
      break;
    }
  }

  // Extract school name (improved patterns for Philippine schools)
  const schoolPatterns = [
    // Full university names
    /(?:University of|Polytechnic University of|Technological University of)\s+[^,\n.]{3,50}/i,
    // University/College/Institute pattern
    /[A-Z][a-zA-Z\s&.'-]{2,50}\s+(?:University|College|Institute|School|Academy)/i,
    // Abbreviated forms
    /(?:UP|UST|DLSU|AdMU|ADMU|PUP|TIP|FEU|UE|NU|MAPUA|MIT|SLU|USC)\s*[-–]?\s*[A-Z][a-zA-Z\s]*/,
  ];

  for (const pattern of schoolPatterns) {
    const match = educationText.match(pattern);
    if (match) {
      let school = match[0].trim().replace(/\s+/g, " ");
      // Remove trailing punctuation
      school = school.replace(/[,.]$/, "");
      if (school.length >= 3 && school.length <= 100) {
        education.school = school;
        break;
      }
    }
  }

  // Extract dates (improved to handle various formats)
  const datePatterns = [
    // YYYY - YYYY or YYYY - Present
    /(\d{4})\s*[-–]\s*(\d{4}|Present|Current)/i,
    // Month YYYY - Month YYYY
    /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})\s*[-–]\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|Present|Current)/i,
    // Just graduation year
    /(?:Graduated|Graduation):\s*(\d{4})/i,
  ];

  for (const pattern of datePatterns) {
    const dateMatch = educationText.match(pattern);
    if (dateMatch) {
      if (dateMatch[2]) {
        education.start_date = dateMatch[1];
        education.end_date =
          dateMatch[2].toLowerCase().includes("present") ||
          dateMatch[2].toLowerCase().includes("current")
            ? "Present"
            : dateMatch[2];
      } else {
        education.end_date = dateMatch[1];
      }
      break;
    }
  }

  // Extract location if present
  const locationMatch = educationText.match(
    /(?:Manila|Quezon City|Makati|Pasig|Cebu|Davao|[A-Z][a-z]+),\s*(?:Philippines|Metro Manila|NCR)/i,
  );
  if (locationMatch) {
    education.location = locationMatch[0];
  }

  return Object.keys(education).length > 0 ? education : undefined;
}

/**
 * Parse work experience section
 */
function parseWorkExperience(
  experienceText: string,
): ParsedResumeData["work_experiences"] {
  const experiences: Array<{
    company: string;
    position: string;
    location: string;
    start_date: string;
    end_date: string;
  }> = [];

  // Split into individual job entries (by double newlines or clear separators)
  const jobEntries = experienceText.split(/\n\s*\n/);

  for (const entry of jobEntries) {
    const experience: {
      company: string;
      position: string;
      location: string;
      start_date: string;
      end_date: string;
    } = {
      company: "",
      position: "",
      location: "",
      start_date: "",
      end_date: "",
    };

    // Extract position/title (improved patterns)
    const positionPatterns = [
      // Position: Title format
      /(?:Position|Role|Title):\s*([A-Z][a-zA-Z\s&,-]+?)(?:\n|$)/i,
      // First capitalized line
      /^([A-Z][a-zA-Z\s&,-]+?)(?:\s*[-–|]\s*|\n)/,
      // Common job titles
      /((?:Senior|Junior|Lead|Principal|Chief)?\s*(?:Software|Web|Mobile|Frontend|Backend|Full[- ]?Stack)?\s*(?:Engineer|Developer|Designer|Manager|Analyst|Specialist|Consultant|Director)[a-zA-Z\s&,-]*)/i,
    ];

    for (const pattern of positionPatterns) {
      const positionMatch = entry.match(pattern);
      if (positionMatch && positionMatch[1]) {
        let position = positionMatch[1].trim();
        position = position.replace(/[,|]$/, "");
        if (position.length >= 3 && position.length <= 100) {
          experience.position = position;
          break;
        }
      }
    }

    // Extract company (improved patterns)
    const companyPatterns = [
      // Company: Name format
      /(?:Company|Organization|Employer):\s*([A-Z][a-zA-Z\s&,.'-]+?)(?:\n|$)/i,
      // "at Company" or "@ Company"
      /(?:at|@)\s+([A-Z][a-zA-Z\s&,.'-]+?)(?:\n|,|\||$)/,
      // Company, Location format
      /([A-Z][a-zA-Z\s&,.'-]+?),\s*(?:Manila|Quezon City|Makati|Philippines|Metro Manila)/i,
    ];

    for (const pattern of companyPatterns) {
      const companyMatch = entry.match(pattern);
      if (companyMatch && companyMatch[1]) {
        let company = companyMatch[1].trim();
        company = company.replace(/[,.|]$/, "");
        if (company.length >= 2 && company.length <= 100) {
          experience.company = company;
          break;
        }
      }
    }

    // Extract dates (improved patterns)
    const datePatterns = [
      // Month YYYY - Month YYYY or Present
      /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4})\s*[-–]\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|Present|Current)/i,
      // YYYY - YYYY or Present
      /(\d{4})\s*[-–]\s*(\d{4}|Present|Current)/i,
      // MM/YYYY - MM/YYYY
      /(\d{1,2}\/\d{4})\s*[-–]\s*(\d{1,2}\/\d{4}|Present|Current)/i,
    ];

    for (const pattern of datePatterns) {
      const dateMatch = entry.match(pattern);
      if (dateMatch) {
        experience.start_date = dateMatch[1];
        experience.end_date =
          dateMatch[2].toLowerCase().includes("present") ||
          dateMatch[2].toLowerCase().includes("current")
            ? "Present"
            : dateMatch[2];
        break;
      }
    }

    // Extract location
    const locationMatch = entry.match(
      /(?:Manila|Quezon City|Makati|Pasig|Taguig|BGC|Ortigas|Cebu|Davao|[A-Z][a-z]+),?\s*(?:Philippines|Metro Manila|NCR)?/i,
    );
    if (locationMatch) {
      experience.location = locationMatch[0].trim();
    }

    // Only add if we have at least position or company
    if (
      (experience.position || experience.company) &&
      (experience.position.length >= 2 || experience.company.length >= 2)
    ) {
      experiences.push(experience);
    }
  }

  return experiences.length > 0 ? experiences : undefined;
}

/**
 * Validate parsed resume data
 */
export function validateParsedResume(data: ParsedResumeData): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.rawText || data.rawText.trim().length < 50) {
    errors.push("Resume text is too short or empty");
  }

  if (!data.email) {
    warnings.push("Email not found - please add manually");
  }

  if (!data.phone) {
    warnings.push("Phone number not found - please add manually");
  }

  if (!data.name) {
    warnings.push("Name not detected - please verify");
  }

  if (!data.skills || data.skills.length === 0) {
    warnings.push("No skills detected - please add manually");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
