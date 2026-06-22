# FileFettle Design System - Implementation Guide

## Introduction

This guide walks developers through implementing the FileFettle Design System across the entire application, from foundational tokens to complete page layouts.

**Timeline:** ~2-3 weeks (phased rollout)  
**Effort Level:** Medium (component refactoring)  
**Priority:** High (consistency + scalability)

---

## Phase 1: Foundation (Days 1-2)

### Step 1: Add Design Tokens CSS

1. Copy `design-tokens.css` to your project
2. Import in `app/layout.tsx`:

```tsx
// app/layout.tsx
import "./design-tokens.css";
import "./globals.css";
```

**Verify:** 
- Open DevTools > Styles tab
- Search for `--accent-primary` 
- Confirm value is `#7c6af7`

### Step 2: Update globals.css

Keep your existing reset + add design-system-specific utilities:

```css
/* app/globals.css */
@import url("./design-tokens.css");

/* ── Base Styles ─────────────────────────────────────────────── */
html {
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
  overflow-x: hidden;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

/* ── Link Styles ─────────────────────────────────────────────── */
a {
  color: var(--accent-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--accent-hover);
  text-decoration: underline;
}

/* ── Selection ───────────────────────────────────────────────── */
::selection {
  background: var(--accent-dim);
  color: var(--text);
}

/* ── Scrollbar ───────────────────────────────────────────────── */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-card);
}

::-webkit-scrollbar-thumb {
  background: var(--text-muted);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text);
}
```

---

## Phase 2: Component Refactoring (Days 3-7)

### Step 3: Refactor Button Components

**Before:**
```tsx
<button
  onClick={handleClick}
  style={{
    background: 'linear-gradient(135deg, #7c6af7 0%, #a78bfa 100%)',
    color: '#fff',
    padding: '11px 20px',
    borderRadius: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    transition: 'opacity 0.15s, transform 0.12s, box-shadow 0.2s',
  }}
>
  Convert
</button>
```

**After:**
```tsx
<button className="btn btn-primary" onClick={handleClick}>
  Convert
</button>
```

**Checklist:**
- [ ] Replace all primary button inline styles → `.btn.btn-primary`
- [ ] Replace all secondary buttons → `.btn.btn-secondary`
- [ ] Add `.btn-sm` where buttons are compact
- [ ] Add `.btn-lg` where buttons are prominent
- [ ] Add `aria-label` to icon-only buttons

**Test:**
```bash
npm run dev
# Verify button hover effects, focus states, disabled states
```

### Step 4: Refactor Card Components

**Before:**
```tsx
<div
  style={{
    background: '#101018',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '16px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }}
>
  {content}
</div>
```

**After:**
```tsx
<div className="card">
  {content}
</div>
```

**Checklist:**
- [ ] Replace all card containers → `.card`
- [ ] Add `.card-header`, `.card-body`, `.card-footer` for structure
- [ ] Replace `.card-title` → `.card-title` class
- [ ] Test hover effects + transitions

### Step 5: Refactor Form Components

**Before:**
```tsx
<input
  type="text"
  style={{
    background: '#17172a',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    color: '#f0f0f8',
    padding: '10px 12px',
    fontSize: '14px',
  }}
  placeholder="Enter text..."
/>
```

**After:**
```tsx
<div className="form-group">
  <label htmlFor="input-id" className="form-label">
    Input Label
  </label>
  <input
    id="input-id"
    type="text"
    className="form-input"
    placeholder="Enter text..."
  />
  <span className="form-hint">Helper text here</span>
</div>
```

**Checklist:**
- [ ] Wrap inputs in `.form-group`
- [ ] Add `.form-label` to `<label>` tags
- [ ] Replace input inline styles → `.form-input`
- [ ] Add `.form-hint` for helper text
- [ ] Add `.form-error` for error messages
- [ ] Test focus/hover/disabled states

### Step 6: Refactor Typography

**Before:**
```tsx
<h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '10px' }}>
  Heading
</h1>
<p style={{ fontSize: '15px', color: '#6e6e94', lineHeight: 1.6 }}>
  Body text
</p>
```

**After:**
```tsx
<h1 className="text-display mb-2">Heading</h1>
<p className="text-base text-muted">Body text</p>
```

