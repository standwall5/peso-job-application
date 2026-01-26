// src/app/(auth)/signup/constants/form.constants.ts
export const REQUIRED_FIELDS = [
  "firstName",
  "lastName",
  "address",
  "applicantType",
  "password",
  "confirmPassword",
  "acceptTerms",
] as const;

export const APPLICANT_TYPES = [
  "Student",
  "Indigenous Person (IP)",
  "Out of School Youth",
  "Person with Disability (PWD)",
  "Rehabilitation Program Graduate",
  "Reintegrated Individual (Former Detainee)",
  "Returning Overseas Filipino Worker (OFW)",
  "Senior Citizen",
  "Solo Parent/Single Parent",
  "Others",
] as const;

export const GENDER_OPTIONS = ["Female", "Male", "Others"] as const;

export const DISABILITY_TYPES = [
  "Hearing",
  "Visual",
  "Mobility",
  "Intellectual",
  "Psychosocial",
  "Others",
] as const;

export const DISTRICTS = ["District 1", "District 2"] as const;

export const BARANGAYS = {
  "District 1": [
    "Baclaran",
    "Don Galo",
    "La Huerta",
    "San Dionisio",
    "Santo Niño",
    "Tambo",
    "Vitalez",
  ],
  "District 2": [
    "BF Homes",
    "Don Bosco",
    "Marcelo Green",
    "Merville",
    "Moonwalk",
    "San Antonio",
    "San Isidro",
    "San Martin de Porres",
    "Sun Valley",
  ],
} as const;

export const PREFERRED_PLACES = [
  "Baclaran",
  "Don Galo",
  "La Huerta",
  "San Dionisio",
  "Santo Niño",
  "Tambo",
  "Vitalez",
  "BF Homes",
  "Don Bosco",
  "Marcelo Green",
  "Merville",
  "Moonwalk",
  "San Antonio",
  "San Isidro",
  "San Martin de Porres",
  "Sun Valley",
] as const;

export const EXT_NAME_OPTIONS = ["Jr.", "Sr.", "II", "III", "IV"] as const;
