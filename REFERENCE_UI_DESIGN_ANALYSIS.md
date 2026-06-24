# FileFettle Reference UI Design Analysis

**Based on 9-page UI mockup showing Landing/Home, Dashboard, Organise, Rules, Duplicates, Bulk Rename, Settings, Logs, and Pricing pages**

---

## 1. COLOR PALETTE

### Primary Colors
- **Primary Accent/Purple**: `#7c5cfa` or `#6d5ce7` (vibrant purple)
  - Used for: Primary buttons, active badges, accent highlights, navigation active states
  - Lighter variant on hover: ~10% lighter
- **Secondary Purple**: `#8b7bc3` (muted purple for secondary actions)
- **Bright Purple (CTA)**: `#8b5cf6` (more saturated for call-to-action buttons)

### Background Colors
- **Page Background**: `#0a0a12` or `#0f0f1a` (very dark, near-black)
- **Card Background**: `#1a1a2e` (slightly lighter for elevation)
- **Elevated Surface**: `#242440` (lighter for modals, dropdowns)
- **Hover Background**: `rgba(255, 255, 255, 0.05)` (subtle white overlay on hover)

### Text Colors
- **Primary Text**: `#ffffff` or `#f5f5ff` (off-white)
- **Secondary Text**: `#a0a0b8` (muted gray-purple)
- **Muted/Placeholder**: `#6e6e94` (darker gray)
- **Light Muted**: `#808099` (medium gray for labels)

### Semantic Colors
- **Success/Green**: `#2ecc71` or `#10b981` (bright green)
- **Error/Red**: `#e74c3c` or `#ef4444` (red)
- **Warning/Yellow**: `#f39c12` or `#f59e0b` (amber/yellow)
- **Info/Blue**: `#3b82f6` or `#2196f3` (blue)

### Accent Variants
- **Green Badge**: `#2ecc71` with `rgba(46, 204, 113, 0.1)` background
- **Red Badge**: `#e74c3c` with `rgba(231, 76, 60, 0.1)` background
- **Orange/Warning**: `#f39c12` with `rgba(243, 156, 18, 0.1)` background
- **Purple/Default**: `#8b5cf6` with `rgba(139, 92, 246, 0.1)` background

---

## 2. TYPOGRAPHY

### Font Family
- **Primary Font Stack**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- Clean, modern sans-serif with excellent readability
- Geometric design (similar to current FileFettle)

### Type Scale

| Level | Size | Weight | Line-Height | Usage |
|-------|------|--------|-------------|-------|
| **Display/H1** | 32-40px | 800 | 1.2 | Page titles (Dashboard, Organise, etc.) |
| **H2** | 24-28px | 700 | 1.3 | Section headers |
| **H3** | 18-20px | 600 | 1.4 | Subsection titles |
| **Large Body** | 16px | 500 | 1.6 | Card titles, stats |
| **Body** | 14px | 400 | 1.6 | Regular text, descriptions |
| **Small** | 13px | 400 | 1.5 | Secondary text, labels |
| **Caption** | 12px | 400 | 1.4 | Captions, timestamps, badges |
| **Tiny** | 11px | 400 | 1.3 | Micro-interactions, hints |

### Font Weights Used
- 400 (Regular) — Body copy, descriptions
- 500 (Medium) — Card titles, section labels
- 600 (Semibold) — Headings, strong labels
- 700 (Bold) — Main headings, emphasis
- 800 (Extrabold) — Display/hero headings

### Letter Spacing
- Headers (H1-H3): `-0.025em` (tightened)
- Body: `0em` (normal)
- Labels/Badges: `0.05em` (opened for emphasis)
- Uppercase labels: `0.08em` (more opened)

---

## 3. LAYOUT & SPACING SYSTEM

### Container Widths
- **Sidebar Nav**: `220px` fixed (left column on dashboard/rules/etc.)
- **Main Content**: Remaining flex space
- **Max Content Width**: ~1200px (full width on large screens)
- **Page Padding**: `16px` (mobile) → `24px` (tablet) → `32px` (desktop)

