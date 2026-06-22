# FileFettle Design System - Quick Reference

## Overview

This quick reference guide helps developers rapidly implement FileFettle's unified design system across file converter tools, dashboards, file management, and settings pages.

---

## 1. Essential Color Variables

### Quick Access

```css
/* Accent (Call-to-Action) */
--accent-primary    /* #7c6af7 - Main accent color */
--accent-hover      /* #9482ff - Hover state (lighter) */
--accent-dim        /* rgba(124, 106, 247, 0.12) - Subtle background */
--accent-grad       /* Gradient for primary buttons */

/* Status Colors */
--success           /* #22c55e - Success/completed */
--warning           /* #f59e0b - Warning/pending */
--error             /* #ef4444 - Error/destructive */
--info              /* #3b82f6 - Info/secondary action */

/* Backgrounds & Text */
--bg                /* #09090f - Main background */
--bg-card           /* #101018 - Card/panel background */
--bg-elevated       /* #17172a - Elevated surfaces */
--text              /* #f0f0f8 - Primary text */
--text-muted        /* #6e6e94 - Secondary text */
--border            /* rgba(255, 255, 255, 0.08) - Dividers */
```

---

## 2. Common Component Patterns

### Primary Button
```tsx
<button className="btn btn-primary">Convert & Download</button>
```

### Secondary Button
```tsx
<button className="btn btn-secondary">Cancel</button>
```

### Danger Button
```tsx
<button className="btn btn-danger">Delete Permanently</button>
```

### Card
```tsx
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Files</h3>
  </div>
  <div className="card-body">
    {/* Content */}
  </div>
</div>
```

### Form Group
```tsx
<div className="form-group">
  <label className="form-label">
    File Type
    <span className="required">*</span>
  </label>
  <input type="text" className="form-input" placeholder="Select..." />
  <span className="form-hint">Choose a supported format</span>
</div>
```

### Alert
```tsx
<div className="alert alert-success">
  <span className="alert-icon">✓</span>
  <div className="alert-content">File converted successfully!</div>
</div>
```

### Table
```tsx
<table className="table">
  <thead>
    <tr>
      <th>Filename</th>
      <th>Size</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>document.pdf</td>
      <td>2.4 MB</td>
      <td><span className="badge badge-success">Done</span></td>
    </tr>
  </tbody>
</table>
```

### Badge
```tsx
<span className="badge badge-success">Completed</span>
<span className="badge badge-warning">Pending</span>
<span className="badge badge-error">Failed</span>
<span className="badge badge-info">Processing</span>
```

### Progress Bar
```tsx
<div className="progress-bar">
  <div className="progress-fill" style={{width: '65%'}}></div>
</div>
```

### Tabs
```tsx
<div className="tabs">
  <button className="tab-button active">Overview</button>
  <button className="tab-button">Details</button>
  <button className="tab-button">History</button>
</div>
<div className="tab-panel active">
  {/* Tab 1 Content */}
</div>
```

### Modal
```tsx
<div className="modal-overlay">
  <div className="modal">
    <div className="modal-header">
      <h2>Confirm Action</h2>
    </div>
    <div className="modal-body">
      Are you sure? This cannot be undone.
    </div>
    <div className="modal-footer">
      <button className="btn btn-secondary">Cancel</button>
      <button className="btn btn-danger">Delete</button>
    </div>
  </div>
</div>
```

---

## 3. Typography Classes

```tsx
<h1 className="text-h1">Main Heading</h1>
<h2 className="text-h2">Section Heading</h2>
<h3 className="text-h3">Subsection</h3>
<p className="text-base">Body text</p>
<p className="text-sm">Secondary text</p>
<p className="text-xs">Label text</p>
<p className="text-xxs">Overline text</p>
```

**Font Weights:**
```tsx
<p className="font-regular">Regular weight</p>
<p className="font-medium">Medium weight</p>
<p className="font-semibold">Semibold weight</p>
<p className="font-bold">Bold weight</p>
<p className="font-extrabold">Extra bold</p>
```

---

## 4. Spacing Scale

Use `--space-*` tokens for consistent spacing:

```css
--space-1: 4px      /* Micro spacing */
--space-2: 8px      /* Tight spacing */
--space-3: 12px     /* Standard spacing */
--space-4: 16px     /* Comfortable */
--space-5: 20px     /* Section spacing */
--space-6: 24px     /* Large spacing */
--space-8: 32px     /* XXL spacing */
--space-10: 40px    /* XXXL spacing */
--space-12: 48px    /* Page sections */
```

**Utility Classes:**
```tsx
<div className="gap-4">...</div>        {/* gap: 16px */}
<div className="p-4">...</div>          {/* padding: 16px */}
<div className="m-4">...</div>          {/* margin: 16px */}
<div className="mt-5 mb-6">...</div>    {/* margin-top: 20px, margin-bottom: 24px */}
```

