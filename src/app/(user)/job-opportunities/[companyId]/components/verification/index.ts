// Export main component as default
export { default } from "./VerifiedIdUpload";

// Export types for external use
export type { Message, SelectedImage, IdFormState } from "./types";

// Export constants if needed elsewhere
export { ID_TYPES, IMAGE_LABELS } from "./constants";
export type { IdType, ImageType } from "./constants";

// Export hooks for potential reuse
export { useExistingId } from "./hooks/useExistingId";
export { useIdForm } from "./hooks/useIdForm";

// Export utilities for potential reuse
export { getImageUrl, formatUploadDate, createFilePreview } from "./utils";

// Export sub-components if needed elsewhere
export { MessageBanner } from "./components/MessageBanner";
export { StepIndicator } from "./components/StepIndicator";
export { IdTypeSelector } from "./components/IdTypeSelector";
export { ImageUploadField } from "./components/ImageUploadField";
export { ImageViewCard } from "./components/ImageViewCard";
export { ImageModal } from "./components/ImageModal";
export { Instructions } from "./components/Instructions";
export { IdViewMode } from "./components/IdViewMode";
export { IdEditMode } from "./components/IdEditMode";
