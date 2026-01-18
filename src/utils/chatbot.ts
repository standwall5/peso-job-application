/**
 * Chatbot utility for handling automated responses when admins are unavailable
 */

export interface BotResponse {
  message: string;
  category?: string;
  buttons?: Array<{ label: string; value: string }>;
}

// Business hours configuration (Philippine Time)
const BUSINESS_HOURS = {
  start: 8, // 8:00 AM
  end: 17, // 5:00 PM
  days: [1, 2, 3, 4, 5], // Monday to Friday (0 = Sunday, 6 = Saturday)
};

/**
 * TESTING: Set to true to always use bot (admins "unavailable")
 * Set to false to use normal business hours logic
 */
export const FORCE_BOT_MODE = false;

/**
 * TESTING: Set to true to always skip bot (admins "available")
 * Set to false to use normal business hours logic
 * PRODUCTION: Set to false to use actual business hours
 */
export const FORCE_ADMIN_MODE = false;

/**
 * Check if current time is within business hours (Philippine Time)
 */
export function isAdminAvailable(): boolean {
  // Testing overrides
  if (FORCE_BOT_MODE) {
    console.log("[Chatbot] FORCE_BOT_MODE is ON - admins unavailable");
    return false;
  }
  if (FORCE_ADMIN_MODE) {
    console.log("[Chatbot] FORCE_ADMIN_MODE is ON - admins available");
    return true;
  }

  // Get current time in Philippine Time (UTC+8)
  const now = new Date();
  const phTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Manila" }),
  );

  const currentHour = phTime.getHours();
  const currentDay = phTime.getDay();

  const isBusinessDay = BUSINESS_HOURS.days.includes(currentDay);
  const isBusinessHour =
    currentHour >= BUSINESS_HOURS.start && currentHour < BUSINESS_HOURS.end;

  const available = isBusinessDay && isBusinessHour;

  // Debug logging
  console.log("[Chatbot] Admin availability check:", {
    serverTime: now.toISOString(),
    philippineTime: phTime.toLocaleString("en-PH", { timeZone: "Asia/Manila" }),
    currentHour: currentHour,
    currentDay: currentDay,
    dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    currentDayName: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
      currentDay
    ],
    isBusinessDay,
    isBusinessHour,
    available,
  });

  return available;
}

/**
 * Knowledge base for the chatbot
 */
const knowledgeBase: Record<
  string,
  {
    keywords: string[];
    response: string;
    buttons?: Array<{ label: string; value: string }>;
  }
