# 🎨 PESO Job Application - Design System Guide

A comprehensive guide to modern, performance-optimized CSS patterns used in this project.

---

## 📋 Table of Contents

1. [Color System](#color-system)
2. [Typography](#typography)
3. [Spacing & Layout](#spacing--layout)
4. [Shadows & Depth](#shadows--depth)
5. [Border Radius](#border-radius)
6. [Card Components](#card-components)
7. [Hover Effects](#hover-effects)
8. [Input Fields](#input-fields)
9. [Gradients](#gradients)
10. [Animations & Transitions](#animations--transitions)
11. [Performance Best Practices](#performance-best-practices)

---

## 🎨 Color System

### CSS Variables (Define in your `globals.css`)

```css
:root {
  --accent: #3498db;        /* Primary blue */
  --button: #27ae60;        /* Primary green */
  --highlight: #f0f9ff;     /* Light blue highlight */
  --text-primary: #1e293b;  /* Dark gray for headings */
  --text-secondary: #64748b; /* Medium gray for body text */
  --text-muted: #94a3b8;    /* Light gray for labels */
  --border-light: rgba(52, 152, 219, 0.1);
  --border-medium: rgba(52, 152, 219, 0.3);
}
```

### Usage Examples

```css
/* Primary accent color */
color: var(--accent);

/* Text colors */
color: var(--text-primary);   /* Headings */
color: var(--text-secondary); /* Body text */
color: var(--text-muted);     /* Labels, captions */

/* Borders */
border: 1px solid var(--border-light);
```

---

## ✍️ Typography

### Font Sizes (Modern Scale)

```css
/* Headings */
.heading-xl { font-size: 2rem; }      /* 32px */
.heading-lg { font-size: 1.75rem; }   /* 28px */
.heading-md { font-size: 1.25rem; }   /* 20px */
.heading-sm { font-size: 1rem; }      /* 16px */

/* Body Text */
.text-lg { font-size: 1rem; }         /* 16px */
.text-base { font-size: 0.875rem; }   /* 14px */
.text-sm { font-size: 0.8rem; }       /* 12.8px */
.text-xs { font-size: 0.7rem; }       /* 11.2px */
```

### Font Weights

```css
.font-light { font-weight: 300; }
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
```

### Typography Best Practices

```css
/* Headings */
h1, h2, h3 {
  font-weight: 600;
  line-height: 1.2;
  color: var(--text-primary);
  margin: 0;
}

/* Body text */
p {
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
}

/* Labels (uppercase, tracking) */
.label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
}
```

### Text Truncation (Ellipsis)

```css
/* Single line */
.truncate-1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Multiple lines (2 lines) */
.truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

---

## 📏 Spacing & Layout

### Spacing Scale

```css
/* Use these values for padding, margin, gap */
.spacing-xs { /* 0.25rem */ }  /* 4px */
.spacing-sm { /* 0.5rem */ }   /* 8px */
.spacing-md { /* 1rem */ }     /* 16px */
.spacing-lg { /* 1.5rem */ }   /* 24px */
.spacing-xl { /* 2rem */ }     /* 32px */
.spacing-2xl { /* 3rem */ }    /* 48px */
```

### Example Usage

```css
.card {
  padding: 1.5rem;        /* spacing-lg */
  gap: 1rem;              /* spacing-md */
  margin-bottom: 2rem;    /* spacing-xl */
}
```

---

## 🌑 Shadows & Depth

### Shadow Levels (Performance-Optimized)

```css
/* Subtle shadow - for resting state */
.shadow-sm {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Medium shadow - for cards */
.shadow-md {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Large shadow - for hover/elevated state */
.shadow-lg {
  box-shadow: 0 8px 24px rgba(52, 152, 219, 0.15);
}

/* Extra large shadow - for modals/overlays */
.shadow-xl {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}
```

### Colored Shadows (Brand Accent)

```css
/* Accent shadow for interactive elements */
.shadow-accent {
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.15);
}

/* Hover accent shadow */
.shadow-accent-lg {
  box-shadow: 0 8px 24px rgba(52, 152, 219, 0.20);
}
```

### Text Shadows (For Overlays)

```css
/* Subtle glow - for white text on images */
.text-shadow-soft {
  text-shadow:
    0 2px 4px rgba(0, 0, 0, 0.18),
    0 6px 24px rgba(0, 0, 0, 0.15);
}

/* Strong contrast - for readability */
.text-shadow-strong {
  text-shadow:
    0 2px 8px rgba(0, 0, 0, 0.35),
    0 0px 1px rgba(0, 0, 0, 0.15);
}
```

---

## 🔲 Border Radius

### Radius Scale

```css
.rounded-none { border-radius: 0; }
.rounded-sm { border-radius: 0.25rem; }   /* 4px */
.rounded { border-radius: 0.5rem; }       /* 8px */
.rounded-md { border-radius: 0.75rem; }   /* 12px */
.rounded-lg { border-radius: 1rem; }      /* 16px */
.rounded-xl { border-radius: 1.25rem; }   /* 20px */
.rounded-2xl { border-radius: 1.5rem; }   /* 24px */
.rounded-full { border-radius: 9999px; }  /* Fully round */
```

### Usage Guidelines

```css
/* Cards */
border-radius: 1.25rem; /* rounded-xl */

/* Buttons */
border-radius: 0.5rem;  /* rounded */

/* Input fields */
border-radius: 2rem;    /* rounded-full for pill shape */

/* Logos/avatars */
border-radius: 1rem;    /* rounded-lg for modern look */
/* OR */
border-radius: 100%;    /* rounded-full for circular */
```

---

## 🃏 Card Components

### Modern Card (Base)

```css
.card {
  padding: 1.5rem;
  border-radius: 1.25rem;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-light);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
  cursor: pointer;
  will-change: transform;
}

.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(52, 152, 219, 0.15);
  border-color: var(--border-medium);
}
```

### Card with Top Border Accent

```css
.card-accent {
  position: relative;
  overflow: hidden;
  /* ... base card styles ... */
}

.card-accent::before {
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

.card-accent:hover::before {
  transform: scaleX(1);
}
```

### Grid Layout for Cards

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.75rem;
  width: 100%;
}

/* Fixed columns (e.g., 4 columns) */
.card-grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.75rem;
}
```

---

## 🖱️ Hover Effects

### Lift Effect (Most Common)

```css
.hover-lift {
  transition: transform 0.25s ease;
  will-change: transform;
}

.hover-lift:hover {
  transform: translateY(-6px);
}
```

### Scale Effect

```css
.hover-scale {
  transition: transform 0.25s ease;
  will-change: transform;
}

.hover-scale:hover {
  transform: scale(1.05);
}
```

### Glow Effect (Accent Border)

```css
.hover-glow {
  border: 1px solid var(--border-light);
  transition: border-color 0.25s ease;
}

.hover-glow:hover {
  border-color: var(--accent);
}
```

### Background Color Change

```css
.hover-bg {
  background: #ffffff;
  transition: background 0.25s ease;
}

.hover-bg:hover {
  background: #f8fcff;
}
```

### Combined Hover (Recommended)

```css
.interactive-card {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-light);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
  will-change: transform;
}

.interactive-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(52, 152, 219, 0.15);
  border-color: var(--border-medium);
}
```

---

## 🔍 Input Fields

### Modern Text Input

```css
.input {
  width: 100%;
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  background: #ffffff;
  border: 1px solid var(--border-light);
  font-size: 0.875rem;
  color: var(--text-primary);
  transition: all 0.2s ease;
  outline: none;
}

.input::placeholder {
  color: var(--text-muted);
}

.input:focus {
  border-color: var(--accent);
  box-shadow:
    0 0 0 3px rgba(52, 152, 219, 0.1),
    0 2px 8px rgba(52, 152, 219, 0.15);
}
```

### Pill-Shaped Search Input

```css
.search-input {
  width: 25rem;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  background: #ffffff;
  border: none;
  font-size: 0.875rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  outline: none;
}

.search-input:focus {
  box-shadow:
    0 0 0 3px rgba(52, 152, 219, 0.1),
    0 4px 16px rgba(52, 152, 219, 0.2);
}
```

---

## 🌈 Gradients

### Background Gradients

```css
/* Accent gradient (diagonal) */
.gradient-accent {
  background: linear-gradient(135deg, var(--accent), var(--button));
}

/* Subtle gradient (light) */
.gradient-light {
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
}

/* Overlay gradient (for images) */
.gradient-overlay {
  background: linear-gradient(
    135deg,
    rgba(52, 152, 219, 0.85),
    rgba(39, 174, 96, 0.70)
  );
}
```

### Gradient with Transparency (Over Images)

```css
.image-overlay::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent) 85%, transparent),
    color-mix(in srgb, var(--button) 70%, transparent)
  );
  pointer-events: none;
}
```

### Top Border Gradient

```css
.gradient-border-top {
  position: relative;
}

.gradient-border-top::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--button));
}
```

---

## ⚡ Animations & Transitions

### Standard Transition Duration

```css
/* Fast - for small UI elements */
transition: all 0.15s ease;

/* Medium - for most interactions (RECOMMENDED) */
transition: all 0.25s ease;

/* Slow - for large movements */
transition: all 0.4s ease;
```

### Easing Functions

```css
/* Linear - constant speed */
transition: all 0.25s linear;

/* Ease - default, good for most cases */
transition: all 0.25s ease;

/* Ease-in-out - smooth start and end */
transition: all 0.25s ease-in-out;

/* Custom cubic-bezier - bouncy effect */
transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
```

### Individual Property Transitions (Performance)

```css
/* Better performance than "all" */
.optimized {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease,
    box-shadow 0.25s ease;
}
```

### Keyframe Animation Example

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeInUp 0.5s ease;
}
```

### Pulse Animation (For Notifications)

```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}
```

---

## 🚀 Performance Best Practices

### ✅ DO (Performance-Friendly)

```css
/* 1. Use transform instead of top/left */
.good {
  transform: translateY(-6px); /* GPU-accelerated ✅ */
}

/* 2. Use opacity for fade effects */
.good {
  opacity: 0.5; /* GPU-accelerated ✅ */
}

/* 3. Use will-change for frequent animations */
.good {
  will-change: transform;
  transition: transform 0.25s ease;
}

/* 4. Use single box-shadow */
.good {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* ✅ */
}

/* 5. Transition specific properties */
.good {
  transition: transform 0.25s ease, opacity 0.25s ease; /* ✅ */
}
```

### ❌ DON'T (Performance Issues)

```css
/* 1. Avoid backdrop-filter on many elements */
.bad {
  backdrop-filter: blur(10px); /* ❌ Heavy on GPU */
}

/* 2. Avoid multiple box-shadows */
.bad {
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.1),
    0 4px 8px rgba(0, 0, 0, 0.1),
    0 8px 16px rgba(0, 0, 0, 0.1); /* ❌ Expensive */
}

/* 3. Avoid transitioning "all" */
.bad {
  transition: all 0.3s ease; /* ❌ Can cause jank */
}

/* 4. Avoid filter on many elements */
.bad {
  filter: blur(5px); /* ❌ CPU-intensive */
}

/* 5. Avoid animating width/height */
.bad {
  transition: width 0.3s ease; /* ❌ Causes reflow */
}
```

### GPU-Accelerated Properties

Only these properties are GPU-accelerated (use for animations):
- `transform` (translate, scale, rotate)
- `opacity`
- `filter` (use sparingly)

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile first approach */
.container {
  /* Mobile styles (default) */
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    /* Tablet styles */
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    /* Desktop styles */
  }
}

/* Large desktop */
@media (min-width: 1280px) {
  .container {
    /* Large desktop styles */
  }
}
```

### Responsive Grid

```css
/* Auto-fit columns based on screen size */
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

/* Specific column counts per breakpoint */
.responsive-grid-specific {
  display: grid;
  grid-template-columns: 1fr; /* Mobile: 1 column */
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .responsive-grid-specific {
    grid-template-columns: repeat(2, 1fr); /* Tablet: 2 columns */
  }
}

@media (min-width: 1024px) {
  .responsive-grid-specific {
    grid-template-columns: repeat(4, 1fr); /* Desktop: 4 columns */
  }
}
```

---

## 🎯 Quick Reference Cheat Sheet

### Modern Card Template

```css
.modern-card {
  padding: 1.5rem;
  border-radius: 1.25rem;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(52, 152, 219, 0.1);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  cursor: pointer;
  will-change: transform;
}

.modern-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(52, 152, 219, 0.15);
}
```

### Modern Button Template

```css
.modern-button {
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

.modern-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(52, 152, 219, 0.3);
}

.modern-button:active {
  transform: translateY(0);
}
```

---

## 📚 Resources & Tools

- **Color Palette Generator:** [Coolors.co](https://coolors.co/)
- **Shadow Generator:** [Shadows.brumm.af](https://shadows.brumm.af/)
- **Gradient Generator:** [CSSGradient.io](https://cssgradient.io/)
- **Cubic Bezier:** [Cubic-bezier.com](https://cubic-bezier.com/)
- **CSS Reference:** [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/CSS)

---

## ✅ Final Checklist

When creating new components, ensure:

- [ ] Use CSS variables for colors
- [ ] Keep box-shadows to 1-2 maximum
- [ ] Use `transform` for animations (not width/height/top/left)
- [ ] Add `will-change` for frequently animated elements
- [ ] Transition specific properties (not "all")
- [ ] Use appropriate border-radius (1-1.25rem for cards)
- [ ] Add hover states for interactive elements
- [ ] Test on mobile devices
- [ ] Ensure text contrast meets WCAG standards
- [ ] Use semantic HTML with proper ARIA labels

---

**Last Updated:** 2024  
**Version:** 1.0  
**Project:** PESO Job Application Portal