# City Selection Implementation Guide

## Overview
This guide explains how to implement city selection for non-Parañaque residents in the signup and profile management system.

## Database Changes

### 1. Run SQL Migration
Execute the migration file: `sql/migrations/add_city_field.sql`

```sql
-- Add city column
ALTER TABLE public.applicants ADD COLUMN IF NOT EXISTS city text;

-- Add comment
COMMENT ON COLUMN public.applicants.city IS 'City where the applicant resides';

-- Update existing records
UPDATE public.applicants
SET city = 'Parañaque'
WHERE city IS NULL AND (district IS NOT NULL OR barangay IS NOT NULL);

-- Add index
CREATE INDEX IF NOT EXISTS idx_applicants_city ON public.applicants(city);
```

## Location Data Constants

The file `src/constants/locationData.ts` contains:

### Cities Supported
- **Parañaque** - District 1 & 2 (original)
- **Las Piñas** - District 1 & 2
- **Muntinlupa** - All Areas (9 barangays)
- **Pasay** - All Areas (201 barangays)
- **Makati** - District 1 & 2 (31 barangays each)
- **Taguig** - All Areas (28 barangays)

### Usage Example
```typescript
import { CITIES, getDistrictsForCity, getBarangaysForCityAndDistrict } from '@/constants/locationData';

const districts = getDistrictsForCity('Las Piñas'); // ['District 1', 'District 2']
const barangays = getBarangaysForCityAndDistrict('Muntinlupa', 'All Areas'); 
// ['Alabang', 'Ayala Alabang', ...]
```

## Implementation Steps

### Step 1: Update `useFormHandlers.ts`

Add city state and handler:

```typescript
const [city, setCity] = useState("");

const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const newCity = e.target.value;
  setCity(newCity);
  // Reset dependent fields when city changes
  setDistrict("");
  setBarangay("");
  setPreferredPlace("");
  validationHook.clearError("city");
  validationHook.clearError("district");
  validationHook.clearError("barangay");
};

// Return in the hook
return {
  // ... other returns
  city,
  handleCityChange,
  // ... rest
};
```

### Step 2: Update `SignUpForm.tsx`

Pass city props to AddressSection:

```typescript
<AddressSection
  residency={formHandlers.residency}
  city={formHandlers.city}  // ADD THIS
  district={formHandlers.district}
  barangay={formHandlers.barangay}
  preferredPlace={formHandlers.preferredPlace}
  onResidencyChange={formHandlers.handleResidencyChange}
  onCityChange={formHandlers.handleCityChange}  // ADD THIS
  onDistrictChange={formHandlers.handleDistrictChange}
  onBarangayChange={formHandlers.handlebarangayChange}
  onPreferredPlaceChange={formHandlers.handlePreferredPlaceChange}
  onInputChange={formHandlers.handleInputChange}
  errors={formHandlers.validationHook.errors}
/>
```

### Step 3: Update `useFormSubmission.ts`

Add city to the form data:

```typescript
// In the FormData interface
interface FormData {
  // ... existing fields
  city: string;  // ADD THIS
  district: string;
  barangay: string;
  preferredPoa: string;
}

// In the submission function
const formData: FormData = {
  // ... existing fields
  city: city,  // ADD THIS from props
  district: district,
  barangay: barangay,
  preferredPoa: preferredPlace,
};
```

### Step 4: Update `ProfileHeader.tsx`

Add city selection to profile editing:

```typescript
// Add state
const [editableCity, setEditableCity] = useState("");

// Initialize from user data
useEffect(() => {
  setEditableCity(user.city || "Parañaque");
  // ... other initializations
}, [user]);

// Add city select in edit mode
<div className={styles.contactItem}>
  <span className={styles.contactLabel}>CITY:</span>
  {isEditingProfile ? (
    <select
      value={editableCity}
      onChange={(e) => {
        setEditableCity(e.target.value);
        setEditableDistrict(""); // Reset district
        setEditablePreferredPoa(""); // Reset POA
      }}
      className={styles.selectInput}
    >
      <option value="">Select city</option>
      {CITIES.map((city) => (
        <option key={city} value={city}>{city}</option>
      ))}
    </select>
  ) : (
    <span className={styles.contactValue}>{user.city || "Not set"}</span>
  )}
</div>

// Update district and barangay dropdowns to use city-based data
import { getDistrictsForCity, getBarangaysForCityAndDistrict } from '@/constants/locationData';

const availableDistricts = editableCity ? getDistrictsForCity(editableCity as City) : [];
const availableBarangays = editableCity && editableDistrict 
  ? getBarangaysForCityAndDistrict(editableCity as City, editableDistrict) 
  : [];
```

### Step 5: Update Server Actions

Update signup and profile actions to handle city field:

```typescript
// In signup action
const { data: insertedApplicant, error: applicantError } = await supabase
  .from("applicants")
  .insert({
    auth_id: user.id,
    name: formData.firstName + " " + formData.middleName + " " + formData.lastName,
    city: formData.city,  // ADD THIS
    district: formData.district,
    barangay: formData.barangay,
    // ... other fields
  });

// In profile update action
await supabase
  .from("applicants")
  .update({
    city: data.city,  // ADD THIS
    district: data.district,
    barangay: data.barangay,
    // ... other fields
  })
  .eq("auth_id", user.id);
```

## Validation Rules

### City Field
- **Required**: Yes
- **Options**: One of the cities in CITIES constant
- **Error Message**: "Please select your city"

### District Field
- **Required**: Only if city has districts (not "All Areas")
- **Conditional**: Depends on selected city
- **Error Message**: "Please select your district"

### Barangay Field  
- **Required**: Yes
- **Conditional**: Options depend on city and district
- **Error Message**: "Please select your barangay"

### Preferred Place of Assignment
- **Required**: Yes
- **Options**: All barangays from the selected city (combined from all districts)
- **Error Message**: "Please select your preferred place of assignment"

## UI/UX Considerations

1. **Field Order**: City → District (if applicable) → Barangay
2. **Reset Behavior**: When city changes, reset district, barangay, and preferred place
3. **Disabled States**: 
   - District dropdown disabled until city is selected
   - Barangay dropdown disabled until district is selected (for cities with districts)
4. **Labels**: Keep consistent with "City", "District", "Barangay"

## Testing Checklist

- [ ] User can select each city from the dropdown
- [ ] District dropdown shows correct districts for selected city
- [ ] Cities with "All Areas" skip district selection
- [ ] Barangay dropdown shows correct barangays based on city/district
- [ ] Preferred place of assignment shows all barangays for selected city
- [ ] Changing city resets dependent fields
- [ ] Form validation prevents submission with incomplete location data
- [ ] Database correctly stores city field
- [ ] Profile editing allows city changes
- [ ] Existing users default to "Parañaque" after migration

## Data Sources

Barangay data sourced from:
- **Parañaque**: Existing system data
- **Las Piñas**: Wikipedia - https://en.wikipedia.org/wiki/Las_Piñas
- **Muntinlupa**: Wikipedia - https://en.wikipedia.org/wiki/Muntinlupa
- **Pasay**: Official government data (201 barangays)
- **Makati**: Official barangay listing (31 barangays)
- **Taguig**: Official barangay listing (28 barangays)

## Notes

- The `residency` field remains separate to indicate if someone is from Parañaque specifically
- `city` field is used to determine which districts/barangays to show
- For Parañaque users, city should be set to "Parañaque"
- Non-Parañaque users will have their respective cities
- The `preferred_poa` (preferred place of assignment) can still be any barangay in the user's city