---

## 5. Border Radius

```css
--radius-sm:   8px      /* Small elements */
--radius-md:   12px     /* Standard buttons/cards */
--radius-lg:   16px     /* Cards/panels */
--radius-xl:   20px     /* Large modals */
--radius-full: 999px    /* Pills/circles */
```

**Utility Classes:**
```tsx
<div className="rounded-sm">...</div>     {/* 8px */}
<div className="rounded-md">...</div>     {/* 12px */}
<div className="rounded-lg">...</div>     {/* 16px */}
<div className="rounded-xl">...</div>     {/* 20px */}
<div className="rounded-full">...</div>   {/* Circle */}
```

---

## 6. Shadows

```css
--shadow-sm:  0 1px 2px rgba(0, 0, 0, 0.2)
--shadow-md:  0 1px 3px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.3)
--shadow-lg:  0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)
--shadow-xl:  0 10px 32px rgba(0, 0, 0, 0.25), 0 4px 8px rgba(0, 0, 0, 0.15)
```

---

## 7. Button Sizing

```tsx
{/* Regular (44px min-height) */}
<button className="btn btn-primary">Standard</button>

{/* Small (36px min-height) */}
<button className="btn btn-primary btn-sm">Compact</button>

{/* Large (48px min-height) */}
<button className="btn btn-primary btn-lg">Prominent</button>

{/* Icon only (40x40px) */}
<button className="btn btn-secondary btn-icon">→</button>
```

---

## 8. Form Inputs

```tsx
{/* Text Input */}
<input type="text" className="form-input" placeholder="Enter text..." />

{/* Checkbox */}
<input type="checkbox" className="checkbox" />

{/* Radio */}
<input type="radio" className="radio" />

{/* Range Slider */}
<input type="range" className="slider" min="0" max="100" />

{/* Textarea */}
<textarea className="form-input" placeholder="Enter message..."></textarea>
```

---

## 9. Responsive Classes

```tsx
{/* Hide on mobile (< 421px) */}
<div className="hidden-mobile">Desktop only</div>

{/* Hide on tablet (< 768px) */}
<div className="hidden-tablet">Tablet+ only</div>

{/* Container with responsive padding */}
<div className="container">
  {/* Padding: 16px on mobile, 24px on desktop */}
</div>
```

---

## 10. Accessibility Best Practices

### Focus States (Automatic)
All interactive elements automatically get a 2px accent outline on focus.

```tsx
{/* No additional code needed - built into .btn, .form-input, etc. */}
<button className="btn btn-primary">Click me</button>
```

### ARIA Labels
```tsx
{/* Icon-only button needs aria-label */}
<button className="btn btn-icon" aria-label="Delete file">✕</button>

{/* Form input needs label */}
<label htmlFor="file-type" className="form-label">File Type</label>
<input id="file-type" type="text" className="form-input" />

{/* Loading spinner is decorative */}
<span className="spinner" aria-hidden="true"></span>
<span>Converting...</span>
```

### Semantic HTML
```tsx
{/* Use semantic tags */}
<main id="main-content" tabIndex={-1}>Content</main>
<nav aria-label="Navigation">Links</nav>
<section aria-labelledby="section-heading">
  <h2 id="section-heading">Section Title</h2>
</section>
<aside aria-label="Sidebar">Sidebar content</aside>
<footer>Footer</footer>
```

### Skip Navigation
```tsx
<a href="#main-content" className="skip-nav">Skip to main content</a>
```

---

## 11. Common Layouts

### 2-Column Layout (Desktop, stacks on mobile)
```tsx
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
  <div className="card">Left</div>
  <div className="card">Right</div>
</div>
```

### 3-Column Grid
```tsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
  {/* Cards */}
</div>
```

### Dashboard Layout
```tsx
<div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh' }}>
  <aside className="bg-card border-r">Sidebar</aside>
  <main className="p-6">Content</main>
</div>
```

---

## 12. Dark/Light Mode

The design system automatically uses the user's system preference via `prefers-color-scheme`.

```tsx
{/* No code needed! CSS variables automatically adapt. */}
<div className="card">This adapts to dark/light mode</div>
```

To manually override in dev:
```html
<!-- Force dark mode in HTML root -->
<html data-theme="dark">

<!-- Force light mode in HTML root -->
<html data-theme="light">
```

---

## 13. Common Patterns

### Loading State
```tsx
<button className="btn btn-primary" disabled>
  <span className="spinner" aria-hidden="true"></span>
  Converting...
</button>
```

### Empty State
```tsx
<div style={{ textAlign: 'center', padding: '40px 20px' }}>
  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
  <h3 className="text-h3">No files yet</h3>
  <p className="text-sm mt-2">Drop files to get started</p>
</div>
```

