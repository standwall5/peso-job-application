// Barrel export for all services
export * from "./user.service";
export * from "./resume.service";
export * from "./job.service";
export * from "./application.service";
export * from "./company.service";
export * from "./exam.service";
export * from "./notification.service";
export * from "./chat.service";
export * from "./analytics.service";

// Re-export client utilities
export { getSupabaseClient, getCurrentUser } from "../client";
