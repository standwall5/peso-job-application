// Type definitions for ID verification

export interface IdFormState {
  idType: string;
  idFront: File | null;
  idBack: File | null;
  selfie: File | null;
  step: number;
  previews: {
    front?: string;
    back?: string;
    selfie?: string;
  };
}

export interface Message {
  text: string;
  type: "success" | "error";
}

export interface SelectedImage {
  type: "front" | "back" | "selfie";
  url: string;
}