### Spacing Scale (4px baseline)
```
4px   (gap-1 / p-1)
8px   (gap-2 / p-2)
12px  (gap-3 / p-3)
16px  (gap-4 / p-4)
20px  (gap-5 / p-5)
24px  (gap-6 / p-6)
28px  (custom)
32px  (gap-8 / p-8)
40px  (gap-10 / p-10)
48px  (gap-12 / p-12)
```

### Grid System
- **Dashboard Cards**: 4-column grid on desktop, 2-column on tablet, 1-column on mobile
- **Table/List**: Full-width with consistent padding
- **Button Groups**: 8px gap between buttons
- **Card Grid**: 12px gap between cards

### Border Radius Scale
- **Buttons/Small**: `6px` or `8px`
- **Cards/Modals**: `12px`
- **Large Elements**: `16px`
- **Fully Rounded (Pills)**: `9999px` (toggles, badges)

### Shadow/Elevation System
- **No Shadow** (cards, default): Flat with `1px` border using `rgba(255, 255, 255, 0.08)`
- **Hover Shadow** (cards on hover): `0 8px 24px rgba(0, 0, 0, 0.3)`
- **Modal Shadow**: `0 20px 60px rgba(0, 0, 0, 0.5)`
- **Glow Effect** (accent elements): `0 0 0 1px #7c5cfa, 0 4px 20px rgba(124, 92, 250, 0.3)`

---

## 4. COMPONENT STYLES

### Buttons

**Primary Button**
- Background: `#8b5cf6` (purple)
- Text: `#ffffff`
- Padding: `12px 24px` (desktop), `10px 20px` (mobile)
- Border Radius: `8px`
- Font Weight: `600`
- Hover: Lighter purple `#a78bfa` or glow effect
- Active: Darker purple `#7c3aed`
- Disabled: `rgba(139, 92, 246, 0.5)` with opacity

**Secondary Button**
- Background: `#1a1a2e` or `transparent`
- Border: `1px solid rgba(255, 255, 255, 0.1)`
- Text: `#ffffff`
- Padding: `12px 24px`
- Hover: `rgba(255, 255, 255, 0.08)` background

**Tertiary/Ghost Button**
- Background: `transparent`
- Text: `#8b5cf6` or `#ffffff`
- No border (or very subtle)
- Hover: `rgba(139, 92, 246, 0.1)` background

### Cards
- **Background**: `#1a1a2e`
- **Border**: `1px solid rgba(255, 255, 255, 0.08)`
- **Padding**: `16px` (compact) → `24px` (spacious)
- **Border Radius**: `12px`
- **Hover**: Border becomes `rgba(255, 255, 255, 0.15)` + shadow
- **Box Shadow**: Flat (no shadow) or `0 8px 24px rgba(0, 0, 0, 0.3)` on hover

### Badges & Tags
- **Height**: `24px`
- **Padding**: `4px 12px`
- **Font Size**: `12px`
- **Border Radius**: `6px`
- **Font Weight**: `500`

**Color Variants:**
- **Green (Success)**: `#2ecc71` text on `rgba(46, 204, 113, 0.1)` background
- **Red (Error)**: `#e74c3c` text on `rgba(231, 76, 60, 0.1)` background
- **Yellow (Warning)**: `#f39c12` text on `rgba(243, 156, 18, 0.1)` background
- **Purple (Default)**: `#8b5cf6` text on `rgba(139, 92, 246, 0.1)` background
- **Gray (Neutral)**: `#a0a0b8` text on `rgba(160, 160, 184, 0.1)` background

### Input Fields
- **Background**: `#1a1a2e`
- **Border**: `1px solid rgba(255, 255, 255, 0.08)`
- **Text Color**: `#ffffff`
- **Placeholder Color**: `#6e6e94`
- **Padding**: `10px 14px` (standard)
- **Border Radius**: `8px`
- **Font Size**: `14px`
- **Focus State**: 
  - Border: `1px solid #8b5cf6`
  - Box Shadow: `0 0 0 2px rgba(139, 92, 246, 0.2)`
- **Hover**: Border becomes `rgba(255, 255, 255, 0.15)`

### Tables
- **Header Background**: `#242440` (slightly elevated)
- **Header Text**: `#ffffff` with `font-weight: 600`
- **Row Background**: `#1a1a2e`
- **Row Padding**: `12px 16px`
- **Border**: `1px solid rgba(255, 255, 255, 0.05)` between rows
- **Hover Row**: Background `rgba(139, 92, 246, 0.05)`
- **Alternating Rows**: Optional `rgba(255, 255, 255, 0.02)` for visual separation

