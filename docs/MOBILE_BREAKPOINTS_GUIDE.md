# Mobile Breakpoints Quick Reference Guide

## Breakpoint Strategy

### Primary Breakpoints
```css
/* Tablet & Large Phones */
@media (max-width: 768px) { }

/* Small Phones */
@media (max-width: 480px) { }
```

### Legacy Breakpoints (Preserved)
```css
/* Admin Sidebar - Mobile */
@media (max-width: 600px) { }

/* Admin Sidebar - Tablet */
@media (max-width: 1024px) { }

/* Admin Sidebar - Small Desktop */
@media (max-width: 1400px) { }
```

## Common Responsive Patterns

### 1. Grid Layouts
```css
/* Desktop: 5 columns */
grid-template-columns: repeat(5, 1fr);

/* Tablet: 2 columns */
@media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
}

/* Mobile: 1 column */
@media (max-width: 480px) {
    grid-template-columns: 1fr;
}
```

### 2. Container Widths
```css
/* Desktop */
width: 80vw;

/* Tablet */
@media (max-width: 768px) {
    width: 95vw;
}

/* Mobile */
@media (max-width: 480px) {
    width: 100vw;
}
```

### 3. Font Sizes
```css
/* Desktop */
font-size: 1rem;

/* Tablet */
@media (max-width: 768px) {
    font-size: 0.9rem;
}

/* Mobile */
@media (max-width: 480px) {
    font-size: 0.85rem;
}
```

### 4. Padding & Margins
```css
/* Desktop */
padding: 2rem;
margin: 2rem;

/* Tablet */
@media (max-width: 768px) {
    padding: 1.5rem;
    margin: 1.5rem;
}

/* Mobile */
@media (max-width: 480px) {
    padding: 1rem;
    margin: 1rem;
}
```

### 5. Flex Direction
```css
/* Desktop */
flex-direction: row;

/* Tablet & Mobile */
@media (max-width: 768px) {
    flex-direction: column;
}
```

### 6. Button Sizes
```css
/* Desktop */
padding: 0.6rem 1.5rem;
font-size: 1rem;

/* Tablet */
@media (max-width: 768px) {
    padding: 0.5rem 1.25rem;
    font-size: 0.925rem;
}

/* Mobile */
@media (max-width: 480px) {
    padding: 0.45rem 1rem;
    font-size: 0.875rem;
}
```

### 7. Modal Widths
```css
/* Desktop */
max-width: 600px;
padding: 2rem;

/* Tablet */
@media (max-width: 768px) {
    max-width: 90vw;
    padding: 1.5rem;
}

/* Mobile */
@media (max-width: 480px) {
    max-width: 95vw;
    padding: 1rem;
}
```

### 8. Image Sizes
```css
/* Desktop */
width: 20rem;

/* Tablet */
@media (max-width: 768px) {
    width: 12rem;
}

/* Mobile */
@media (max-width: 480px) {
    width: 10rem;
}
```

## Touch Target Sizes

### Minimum Sizes (WCAG 2.5.5)
- **Buttons**: 44x44px minimum
- **Links**: 44x44px minimum
- **Form Controls**: 44x44px minimum
- **Icons**: 24x24px minimum (with 44x44px touch area)

### Implementation
```css
/* Desktop */
.button {
    padding: 0.6rem 1.5rem; /* ~38px height */
}

/* Mobile - ensure 44px minimum */
@media (max-width: 480px) {
    .button {
        padding: 0.75rem 1rem; /* ~44px height */
    }
}
```

## Spacing Scale

### Recommended Values
```css
/* Extra Small */
gap: 0.25rem;  /* 4px */

/* Small */
gap: 0.5rem;   /* 8px */

/* Medium */
gap: 1rem;     /* 16px */

/* Large */
gap: 1.5rem;   /* 24px */

/* Extra Large */
gap: 2rem;     /* 32px */
```

### Mobile Adjustments
```css
/* Desktop */
gap: 2rem;

/* Tablet */
@media (max-width: 768px) {
    gap: 1.5rem; /* Reduce by 25% */
}

/* Mobile */
@media (max-width: 480px) {
    gap: 1rem;   /* Reduce by 50% */
}
```

## Typography Scale