> = {
  greeting: {
    keywords: [
      "hello",
      "hi",
      "hey",
      "good morning",
      "good afternoon",
      "good evening",
      "start",
      "help",
    ],
    response:
      "Hello! I'm the PESO chatbot assistant. I'm here to help you with our services. What would you like to know about?",
    buttons: [
      { label: "📝 How to Apply for Jobs", value: "apply" },
      { label: "📄 Upload Resume", value: "resume" },
      { label: "📊 Check Application Status", value: "status" },
      { label: "👤 Account & Profile", value: "account" },
      { label: "📞 Contact Information", value: "contact" },
      { label: "❓ Other Questions", value: "help" },
    ],
  },
  about: {
    keywords: ["what is peso", "about peso", "who are you", "what do you do"],
    response:
      "PESO (Public Employment Service Office) is a government agency that provides employment facilitation services. We help connect job seekers with employers, provide career guidance, and offer skills training programs.",
  },
  apply: {
    keywords: [
      "apply",
      "job",
      "application",
      "how apply",
      "submit",
      "work",
      "position",
      "vacancy",
      "opening",
      "hiring",
    ],
    response:
      "📝 **How to Apply for a Job:**\n\n1. Create an account or log in\n2. Browse available job postings\n3. Click 'Apply' on jobs that match your skills\n4. Fill out the application form\n5. Upload your resume\n\nYou can track your applications in your dashboard.",
    buttons: [
      { label: "📊 Check Application Status", value: "status" },
      { label: "📄 Upload Resume", value: "resume" },
      { label: "🏠 Back to Main Menu", value: "hello" },
    ],
  },
  resume: {
    keywords: [
      "resume",
      "cv",
      "upload",
      "curriculum",
      "vitae",
      "document",
      "file",
      "update resume",
      "change resume",
    ],
    response:
      "📄 **Resume Upload:**\n\nYou can upload or update your resume in your profile settings.\n\n✅ Accepted formats: PDF, DOC, DOCX\n💡 Tip: Make sure your resume is up-to-date and highlights your skills and experience.",
    buttons: [
      { label: "📝 How to Apply", value: "apply" },
      { label: "👤 Update Profile", value: "account" },
      { label: "🏠 Back to Main Menu", value: "hello" },
    ],
  },
  status: {
    keywords: [
      "status",
      "track",
      "check",
      "progress",
      "application",
      "where",
      "see",
      "view",
      "my application",
    ],
    response:
      "📊 **Check Application Status:**\n\nYou can view your application status in your dashboard under 'My Applications'.\n\n**Status meanings:**\n• Pending - Application received\n• Under Review - Being evaluated\n• Accepted - Congratulations!\n• Rejected - Not selected this time",
    buttons: [
      { label: "📝 Apply for Another Job", value: "apply" },
      { label: "📞 Contact Us", value: "contact" },
      { label: "🏠 Back to Main Menu", value: "hello" },
    ],
  },
  account: {
    keywords: [
      "account",
      "profile",
      "sign up",
      "register",
      "create",
      "new account",
      "personal info",
      "settings",
      "edit profile",
      "update profile",
    ],
    response:
      "👤 **Account & Profile:**\n\n**To create an account:**\n1. Click 'Sign Up' on the homepage\n2. Fill in your personal information\n3. Provide a valid email address\n4. Create a secure password\n5. Verify your email\n\n**To update your profile:**\nGo to your account settings to edit your information, upload a profile picture, and manage your preferences.",
    buttons: [
      { label: "🔑 Reset Password", value: "password" },
      { label: "📄 Upload Resume", value: "resume" },
      { label: "🏠 Back to Main Menu", value: "hello" },
    ],
  },
  password: {
    keywords: [
      "password",
      "forgot",
      "reset",
      "change",
      "login",
      "can't login",
      "cannot login",
      "locked out",
    ],
    response:
      "🔑 **Reset Your Password:**\n\n1. Click 'Forgot Password' on the login page\n2. Enter your registered email address\n3. Check your email for a reset link\n4. Follow the link to create a new password\n\n💡 Tip: If you don't receive the email, check your spam folder.",
    buttons: [
      { label: "👤 Account Help", value: "account" },
      { label: "📞 Contact Support", value: "contact" },
      { label: "🏠 Back to Main Menu", value: "hello" },
    ],
  },
  pwd: {
    keywords: ["pwd", "disability", "persons with disability", "special needs"],
    response:
      "We provide special assistance for Persons with Disabilities (PWD). PESO offers:\n- Priority job matching services\n- Accessible application process\n- Special skills training programs\n- Employment counseling\n\nPlease indicate your PWD status in your profile for personalized assistance.",
  },
  training: {
    keywords: [
      "training",
      "course",
      "seminar",
      "workshop",
      "skill",
      "learn",
      "program",
      "class",
      "education",
    ],
    response:
      "📚 **Training Programs:**\n\nPESO offers various skills training programs:\n• Computer literacy\n• Vocational skills\n• Soft skills development\n• Industry-specific training\n\nCheck our 'Training Programs' section for upcoming courses and registration details.",
    buttons: [
      { label: "📝 How to Apply", value: "apply" },
      { label: "📞 Contact Us", value: "contact" },
      { label: "🏠 Back to Main Menu", value: "hello" },
    ],
  },
  livelihood: {
    keywords: ["livelihood", "business", "self employment", "entrepreneur"],
    response:
      "We offer livelihood and entrepreneurship programs to help you start your own business. This includes business planning assistance, microfinancing information, and skills training for various livelihood opportunities.",
  },
  contact: {
    keywords: [
      "contact",
      "phone",
      "email",
      "reach",
      "call",
      "location",
      "address",
      "where",
      "find you",
      "visit",
    ],
    response:
      "📞 **Contact Information:**\n\n• **Chat:** Mon-Fri, 8:00 AM - 5:00 PM\n• **Email:** Check our Contact Us page\n• **Visit:** Office address available on Contact page\n\n🕐 **Office Hours:**\nMonday to Friday, 8:00 AM - 5:00 PM\n(Closed weekends and holidays)",
    buttons: [
      { label: "⏰ Office Hours", value: "hours" },
      { label: "❓ Other Questions", value: "help" },
      { label: "🏠 Back to Main Menu", value: "hello" },
    ],
  },
  hours: {
    keywords: [
      "hours",
      "time",
      "when",
      "open",
      "schedule",
      "working",
      "business",
      "available",
    ],
    response:
      "⏰ **Office Hours:**\n\n**Monday to Friday:** 8:00 AM - 5:00 PM\n**Weekends & Holidays:** Closed\n\n💻 Online services are available 24/7, but live chat support is only available during office hours.",
    buttons: [
      { label: "📞 Contact Information", value: "contact" },
      { label: "❓ Other Questions", value: "help" },
      { label: "🏠 Back to Main Menu", value: "hello" },
    ],
  },
  help: {
    keywords: [
      "help",
      "support",
      "assist",
      "question",
      "info",
      "information",
      "other",
    ],
    response:
      "❓ **I can help you with:**\n\n• Job applications and status\n• Account creation and password issues\n• Resume uploading\n• Training programs\n• General PESO information\n\nWhat would you like to know more about?",
    buttons: [
      { label: "📝 Job Applications", value: "apply" },
      { label: "👤 Account & Profile", value: "account" },
      { label: "📄 Resume Upload", value: "resume" },
      { label: "📞 Contact Us", value: "contact" },
      { label: "🏠 Back to Main Menu", value: "hello" },
    ],
  },
  thankyou: {
    keywords: [
      "thank",
      "thanks",
      "appreciate",
      "helpful",
      "great",
      "perfect",
      "awesome",
    ],
    response:
      "You're welcome! 😊 If you have any other questions, feel free to ask. If you need to speak with an admin, they'll be available during office hours (Mon-Fri, 8:00 AM - 5:00 PM).",
    buttons: [
      { label: "❓ Ask Another Question", value: "help" },
      { label: "📞 Contact Admin", value: "contact" },
      { label: "🏠 Back to Main Menu", value: "hello" },
    ],
  },
};