### Toggles/Switches
- **Size**: `44px` wide × `24px` tall (accessible touch target)
- **Background** (off): `#242440`
- **Background** (on): `#8b5cf6`
- **Knob**: `#ffffff`
- **Border Radius**: `12px` (for track), `10px` (for knob)
- **Transition**: `0.25s ease-out`

### Checkboxes
- **Size**: `18px` × `18px`
- **Unchecked**: Border `1px solid rgba(255, 255, 255, 0.2)`, background transparent
- **Checked**: Background `#8b5cf6`, border `1px solid #8b5cf6`
- **Border Radius**: `4px`
- **Checkmark**: White `#ffffff`

### Navigation/Sidebar
- **Background**: `#0a0a12`
- **Item Padding**: `12px 16px`
- **Item Height**: `40px`
- **Active Item Background**: `rgba(139, 92, 246, 0.15)`
- **Active Item Border Left**: `3px solid #8b5cf6`
- **Hover Item Background**: `rgba(255, 255, 255, 0.05)`
- **Text Color** (inactive): `#a0a0b8`
- **Text Color** (active): `#ffffff`
- **Icon Size**: `18px`

### Stats Cards (Dashboard)
- **Layout**: Icon + Label + Value
- **Value Font Size**: `24px` → `32px`
- **Value Font Weight**: `700`
- **Label Font Size**: `12px`
- **Label Color**: `#808099`
- **Icon Size**: `32px` or `40px`
- **Icon Background**: `rgba(139, 92, 246, 0.1)` or semantic color variant

---

## 5. VISUAL EFFECTS & INTERACTIONS

### Shadows/Elevation
- **Level 0** (default): No shadow, `1px border`
- **Level 1** (hover): `0 4px 12px rgba(0, 0, 0, 0.2)`
- **Level 2** (cards elevated): `0 8px 24px rgba(0, 0, 0, 0.3)`
- **Level 3** (modals): `0 20px 60px rgba(0, 0, 0, 0.5)`

### Border Styling
- **Default Border**: `1px solid rgba(255, 255, 255, 0.08)`
- **Hover Border**: `1px solid rgba(255, 255, 255, 0.15)`
- **Active/Focus Border**: `1px solid #8b5cf6`
- **Error Border**: `1px solid #e74c3c`
- **Success Border**: `1px solid #2ecc71`

### Glows & Highlights
- **Purple Glow** (accent): `0 0 0 1px #8b5cf6, 0 4px 20px rgba(139, 92, 246, 0.3)`
- **Success Glow**: `0 4px 20px rgba(46, 204, 113, 0.2)`
- **Error Glow**: `0 4px 20px rgba(231, 76, 60, 0.2)`

### Transitions & Animations
- **Fast** (micro-interactions): `0.15s ease-out`
- **Standard** (most interactions): `0.2s ease-out`
- **Slow** (modal appear): `0.3s ease-out`
- **Easing**: `ease-out` for most, `ease-in-out` for complex animations
- **Reduced Motion**: Respect `prefers-reduced-motion` media query (instant or 0.05s)

### Hover States
- **Buttons**: Lighter color + subtle shadow
- **Cards**: Border brightens + shadow appears
- **Links**: Color change + underline
- **Interactive Elements**: Background color shift or glow

### Active/Selected States
- **Buttons**: Darker color, slight scale down (98%)
- **Navigation Items**: Left border highlight + background color
- **Tabs**: Bottom border highlight
- **Checkboxes**: Purple fill

### Disabled States
- **Opacity**: `0.5` or `0.6`
- **Cursor**: `not-allowed`
- **Color**: Gray-tinted version of normal color
- **Pointer Events**: `none`

---

## 6. PAGE-SPECIFIC PATTERNS

### Landing/Home Page
- **Hero Section**: Large heading (32-40px) + subtitle + CTA button
- **Tagline Style**: "Tidy files. Clear mind. More time." — Multiple colors, bold typography
- **Features List**: Icon + title + description, vertical stack
- **Button Prominence**: Large primary CTA with hover glow effect

