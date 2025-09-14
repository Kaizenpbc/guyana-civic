# Local Government Platform Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from **Linear** and **Notion** for their clean, functional interfaces that handle complex data while remaining user-friendly. This government platform requires clear information hierarchy and efficient workflows for both citizens and officials.

## Core Design Elements

### A. Color Palette
**Primary Colors:**
- Light Mode: Deep civic blue (215 75% 35%) for trust and authority
- Dark Mode: Softer blue (215 60% 45%) for accessibility
- Success: Forest green (145 70% 40%) for resolved issues
- Warning: Amber (35 90% 55%) for pending items
- Error: Crimson (355 75% 50%) for urgent issues

**Neutral Colors:**
- Light backgrounds with warm gray tones (210 15% 97%)
- Dark mode with cool charcoal (215 25% 15%)
- Text hierarchy using varying opacity levels

### B. Typography
**Font Stack:** Inter via Google Fonts CDN
- Headings: Inter 600 (Semi-bold) for department names, issue titles
- Body: Inter 400 (Regular) for descriptions, content
- Labels: Inter 500 (Medium) for form labels, status badges
- Data: Inter 400 with tabular numbers for reports, statistics

### C. Layout System
**Spacing:** Consistent use of Tailwind units: 2, 4, 6, 8, 12, 16
- Micro spacing (p-2, m-2) for tight UI elements
- Component spacing (p-4, gap-4) for cards, forms
- Section spacing (py-8, my-12) for major layout areas
- Page margins (px-6, max-w-7xl) for content containers

### D. Component Library

**Navigation:**
- Horizontal header with jurisdiction selector dropdown
- Breadcrumb navigation for department drilling
- Side navigation for admin sections with collapsible groups

**Data Display:**
- Issue cards with status badges and priority indicators
- Timeline components for issue progress tracking
- Data tables with sorting and filtering for HR records
- Status dashboards with metric tiles and progress bars

**Forms:**
- Multi-step issue reporting wizard with progress indicators
- Inline validation with clear error states
- File upload areas with drag-and-drop for evidence photos
- Search bars with auto-complete for location/department lookup

**Feedback:**
- Toast notifications for action confirmations
- Loading states with skeleton screens for data fetching
- Empty states with helpful illustrations for new jurisdictions

### E. Mobile Considerations
- Bottom navigation for core citizen functions (Report, Track, Directory)
- Swipe gestures for issue photo galleries
- Large touch targets (min 44px) for accessibility
- Collapsible sections to manage information density

## Images
**Hero Section:** No large hero image - instead use a clean header with jurisdiction selector and quick action buttons

**Supporting Images:**
- Icon illustrations for issue categories (roads, utilities, waste management)
- Department building photos for jurisdiction directory pages
- Before/after photos in issue resolution timelines
- Placeholder avatars for staff profiles in HR sections

## Key Design Principles
1. **Civic Trust:** Professional appearance that instills confidence in government services
2. **Accessibility First:** WCAG 2.1 AA compliance with high contrast and screen reader support
3. **Mobile Priority:** Citizen-facing features optimized for smartphone use
4. **Data Clarity:** Clean typography and spacing for complex government information
5. **Progressive Disclosure:** Layered information architecture preventing overwhelm

This design balances the serious nature of government services with modern usability expectations, ensuring both citizens and officials can efficiently accomplish their goals.