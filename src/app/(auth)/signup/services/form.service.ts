// src/app/(auth)/signup/services/form.service.ts
import { SignUpFormData } from "../types/form.types";

export class FormService {
  static calculateAge(birthDateValue: string): number | null {
    if (!birthDateValue) return null;
    const today = new Date();
    const birth = new Date(birthDateValue);
    if (isNaN(birth.getTime())) return null;
    if (birth > today) return null;
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age >= 0 ? age : null;
  }

  static formatDateYYYYMMDD(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  static parseBirthDateString(s: string): Date | null {
    if (!s) return null;
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  static formatPhoneNumber(phoneNumber: string): string {
    return phoneNumber ? `+63${phoneNumber}` : "";
  }

  static sanitizePhoneNumber(value: string): string {
    return value.replace(/\D/g, "").slice(0, 10);
  }
}
