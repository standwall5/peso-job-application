// Constants for ID verification
export const ID_TYPES = [
  "PhilHealth",
  "UMID",
  "Driver's License",
  "Passport",
  "Voter's ID",
  "PRC ID",
  "SSS",
  "TIN",
  "Postal ID",
  "Other",
] as const;

export type IdType = typeof ID_TYPES[number];

export type ImageType = "front" | "back" | "selfie";

export const IMAGE_LABELS: Record<ImageType, string> = {
  front: "Front of ID",
  back: "Back of ID",
  selfie: "Selfie with ID",
};
