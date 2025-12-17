# Brand Deal CRM - Design Guidelines

## Design Approach
**Selected Approach:** Design System with Modern SaaS Dashboard Patterns

**Primary Inspiration:** Linear's clean productivity aesthetic + Notion's creator-friendly interface

**Key Principles:**
- Creator-first language (no corporate jargon)
- Information clarity over decoration
- Fast visual scanning for busy creators
- Mobile-optimized for on-the-go management

---

## Typography

**Font Stack:**
- Primary: Inter (Google Fonts) - clean, readable at all sizes
- Monospace: JetBrains Mono - for monetary values and metrics

**Hierarchy:**
- Page Titles: text-2xl, font-semibold (32px)
- Section Headers: text-lg, font-semibold (18px)
- Card Titles: text-base, font-medium (16px)
- Body Text: text-sm (14px)
- Captions/Metadata: text-xs, text-gray-600 (12px)
- Numbers/Metrics: text-3xl, font-bold for dashboard stats

---

## Layout System

**Spacing Primitives:** Use Tailwind units of **2, 4, 6, and 8** consistently
- Tight spacing: p-2, gap-2 (buttons, inline elements)
- Standard spacing: p-4, gap-4 (cards, form fields)
- Section spacing: p-6, py-8 (page sections)
- Page margins: p-8 (desktop), p-4 (mobile)

**Grid System:**
- Dashboard: 3-column stats grid on desktop → single column mobile
- Kanban columns: Horizontal scroll on mobile, full width on desktop
- Forms: Single column, max-w-2xl centered

---

## Core Components

### Navigation
- **Sidebar Navigation** (Desktop): Fixed left sidebar, width w-64
  - Logo/Brand at top
  - Main nav items with icons (Dashboard, Deals, Contracts, Reminders)
  - User profile at bottom
  - Icons: Heroicons outline style
  
- **Mobile Navigation**: Bottom tab bar with 4 primary actions

### Dashboard Cards
- Stat Cards: Rounded corners (rounded-lg), subtle shadow (shadow-sm)
- Grid layout with equal heights
- Large number display with small label underneath
- Icon in top-right corner for visual context

### Kanban Board
- Column headers: Sticky positioning for scroll
- Deal cards: Compact with key info only (brand, value, deadline)
- Drag handles: Subtle dotted pattern on left edge
- Empty states: Friendly illustrations with encouraging copy

### Data Tables
- Zebra striping for better scanning
- Sticky headers on scroll
- Action buttons: Icon-only for compact rows
- Sort indicators in column headers

### Forms
- Single-column layout, generous vertical spacing (gap-6)
- Floating labels or top-aligned labels
- Full-width inputs with consistent height (h-10)
- Primary action button: Full-width on mobile, inline on desktop

### Charts (Recharts)
- Line charts: Smooth curves for earnings trends
- Bar charts: Platform/brand comparisons
- Subtle grid lines, clear axis labels
- Tooltip on hover with exact values

---

## Component Library Details

### Buttons
- Primary: Solid, medium size, rounded-md
- Secondary: Outline style
- Destructive: Red accent for delete actions
- Icon buttons: Square, centered icon, subtle hover state

### Cards
- Border: border border-gray-200
- Padding: p-6
- Rounded: rounded-lg
- Hover: subtle lift effect (hover:shadow-md transition)

### Status Badges
- Pipeline stages: Different badge styles per stage
- Payment status: Green (paid) / Yellow (pending)
- Small, rounded-full, px-3 py-1

### Modals
- Centered overlay with backdrop blur
- Max width: max-w-lg for forms, max-w-4xl for detail views
- Close button: Top-right corner
- Actions: Right-aligned footer buttons

---

## Application-Specific Patterns

### Deal Pipeline View
- Horizontal Kanban layout with 5 columns of equal width
- Column headers show count badges
- Cards show: Brand logo placeholder, brand name, deal value (prominent), platform icon, deadline
- "Add Deal" button at top of each column

### Creator Dashboard
- Hero section: Large stats in 4-column grid (mobile: 2x2)
- Quick actions row: "New Deal", "Add Payment", "Upload Contract"
- Recent activity feed below stats
- Earnings chart: Full-width line chart showing last 6 months

### Contract Vault
- Grid of contract cards with PDF thumbnails
- Each card: Brand name, dates, download button
- Upload area: Drag-and-drop zone with dashed border

### Reminder Center
- List view with grouped sections (Today, This Week, Later)
- Each reminder: Icon, title, deal reference, time
- Inline actions: Mark complete, snooze, delete

---

## Mobile Responsiveness Strategy

**Breakpoints:**
- Mobile: base (< 768px) - stack everything vertically
- Tablet: md (768px+) - 2-column grids where appropriate
- Desktop: lg (1024px+) - full multi-column layouts

**Mobile Optimizations:**
- Kanban: Horizontal scroll with snap points
- Tables: Card view instead of traditional table
- Forms: Full-width, larger touch targets (min-h-12)
- Navigation: Bottom tab bar (4 items max)

---

## Visual Enhancements

**Minimal Animations:**
- Card hover: Subtle lift (transform: translateY(-2px))
- Button clicks: Scale feedback (scale-95 active state)
- Page transitions: Fade in content
- NO distracting auto-playing animations

**Empty States:**
- Friendly illustrations (use placeholder SVGs)
- Actionable copy: "Create your first deal"
- Primary CTA button centered below message

---

## Images

**Dashboard/Application Context:**
This is a dashboard application, not a marketing site. Images are used strategically:

1. **Brand Logos:** Placeholder circular avatars for brand names in deal cards
2. **User Avatar:** Small circular image in navigation (top-right or sidebar)
3. **Empty State Illustrations:** Simple, friendly SVG illustrations for empty pipeline columns and blank states
4. **Contract Thumbnails:** PDF preview thumbnails in vault (generated or placeholder)

**No hero images** - this is a functional dashboard that prioritizes data and actions over imagery.

---

## Accessibility

- All interactive elements have min-height of h-10 (40px) for touch targets
- Form inputs include proper labels and ARIA attributes
- Focus states: Clear ring-2 ring-blue-500 outline on keyboard focus
- Icon-only buttons include aria-label attributes
- Maintain 4.5:1 contrast ratio for all text