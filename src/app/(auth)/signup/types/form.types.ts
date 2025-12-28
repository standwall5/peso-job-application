// src/app/(auth)/signup/types/form.types.ts
export interface PasswordRequirements {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

export interface SignUpFormData {
  firstName: string;
  lastName: string;
  middleName?: string;
  extName?: string;
  gender: string;
  genderOther?: string;
  birthDate: string;
  age: number | null;
  email: string;
  phoneNumber: string;
  residency: "resident" | "nonresident" | null;
  address: string;
  district?: string;
  barangay?: string;
  preferredPlaceOfAssignment?: string;
  applicantType: string[];
  disabilityType?: string;
  pwdNumber?: string;
  studentId?: string;
  ofwNumber?: string;
  seniorCitizenNumber?: string;
  soloParentNumber?: string;
  othersSpecify?: string;
  acceptTerms: boolean;
}

export interface FormErrors {
  [key: string]: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
}