### Dashboard Page
- **4-Column Stats Grid**: File Organized, Space Saved, Duplicates Found, Rules Active
- **Activity Feed**: Left sidebar nav + main content area
- **Donut Chart**: Storage visualization with legend
- **Quick Actions**: 2×2 grid of action buttons

### Organise Page
- **Two-Mode Interface**: Smart Mode vs. Custom Mode toggles
- **Smart Mode**: AI categorization options
- **Custom Mode**: Drag-to-organize interface
- **Folder Structure**: File hierarchy with icons

### Rules Page
- **Table Layout**: Name | Conditions | Actions | Status columns
- **Row Actions**: Toggle enable/disable, edit, delete
- **New Rule Button**: Prominent primary button at top-right
- **Status Indicators**: Green (active) / Gray (inactive) pills

### Duplicates Page
- **File List**: Thumbnail | Name | Original/Duplicate tag | Keep/Remove buttons
- **Duplicate Detection**: Shows relationships between duplicate files
- **Batch Actions**: Select multiple, bulk keep/remove

### Bulk Rename Page
- **Pattern Input**: Text field for rename pattern
- **Preview Grid**: Shows before/after filenames
- **Rename Button**: Large, prominent, at bottom
- **Clear/Reset**: Option to clear and start over

### Settings Page
- **Tabbed Interface**: General | Organization | Duplicates | Advanced
- **Toggle Controls**: Yes/No settings as switches
- **List Controls**: Numbered list of options
- **Color-Coded Controls**: Green toggles for enabled, gray for disabled

### Logs Page
- **Activity Table**: Action | Details | Files | Date & Time columns
- **Filter Bar**: Dropdown for action type + date range picker
- **Timestamp**: Relative time (e.g., "5m ago")
- **Detailed View**: Click row to expand details

### Pricing Page
- **3-Tier Comparison**: Free | Pro | Team
- **Card Layout**: Centered, equal height
- **Feature Checklist**: ✓ mark for included features
- **CTA Button**: "Get Started" (Free) / "Most Popular" (Pro) / "Get Team" (Team)
- **Price Display**: Large, bold, with billing period

---

## 7. CONSISTENT DESIGN LANGUAGE

### Recurring Elements Across All 9 Pages

1. **Header/Navigation**
   - FileFettle logo on left
   - Main navigation menu items (Dashboard, Organise, Rules, Duplicates, Bulk Rename, Settings, Logs)
   - Active state: Purple accent bar or background
   - Account/Profile icon on right

2. **Sidebar Navigation** (on dashboard, rules, duplicates, settings pages)
   - Fixed left sidebar with navigation items
   - Icons + labels
   - Active item highlighted with purple accent
   - Collapsible on mobile

3. **Color Hierarchy**
   - Bright purple (`#8b5cf6`) for primary actions and highlights
   - Green (`#2ecc71`) for success and positive states
   - Red (`#e74c3c`) for errors and destructive actions
   - Consistent across all pages

4. **Typography Hierarchy**
   - Page titles: 32-40px, weight 700-800
   - Section titles: 18-20px, weight 600
   - Body text: 14px, weight 400
   - Labels/captions: 12px, weight 400-500

5. **Spacing Consistency**
   - Consistent gaps between components (8px, 12px, 16px, 24px)
   - Padding inside cards and containers (16px or 24px)
   - Margin between sections (24px, 32px, 40px)

6. **Interactive Elements**
   - Buttons always have hover states (shadow, color change, glow)
   - Form inputs have clear focus states (purple border, glow)
   - Tables have row hover states
   - Toggles have smooth transitions

7. **Dark Mode Foundation**
   - All pages built on dark background (`#0a0a12`)
   - Elevated surfaces use lighter dark colors (`#1a1a2e`, `#242440`)
   - Text is white/off-white for contrast
   - Accent color (purple) provides visual pop

8. **Accessibility Features**
   - High contrast ratios (white on dark backgrounds ~15:1)
   - Focus states clearly visible (2px outline or border)
   - Minimum 44px touch targets (buttons, toggles)
   - Semantic HTML structure (implied from design)
   - Icons paired with text labels

9. **Micro-interactions**
   - Smooth transitions on all state changes (0.15s-0.3s)
   - Hover effects on interactive elements
   - Loading states (spinners, progress bars)
   - Success/error feedback (badges, alerts)

