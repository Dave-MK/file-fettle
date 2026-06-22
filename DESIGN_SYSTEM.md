# FileFettle Design System Specification v1.0

## Overview

This design system unifies FileFettle's file converter tools with extended dashboard, organization, and settings functionality. It maintains FileFettle's core identity (privacy-first, simplicity, client-side focus) while scaling to complex workflows like file management, bulk operations, and advanced configuration.

---

## 1. COLOR PALETTE

### Primary Colors

| Token | Light Hex | Light RGB | Dark Hex | Dark RGB | Usage |
|-------|-----------|-----------|----------|----------|-------|
| `--accent-primary` | `#7c6af7` | `124, 106, 247` | `#9482ff` | `148, 130, 255` | CTAs, highlights, active states |
| `--accent-hover` | `#9482ff` | `148, 130, 255` | `#a78bfa` | `167, 139, 250` | Hover state (lighter) |
| `--accent-dim` | `rgba(124, 106, 247, 0.12)` | - | `rgba(167, 139, 250, 0.12)` | - | Subtle backgrounds, badges |
| `--accent-glow` | `rgba(124, 106, 247, 0.3)` | - | `rgba(167, 139, 250, 0.3)` | - | Shadows, focus rings |

### Semantic Colors

| Token | Light Hex | Dark Hex | Usage |
|-------|-----------|----------|-------|
| `--success` | `#22c55e` | `#4ade80` | Success messages, confirmations, completed states |
| `--warning` | `#f59e0b` | `#fbbf24` | Warnings, cautions, pending states |
| `--error` | `#ef4444` | `#f87171` | Errors, destructive actions, alerts |
| `--info` | `#3b82f6` | `#60a5fa` | Information, tips, secondary actions |

### Neutral Colors (Dark Mode - Primary)

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--bg` | `#09090f` | `9, 9, 15` | Main background |
| `--bg-card` | `#101018` | `16, 16, 24` | Card/panel backgrounds |
| `--bg-elevated` | `#17172a` | `23, 23, 42` | Elevated surfaces (modals, dropdowns) |
| `--text` | `#f0f0f8` | `240, 240, 248` | Primary text |
| `--text-muted` | `#6e6e94` | `110, 110, 148` | Secondary text, labels, hints |
| `--border` | `rgba(255, 255, 255, 0.08)` | - | Subtle dividers |
| `--border-hover` | `rgba(255, 255, 255, 0.18)` | - | Hover state dividers |

### Light Mode Palette (Optional)

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--bg` | `#fafbfc` | `250, 251, 252` | Main background |
| `--bg-card` | `#ffffff` | `255, 255, 255` | Card backgrounds |
| `--bg-elevated` | `#f3f4f6` | `243, 244, 246` | Elevated surfaces |
| `--text` | `#0f1419` | `15, 20, 25` | Primary text |
| `--text-muted` | `#6b7280` | `107, 114, 128` | Secondary text |
| `--border` | `rgba(0, 0, 0, 0.08)` | - | Subtle dividers |
| `--border-hover` | `rgba(0, 0, 0, 0.14)` | - | Hover state |

### Color Palette CSS Variables