**Hierarchy:**
```
.text-display   → clamp(24px, 4vw, 32px)
.text-h1        → 24px
.text-h2        → 20px
.text-h3        → 16px
.text-base      → 15px
.text-sm        → 13px
.text-xs        → 12px
.text-xxs       → 11px
```

**Checklist:**
- [ ] Replace all `<h1>`, `<h2>`, `<h3>` → add `.text-h*` classes
- [ ] Replace body text styles → `.text-base`
- [ ] Replace secondary text → `.text-sm` or `.text-muted`
- [ ] Remove all inline font-size/weight styles

---

## Phase 3: Layout Patterns (Days 8-12)

### Step 7: Implement Dashboard Layout

**Create new component:**

```tsx
// components/DashboardLayout.tsx
import React from 'react';

interface DashboardLayoutProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function DashboardLayout({
  sidebar,
  header,
  children,
  footer,
}: DashboardLayoutProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '240px 1fr',
        gridTemplateRows: '58px 1fr',
        minHeight: '100vh',
        gap: '0',
      }}
    >
      {/* Header - spans full width */}
      <div
        style={{
          gridColumn: '1 / -1',
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          zIndex: 'var(--z-header)',
          padding: '0 var(--space-4)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {header}
      </div>

      {/* Sidebar */}
      <aside
        style={{
          background: 'var(--bg-card)',
          borderRight: '1px solid var(--border)',
          padding: 'var(--space-4)',
          overflowY: 'auto',
        }}
      >
        {sidebar}
      </aside>

      {/* Main Content */}
      <main
        style={{
          padding: 'var(--space-6)',
          overflowY: 'auto',
          background: 'var(--bg)',
        }}
      >
        {children}
      </main>

      {/* Footer */}
      {footer && (
        <footer
          style={{
            gridColumn: '1 / -1',
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--border)',
            padding: 'var(--space-4)',
            textAlign: 'center',
          }}
        >
          {footer}
        </footer>
      )}
    </div>
  );
}
```

**Usage:**
```tsx
<DashboardLayout
  header={<h1 className="text-h1">Dashboard</h1>}
  sidebar={
    <nav>
      <a href="/dashboard" className="btn btn-tertiary">Home</a>
      <a href="/organize" className="btn btn-tertiary">Organize</a>
      <a href="/rules" className="btn btn-tertiary">Rules</a>
    </nav>
  }
>
  {/* Main content */}
</DashboardLayout>
```

### Step 8: Implement File List Component

```tsx
// components/FileList.tsx
interface FileItem {
  id: string;
  name: string;
  size: number;
  status: 'pending' | 'processing' | 'done' | 'error';
  icon: string;
}

export default function FileList({ files }: { files: FileItem[] }) {
  const statusBadgeClass = {
    pending: 'badge-info',
    processing: 'badge-warning',
    done: 'badge-success',
    error: 'badge-error',
  };

  return (
    <div className="flex flex-col gap-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="card"
          style={{
            display: 'grid',
            gridTemplateColumns: '40px 1fr auto',
            gap: 'var(--space-3)',
            alignItems: 'center',
          }}
        >
          {/* File Icon */}
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0,
            }}
          >
            {file.icon}
          </div>

          {/* File Info */}
          <div className="truncate">
            <p className="font-semibold text-base">{file.name}</p>
            <p className="text-xs text-muted">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>

          {/* Status Badge */}
          <span className={`badge ${statusBadgeClass[file.status]}`}>
            {file.status}
          </span>
        </div>
      ))}
    </div>
  );
}
```

### Step 9: Implement Settings Form