10. **Mobile Responsiveness** (implied from design)
    - Single-column layout on small screens
    - Sidebar navigation becomes hamburger menu
    - Card grids adapt to available width
    - Touch targets remain 44px minimum

---

## 8. KEY DIFFERENCES FROM CURRENT FILEFETTLE UI

| Aspect | Current FileFettle | Reference Design |
|--------|-------------------|------------------|
| **Scale** | File converter tool only | Expanded app (dashboard + management) |
| **Navigation** | Simple header + breadcrumbs | Sidebar nav + header menu |
| **Component Usage** | Task-focused (DropZone, FormatSelector) | Dashboard-oriented (cards, tables, stats) |
| **Complexity** | Single-purpose per page | Multi-section pages |
| **Information Density** | Low (one converter per page) | High (stats, logs, settings) |
| **Sidebar** | None | Left navigation sidebar |
| **Tables** | Not used | Heavily used (Rules, Duplicates, Logs) |
| **Modals** | Minimal | More modal/dialog usage |
| **Stats Display** | Simple text + numbers | Card-based metrics grid |

---

## 9. IMPLEMENTATION PRIORITY

**Phase 1: Core Design Tokens** (Colors, Typography, Spacing)
- Extract exact hex values from reference
- Define CSS variable naming
- Set up Tailwind config

**Phase 2: Foundational Components** (Buttons, Cards, Inputs)
- Implement primary/secondary button styles
- Create card component with elevation
- Style form inputs with focus states

**Phase 3: Advanced Components** (Tables, Sidebars, Modals)
- Create table styling
- Implement sidebar navigation
- Design modal/dialog components

**Phase 4: Page-Specific Patterns** (Dashboard, Rules, Settings)
- Apply patterns to specific pages
- Ensure consistency across sections
- Responsive design adjustments

**Phase 5: Refinement & Testing**
- Fine-tune spacing and alignment
- Test accessibility (WCAG AA)
- Mobile responsiveness verification
- Cross-browser compatibility

---

## 10. COLOR CODE REFERENCE (Hex Values Extracted)

| Element | Color | Hex Value | Usage |
|---------|-------|-----------|-------|
| **Primary Accent** | Purple | `#8b5cf6` | Buttons, active states, highlights |
| **Primary Hover** | Light Purple | `#a78bfa` | Button hover, lighter variant |
| **Primary Dark** | Dark Purple | `#7c3aed` | Button active, pressed state |
| **Background** | Near Black | `#0a0a12` | Page background |
| **Card Background** | Dark Navy | `#1a1a2e` | Card, surface background |
| **Elevated Surface** | Light Navy | `#242440` | Modal, dropdown, table header |
| **Primary Text** | Off White | `#ffffff` | Main text color |
| **Secondary Text** | Gray Purple | `#a0a0b8` | Secondary labels, muted text |
| **Muted Text** | Dark Gray | `#6e6e94` | Placeholder, very muted text |
| **Success** | Green | `#2ecc71` | Success badges, positive indicators |
| **Error** | Red | `#e74c3c` | Error messages, destructive actions |
| **Warning** | Amber | `#f39c12` | Warning badges, caution indicators |
| **Info** | Blue | `#3b82f6` | Info badges, informational content |
| **Border Default** | Subtle White | `rgba(255, 255, 255, 0.08)` | Default border color |
| **Border Hover** | Light White | `rgba(255, 255, 255, 0.15)` | Hover border, elevated |
| **Focus Glow** | Purple Glow | `rgba(139, 92, 246, 0.3)` | Focus state glow effect |

---

## CONCLUSION

This reference design provides a **cohesive, modern dark-themed UI** suitable for an expanded FileFettle application that goes beyond simple file conversion to include **dashboard, organization, rules, and file management features**. The design language is:

- **Consistent**: Recurring patterns, colors, and typography across all 9 pages
- **Accessible**: High contrast, clear focus states, 44px touch targets
- **Modern**: Clean typography, subtle shadows, smooth transitions
- **Scalable**: Flexible grid system, responsive design considerations
- **Professional**: Dashboard-like appearance suitable for productivity software

The current FileFettle converter UI can adopt these design principles to create a unified experience when expanded to include dashboard and management features.