/**
 * Generate a bot response based on user input
 */
export function generateBotResponse(userMessage: string): BotResponse {
  const normalizedMessage = userMessage.toLowerCase().trim();

  // Remove common words and punctuation for better matching
  const cleanedMessage = normalizedMessage
    .replace(/[?!.,]/g, "")
    .replace(
      /\b(i|want|to|how|do|can|please|help|me|with|about|the|a|an|my)\b/g,
      "",
    )
    .trim();

  // Try to find a matching category
  for (const [category, data] of Object.entries(knowledgeBase)) {
    for (const keyword of data.keywords) {
      // Match if keyword is in the message or cleaned message
      if (
        normalizedMessage.includes(keyword) ||
        cleanedMessage.includes(keyword)
      ) {
        return {
          message: data.response,
          category,
          buttons: data.buttons,
        };
      }
    }
  }

  // Default response if no match found - show main menu
  return {
    message:
      "I'm not sure I understand your question. Let me show you what I can help with:",
    category: "default",
    buttons: [
      { label: "📝 Job Applications", value: "apply" },
      { label: "📊 Application Status", value: "status" },
      { label: "👤 Account & Profile", value: "account" },
      { label: "📄 Resume Upload", value: "resume" },
      { label: "📞 Contact Information", value: "contact" },
      { label: "⏰ Office Hours", value: "hours" },
    ],
  };
}

/**
 * Get initial bot greeting message with buttons
 */
export function getBotGreeting(): BotResponse {
  const isAvailable = isAdminAvailable();

  if (isAvailable) {
    return {
      message:
        "Hello! 👋 Our admins are currently assisting other users. I'm here to help answer your questions in the meantime. What would you like to know about?",
      category: "greeting",
      buttons: [
        { label: "📝 How to Apply for Jobs", value: "apply" },
        { label: "📊 Check Application Status", value: "status" },
        { label: "👤 Account & Profile", value: "account" },
        { label: "📄 Upload Resume", value: "resume" },
        { label: "📞 Contact Information", value: "contact" },
        { label: "❓ Other Questions", value: "help" },
      ],
    };
  }

  return {
    message:
      "Hello! 👋 Our office hours are Monday to Friday, 8:00 AM - 5:00 PM.\n\n" +
      "I'm the PESO chatbot assistant, and I'm here to help answer your questions. " +
      "An admin will be available during office hours for personalized assistance.\n\n" +
      "What would you like to know about?",
    category: "greeting",
    buttons: [
      { label: "📝 How to Apply for Jobs", value: "apply" },
      { label: "📊 Check Application Status", value: "status" },
      { label: "👤 Account & Profile", value: "account" },
      { label: "📄 Upload Resume", value: "resume" },
      { label: "📞 Contact Information", value: "contact" },
      { label: "❓ Other Questions", value: "help" },
    ],
  };
}

/**
 * Get suggested questions for the user
 */
export function getSuggestedQuestions(): string[] {
  return [
    "How do I apply for a job?",
    "How can I check my application status?",
    "How do I upload my resume?",
    "What training programs are available?",
    "What are your office hours?",
  ];
}
