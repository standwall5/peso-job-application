# Button Component Quick Reference Guide

## Overview
The `Button` component is the standardized button element used throughout the PESO Job Application. All buttons in the application should use this component for consistency.

## Import

```tsx
import Button from "@/components/Button";
```

## Props

```typescript
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "danger" | "success" | "warning";
};
```

All standard HTML button attributes are supported (onClick, disabled, type, etc.)

## Variants

### Primary (Blue)
Default variant. Use for main actions.

```tsx
<Button variant="primary">Login</Button>
<Button>Save</Button> {/* variant="primary" is default */}
```

**Use Cases:**
- Login/Sign up buttons
- Save/Submit forms
- Primary navigation actions

**Color:** `var(--button)` (#7adaef / #448bc5 on hover)

---

### Success (Green)
Use for positive/affirmative actions.

```tsx
<Button variant="success">Apply</Button>
<Button variant="success">Submit</Button>
```

**Use Cases:**
- Apply to jobs
- Submit applications
- Confirm actions
- Accept/Approve

**Color:** `var(--green-button)` (#80e7b1 / #5fcaaf on hover)

---

### Danger (Red)
Use for destructive actions.

```tsx
<Button variant="danger">Delete</Button>
<Button variant="danger">Cancel</Button>
```

**Use Cases:**
- Delete items
- Reject applications
- Dangerous operations
- Cancel with data loss

**Color:** #e53e3e / #c53030 on hover

---

### Warning (Yellow/Orange)
Use for caution or edit actions.

```tsx
<Button variant="warning">Edit Profile</Button>
<Button variant="warning">Update</Button>
```

**Use Cases:**
- Edit existing data
- Modify settings
- Actions requiring attention

**Color:** #fbbf24 (yellow-orange) / #f59e0b on hover
**Text Color:** #92400e (dark brown)

## Common Patterns

### Basic Button
```tsx
<Button variant="success">Apply Now</Button>
```

### With Click Handler
```tsx
<Button 
  variant="primary" 
  onClick={() => handleSubmit()}
>
  Submit Application
</Button>
```

### Disabled State
```tsx
<Button variant="success" disabled={isAlreadyApplied}>
  {isAlreadyApplied ? "Applied" : "Apply"}
</Button>
```

### Form Submit Button
```tsx
<Button type="submit" variant="primary">
  Register
</Button>
```

### Button with Icon/Loading
```tsx
<Button 
  variant="primary"
  style={{ display: "flex", alignItems: "center", gap: ".5rem" }}
>
  {loading && <OneEightyRing color="white" />}
  Login
</Button>
```

### Button Inside Link
```tsx
<Link href="/login">
  <Button variant="primary">Login</Button>
</Link>
```

### Button with Custom Styles
```tsx
<Button 
  variant="success"
  style={{ marginTop: "1rem", width: "100%" }}
>
  Apply
</Button>
```

### Button with ClassName (if needed)
```tsx
<Button 
  variant="primary"
  className={styles.customButton}
>
  Custom Styled
</Button>
```

## Features

### ✅ Hover Effects
- Subtle lift animation (translateY)
- Enhanced shadow on hover
- Smooth transitions

### ✅ Active States
- Press-down effect when clicked
- Reduced shadow for tactile feedback

### ✅ Disabled States
- Reduced opacity (0.6)
- No pointer cursor
- No hover effects
- Prevents clicks

### ✅ Accessibility
- Proper cursor states
- Keyboard navigation support
- Focus states (inherited from browser defaults)

## Do's and Don'ts

### ✅ DO

```tsx
// Use semantic variants
<Button variant="success">Apply</Button>
<Button variant="danger">Delete Job</Button>

// Use disabled for conditional states
<Button disabled={!formValid}>Submit</Button>

// Wrap in Link for navigation
<Link href="/jobs">
  <Button variant="primary">View Jobs</Button>
</Link>
```

### ❌ DON'T

```tsx
// Don't use raw button elements
<button className="green-button">Apply</button>

// Don't use old global classes
<button className="custom-button">Login</button>

// Don't nest Link inside Button (wrong order)
<Button>
  <Link href="/jobs">View Jobs</Link>
</Button>

// Don't style with inline background colors (use variants)
<Button style={{ backgroundColor: "red" }}>Delete</Button>
```

## Migration from Old Buttons

### Before
```tsx
<button className="green-button">Apply</button>
<button className="custom-button">Login</button>
<Link className="blue-button" href="/profile">Edit</Link>
<button className="grey-button">Update</button>
```

### After
```tsx
<Button variant="success">Apply</Button>
<Button variant="primary">Login</Button>
<Link href="/profile">
  <Button variant="warning">Edit</Button>
</Link>
<Button variant="warning">Update</Button>
```

## Styling Reference

### Base Styles
- Padding: `0.6rem 1.5rem`
- Border Radius: `8px`
- Font Size: `1rem`
- Font Weight: `500`
- Color: `white` (except warning variant)
- Transition: `all 0.2s ease`

### Hover Animation
- Transform: `translateY(-1px)`
- Enhanced box-shadow

### Active State
- Transform: `translateY(0)`
- Reduced box-shadow

### Disabled State
- Opacity: `0.6`
- Cursor: `not-allowed`
- No transform effects

## Browser Support

The Button component uses modern CSS features:
- CSS Variables (`var(--button)`, `var(--green-button)`)
- Transform and transitions
- Box-shadow effects

**Supported:** All modern browsers (Chrome, Firefox, Safari, Edge)

## Component Location

```
src/
├── components/
│   ├── Button.tsx          # Main component
│   └── Button.module.css   # Styles
```

## Related Documentation

- `BUTTON_STANDARDIZATION.md` - Migration guide and changes log
- `DESIGN_SYSTEM.md` - Overall design system
- Component source: `src/components/Button.tsx`

## Need a New Variant?

If you need a new button style:

1. Add the variant type to `ButtonProps` in `Button.tsx`
2. Add corresponding CSS class in `Button.module.css`
3. Update this guide with the new variant
4. Consider if it's truly needed (avoid variant proliferation)

## Questions?

- Check `Button.tsx` for the latest props
- Check `Button.module.css` for current styles
- Review existing usage in the codebase
- Ask the development team

---

**Last Updated:** 2024  
**Component Version:** 1.0  
**Status:** ✅ Production Ready