### Heading Sizes
```css
/* Desktop */
h1 { font-size: 2.5rem; }
h2 { font-size: 2rem; }
h3 { font-size: 1.5rem; }

/* Tablet */
@media (max-width: 768px) {
    h1 { font-size: 2rem; }
    h2 { font-size: 1.5rem; }
    h3 { font-size: 1.25rem; }
}

/* Mobile */
@media (max-width: 480px) {
    h1 { font-size: 1.75rem; }
    h2 { font-size: 1.25rem; }
    h3 { font-size: 1.1rem; }
}
```

### Body Text
```css
/* Desktop */
font-size: 1rem;      /* 16px */

/* Tablet */
@media (max-width: 768px) {
    font-size: 0.9rem;  /* 14.4px */
}

/* Mobile */
@media (max-width: 480px) {
    font-size: 0.85rem; /* 13.6px */
}
```

## Device Reference

### Common Device Widths
- **iPhone SE**: 320px
- **iPhone 12/13 Mini**: 360px
- **iPhone 12/13**: 390px
- **iPhone 14 Pro Max**: 430px
- **iPad Mini**: 768px
- **iPad Air**: 820px
- **iPad Pro 11"**: 834px
- **iPad Pro 12.9"**: 1024px

### Testing Targets
1. **Small Phone** (375px) - iPhone SE, older Android
2. **Medium Phone** (390px) - iPhone 12/13
3. **Large Phone** (430px) - iPhone Pro Max
4. **Tablet** (768px) - iPad Mini, Android tablets
5. **Desktop** (1024px+) - Standard displays

## Performance Optimization

### CSS Properties to Avoid on Mobile
```css
/* Expensive - avoid on mobile */
backdrop-filter: blur(10px);
box-shadow: [multiple shadows];
filter: blur(5px);

/* Better alternatives */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); /* Single shadow */
background: rgba(255, 255, 255, 0.95);     /* Solid color */
```

### Animation Guidelines
```css
/* Desktop - Complex animations OK */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* Mobile - Simpler transitions */
@media (max-width: 480px) {
    transition: transform 0.2s ease, opacity 0.2s ease;
}
```

## Accessibility Considerations

### Contrast Ratios
- **Normal Text**: 4.5:1 minimum
- **Large Text**: 3:1 minimum
- **Graphical Objects**: 3:1 minimum

### Font Size Minimums
- **Body Text**: 14px minimum (0.875rem)
- **Small Text**: 12px minimum (0.75rem)
- **Never Go Below**: 11px (0.6875rem)

## Testing Checklist

### Visual Tests
- [ ] All text readable
- [ ] Images properly scaled
- [ ] No horizontal scroll
- [ ] Buttons easily tappable
- [ ] Forms usable
- [ ] Modals fit screen

### Interaction Tests
- [ ] Navigation works
- [ ] Forms submit correctly
- [ ] Dropdowns accessible
- [ ] Scrolling smooth
- [ ] Gestures work
- [ ] Touch targets adequate

### Browser Tests
- [ ] Safari iOS
- [ ] Chrome Android
- [ ] Firefox Mobile
- [ ] Samsung Internet

## Quick Fix Patterns

### Fix Horizontal Overflow
```css
@media (max-width: 480px) {
    .container {
        max-width: 100vw;
        overflow-x: hidden;
    }
}
```

### Fix Small Text
```css
@media (max-width: 480px) {
    .text {
        font-size: max(0.875rem, 14px);
    }
}
```

### Fix Tiny Buttons
```css
@media (max-width: 480px) {
    .button {
        min-height: 44px;
        min-width: 44px;
        padding: 0.75rem 1rem;
    }
}
```

### Fix Cramped Spacing
```css
@media (max-width: 480px) {
    .container {
        padding: 1rem;
        gap: 1rem;
    }
}
```

## Best Practices

1. **Mobile First** (if starting fresh)
   - Start with mobile styles
   - Use `min-width` media queries to add desktop features

2. **Desktop First** (our approach)
   - Maintain existing desktop styles
   - Use `max-width` media queries to adapt for mobile

3. **Always Test**
   - Use browser DevTools
   - Test on real devices
   - Check various screen sizes

4. **Performance Matters**
   - Simplify animations on mobile
   - Use fewer shadows
   - Optimize images

5. **Touch Targets**
   - 44x44px minimum
   - Adequate spacing between elements
   - Visual feedback on tap

## Resources

- [MDN: Using Media Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries)
- [WCAG Touch Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Can I Use: Media Queries](https://caniuse.com/css-mediaqueries)
- [Responsive Design Checker](https://responsivedesignchecker.com/)