```tsx
// components/SettingsPanel.tsx
export default function SettingsPanel() {
  const [darkMode, setDarkMode] = React.useState(true);

  return (
    <div className="card" style={{ maxWidth: '500px' }}>
      <div className="card-header">
        <h3 className="card-title">Appearance Settings</h3>
      </div>

      <div className="card-body">
        {/* Dark Mode Toggle */}
        <div
          className="form-group"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <label htmlFor="dark-mode" className="form-label" style={{ marginBottom: '0' }}>
            Dark Mode
          </label>
          <input
            id="dark-mode"
            type="checkbox"
            className="checkbox"
            checked={darkMode}
            onChange={(e) => setDarkMode(e.target.checked)}
          />
        </div>

        {/* Font Size Slider */}
        <div className="form-group">
          <label className="form-label">Font Size</label>
          <input type="range" className="slider" min="12" max="18" defaultValue="15" />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
            <span>Small</span>
            <span>Large</span>
          </div>
        </div>

        {/* Notifications Checkbox */}
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <input id="notifications" type="checkbox" className="checkbox" defaultChecked />
          <label htmlFor="notifications" className="form-label" style={{ marginBottom: '0' }}>
            Enable notifications
          </label>
        </div>
      </div>

      <div className="card-footer">
        <button className="btn btn-secondary">Reset</button>
        <button className="btn btn-primary">Save Changes</button>
      </div>
    </div>
  );
}
```

---

## Phase 4: Page Migrations (Days 13-18)

### Step 10: Migrate Home Page (page.tsx)

1. Replace all inline button styles → `.btn` classes
2. Replace all card styles → `.card` classes
3. Replace typography styles → `.text-*` classes
4. Replace spacing values → utility classes
5. Test all interactive states

**Example migration:**

```tsx
// Before
<button
  style={{
    background: 'var(--accent-grad)',
    color: '#fff',
    padding: '11px 20px',
    borderRadius: '12px',
    fontWeight: '600',
  }}
>
  Start Converting
</button>

// After
<button className="btn btn-primary">Start Converting</button>
```

### Step 11: Create New Dashboard Pages

1. `app/dashboard/page.tsx` - Overview
2. `app/organize/page.tsx` - File organization
3. `app/rules/page.tsx` - Automation rules
4. `app/duplicates/page.tsx` - Duplicate finder
5. `app/bulk-rename/page.tsx` - Batch rename
6. `app/settings/page.tsx` - Settings

Each page:
- Uses `DashboardLayout` component
- Implements proper sidebar navigation
- Follows card + form patterns
- Uses badge/alert for status
- Mobile responsive

**Template:**

```tsx
// app/dashboard/page.tsx
'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Sidebar from '@/components/Sidebar';

export default function DashboardPage() {
  return (
    <DashboardLayout
      header={<h1 className="text-h1">Dashboard</h1>}
      sidebar={<Sidebar />}
    >
      <div className="container">
        <section className="mb-6">
          <h2 className="text-h2 mb-4">Recent Files</h2>
          {/* File list component */}
        </section>

        <section>
          <h2 className="text-h2 mb-4">Statistics</h2>
          {/* Stats cards */}
        </section>
      </div>
    </DashboardLayout>
  );
}
```

---

## Phase 5: Polish & Testing (Days 19-21)

### Step 12: Accessibility Audit

**Checklist:**

- [ ] All buttons keyboard-accessible (Tab navigation)
- [ ] All form inputs have associated labels
- [ ] Focus states visible (2px outline)
- [ ] Color contrast ≥ 4.5:1 for normal text
- [ ] No keyboard traps
- [ ] Skip navigation link works
- [ ] Screen reader announces dynamic content
- [ ] Images have alt text
- [ ] No red-only status indicators

**Test with:**
```bash
# Keyboard only navigation
# Chrome DevTools > Lighthouse > Accessibility
# WAVE browser extension
# Screen reader (VoiceOver, NVDA)
```

### Step 13: Mobile Testing

**Checklist:**

- [ ] Touch targets ≥ 44x44px
- [ ] No horizontal scroll on mobile
- [ ] Sidebar collapses on mobile
- [ ] Modals fit viewport
- [ ] Forms work on mobile keyboard
- [ ] Images scale responsively
- [ ] Test on actual devices (iOS + Android)

**Breakpoints to test:**
- 375px (iPhone SE)
- 768px (Tablet)
- 1024px (Desktop)
- 1440px (Large desktop)

### Step 14: Animation & Motion

**Checklist:**

- [ ] All animations respect `prefers-reduced-motion`
- [ ] Animations < 300ms (except loaders)
- [ ] No flashing > 3/sec
- [ ] Disable animations on low-end devices
- [ ] Test on 3G connection

### Step 15: Performance Audit