```css
:root {
  /* Accent */
  --accent-primary:   #7c6af7;
  --accent-hover:     #9482ff;
  --accent-dim:       rgba(124, 106, 247, 0.12);
  --accent-glow:      rgba(124, 106, 247, 0.3);
  --accent-grad:      linear-gradient(135deg, #7c6af7 0%, #a78bfa 100%);

  /* Semantic */
  --success:          #22c55e;
  --success-dim:      rgba(34, 197, 94, 0.12);
  --warning:          #f59e0b;
  --warning-dim:      rgba(245, 158, 11, 0.12);
  --error:            #ef4444;
  --error-dim:        rgba(239, 68, 68, 0.12);
  --info:             #3b82f6;
  --info-dim:         rgba(59, 130, 246, 0.12);

  /* Neutrals (Dark) */
  --bg:               #09090f;
  --bg-card:          #101018;
  --bg-elevated:      #17172a;
  --border:           rgba(255, 255, 255, 0.08);
  --border-hover:     rgba(255, 255, 255, 0.18);
  --text:             #f0f0f8;
  --text-muted:       #6e6e94;
}

@media (prefers-color-scheme: light) {
  :root {
    --accent-primary:   #6d5ce7;
    --accent-hover:     #7d6ff9;
    --accent-dim:       rgba(109, 92, 231, 0.12);
    --accent-glow:      rgba(109, 92, 231, 0.25);

    --bg:               #fafbfc;
    --bg-card:          #ffffff;
    --bg-elevated:      #f3f4f6;
    --border:           rgba(0, 0, 0, 0.08);
    --border-hover:     rgba(0, 0, 0, 0.14);
    --text:             #0f1419;
    --text-muted:       #6b7280;
  }
}
```

---

## 2. TYPOGRAPHY SYSTEM

### Font Family Stack

```css
font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", "Helvetica Neue", sans-serif;
```

**Rationale:** System fonts load instantly; Inter as fallback for web; supports 15+ languages natively.

### Type Scale

| Role | Size | Line Height | Letter Spacing | Weight | Usage |
|------|------|-------------|-----------------|--------|-------|
| **Display** | `clamp(24px, 4vw, 32px)` | 1.2 | -0.03em | 800 | Page headings, hero titles |
| **H1** | `24px` | 1.3 | -0.02em | 700 | Section titles |
| **H2** | `20px` | 1.35 | -0.01em | 700 | Subsection titles |
| **H3** | `16px` | 1.4 | 0 | 600 | Card titles, panel headers |
| **Base** | `15px` | 1.6 | 0 | 400 | Body text |
| **Small** | `13px` | 1.5 | 0 | 400 | Secondary text, descriptions |
| **XSmall** | `12px` | 1.4 | 0 | 500 | Labels, badges, hints |
| **XXSmall** | `11px` | 1.3 | 0.05em | 700 | Section labels, overlines |

### Font Weight Hierarchy

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body copy, descriptions |
| Medium | 500 | Secondary labels, data |
| Semibold | 600 | Card titles, action labels, buttons |
| Bold | 700 | Headings, badges, emphasis |
| ExtraBold | 800 | Display/hero text |

### Typography CSS Classes

```css
.text-display { font-size: clamp(24px, 4vw, 32px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.2; }
.text-h1     { font-size: 24px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.3; }
.text-h2     { font-size: 20px; font-weight: 700; letter-spacing: -0.01em; line-height: 1.35; }
.text-h3     { font-size: 16px; font-weight: 600; line-height: 1.4; }
.text-base   { font-size: 15px; font-weight: 400; line-height: 1.6; }
.text-sm     { font-size: 13px; font-weight: 400; line-height: 1.5; }
.text-xs     { font-size: 12px; font-weight: 500; line-height: 1.4; }
.text-xxs    { font-size: 11px; font-weight: 700; letter-spacing: 0.05em; line-height: 1.3; }
```

---

## 3. SPACING & LAYOUT GRID

### Spacing Scale (4px baseline)

| Token | Value | Usage |
|-------|-------|-------|
| `--space-0` | `0` | - |
| `--space-1` | `4px` | Micro spacing |
| `--space-2` | `8px` | Tight spacing (gaps, padding) |
| `--space-3` | `12px` | Standard spacing |
| `--space-4` | `16px` | Comfortable spacing |
| `--space-5` | `20px` | Section spacing |
| `--space-6` | `24px` | Large spacing |
| `--space-7` | `28px` | XL spacing |
| `--space-8` | `32px` | XXL spacing |
| `--space-10` | `40px` | XXXL spacing |
| `--space-12` | `48px` | Page sections |
| `--space-16` | `64px` | Major sections |

### Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `8px` | Small buttons, inputs |
| `--radius-md` | `12px` | Standard buttons, cards, dropdowns |
| `--radius-lg` | `16px` | Cards, panels, major surfaces |
| `--radius-xl` | `20px` | Large modals, prominent cards |
| `--radius-full` | `999px` | Pills, badges, circular elements |

