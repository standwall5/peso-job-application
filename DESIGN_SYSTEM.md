# PESO Job Application - Design System

> Modern, consistent, and performance-optimized design patterns used across the application.

## 📋 Table of Contents
- [Color Palette](#color-palette)
- [Typography](#typography)
- [Spacing & Layout](#spacing--layout)
- [Shadows & Elevation](#shadows--elevation)
- [Borders & Corners](#borders--corners)
- [Animations & Transitions](#animations--transitions)
- [Component Patterns](#component-patterns)
- [Performance Optimizations](#performance-optimizations)

---

## 🎨 Color Palette

### CSS Variables (defined in `globals.css`)
```css
:root {
    --foreground: #171717;
    --text: #040316;
    --background: #fbfbfe;
    --highlight: #eaffee;
    --accent: #80e7b1;          /* Green accent */
    --button: #7adaef;          /* Blue accent */
    --green-button: #80e7b1;
    --warning-bg: #fffdf1;
    --nav: #1278d4;
}
```

### Semantic Colors
- **Primary Text**: `#1e293b` or `var(--text)`
- **Secondary Text**: `#64748b`
- **Muted Text**: `#94a3b8`
- **Borders**: `rgba(52, 152, 219, 0.1)` - Light blue tint
- **Hover Background**: `#f8fcff` - Very light blue

### Gradient Accents
```css
/* Primary Gradient */
background: linear-gradient(90deg, var(--accent), var(--button));
/* Green to Blue: #80e7b1 → #7adaef */

/* Diagonal Gradient */
background: linear-gradient(135deg, var(--accent), var(--button));

/* Orange Gradient (for highlights/warnings) */
background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
```

---

## 📝 Typography

### Font Families
- **Primary**: `var(--font-geist), sans-serif`
- **Headings**: `var(--font-poppins-sans), sans-serif`

### Font Sizes
```css
/* Headings */
h1: 2rem (32px)
h2: 1.5rem (24px)
h3: 1.25rem (20px)

/* Body Text */
Body: 0.875rem (14px)
Small: 0.8125rem (13px)
Extra Small: 0.75rem (12px)

/* Labels/Stats */
Uppercase Labels: 0.7rem (11.2px)
Letter Spacing: 0.5px
```

### Font Weights
- Regular: `400`
- Medium: `500`
- Semibold: `600`
- Bold: `700`

---

## 📐 Spacing & Layout

### Card Spacing
```css
padding: 1.5rem;           /* Standard card padding */
padding: 1.25rem 1.75rem;  /* Sort/filter containers */
gap: 1rem;                 /* Default gap between elements */
gap: 0.75rem;              /* Compact gap */
```

### Section Spacing
```css
margin-bottom: 1.75rem;    /* Between major sections */
margin-bottom: 1.5rem;     /* Between cards */
margin-bottom: 1rem;       /* Between related elements */
```

### Grid Systems
```css
/* Job Cards - 4 columns on desktop */
display: grid;
grid-template-columns: repeat(4, 1fr);
gap: 1.75rem;

/* Responsive breakpoints */
@media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
}

@media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
}
```

---

## 🌟 Shadows & Elevation

### Standard Card Shadow
```css
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
```

### Hover State Shadow
```css
box-shadow: 0 8px 24px rgba(52, 152, 219, 0.15);
```

### Focused/Active Shadow
```css
box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
```

### Input Focus Shadow (Green Accent)
```css
box-shadow:
    rgba(128, 231, 177, 0.3) 0px 6px 24px 0px,
    rgba(128, 231, 177, 0.5) 0px 0px 0px 2px,
    0 0 0 4px rgba(128, 231, 177, 0.1);
```

### Legacy Shadow (globals.css)
```css
box-shadow:
    rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,
    rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
```

---

## 🔲 Borders & Corners

### Border Radius
```css
border-radius: 1.25rem;  /* Standard cards */
border-radius: 1rem;     /* Inner elements, inputs */
border-radius: 0.5rem;   /* Buttons, small elements */
border-radius: 2rem;     /* Pills/badges */
```

### Border Colors
```css
/* Light border */
border: 1px solid rgba(52, 152, 219, 0.1);

/* Hover border */
border-color: rgba(52, 152, 219, 0.3);

/* Focus border (green) */
border-color: var(--accent);
```

---

## 🎬 Animations & Transitions

### Standard Transition
```css
transition: all 0.25s ease;
```

### Component-Specific Transitions
```css
/* Cards */
transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;

/* Buttons */
transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
```

### Hover Effects

#### Lift Effect (Cards)
```css
.card:hover {
    transform: translateY(-6px);
    box-shadow: 0 8px 24px rgba(52, 152, 219, 0.15);
    border-color: rgba(52, 152, 219, 0.3);
}
```

#### Subtle Lift (Buttons)
```css
.button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.15);
}
```

#### Scale Effect (Images/Icons)
```css
.logo:hover {
    transform: scale(1.1);
}
```

### Performance Optimizations
```css
/* Use will-change sparingly */
will-change: transform;

/* Remove after animation */
transition: transform 0.25s ease, will-change 0s 0.25s;
```

---

## 🧩 Component Patterns

### Gradient Accent Bar
Used on cards to add visual interest without performance cost.

```css
.card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--accent), var(--button));
    transform: scaleX(0);
    transition: transform 0.3s ease;
}

.card:hover::before {
    transform: scaleX(1);
}
```

**Used in:**
- Job cards (`JobHome.module.css`)
- Company cards
- Dashboard cards

### Background Overlay Pattern
For hero sections and headers with background images.

```css
/* Blurred image layer */
.header::before {
    content: "";
    position: absolute;
    inset: 0;
    background: url("/assets/image.jpg");
    background-size: cover;
    background-position: center;
    mask-image: linear-gradient(to bottom, transparent 0%, black 60%);
    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 60%);
}

/* Gradient overlay */
.header::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--accent) 85%, transparent),
        color-mix(in srgb, var(--button) 70%, transparent)
    );
}

/* Content stays on top */
.header > * {
    position: relative;
    z-index: 2;
}
```

**Used in:**
- Job opportunities welcome section
- About page header

### Modern Logo Container
```css
.logo {
    border-radius: 1rem;
    width: 4.5rem;
    height: 4.5rem;
    object-fit: contain;
    padding: 0.5rem;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(52, 152, 219, 0.1);
    transition: transform 0.25s ease;
}

.card:hover .logo {
    transform: scale(1.1);
}
```

### Text Truncation
For responsive text overflow.

```css
.description {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
```

---

## ⚡ Performance Optimizations

### Removed Features
❌ **Backdrop Filters** - Too expensive for low-end devices
```css
/* REMOVED: backdrop-filter: blur(10px); */
```

❌ **Text Gradients** - Replaced with solid colors for performance
```css
/* OLD: background: linear-gradient(...); -webkit-background-clip: text; */
/* NEW: color: var(--accent); */
```

### Best Practices

✅ **Single Shadows** - Use one shadow instead of multiple
```css
/* GOOD */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

/* AVOID */
box-shadow: 0 2px 4px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1);
```

✅ **Will-Change** - Use sparingly and remove after animation
```css
will-change: transform;
```

✅ **Transform over Position** - Hardware accelerated
```css
/* GOOD */
transform: translateY(-6px);

/* AVOID */
top: -6px;
```

---

## 📱 Responsive Design

### Breakpoints
```css
/* Tablet */
@media (max-width: 768px) { }

/* Mobile */
@media (max-width: 480px) { }
```

### Mobile Adjustments
- Reduce padding: `1.5rem → 1rem → 0.75rem`
- Reduce font sizes: `0.875rem → 0.8125rem → 0.75rem`
- Reduce gaps: `1.75rem → 1.25rem → 1rem`
- Stack layouts: `grid` columns reduce
- Full width buttons

---

## 🎯 Usage Examples

### Standard Card
```css
.card {
    padding: 1.5rem;
    border-radius: 1.25rem;
    background: #ffffff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(52, 152, 219, 0.1);
    transition: all 0.25s ease;
}

.card:hover {
    transform: translateY(-6px);
    box-shadow: 0 8px 24px rgba(52, 152, 219, 0.15);
    border-color: rgba(52, 152, 219, 0.3);
    background: #f8fcff;
}
```

### Input Field
```css
.input {
    padding: 0.75rem 1.25rem;
    border-radius: 1rem;
    border: 1px solid rgba(52, 152, 219, 0.1);
    background: white;
    font-size: 0.875rem;
    transition: all 0.25s ease;
    outline: none;
}

.input:focus {
    border-color: var(--accent);
    box-shadow:
        rgba(128, 231, 177, 0.3) 0px 6px 24px 0px,
        rgba(128, 231, 177, 0.5) 0px 0px 0px 2px,
        0 0 0 4px rgba(128, 231, 177, 0.1);
}
```

### Button with Gradient
```css
.button {
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    background: linear-gradient(135deg, var(--accent), var(--button));
    color: white;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 2px 8px rgba(52, 152, 219, 0.2);
}

.button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(52, 152, 219, 0.3);
}
```

---

## 🔄 Consistency Checklist

When creating new components, ensure:

- [ ] Use standard border radius (`1.25rem` for cards, `1rem` for inputs)
- [ ] Use standard shadow (`0 4px 12px rgba(0, 0, 0, 0.08)`)
- [ ] Use standard border (`1px solid rgba(52, 152, 219, 0.1)`)
- [ ] Add hover lift effect (`translateY(-6px)` for cards, `-2px` for buttons)
- [ ] Use `0.25s ease` transitions
- [ ] Follow color palette (use CSS variables)
- [ ] Add gradient accent bar for visual interest
- [ ] Ensure responsive behavior (test at 768px and 480px)
- [ ] Use `will-change` sparingly
- [ ] Avoid backdrop-filter and text gradients

---

**Last Updated**: January 2025  
**Maintained By**: Development Team