### File List Item
```tsx
<div className="card p-4" style={{ display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: '12px', alignItems: 'center' }}>
  <span style={{ fontSize: '18px' }}>📄</span>
  <div className="truncate">
    <p className="font-semibold">document.pdf</p>
    <p className="text-xs text-muted">2.4 MB</p>
  </div>
  <span className="badge badge-success">Done</span>
</div>
```

### Filter/Sort Controls
```tsx
<div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
  <input type="text" className="form-input" placeholder="Search files..." />
  <select className="form-input">
    <option>Sort by Date</option>
    <option>Sort by Name</option>
    <option>Sort by Size</option>
  </select>
  <button className="btn btn-secondary">Filter</button>
</div>
```

---

## 14. Animation & Motion

All animations respect `prefers-reduced-motion` preference automatically.

### Fade In
```css
animation: fadeIn var(--transition-normal);
```

### Slide Up
```css
animation: slideUp var(--transition-slow);
```

### Spin (Loading)
```css
animation: spin 0.8s linear infinite;
```

### Pulse
```css
animation: pulse 1.5s ease-in-out infinite;
```

---

## 15. Z-Index Reference

```css
--z-base: 0                 /* Default */
--z-sticky: 10              /* Sticky headers */
--z-header: 100             /* Site header */
--z-dropdown: 1001          /* Menus, selects */
--z-modal-overlay: 1000     /* Modal backdrop */
--z-modal-content: 1001     /* Modal dialog */
--z-tooltip: 1002           /* Tooltips */
--z-notification: 1050      /* Toast messages */
```

---

## 16. Troubleshooting

### Button doesn't look right
- Use `.btn` base class + `.btn-primary`, `.btn-secondary`, or `.btn-danger`
- Min-height is 44px (touch-friendly)
- Add `.btn-sm` for 36px or `.btn-lg` for 48px

### Form input not styled
- Use `.form-input` class on `<input>`, `<select>`, `<textarea>`
- Wrap in `.form-group` for consistent spacing
- Add `.form-label` to associated `<label>`

### Text color too faint
- Use `.text-muted` for secondary text (4.8:1 contrast)
- Use `.text` (no class) for primary text (21.4:1 contrast)
- All combinations meet WCAG AA standards

### Focus outline not showing
- It's automatic on `.btn`, `.form-input`, interactive elements
- Customize in CSS if needed: `outline: 2px solid var(--accent-primary);`

### Component doesn't work on mobile
- All components are responsive by default
- Check breakpoint media queries for tablet/mobile overrides
- Use `.hidden-mobile` or `.hidden-tablet` to hide/show

---

## 17. File Structure

After implementation, your project should have:

```
ne-file/
├── DESIGN_SYSTEM.md              # Full specification
├── DESIGN_SYSTEM_QUICK_REFERENCE.md  # This file
├── design-tokens.css             # All CSS classes & variables
├── app/
│   ├── globals.css               # Base resets + grid utilities
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/
│   ├── DashboardLayout.tsx        # Dashboard grid template
│   ├── FileList.tsx              # File list with design tokens
│   ├── SettingsPanel.tsx         # Settings form
│   └── ...
└── lib/
    └── constants.ts              # Color/spacing constants
```

---

## 18. CSS Variable Usage in JavaScript

```tsx
// Get computed color value
const accentColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--accent-primary')
  .trim();

// Set dynamic theme
document.documentElement.setAttribute('data-theme', 'light');

// Use in styled components
const buttonStyle = {
  background: 'var(--accent-grad)',
  color: 'var(--text)',
  padding: 'var(--space-3)',
};
```

---

## 19. Integration Checklist

- [ ] Import `design-tokens.css` in `app/layout.tsx` or `globals.css`
- [ ] Replace all inline button styles with `.btn` classes
- [ ] Replace all inline card styles with `.card` classes
- [ ] Update form inputs to use `.form-input`, `.form-label`, `.form-group`
- [ ] Replace custom colors with CSS variables
- [ ] Test dark/light mode toggle
- [ ] Verify accessibility (Tab navigation, focus states, contrast)
- [ ] Test on mobile (touch targets, responsive layout)
- [ ] Audit animations with `prefers-reduced-motion`
- [ ] Document any custom components added

---

## 20. Need Help?

- **Color questions:** See section 1 & "Color Palette" in DESIGN_SYSTEM.md
- **Component styling:** See section 4 & "Component Design Specs" in DESIGN_SYSTEM.md
- **Accessibility:** See section 7 & "Accessibility Checklist" in DESIGN_SYSTEM.md
- **Layout questions:** See section 9 & "Component Patterns" in DESIGN_SYSTEM.md
- **Animation issues:** See section 8 & "Animation & Transitions" in DESIGN_SYSTEM.md

---

**Version:** 1.0  
**Last Updated:** June 2026  
**Status:** Ready for Development