```bash
npm run build
npm run start

# Chrome DevTools > Performance
# Lighthouse
# Web Vitals
```

**Optimize:**
- CSS file size < 50KB (minified)
- No render-blocking resources
- Animations use GPU (transform, opacity)
- Images optimized + lazy-loaded

### Step 16: Cross-Browser Testing

Test on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

### Step 17: Documentation

1. Update README with design system info
2. Add Storybook stories (optional)
3. Document custom components
4. Create component library page (optional)

---

## Common Pitfalls & Solutions

### Pitfall 1: Inline Styles Take Precedence

**Problem:**
```tsx
<button className="btn btn-primary" style={{ padding: '20px' }}>
  // Inline style overrides class
</button>
```

**Solution:**
Use `!important` in CSS or remove inline styles entirely.

### Pitfall 2: Colors Not Updating in Dark Mode

**Problem:**
```tsx
<div style={{ color: '#f0f0f8' }}>Text</div>  // Hardcoded color
```

**Solution:**
Use CSS variables:
```tsx
<div style={{ color: 'var(--text)' }}>Text</div>
```

### Pitfall 3: Focus Outline Hidden

**Problem:**
```tsx
input:focus {
  outline: none;  // BAD! Breaks accessibility
}
```

**Solution:**
Let design system handle it or use custom outline:
```tsx
input:focus {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}
```

### Pitfall 4: Responsive Layout Broken

**Problem:**
```tsx
<div style={{ width: '100%', padding: '24px' }}>
  // Creates horizontal scroll on mobile
</div>
```

**Solution:**
Use responsive utilities:
```tsx
<div className="container">
  {/* Padding automatically adjusts */}
</div>
```

### Pitfall 5: Animations Jank on Mobile

**Problem:**
```tsx
div {
  transition: all 0.2s;  // Animates everything
}
```

**Solution:**
Be specific:
```tsx
.btn {
  transition: opacity 0.15s, transform 0.12s, box-shadow 0.2s;
}
```

---

## Verification Checklist

After implementation:

- [ ] All pages use design system classes
- [ ] No inline color/sizing styles (except dynamic values)
- [ ] Dark/light mode works
- [ ] Accessibility audit passes
- [ ] Mobile layout responsive
- [ ] Animations smooth (60 FPS)
- [ ] Focus states visible
- [ ] Forms validate + show errors
- [ ] Tables sortable/filterable
- [ ] Modals accessible + dismissible
- [ ] Documentation complete
- [ ] Performance metrics pass

---

## Next Steps

1. **Import design-tokens.css** in `app/layout.tsx`
2. **Refactor components** following Phase 2-3 patterns
3. **Migrate pages** using Phase 4 templates
4. **Test thoroughly** with Phase 5 checklist
5. **Deploy** with confidence!

---

## Support & Questions

### Where to find answers?

- **Component styling** → Section 4, `DESIGN_SYSTEM.md`
- **Color questions** → Section 1, `DESIGN_SYSTEM.md`
- **Layout patterns** → Section 9, `DESIGN_SYSTEM.md`
- **Accessibility** → Section 7, `DESIGN_SYSTEM.md`
- **Quick reference** → `DESIGN_SYSTEM_QUICK_REFERENCE.md`

### File Structure After Implementation

```
ne-file/
├── DESIGN_SYSTEM.md
├── DESIGN_SYSTEM_QUICK_REFERENCE.md
├── IMPLEMENTATION_GUIDE.md  ← You are here
├── design-tokens.css
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── organize/
│   │   └── page.tsx
│   ├── settings/
│   │   └── page.tsx
│   └── ...
├── components/
│   ├── DashboardLayout.tsx
│   ├── FileList.tsx
│   ├── SettingsPanel.tsx
│   ├── Sidebar.tsx
│   └── ...
└── ...
```

---

**Timeline Summary:**
- **Phase 1:** 2 days (foundations)
- **Phase 2:** 5 days (components)
- **Phase 3:** 5 days (layouts)
- **Phase 4:** 6 days (page migrations)
- **Phase 5:** 3 days (testing)

**Total:** ~3 weeks

---

**Version:** 1.0  
**Last Updated:** June 2026  
**Status:** Ready for Implementation
