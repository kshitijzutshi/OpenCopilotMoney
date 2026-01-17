"# Badget Design System & Styling Guide

> A comprehensive guide to the design system, component patterns, and styling conventions used throughout the Badget application.

## Table of Contents

- [🎨 Core Design Principles](#-core-design-principles)
- [📏 Border & Spacing Standards](#-border--spacing-standards)
- [🏗️ Layout Architecture](#️-layout-architecture)
- [🧩 Component Patterns](#-component-patterns)
- [📱 Responsive Design Patterns](#-responsive-design-patterns)
- [🎯 Filter & Form Components](#-filter--form-components)
- [🌈 Animation & Transitions](#-animation--transitions)
- [📋 Component Spacing Guidelines](#-component-spacing-guidelines)
- [🎨 Shadow System](#-shadow-system)

## 🎨 Core Design Principles

### Color System
Badget uses a sophisticated **OKLCH color space** with CSS custom properties for consistent theming across light and dark modes.

#### Light Theme Colors
```css
:root {
  --background: oklch(98.46% 0.002 247.84);     /* Off-white background */
  --foreground: oklch(0.145 0 0);               /* Dark text */
  --border: oklch(0.922 0 0);                   /* Light gray borders */
  --primary: oklch(0.205 0 0);                  /* Dark primary color */
  --secondary: oklch(0.9400 0 0);               /* Light secondary */
  --muted: oklch(0.97 0 0);                     /* Muted backgrounds */
  --muted-foreground: oklch(0.556 0 0);         /* Muted text */
  --accent: oklch(100% 0 0);                    /* Accent backgrounds */
  --card: oklch(1 0 0);                         /* Card backgrounds */
}
```

#### Dark Theme Colors
```css
.dark {
  --background: oklch(21.03% 0.006 285.89);     /* Dark background (#18181B) */
  --foreground: oklch(0.985 0 0);               /* Light text */
  --border: oklch(0.269 0 0);                   /* Dark gray borders */
  --primary: oklch(0.985 0 0);                  /* Light primary */
  --secondary: oklch(0.269 0 0);                /* Dark secondary */
  --muted: oklch(0.269 0 0);                    /* Dark muted */
  --card: oklch(0.145 0 0);                     /* Dark card backgrounds */
}
```

#### Chart Colors
```css
--chart-1: oklch(0.646 0.222 41.116);          /* Orange */
--chart-2: oklch(0.6 0.118 184.704);           /* Blue */
--chart-3: oklch(0.398 0.07 227.392);          /* Purple */
--chart-4: oklch(0.828 0.189 84.429);          /* Green */
--chart-5: oklch(0.769 0.188 70.08);           /* Yellow */
```

## 📏 Border & Spacing Standards

### Border Specifications
All borders follow consistent patterns throughout the application:

```css
/* Standard border used in 95% of components */
border: 1px solid var(--border)

/* Marketing layout vertical guides */
border-x: 1px solid var(--border)

/* Sidebar borders */
border-l: 1px solid var(--sidebar-border)
border-r: 1px solid var(--sidebar-border)
```

### Border Radius System
```css
--radius: 0.625rem; /* Base radius = 10px */
```

**Radius Variants:**
- `rounded-sm`: `calc(var(--radius) - 4px)` → **6px**
- `rounded-md`: `calc(var(--radius) - 2px)` → **8px** 
- `rounded-lg`: `var(--radius)` → **10px** (default)
- `rounded-xl`: `calc(var(--radius) + 4px)` → **14px**
- `rounded-2xl`: `calc(var(--radius) + 8px)` → **18px**

### Component-Specific Border Patterns

#### Cards
```css
.card {
  border: 1px solid var(--border);
  border-radius: var(--radius-xl); /* 14px */
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}
```

#### Buttons
```css
.button {
  border-radius: var(--radius-md); /* 8px */
  border: 1px solid var(--input); /* for outline variant */
}
```

#### Form Inputs
```css
.input, .select {
  border: 1px solid var(--input);
  border-radius: var(--radius-md); /* 8px */
}
```

## 🏗️ Layout Architecture

### Marketing Section (`/(marketing)`)

The marketing section uses a centered layout with decorative guide lines:

```tsx
// Layout Container Pattern
<div className="max-w-7xl mx-auto border-x relative">
  {/* Left guide line */}
  <div className="block w-px h-full border-l border-border absolute top-0 left-6 z-10"></div>
  {/* Right guide line */}
  <div className="block w-px h-full border-r border-border absolute top-0 right-6 z-10"></div>
  <Navbar />
  {children}
  <FooterSection />
</div>
```

**Layout Specifications:**
- **Max Width**: `max-w-7xl` (1280px)
- **Vertical Guide Lines**: 1px borders positioned at `left-6` and `right-6`
- **Section Dividers**: `divide-y divide-border` between main sections
- **Responsive Padding**: `px-5 md:px-10` for mobile-first design

#### Hero Section Pattern
```tsx
<section id="hero" className="w-full relative">
  <div className="relative flex flex-col items-center w-full px-6">
    {/* Gradient background with rounded bottom */}
    <div className="absolute inset-0">
      <div className="absolute inset-0 -z-10 h-[600px] md:h-[800px] w-full [background:radial-gradient(125%_125%_at_50%_10%,var(--background)_40%,var(--secondary)_100%)] rounded-b-xl"></div>
    </div>
    {/* Hero content */}
  </div>
</section>
```

#### Bento Grid Layout
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 overflow-hidden">
  {items.map((item) => (
    <div className="flex flex-col items-start justify-end min-h-[600px] md:min-h-[500px] p-0.5 relative before:absolute before:-left-0.5 before:top-0 before:z-10 before:h-screen before:w-px before:bg-border before:content-[''] after:absolute after:-top-0.5 after:left-0 after:z-10 after:h-px after:w-screen after:bg-border after:content-['']">
      {/* Grid item content */}
    </div>
  ))}
</div>
```

### Dashboard Section (`/dashboard`)

The dashboard uses a sidebar layout with container queries:

```tsx
// Dashboard Layout Pattern
<SidebarProvider
  style={{
    "--sidebar-width": "calc(var(--spacing) * 72)", // 288px
    "--header-height": "calc(var(--spacing) * 12)", // 48px
  }}
>
  <AppSidebar variant="inset" />
  <SidebarInset>
    <SiteHeader />
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        {children}
      </div>
    </div>
  </SidebarInset>
</SidebarProvider>
```

**Layout Specifications:**
- **Sidebar Width**: `calc(var(--spacing) * 72)` (18rem/288px)
- **Header Height**: `calc(var(--spacing) * 12)` (3rem/48px)  
- **Container Queries**: Uses `@container/main` for responsive layouts
- **Section Gap**: `gap-6` (1.5rem/24px) between major sections

#### Dashboard Page Pattern
```tsx
// Standard dashboard page layout
<div className="flex flex-col gap-6 p-6">
  <HeaderSection />
  <MetricsSection />
  
  {/* Two-column layout for analytics */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <AnalyticsSection />
    <InsightsSection />
  </div>
  
  <TransactionSection />
</div>
```

## 🧩 Component Patterns

### Button System

The button component uses **Class Variance Authority (CVA)** for consistent variants:

```tsx
const buttonVariants = cva(
  // Base styles - applied to all buttons
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

#### Special Button Patterns

**Hero CTA Buttons:**
```tsx
// Primary CTA with complex shadow
<Link
  href="/dashboard"
  className="bg-secondary h-9 flex items-center justify-center text-sm font-normal tracking-wide rounded-full text-primary-foreground dark:text-secondary-foreground w-32 px-4 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),0_3px_3px_-1.5px_rgba(16,24,40,0.06),0_1px_1px_rgba(16,24,40,0.08)] border border-white/[0.12] hover:bg-secondary/80 transition-all ease-out active:scale-95"
>
  Try for free
</Link>

// Secondary CTA
<Link
  href="/contact"
  className="h-10 flex items-center justify-center w-32 px-5 text-sm font-normal tracking-wide text-primary rounded-full transition-all ease-out active:scale-95 bg-white dark:bg-background border border-[#E5E7EB] dark:border-[#27272A] hover:bg-white/80 dark:hover:bg-background/80"
>
  Contact us
</Link>
```

### Card Components

Cards form the foundation of the dashboard layout:

```tsx
// Base Card Component
function Card({ className, ...props }) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

// Card Header
function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

// Card Content
function CardContent({ className, ...props }) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}
```

#### Metrics Card Pattern
```tsx
// Dashboard metrics cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
  {metrics.map((metric, index) => (
    <div key={index} className="border rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {metric.title}
          </p>
          <p className="text-2xl font-bold">{metric.value}</p>
          <div className="flex items-center gap-1 text-xs">
            <TrendIcon className="h-3 w-3 text-emerald-600" />
            <span className="text-emerald-600">{metric.change}</span>
            <span className="text-muted-foreground ml-1">{metric.period}</span>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>
```

## 📱 Responsive Design Patterns

### Breakpoint System
Badget follows a mobile-first approach with these breakpoints:

- **Mobile**: Base styles (no prefix) - `0px+`
- **Small**: `sm:` - `640px+`
- **Medium**: `md:` - `768px+`
- **Large**: `lg:` - `1024px+`
- **Extra Large**: `xl:` - `1280px+`
- **2X Large**: `2xl:` - `1536px+`

### Grid Patterns

#### Marketing Grids
```tsx
// Bento section - 1 col mobile, 2 col desktop
<div className="grid grid-cols-1 md:grid-cols-2 overflow-hidden">

// Feature showcase - responsive 3-column
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

#### Dashboard Grids
```tsx
// Metrics - responsive 1 to 5 columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

// Analytics - 1 col mobile, 3 col desktop
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

// Transactions - full width table with horizontal scroll
<div className="overflow-x-auto">
  <table className="w-full min-w-[800px]">
```

### Container Patterns
```tsx
// Marketing container with guides
<div className="max-w-7xl mx-auto border-x relative">

// Dashboard container with padding
<div className="flex flex-col gap-6 p-6">

// Content container with responsive padding
<div className="relative flex flex-col items-center w-full px-6">

// Section container with border decorations
<div className="border-x mx-5 md:mx-10 relative">
```

## 🎯 Filter & Form Components

### Filter Bar Pattern
The transaction filter bar demonstrates the standard form layout:

```tsx
<div className="space-y-4 border rounded-lg p-4">
  {/* Main Filter Bar */}
  <div className="flex flex-col sm:flex-row gap-3">
    {/* Search - Primary Filter */}
    <div className="flex-1 min-w-0">
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          className="pl-10 bg-background"
          value={filters.search || ""}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>
    </div>

    {/* Status Filter */}
    <div className="w-full sm:w-[140px]">
      <Select value={filters.status || "all"}>
        <SelectTrigger className="bg-background">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All status</SelectItem>
          <SelectItem value="RECONCILED">Reconciled</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
</div>
```

### Form Input Standards

#### Search Inputs
```tsx
// Icon + input pattern
<div className="relative">
  <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <Input
    placeholder="Search..."
    className="pl-10 bg-background"
  />
</div>
```

#### Select Dropdowns
```tsx
// Consistent width for filter selects
<div className="w-full sm:w-[140px]">
  <Select>
    <SelectTrigger className="bg-background">
      <SelectValue placeholder="Choose..." />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="option1">Option 1</SelectItem>
    </SelectContent>
  </Select>
</div>
```

#### Button Groups
```tsx
// Filter buttons with icons
<div className="flex items-center gap-2">
  <Button variant="outline" className="gap-2 bg-background">
    <IconFilter className="h-4 w-4" />
    More filters
    <IconChevronDown className="h-4 w-4" />
  </Button>
</div>
```

## 🌈 Animation & Transitions

### Standard Transitions
```css
/* Selective property transitions for performance */
transition-[color,box-shadow]

/* All properties (use sparingly) */
transition-all ease-out

/* Specific durations */
transition: all 300ms ease-out;
```

### Hover States
```css
/* Opacity-based hovers for colored backgrounds */
hover:bg-primary/90        /* 90% opacity */
hover:bg-secondary/80      /* 80% opacity */

/* Background change hovers */
hover:bg-accent hover:text-accent-foreground
```

### Active States
```css
/* Subtle press effect */
active:scale-95

/* Focus states */
focus-visible:border-ring 
focus-visible:ring-ring/50 
focus-visible:ring-[3px]
```

### Custom Animations

The application includes several custom keyframe animations:

```css
/* Orbit animation for decorative elements */
@keyframes orbit {
  0% {
    transform: rotate(calc(var(--angle) * 1deg))
      translateY(calc(var(--radius) * 1px)) 
      rotate(calc(var(--angle) * -1deg));
  }
  100% {
    transform: rotate(calc(var(--angle) * 1deg + 360deg))
      translateY(calc(var(--radius) * 1px))
      rotate(calc((var(--angle) * -1deg) - 360deg));
  }
}

/* Marquee for scrolling text */
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(calc(-100% - var(--gap))); }
}

/* Accordion animations */
@keyframes accordion-down {
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
}
```

## 📋 Component Spacing Guidelines

### Internal Spacing (Padding/Margin)

#### Cards
```css
.card {
  padding: 1.5rem 0;           /* py-6 */
}

.card-content {
  padding-left: 1.5rem;        /* px-6 */
  padding-right: 1.5rem;
}

.card-header {
  padding-left: 1.5rem;        /* px-6 */
  padding-right: 1.5rem;
  gap: 0.375rem;               /* gap-1.5 */
}
```

#### Buttons
```css
.button-default {
  height: 2.25rem;             /* h-9 */
  padding: 0.5rem 1rem;        /* px-4 py-2 */
  gap: 0.5rem;                 /* gap-2 */
}

.button-sm {
  height: 2rem;                /* h-8 */
  padding: 0.75rem;            /* px-3 */
  gap: 0.375rem;               /* gap-1.5 */
}

.button-lg {
  height: 2.5rem;              /* h-10 */
  padding: 1.5rem;             /* px-6 */
}
```

#### Form Elements
```css
.input {
  height: 2.25rem;             /* h-9 */
  padding: 0.5rem 0.75rem;     /* px-3 py-2 */
}

.select-trigger {
  height: 2.25rem;             /* h-9 */
  padding: 0.5rem 0.75rem;     /* px-3 py-2 */
}
```

### External Spacing (Gaps)

#### Page Level
```css
/* Dashboard pages */
.dashboard-page {
  padding: 1.5rem;             /* p-6 */
  gap: 1.5rem;                 /* gap-6 */
}

/* Marketing sections */
.marketing-section {
  padding: 1.25rem 2.5rem;     /* px-5 md:px-10 */
}
```

#### Component Level
```css
/* Major sections */
gap: 1.5rem;                   /* gap-6 */

/* Related components */
gap: 1rem;                     /* gap-4 */

/* Form rows */
gap: 0.75rem;                  /* gap-3 */

/* Grouped elements */
gap: 0.5rem;                   /* gap-2 */

/* Tight spacing */
gap: 0.375rem;                 /* gap-1.5 */
```

#### Grid Gaps
```css
/* Card grids */
.metrics-grid {
  gap: 1rem;                   /* gap-4 */
}

/* Content grids */
.content-grid {
  gap: 1.5rem;                 /* gap-6 */
}

/* Bento grids - no gap for seamless borders */
.bento-grid {
  gap: 0;                      /* Borders handle visual separation */
}
```

## 🎨 Shadow System

### Shadow Hierarchy
```css
/* Subtle elevation */
shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);

/* Card elevation */
shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.1);

/* Button focus/active states */
shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06);
```

### Special Shadow Effects

#### Hero Button Shadow
```css
/* Complex inset + drop shadow for premium feel */
box-shadow: 
  inset 0 1px 2px rgba(255,255,255,0.25),
  0 3px 3px -1.5px rgba(16,24,40,0.06),
  0 1px 1px rgba(16,24,40,0.08);
```

#### Focus Ring Shadow
```css
/* Accessible focus indicators */
box-shadow: 0 0 0 3px rgb(var(--ring) / 0.5);
```

---

## 🛠️ Implementation Guidelines

### Class Naming Conventions
- Use Tailwind utility classes for consistency
- Follow the `variant:` prefix pattern for responsive design
- Use semantic color tokens (`text-primary`, `bg-card`) over hard values
- Leverage CSS custom properties for dynamic theming

### Component Architecture
- Build components with compound patterns (Card, CardHeader, CardContent)
- Use CVA (Class Variance Authority) for variant-based styling
- Implement proper focus management and accessibility
- Follow the data-slot pattern for better component composition

### Performance Considerations
- Use selective CSS property transitions (`transition-[color,box-shadow]`)
- Implement container queries (`@container`) for responsive components  
- Leverage CSS custom properties for theme switching
- Minimize animation complexity for smooth 60fps performance

This styling guide ensures consistent, accessible, and maintainable design patterns throughout the Badget application. All measurements, colors, and patterns are derived from the actual codebase implementation. 