# Verified ID Upload - Refactored Structure

This directory contains the refactored Verified ID Upload feature, broken down into smaller, maintainable components, hooks, and utilities.

## 📁 Directory Structure

```
verification/
├── README.md                          # This file
├── VerifiedIdUpload.tsx              # Main orchestrating component (180 lines, down from 809)
├── VerifiedIdUpload.module.css       # Shared styles
├── constants.ts                       # ID types and labels
├── types.ts                          # TypeScript interfaces
├── utils.ts                          # Utility functions
├── hooks/
│   ├── useExistingId.ts             # Custom hook for fetching existing ID data
│   └── useIdForm.ts                 # Custom hook for form state management
└── components/
    ├── IdViewMode.tsx               # View mode - displays existing ID
    ├── IdEditMode.tsx               # Edit/upload mode - form component
    ├── ImageUploadField.tsx         # Reusable image upload field
    ├── ImageViewCard.tsx            # Display uploaded image card
    ├── ImageModal.tsx               # Image enlargement modal
    ├── MessageBanner.tsx            # Success/error message display
    ├── StepIndicator.tsx            # Step progress indicator
    ├── IdTypeSelector.tsx           # ID type dropdown selector
    └── Instructions.tsx             # Instructions list
```

## 🎯 Benefits of Refactoring

### Before
- **809 lines** in a single file
- **12+ useState hooks** in one component
- Repeated JSX patterns
- Mixed concerns (view, edit, validation, API calls)
- Difficult to test and maintain

### After
- **180 lines** in main component (77% reduction)
- **Separated concerns** into focused modules
- **Reusable components** that can be used elsewhere
- **Custom hooks** for business logic
- **Type safety** with proper TypeScript interfaces
- **Easy to test** each piece independently

## 📦 Component Overview

### Main Component
**`VerifiedIdUpload.tsx`**
- Orchestrates the overall flow
- Manages view vs edit mode
- Handles form submission
- Delegates rendering to sub-components

### Custom Hooks

**`useExistingId()`**
```typescript
const { existingId, loading, error, refetch } = useExistingId();
```
- Fetches existing ID data on mount
- Provides refetch function for updates
- Handles loading and error states

**`useIdForm(initialIdType)`**
```typescript
const {
  idType, idFront, idBack, selfie, step, previews,
  setIdType, setStep, handleFileChange, resetForm,
  canProceedStep1, canSubmit
} = useIdForm(existingId?.id_type);
```
- Manages all form state
- Handles file uploads and preview generation
- Provides validation functions
- Resets form state

### Sub-Components

**`IdViewMode`**
- Displays existing verified ID
- Shows ID type and upload date
- Image grid with click-to-enlarge
- Edit button to enter edit mode

**`IdEditMode`**
- Upload/edit form
- Multi-step flow for new uploads
- Single-page edit for existing IDs
- Validation and submission

**`ImageUploadField`**
- Reusable image upload component
- Handles front, back, and selfie uploads
- Shows preview or current image
- Supports required/optional states

**`ImageViewCard`**
- Displays uploaded image in view mode
- Click to enlarge functionality
- Labeled with image type

**`ImageModal`**
- Full-screen image viewer
- Click outside to close
- Used for viewing uploaded images

**`MessageBanner`**
- Success/error message display
- Color-coded by type
- Icon indicator

**`StepIndicator`**
- Visual progress through upload steps
- Shows current step and completion

**`IdTypeSelector`**
- Dropdown for ID type selection
- Populated from constants
- Required field indicator

**`Instructions`**
- Static instructions list
- Displayed on new uploads
- Guidelines for image quality

## 🔧 Utilities

**`utils.ts`**
- `getImageUrl(path)` - Generate API URL for image viewing
- `formatUploadDate(date)` - Format upload date for display
- `createFilePreview(file)` - Generate base64 preview from File

**`constants.ts`**
- `ID_TYPES` - Array of valid ID types
- `IMAGE_LABELS` - Human-readable labels for image types

**`types.ts`**
- `IdFormState` - Form state interface
- `Message` - Success/error message interface
- `SelectedImage` - Modal image interface

## 🚀 Usage Example

```typescript
import VerifiedIdUpload from "./components/verification/VerifiedIdUpload";

function MyComponent() {
  return (
    <VerifiedIdUpload
      jobId={123}
      onSubmitted={() => console.log("ID submitted!")}
      showSubmitButton={true}
      onSubmitFinalApplication={() => console.log("Application submitted!")}
    />
  );
}
```

## 🧪 Testing Strategy

With this refactored structure, you can now test:

1. **Hooks independently**
   ```typescript
   test('useIdForm validates form correctly', () => {
     const { result } = renderHook(() => useIdForm());
     // Test validation logic
   });
   ```

2. **Components in isolation**
   ```typescript
   test('MessageBanner displays error correctly', () => {
     render(<MessageBanner message={{ text: "Error", type: "error" }} />);
     // Test rendering
   });
   ```

3. **Utilities as pure functions**
   ```typescript
   test('formatUploadDate formats correctly', () => {
     const result = formatUploadDate('2024-01-15');
     expect(result).toBe('January 15, 2024');
   });
   ```

## 🔄 State Flow

```
VerifiedIdUpload
├─> useExistingId() ──> Fetches existing ID from API
├─> useIdForm() ──────> Manages form state & validation
│
├─> existingId && !editMode
│   └─> IdViewMode ───> Displays existing ID
│       └─> ImageViewCard (x3)
│       └─> ImageModal (conditional)
│
└─> editMode || !existingId
    └─> IdEditMode ───> Upload/edit form
        ├─> StepIndicator (new uploads only)
        ├─> IdTypeSelector
        ├─> ImageUploadField (x3)
        └─> Instructions (new uploads only)
```

## 📝 Adding New Features

### Add a new ID type
1. Update `constants.ts` - add to `ID_TYPES` array
2. No other changes needed!

### Add a new image type
1. Update `constants.ts` - add to `ImageType` and `IMAGE_LABELS`
2. Update `types.ts` - extend `IdFormState` if needed
3. Use `ImageUploadField` component with new type

### Add validation
1. Add validation function to `useIdForm` hook
2. Call it in the main component before submission

## 🎨 Styling

All components share the same CSS module: `VerifiedIdUpload.module.css`

This maintains consistent styling while keeping the component structure modular.

## 🔐 Security Considerations

- File uploads are validated on the server
- Image URLs use API proxy (`/api/verified-id/view`)
- No direct file system paths exposed
- User-uploaded content is isolated

## 📚 Further Improvements

Potential enhancements for the future:

1. **Image compression** before upload
2. **Drag-and-drop** file upload
3. **Camera capture** on mobile devices
4. **Progress indicators** for upload
5. **Image cropping/editing** tools
6. **Accessibility improvements** (ARIA labels, keyboard navigation)
7. **Unit tests** for all components and hooks
8. **Storybook stories** for component documentation

## 🤝 Contributing

When adding new features:
1. Keep components focused (single responsibility)
2. Extract reusable logic into hooks
3. Use TypeScript for type safety
4. Update this README with changes
5. Test components in isolation

---

**Refactored**: January 2024
**Original File Size**: 809 lines
**New Main Component**: 180 lines (77% reduction)
**Total Files**: 14 files (better organization)