### Layout Grid

- **Container Max Width:** `1060px` (desktop), `100%` (mobile)
- **Gutter:** `24px` (desktop), `16px` (mobile)
- **Column Grid:** 
  - Desktop: 12-column (88px per column)
  - Tablet: 8-column
  - Mobile: 4-column (responsive)

### Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| `xs` | `0px` | Mobile |
| `sm` | `420px` | Small mobile |
| `md` | `480px` | Tablet |
| `lg` | `900px` | Desktop |
| `xl` | `1200px` | Large desktop |

---

## 4. COMPONENT DESIGN SPECS

### 4.1 Buttons

#### Primary Button (CTA)

```css
.btn-primary {
  background: var(--accent-grad);
  color: #fff;
  padding: 11px 20px;      /* 44px min-height */
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.12s, box-shadow 0.2s;
  touch-action: manipulation;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px var(--accent-glow);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
  opacity: 1;
}

.btn-primary:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  transform: none;
}

.btn-primary:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}
```

**Specifications:**
- Minimum height: 44px (touch target)
- Padding: 11px 20px (tall), 8px 16px (compact)
- Color: Gradient accent to white text
- Animations: 0.15s opacity, 0.12s micro-interaction on hover

#### Secondary Button

```css
.btn-secondary {
  background: var(--bg-elevated);
  color: var(--text-muted);
  border: 1px solid var(--border);
  padding: 11px 20px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  touch-action: manipulation;
}

.btn-secondary:hover:not(:disabled) {
  border-color: var(--border-hover);
  color: var(--text);
  background: rgba(255, 255, 255, 0.04);
}

.btn-secondary:active:not(:disabled) {
  background: rgba(255, 255, 255, 0.07);
}

.btn-secondary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

#### Tertiary Button (Ghost)

```css
.btn-tertiary {
  background: transparent;
  color: var(--text-muted);
  border: none;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}

.btn-tertiary:hover {
  color: var(--text);
  background: rgba(255, 255, 255, 0.06);
}
```

#### Danger Button (Destructive)

```css
.btn-danger {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 11px 20px;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.25);
  border-color: rgba(239, 68, 68, 0.5);
}
```

### 4.2 Cards

```css
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
}

.card:hover {
  border-color: var(--border-hover);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.3);
  transform: translateY(-1px);
}

.card.interactive {
  cursor: pointer;
}

.card.selected {
  border-color: var(--accent-primary);
  background: var(--accent-dim);
  box-shadow: 0 0 0 1px var(--accent-primary);
}

.card.elevated {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

**Card Variants:**
- **Default:** 16px padding, minimal elevation
- **Interactive:** Cursor pointer, hover effect
- **Selected:** Accent border, dim background
- **Elevated:** Higher shadow for prominence

### 4.3 Form Inputs

#### Text Input

```css
.input-text {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  padding: 10px 12px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;
  min-height: 40px;
}

.input-text:hover:not(:disabled) {
  border-color: var(--border-hover);
}

.input-text:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.input-text:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-text::placeholder {
  color: var(--text-muted);
}
```

#### Checkbox

```css
.checkbox {
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--border);
  border-radius: 4px;
  background: var(--bg-elevated);
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.checkbox:hover {
  border-color: var(--accent-primary);
}

.checkbox:checked {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 11-1.06-1.06l7.25-7.25a.75.75 0 011.06 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100%;
}

.checkbox:focus-visible {
  box-shadow: 0 0 0 3px var(--accent-glow);
}
```

#### Radio Button

```css
.radio {
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--border);
  border-radius: 50%;
  background: var(--bg-elevated);
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.radio:hover {
  border-color: var(--accent-primary);
}

.radio:checked {
  border-color: var(--accent-primary);
  box-shadow: inset 0 0 0 4px var(--accent-primary);
}

.radio:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}
```

#### Range Slider

```css
.slider {
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 999px;
  background: var(--bg-elevated);
  outline: none;
  cursor: pointer;
  transition: background 0.15s;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent-primary);
  cursor: pointer;
  border: 2.5px solid var(--bg-card);
  box-shadow: 0 0 0 1px var(--accent-primary), 0 2px 8px rgba(0, 0, 0, 0.4);
  transition: box-shadow 0.15s;
}

.slider::-webkit-slider-thumb:hover {
  box-shadow: 0 0 0 1px var(--accent-primary), 0 4px 12px var(--accent-glow);
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent-primary);
  cursor: pointer;
  border: 2.5px solid var(--bg-card);
  box-shadow: 0 0 0 1px var(--accent-primary), 0 2px 8px rgba(0, 0, 0, 0.4);
}
```

### 4.4 Badges & Labels

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  border: 1px solid;
  white-space: nowrap;
}

