# Lecture Feedback Web Application - Design Guidelines

## Design Approach
**Design System Foundation:** Material Design principles with modern dashboard aesthetics inspired by Linear and Notion
**Rationale:** Educational feedback system requires clear hierarchy, data-heavy displays, and intuitive navigation for multiple user roles

## Typography System
**Font Family:** Inter (primary), Roboto (alternative) via Google Fonts CDN
**Hierarchy:**
- Page Titles: text-3xl font-bold (Admin Panel, Teacher Dashboard, etc.)
- Section Headers: text-xl font-semibold
- Card Titles: text-lg font-medium
- Body Text: text-base font-normal
- Labels/Captions: text-sm font-medium
- Metadata: text-xs text-gray-600

## Layout & Spacing System
**Tailwind Spacing Units:** Standardize on 2, 4, 6, 8, 12, 16
- Component padding: p-6 or p-8
- Card spacing: space-y-4
- Section margins: mb-8 or mb-12
- Grid gaps: gap-6

**Container Structure:**
- Max width: max-w-7xl mx-auto
- Page padding: px-6 lg:px-8
- Dashboard content: Two-column grid on desktop (sidebar + main), single column on mobile

## Core Components

### Navigation
**Top Navigation Bar:**
- Fixed position, full width with backdrop blur
- Height: h-16
- Logo left, user profile/logout right
- Role indicator badge (Student/Teacher/Admin)
- Icons: Heroicons (via CDN)

**Sidebar Navigation (Dashboard):**
- Width: w-64 on desktop, collapsible to icon-only on tablet
- Vertical menu items with icons and labels
- Active state: subtle background highlight
- Sections: Dashboard, Teachers, Feedback (student), Analytics (teacher)

### Authentication Pages
**Layout:** Centered card design (max-w-md)
- Split view option for login/signup toggle
- Form fields: Full width with clear labels above inputs
- Input styling: Bordered with focus ring, rounded-lg
- Submit button: Full width, prominent
- Role selection: Radio buttons or segmented control for Student/Teacher
- Secondary actions (Forgot Password, Switch to Login): text-sm links below form

### Dashboard Cards
**Card Structure:**
- Rounded corners: rounded-xl
- Shadow: shadow-sm with hover:shadow-md transition
- Padding: p-6
- Border: border border-gray-200

**Statistics Cards (Teacher Dashboard):**
- Grid: grid-cols-1 md:grid-cols-3 gap-6
- Display: Large number (text-4xl font-bold), small label below
- Icon placement: Top-right corner of card
- Metrics: Total Feedback, Average Rating, Recent Reviews

### Teacher List & Cards (Student View)
**Grid Layout:** grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
**Card Content:**
- Teacher name: text-lg font-semibold
- Department badge: Pill shape (rounded-full px-3 py-1 text-xs)
- Subject list: Comma-separated, text-sm
- Average rating: Star display + numeric value
- Action button: "Give Feedback" (full width within card)

### Feedback Form
**Modal/Page Layout:** max-w-2xl centered
**Components:**
- Teacher info header: Name, subject, department (read-only, highlighted background)
- Star Rating Widget: Large clickable stars (text-4xl), 1-5 scale
- Comment Textarea: min-h-32, border-2 on focus
- Character counter: Bottom-right of textarea
- Submit button: Prominent, disabled state for duplicate prevention
- Validation messages: Inline below fields

### Feedback Display (Teacher Dashboard)
**List View:**
- Each feedback item as a card
- Student name (anonymous option), date (text-xs text-gray-500)
- Star rating: Visual stars + numeric
- Comment: text-base with max-height, expand option for long comments
- Filters: Dropdown or segmented control (All, 5-star, 4-star, etc.)
- Sort options: Most Recent, Highest Rating, Lowest Rating

### Analytics Visualization
**Chart Container:** p-8 rounded-xl border
**Chart Types:**
- Bar chart for rating distribution (1-5 stars on x-axis)
- Line chart for rating trends over time (if applicable)
- Height: h-64 or h-80
- Library: Chart.js or Recharts integration
- Legend: Bottom placement

### Admin Panel - Teacher Management
**Table Layout:**
- Responsive table with border-collapse
- Headers: Sticky, bg-gray-50, font-semibold
- Rows: Alternating subtle background (striped)
- Actions column: Icon buttons (Edit, Delete)
- Add Teacher Button: Top-right, prominent with icon

**Add Teacher Form:**
- Modal overlay with max-w-lg card
- Fields: Name, Department (dropdown), Subject (input with tags/chips for multiple)
- Field spacing: space-y-4
- Buttons: Cancel (secondary), Add Teacher (primary)

### Search & Filter Bar
**Layout:** Sticky below navigation
- Search input: w-full md:w-96 with search icon prefix
- Filter chips: Horizontal scroll on mobile, inline on desktop
- Active filter: Highlighted with dismiss icon
- Clear all: Text button on right

## Form Input Patterns
**Consistent Styling:**
- Height: h-12 for text inputs
- Border radius: rounded-lg
- Border: border-2 border-gray-300
- Focus state: ring-2 ring-blue-500
- Label: mb-2 block text-sm font-medium
- Error state: border-red-500 with text-red-600 message below

## Button Patterns
**Primary:** bg-blue-600 text-white px-6 py-3 rounded-lg font-medium
**Secondary:** bg-white border-2 border-gray-300 px-6 py-3 rounded-lg
**Danger:** bg-red-600 text-white (for delete actions)
**Icon Buttons:** p-2 rounded-lg hover background change
**Sizes:** Small (px-4 py-2 text-sm), Default (px-6 py-3), Large (px-8 py-4)

## Animations
**Minimal & Purposeful:**
- Page transitions: Simple fade-in
- Modal/Dialog: Fade + scale animation (300ms)
- Hover states: Subtle shadow or background changes
- Loading states: Spinner or skeleton screens
- No complex scroll animations

## Responsive Breakpoints
- Mobile: Single column, collapsible navigation
- Tablet (md:): Two-column grids, sidebar visible
- Desktop (lg:): Three-column grids, full layouts

## Icons
**Library:** Heroicons via CDN
**Usage:**
- Navigation items: 20px icons
- Buttons: 16px icons
- Cards: 24px icons for emphasis
- Consistent stroke-width across application

## Images
**Not Required:** This application is data-focused and does not need hero images or decorative photography. Use icons and illustrations sparingly for empty states only (e.g., "No feedback yet" with simple illustration).