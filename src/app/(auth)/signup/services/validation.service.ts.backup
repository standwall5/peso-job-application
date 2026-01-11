// src/app/(auth)/signup/services/validation.service.ts
import { FormErrors } from "../types/form.types";

const MIN_AGE = 15;
const MAX_AGE = 120;
const MIN_YEAR = 1900;

export class ValidationService {
  static validateEmail(email: string): string | null {
    if (!email || email.trim() === "") {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return null;
  }

  static validatePhoneNumber(phoneNumber: string): string | null {
    if (!phoneNumber || phoneNumber.trim() === "") {
      return "Contact number is required";
    }
    if (!/^\d+$/.test(phoneNumber)) {
      return "Phone number must contain digits only";
    }
    if (!phoneNumber.startsWith("9")) {
      return "Mobile number must start with 9";
    }
    if (phoneNumber.length !== 10) {
      return "Mobile number must have 10 digits after +63";
    }
    return null;
  }

  static validateBirthDate(birthDate: string): string | null {
    if (!birthDate) return "Birth date is required";

    const today = new Date();
    const birth = new Date(birthDate);

    // Invalid date format
    if (isNaN(birth.getTime())) return "Invalid birth date";

    // Future date
    if (birth > today) return "Birth date cannot be in the future";

    // Date too old
    if (birth < new Date(`${MIN_YEAR}-01-01`)) {
      return `Birth date cannot be before ${MIN_YEAR}`;
    }

    // Calculate age
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    // Age validation
    if (age < MIN_AGE) {
      return `You must be at least ${MIN_AGE} years old to register`;
    }

    if (age > MAX_AGE) {
      return "Please enter a valid birth date";
    }

    return null;
  }

  // src/app/(auth)/signup/services/validation.service.ts

  static validatePassword(password: string): {
    isValid: boolean;
    requirements: {
      length: boolean;
      uppercase: boolean;
      lowercase: boolean;
      number: boolean;
      special: boolean;
    };
  } {
    if (password.length === 0) {
      return {
        isValid: false,
        requirements: {
          length: false,
          uppercase: false,
          lowercase: false,
          number: false,
          special: false,
        },
      };
    }

    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      // ✅ FIX: If only A-Z, a-z, 0-9 exist, then false
      special: /[^A-Za-z0-9]/.test(password),
    };

    return {
      isValid: Object.values(requirements).every(Boolean),
      requirements,
    };
  }

  static validatePasswordMatch(
    password: string,
    confirmPassword: string,
  ): string | null {
    if (!password) return "Password is required";
    if (!confirmPassword) return "Confirm password is required";
    if (password !== confirmPassword) return "Passwords do not match";
    const validation = this.validatePassword(password);
    if (!validation.isValid) return "Password does not meet requirements";
    return null;
  }

  static validateRequiredField(
    value: string | null | undefined,
    fieldName: string,
  ): string | null {
    if (!value || value.trim() === "") {
      return `${fieldName} is required`;
    }
    return null;
  }
}