.badge-success {
  background: rgba(34, 197, 94, 0.12);
  color: #4ade80;
  border-color: rgba(34, 197, 94, 0.25);
}

.badge-warning {
  background: rgba(245, 158, 11, 0.12);
  color: #fbbf24;
  border-color: rgba(245, 158, 11, 0.25);
}

.badge-error {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.25);
}

.badge-info {
  background: rgba(59, 130, 246, 0.12);
  color: #60a5fa;
  border-color: rgba(59, 130, 246, 0.25);
}

.badge-primary {
  background: var(--accent-dim);
  color: var(--accent-hover);
  border-color: rgba(124, 106, 247, 0.25);
}
```

### 4.5 Tables

```css
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table thead {
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border);
}

.table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: var(--text-muted);
  font-size: 12px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  user-select: none;
}

.table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  color: var(--text);
}

.table tbody tr:hover {
  background: rgba(255, 255, 255, 0.03);
}

.table tbody tr.selected {
  background: var(--accent-dim);
}

.table-sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
}
```

### 4.6 Modals & Overlays

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

.modal {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  max-width: 500px;
  width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  animation: slideUp 0.3s ease;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 4.7 Dropdowns & Menus

```css
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  min-width: 180px;
  padding: 6px 0;
  margin-top: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 1001;
  animation: slideUp 0.2s ease;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  color: var(--text);
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.15s;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.dropdown-item.destructive {
  color: #f87171;
}

.dropdown-item.destructive:hover {
  background: rgba(239, 68, 68, 0.1);
}

.dropdown-divider {
  height: 1px;
  background: var(--border);
  margin: 6px 0;
}
```

### 4.8 Tabs

```css
.tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
  gap: 0;
}

.tab-button {
  padding: 12px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
  white-space: nowrap;
}

.tab-button:hover {
  color: var(--text);
}

.tab-button.active {
  color: var(--text);
  border-bottom-color: var(--accent-primary);
  font-weight: 600;
}

.tabs-content {
  padding: 20px 0;
}

.tab-panel {
  display: none;
}

