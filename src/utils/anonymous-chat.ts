// Client-side utilities for anonymous chat
// Manages anonymous user identification and session persistence

const ANONYMOUS_ID_KEY = "peso_anonymous_chat_id";
const ANONYMOUS_NAME_KEY = "peso_anonymous_chat_name";
const SESSION_EXPIRY_DAYS = 30;

/**
 * Generate a unique anonymous ID using UUID v4 format
 */
export function generateAnonymousId(): string {
  // Generate UUID v4 (random)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create anonymous ID from localStorage
 * Returns existing ID if found, otherwise generates and stores new one
 */
export function getOrCreateAnonymousId(): string {
  if (typeof window === "undefined") {
    // Server-side rendering - return temporary ID
    return generateAnonymousId();
  }

  try {
    // Check if ID exists in localStorage
    const existingId = localStorage.getItem(ANONYMOUS_ID_KEY);

    if (existingId) {
      // Verify it's a valid format
      if (existingId.match(/^[a-f0-9-]{36}$/i)) {
        return existingId;
      }
    }

    // Generate new ID
    const newId = generateAnonymousId();
    localStorage.setItem(ANONYMOUS_ID_KEY, newId);

    // Set expiry timestamp (30 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + SESSION_EXPIRY_DAYS);
    localStorage.setItem(
      `${ANONYMOUS_ID_KEY}_expiry`,
      expiryDate.getTime().toString()
    );

    return newId;
  } catch (error) {
    console.error("Error accessing localStorage for anonymous ID:", error);
    // Fallback to session-only ID
    return generateAnonymousId();
  }
}

/**
 * Get existing anonymous ID without creating a new one
 * Returns null if no ID exists
 */
export function getExistingAnonymousId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const existingId = localStorage.getItem(ANONYMOUS_ID_KEY);

    // Check if ID has expired
    const expiryTimestamp = localStorage.getItem(`${ANONYMOUS_ID_KEY}_expiry`);
    if (expiryTimestamp) {
      const expiry = parseInt(expiryTimestamp, 10);
      if (Date.now() > expiry) {
        // ID has expired, clear it
        clearAnonymousId();
        return null;
      }
    }

    return existingId;
  } catch (error) {
    console.error("Error getting anonymous ID:", error);
    return null;
  }
}

/**
 * Clear anonymous ID from localStorage
 * Used when user logs in or wants to start fresh
 */
export function clearAnonymousId(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(ANONYMOUS_ID_KEY);
    localStorage.removeItem(`${ANONYMOUS_ID_KEY}_expiry`);
    localStorage.removeItem(ANONYMOUS_NAME_KEY);
  } catch (error) {
    console.error("Error clearing anonymous ID:", error);
  }
}

/**
 * Set anonymous user's display name
 */
export function setAnonymousName(name: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const sanitizedName = name.trim() || "Anonymous User";
    localStorage.setItem(ANONYMOUS_NAME_KEY, sanitizedName);
  } catch (error) {
    console.error("Error setting anonymous name:", error);
  }
}

/**
 * Get anonymous user's display name
 */
export function getAnonymousName(): string {
  if (typeof window === "undefined") {
    return "Anonymous User";
  }

  try {
    const name = localStorage.getItem(ANONYMOUS_NAME_KEY);
    return name && name.trim() ? name : "Anonymous User";
  } catch (error) {
    console.error("Error getting anonymous name:", error);
    return "Anonymous User";
  }
}

/**
 * Check if user has an active anonymous session
 */
export function hasAnonymousSession(): boolean {
  return getExistingAnonymousId() !== null;
}

/**
 * Generate a random anonymous display name
 */
export function generateRandomAnonymousName(): string {
  const adjectives = [
    "Curious",
    "Helpful",
    "Friendly",
    "Happy",
    "Kind",
    "Smart",
    "Brave",
    "Clever",
    "Bright",
    "Eager",
  ];

  const nouns = [
    "Visitor",
    "Guest",
    "User",
    "Seeker",
    "Explorer",
    "Applicant",
    "Jobseeker",
    "Candidate",
    "Person",
    "Individual",
  ];

  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 1000);

  return `${randomAdjective} ${randomNoun} #${randomNumber}`;
}

/**
 * Initialize anonymous chat session
 * Call this when user opens chat widget while not logged in
 */
export function initAnonymousChat(): {
  anonymousId: string;
  anonymousName: string;
} {
  const anonymousId = getOrCreateAnonymousId();
  let anonymousName = getAnonymousName();

  // If no name set, generate a random one
  if (anonymousName === "Anonymous User") {
    anonymousName = generateRandomAnonymousName();
    setAnonymousName(anonymousName);
  }

  return {
    anonymousId,
    anonymousName,
  };
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const testKey = "__test__";
    localStorage.setItem(testKey, "test");
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Migrate anonymous chat to authenticated user
 * Call this after user logs in to preserve their chat history
 */
export async function migrateAnonymousChatToUser(
  userId: number
): Promise<boolean> {
  const anonymousId = getExistingAnonymousId();

  if (!anonymousId) {
    return false; // No anonymous session to migrate
  }

  try {
    // Call API to migrate sessions
    const response = await fetch("/api/chat/migrate-anonymous", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        anonymousId,
        userId,
      }),
    });

    if (!response.ok) {
      console.error("Failed to migrate anonymous chat");
      return false;
    }

    // Clear anonymous ID after successful migration
    clearAnonymousId();
    return true;
  } catch (error) {
    console.error("Error migrating anonymous chat:", error);
    return false;
  }
}

/**
 * Get chat session info for display
 */
export function getAnonymousChatInfo(): {
  isAnonymous: boolean;
  id: string | null;
  name: string;
} {
  const anonymousId = getExistingAnonymousId();
  const anonymousName = getAnonymousName();

  return {
    isAnonymous: anonymousId !== null,
    id: anonymousId,
    name: anonymousName,
  };
}
