// Comprehensive skills database
export const SKILLS_DATABASE = [
  // Technical Skills
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C#",
  "PHP",
  "Ruby",
  "Go",
  "Rust",
  "Swift",
  "Kotlin",
  "React",
  "Next.js",
  "Vue.js",
  "Angular",
  "Node.js",
  "Express.js",
  "Django",
  "Flask",
  "Spring Boot",
  "ASP.NET",
  "Laravel",
  "Ruby on Rails",
  "HTML",
  "CSS",
  "Tailwind CSS",
  "Bootstrap",
  "SASS",
  "SQL",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "Firebase",
  "AWS",
  "Azure",
  "Google Cloud",
  "Docker",
  "Kubernetes",
  "Git",
  "GitHub",
  "CI/CD",
  "REST API",
  "GraphQL",
  "Microservices",

  // Office & Productivity
  "Microsoft Office",
  "Microsoft Word",
  "Microsoft Excel",
  "Microsoft PowerPoint",
  "Google Workspace",
  "Google Sheets",
  "Google Docs",
  "Data Entry",
  "Typing",
  "Email Management",
  "Calendar Management",
  "File Organization",

  // Design
  "Adobe Photoshop",
  "Adobe Illustrator",
  "Figma",
  "Canva",
  "UI/UX Design",
  "Graphic Design",
  "Web Design",
  "Video Editing",
  "Adobe Premiere",
  "Final Cut Pro",

  // Business & Management
  "Project Management",
  "Team Leadership",
  "Strategic Planning",
  "Business Analysis",
  "Financial Analysis",
  "Budgeting",
  "Accounting",
  "Bookkeeping",
  "QuickBooks",
  "SAP",
  "Sales",
  "Marketing",
  "Digital Marketing",
  "Social Media Marketing",
  "SEO",
  "Content Marketing",
  "Email Marketing",

  // Customer Service
  "Customer Service",
  "Customer Support",
  "Call Center",
  "Technical Support",
  "Client Relations",
  "Communication Skills",
  "Problem Solving",
  "Conflict Resolution",

  // Healthcare
  "Nursing",
  "Patient Care",
  "Medical Terminology",
  "First Aid",
  "CPR",
  "Healthcare Administration",
  "Medical Records",

  // Education
  "Teaching",
  "Tutoring",
  "Curriculum Development",
  "Classroom Management",
  "Online Teaching",

  // Manufacturing & Operations
  "Quality Control",
  "Inventory Management",
  "Supply Chain Management",
  "Warehouse Management",
  "Forklift Operation",
  "Machine Operation",
  "Assembly",
  "Production Planning",

  // Food Service
  "Food Preparation",
  "Cooking",
  "Baking",
  "Food Safety",
  "Restaurant Management",
  "Bartending",
  "Barista",

  // Transportation & Logistics
  "Driving",
  "Delivery",
  "Logistics",
  "Route Planning",
  "Fleet Management",

  // Construction & Trades
  "Carpentry",
  "Plumbing",
  "Electrical Work",
  "Welding",
  "HVAC",
  "Painting",
  "Masonry",
  "Construction Management",

  // Security
  "Security",
  "Security Guard",
  "CCTV Monitoring",
  "Access Control",

  // Cleaning & Maintenance
  "Housekeeping",
  "Cleaning",
  "Janitorial Services",
  "Maintenance",
  "Facility Management",

  // Soft Skills
  "Teamwork",
  "Time Management",
  "Critical Thinking",
  "Adaptability",
  "Attention to Detail",
  "Multitasking",
  "Organization",
  "Work Ethic",
  "Reliability",
  "Punctuality",
  "Professionalism",
  "Interpersonal Skills",
  "Public Speaking",
  "Presentation Skills",
  "Negotiation",
  "Decision Making",

  // Languages
  "English",
  "Filipino",
  "Tagalog",
  "Cebuano",
  "Ilocano",
  "Spanish",
  "Mandarin",
  "Japanese",
  "Korean",

  // Other
  "Research",
  "Writing",
  "Editing",
  "Proofreading",
  "Translation",
  "Data Analysis",
  "Report Writing",
  "Documentation",
] as const;

export type Skill = (typeof SKILLS_DATABASE)[number];

// Function to search skills
export function searchSkills(query: string): Skill[] {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();
  return SKILLS_DATABASE.filter((skill) =>
    skill.toLowerCase().includes(lowerQuery),
  ).slice(0, 10); // Limit to 10 results
}

// Function to check if skill exists
export function isValidSkill(skill: string): boolean {
  return SKILLS_DATABASE.some((s) => s.toLowerCase() === skill.toLowerCase());
}