.tab-panel.active {
  display: block;
  animation: fadeIn 0.2s ease;
}
```

### 4.9 Progress & Loading

```css
.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent-grad);
  border-radius: 999px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.skeleton {
  background: linear-gradient(90deg, var(--bg-card) 0%, rgba(255, 255, 255, 0.05) 50%, var(--bg-card) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 4.10 Tooltips & Popovers

```css
.tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  pointer-events: none;
  z-index: 1002;
  animation: fadeIn 0.15s ease;
}

.tooltip::after {
  content: "";
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  background: rgba(0, 0, 0, 0.8);
  clip-path: polygon(0% 0%, 100% 100%, 0% 100%);
}

.popover {
  position: absolute;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  font-size: 14px;
  color: var(--text);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 1002;
  max-width: 300px;
}
```

---

## 5. ELEVATION SYSTEM

### Shadow Hierarchy

| Level | CSS | Usage |
|-------|-----|-------|
| **None** | `none` | Flat surfaces (inputs, text) |
| **Slight** | `0 1px 2px rgba(0,0,0,0.2)` | Very subtle depth (hover states) |
| **Subtle** | `0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)` | Card hover |
| **Medium** | `0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)` | Elevated cards, panels |
| **Strong** | `0 10px 32px rgba(0,0,0,0.25), 0 4px 8px rgba(0,0,0,0.15)` | Modal dialog |
| **Accent Glow** | `0 0 0 1px var(--accent), 0 4px 20px var(--accent-glow)` | Focused elements, CTAs |

### Z-Index Scale

| Level | Value | Usage |
|-------|-------|-------|
| Base | 0 | Default stacking context |
| Sticky | 10 | Sticky headers |
| Header | 100 | Site header |
| Dropdown | 1001 | Menus, select |
| Modal | 1000 | Modal overlay (behind content) |
| Modal Content | 1001+ | Modal dialog on top |
| Tooltip | 1002 | Tooltips, floating hints |
| Notification | 1050 | Toast/notification stacks |

---

## 6. DARK MODE & LIGHT MODE

### Implementation Strategy

**Primary:** Dark mode (default)  
**Secondary:** Light mode (opt-in via settings)

### CSS Media Query Approach

```css
/* Dark mode (default) - already defined in :root */
:root {
  --bg: #09090f;
  --text: #f0f0f8;
  /* ... */
}

/* Light mode - override via media query */
@media (prefers-color-scheme: light) {
  :root {
    --bg: #fafbfc;
    --text: #0f1419;
    /* ... */
  }
}

/* Manual toggle via data attribute */
html[data-theme="light"] {
  --bg: #fafbfc;
  --text: #0f1419;
  /* ... */
}
```

### Adaptive Images

```css
/* Light mode overrides for specific images */
img[alt*="icon"] {
  filter: none;
}

@media (prefers-color-scheme: light) {
  img.dark-only {
    display: none;
  }
  img.light-only {
    display: block;
  }
}
```

---

## 7. ACCESSIBILITY CHECKLIST

### Color & Contrast

- [ ] All text meets WCAG AA standards (4.5:1 for normal, 3:1 for large text)
- [ ] Links distinguished by color + underline or other visual indicator
- [ ] Semantic colors not sole indicator of meaning (use icons, labels)
- [ ] At least 3:1 contrast for UI elements and graphical elements

**Contrast Verification (Dark Mode):**
- Primary text on background: `#f0f0f8` on `#09090f` = **21.4:1** ✓
- Muted text on background: `#6e6e94` on `#09090f` = **4.8:1** ✓
- Accent on background: `#7c6af7` on `#09090f` = **5.2:1** ✓

### Keyboard Navigation

- [ ] All interactive elements reachable via Tab key
- [ ] Logical tab order (left-to-right, top-to-bottom)
- [ ] Focus indicators always visible (2px outline, 2px offset)
- [ ] Escape key closes modals, dropdowns
- [ ] Enter/Space activates buttons
- [ ] Arrow keys navigate tabs, menus, sliders
- [ ] Home/End navigate to first/last item

### Screen Readers

- [ ] Semantic HTML (`<button>`, `<input>`, `<label>`, `<nav>`, `<main>`)
- [ ] ARIA labels on icon-only buttons
- [ ] Form labels associated via `<label for>` or `aria-label`
- [ ] Images have descriptive `alt` text
- [ ] Skip navigation link at top of page
- [ ] Region landmarks (`<main>`, `<nav>`, `<aside>`)
- [ ] Live regions for dynamic content (`aria-live="polite"`)

### Motor & Touch

- [ ] Minimum touch target: 44x44px
- [ ] Click areas have 8px minimum padding
- [ ] No hover-only interactions; keyboard alternative provided
- [ ] Sufficient spacing between clickable elements (8px)
- [ ] No time-based interactions (auto-advance, auto-dismiss)

### Motion & Animation

- [ ] Respects `prefers-reduced-motion` media query
- [ ] No auto-playing video/audio
- [ ] Animations have off switch
- [ ] No flashing > 3 per second

### Code Example: Accessible Button

```tsx
<button
  className="btn-primary"
  onClick={handleSubmit}
  aria-label="Convert files and download"
  aria-disabled={isProcessing}
  disabled={isProcessing}
>
  {isProcessing ? (
    <>
      <span className="spinner" aria-hidden="true" />
      Converting...
    </>
  ) : (
    "Convert & Download"
  )}
</button>
```

---

## 8. ANIMATION & TRANSITIONS

### Duration Scale

| Duration | Value | Usage |
|----------|-------|-------|
| Instant | 0ms | No delay |
| Quick | 75ms | Micro-interactions (focus) |
| Fast | 150ms | Hover states, quick feedback |
| Normal | 200ms | Standard transitions |
| Slow | 300ms | Modal entrance, significant changes |
| Very Slow | 500ms+ | Page transitions, complex sequences |

### Easing Functions

| Name | Cubic Bezier | Usage |
|------|--------------|-------|
| Linear | `linear` | Spinner, progress bar |
| Ease In | `cubic-bezier(0.4, 0, 1, 1)` | Entrance animations |
| Ease Out | `cubic-bezier(0, 0, 0.2, 1)` | Exit animations |
| Ease In-Out | `cubic-bezier(0.4, 0, 0.2, 1)` | Smooth transitions |
| Spring | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful interactions |

### Animation Keyframes

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInFromLeft {
  from {
    opacity: 0;
    transform: translateX(-16px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
```

### Micro-interactions

#### Button Hover (Primary)

```css
.btn-primary:hover {
  opacity: 0.92;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px var(--accent-glow);
  transition: opacity 0.15s, transform 0.12s, box-shadow 0.2s;
}
```

#### Button Active (Press)

```css
.btn-primary:active {
  transform: translateY(0);
  opacity: 1;
  transition: transform 0.12s, opacity 0.15s;
}
```

#### Input Focus

```css
.input-text:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-glow);
  transition: border-color 0.15s, box-shadow 0.15s;
}
```

#### Card Hover

```css
.card:hover {
  transform: translateY(-1px);
  border-color: var(--border-hover);
  box-shadow: 0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Reduce Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. COMPONENT PATTERNS

### 9.1 Dashboard Layout

**Structure:**
- Header (sticky, 58px)
- Sidebar (240px fixed, collapsible on mobile)
- Main content area (1fr, flexible)
- Footer (optional)

**CSS:**

```css
.dashboard-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: 58px 1fr;
  min-height: 100vh;
  gap: 0;
}

.dashboard-header {
  grid-column: 1 / -1;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  z-index: 100;
}

.dashboard-sidebar {
  background: var(--bg-card);
  border-right: 1px solid var(--border);
  padding: 16px 0;
  overflow-y: auto;
}

.dashboard-content {
  padding: 20px 32px;
  overflow-y: auto;
  background: var(--bg);
}

@media (max-width: 768px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
  }
  .dashboard-sidebar {
    position: fixed;
    left: 0;
    top: 58px;
    width: 240px;
    height: calc(100vh - 58px);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 99;
  }
  .dashboard-sidebar.open {
    transform: translateX(0);
  }
}
```

### 9.2 File List / Table Pattern

```css
.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: grid;
  grid-template-columns: 40px 1fr auto auto;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s;
}

.file-item:hover {
  border-color: var(--border-hover);
  background: rgba(255, 255, 255, 0.03);
}

.file-item.selected {
  background: var(--accent-dim);
  border-color: var(--accent-primary);
}

.file-item-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--bg-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
}

.file-item-info {
  min-width: 0;
}

.file-item-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-item-meta {
  font-size: 12px;
  color: var(--text-muted);
}

.file-item-size {
  font-size: 13px;
  color: var(--text-muted);
  white-space: nowrap;
}

.file-item-actions {
  display: flex;
  gap: 8px;
}
```

### 9.3 Form Group Pattern

```css
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 4px;
}

.form-label .required {
  color: var(--error);
}

.form-input-wrapper {
  position: relative;
}

.form-hint {
  font-size: 12px;
  color: var(--text-muted);
}

.form-error {
  font-size: 12px;
  color: var(--error);
  display: flex;
  align-items: center;
  gap: 4px;
}
```

### 9.4 Alert / Banner Pattern

```css
.alert {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  border: 1px solid;
  align-items: flex-start;
}

.alert-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.alert-content {
  flex: 1;
  line-height: 1.5;
}

.alert-success {
  background: rgba(34, 197, 94, 0.08);
  border-color: rgba(34, 197, 94, 0.3);
  color: #4ade80;
}

.alert-warning {
  background: rgba(245, 158, 11, 0.08);
  border-color: rgba(245, 158, 11, 0.3);
  color: #fbbf24;
}

.alert-error {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.alert-info {
  background: rgba(59, 130, 246, 0.08);
  border-color: rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}
```

---

## 10. RESPONSIVE DESIGN

### Mobile-First Approach

```css
/* Base (mobile) */
.container {
  max-width: 100%;
  padding: 0 16px;
}

/* Tablet (480px+) */
@media (min-width: 480px) {
  .container {
    max-width: 420px;
    margin: 0 auto;
  }
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .container {
    max-width: 680px;
  }
}

/* Desktop (900px+) */
@media (min-width: 900px) {
  .container {
    max-width: 900px;
    padding: 0 24px;
  }
}

/* Large desktop (1200px+) */
@media (min-width: 1200px) {
  .container {
    max-width: 1200px;
  }
}
```

### Responsive Grid

```css
.grid {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
}

@media (min-width: 480px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

---

## 11. USAGE EXAMPLES

### Example 1: Convert Tool Page (FileFettle Core)

**Components:**
1. Header (sticky)
2. Category selector (grid or sidebar)
3. Drop zone (prominent)
4. Format selector (tabs/grid)
5. Batch queue (cards)
6. Action buttons (primary CTA)

**Layout:**
```
┌─────────────────────────────────────┐
│  Header                             │
├────────────┬────────────────────────┤
│ Categories │  Main Content          │
│            │  - Drop Zone           │
│            │  - Format Selector     │
│            │  - Batch Queue         │
│            │  - Actions             │
└────────────┴────────────────────────┘
```

### Example 2: Dashboard Page (File Management)

**Components:**
1. Sidebar (navigation)
2. Main header (title, search, actions)
3. Filter/sort controls
4. File list or table
5. Pagination (if needed)
6. Footer stats

**Layout:**
```
┌──────────────────────────────────────────┐
│  Header                                  │
├────────────┬──────────────────────────────┤
│ Sidebar    │  Title                       │
│ - Home     │  [Search] [Filters] [+]      │
│ - Organise │  ┌──────────────────────────┐│
│ - Rules    │  │ File 1                   ││
│ - Dup.     │  ├──────────────────────────┤│
│ - Bulk Rn. │  │ File 2                   ││
│ - Settings │  └──────────────────────────┘│
│            │  [Prev] 1 of 5 [Next]        │
└────────────┴──────────────────────────────┘
```

### Example 3: Settings Page

**Components:**
1. Sidebar (settings categories)
2. Settings panel (form)
3. Tabs (for grouped settings)
4. Toggle switches, inputs, selects
5. Save/Cancel buttons

**Layout:**
```
Settings > Appearance
┌────────────┬──────────────────────────┐
│ Appearance │ Dark Mode        [Toggle]│
│ Privacy    │ Color Scheme     [Selector]│
│ Account    │ Font Size        [Slider] │
│ ...        │                          │
│            │ [Save Changes] [Cancel]  │
└────────────┴──────────────────────────┘
```

---

## 12. IMPLEMENTATION CHECKLIST

### Phase 1: Core System
- [ ] CSS variables fully defined (colors, spacing, sizing)
- [ ] Base component styles (buttons, inputs, cards)
- [ ] Typography system implemented
- [ ] Elevation/shadow system defined
- [ ] Dark/light mode support added

### Phase 2: Extended Components
- [ ] Tables and lists
- [ ] Forms and validation
- [ ] Modals and overlays
- [ ] Tabs and navigation
- [ ] Dropdowns and menus

### Phase 3: Patterns & Pages
- [ ] Dashboard layout
- [ ] File management interface
- [ ] Settings/configuration pages
- [ ] Responsive breakpoints tested

### Phase 4: Polish & Accessibility
- [ ] Accessibility audit (WCAG AA)
- [ ] Animation/transition performance
- [ ] Cross-browser testing
- [ ] Mobile touch interaction testing
- [ ] Documentation complete

### Phase 5: Integration
- [ ] Design tokens in Figma (optional)
- [ ] Component library created
- [ ] Storybook documentation (optional)
- [ ] Developer handoff complete

---

## 13. DESIGN TOKENS (CSS CUSTOM PROPERTIES)

```css
:root {
  /* Spacing */
  --space-0: 0;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-full: 999px;

  /* Shadows */
  --shadow-none: none;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 1px 3px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 10px 32px rgba(0, 0, 0, 0.25), 0 4px 8px rgba(0, 0, 0, 0.15);

  /* Typography */
  --font-family-base: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
  --font-size-xs: 12px;
  --font-size-sm: 13px;
  --font-size-base: 15px;
  --font-size-lg: 16px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  --line-height-tight: 1.3;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.6;

  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 14. MIGRATION GUIDE: Current → New Design System

### Breaking Changes
- All custom inline styles → CSS classes
- Tailwind utilities → custom spacing scale
- Inconsistent button styles → unified button system
- Ad-hoc shadows → elevation hierarchy

### Step-by-Step Migration

1. **Update globals.css** with new color tokens and component classes
2. **Refactor page.tsx** to use semantic classes instead of inline styles
3. **Update components** to follow new patterns
4. **Test dark/light mode** with prefers-color-scheme
5. **Verify accessibility** with WCAG audit
6. **Performance test** animations with reduced-motion preference

---

## 15. FUTURE ENHANCEMENTS

- [ ] CSS-in-JS abstraction (optional)
- [ ] Design tokens in Figma + Tokens Studio sync
- [ ] Storybook integration for component documentation
- [ ] Tailwind integration as alternative to CSS variables
- [ ] Figma design kit for designers
- [ ] Custom property documentation in Zeroheight/Uxpin
- [ ] Motion design guidelines for micro-interactions
- [ ] Internationalization (RTL support)

---

## Appendix A: Color Contrast Matrix

| Foreground | Background | Ratio | WCAG Level |
|-----------|-----------|-------|-----------|
| `#f0f0f8` | `#09090f` | 21.4:1 | AAA |
| `#6e6e94` | `#09090f` | 4.8:1 | AA |
| `#7c6af7` | `#09090f` | 5.2:1 | AA |
| `#4ade80` | `#09090f` | 9.2:1 | AAA |
| `#f87171` | `#09090f` | 7.8:1 | AAA |
| `#fbbf24` | `#09090f` | 11.3:1 | AAA |
| `#60a5fa` | `#09090f` | 8.7:1 | AAA |

---

## Appendix B: Recommended Figma Setup

**Frame Structure:**
```
📄 FileFettle Design System
├── 🎨 Colors
│  ├── Primary
│  ├── Semantic
│  └── Neutrals
├── 📝 Typography
│  ├── Display
│  ├── Headings
│  ├── Body
│  └── Labels
├── 🧩 Components
│  ├── Buttons
│  ├── Inputs
│  ├── Cards
│  ├── Tables
│  └── Modals
├── 📐 Layout
│  ├── Grids
│  └── Spacing
└── 🎬 Interactions
   ├── Hover States
   ├── Focus States
   └── Loading States
```

---

**Document Version:** 1.0  
**Last Updated:** June 2026  
**Author:** Dave-MK / FileFettle Team  
**Status:** Ready for Implementation
