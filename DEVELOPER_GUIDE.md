# OpenCopilotMoney Developer Guide

A comprehensive guide to understanding, navigating, and contributing to the OpenCopilotMoney codebase.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Core Concepts](#core-concepts)
4. [Data Flow Patterns](#data-flow-patterns)
5. [Authentication System](#authentication-system)
6. [Database Schema](#database-schema)
7. [Server Actions](#server-actions)
8. [Component Patterns](#component-patterns)
9. [Key Code Paths](#key-code-paths)
10. [Adding New Features](#adding-new-features)
11. [Common Patterns & Conventions](#common-patterns--conventions)
12. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

Badget implements a **dual-layer architecture** with clean separation between authentication and business logic:

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION LAYER                         │
│  ┌─────────┐   ┌──────────┐   ┌─────────┐   ┌──────────────┐   │
│  │  User   │──▶│ Session  │──▶│ Account │──▶│ Verification │   │
│  └────┬────┘   └──────────┘   └─────────┘   └──────────────┘   │
│       │ (better-auth manages this layer)                        │
├───────┼─────────────────────────────────────────────────────────┤
│       │              APPLICATION LAYER                          │
│       ▼                                                         │
│  ┌─────────┐   ┌────────┐   ┌──────────────────┐               │
│  │ AppUser │──▶│ Family │──▶│ Financial Models │               │
│  └─────────┘   └────────┘   └──────────────────┘               │
│                    │                                            │
│                    ▼                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ FinancialAccount │ Transaction │ Category │ Budget │ Goal │ │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Why This Separation?

| Benefit | Description |
|---------|-------------|
| **Clean Separation** | Auth concerns vs business logic are completely separate |
| **Auth Flexibility** | Can swap auth systems without touching financial data |
| **Multi-Tenancy** | Families can have multiple users with different roles |
| **Scalability** | Different optimization strategies for each layer |
| **Maintainability** | Clear boundaries make code easier to understand |

---

## Project Structure

```
src/
├── actions/                    # Server Actions (Next.js 14+)
│   ├── auth-actions.ts         # Authentication logic
│   ├── user-actions.ts         # User/AppUser management
│   ├── dashboard-actions.ts    # Dashboard data fetching
│   ├── financial-actions.ts    # Financial operations
│   ├── asset-actions.ts        # Investment asset management
│   ├── plaid-actions.ts        # Plaid bank integration
│   ├── gocardless-actions.ts   # GoCardless integration
│   └── waitlist-actions.ts     # Waitlist management
│
├── app/                        # Next.js App Router
│   ├── (marketing)/            # Public marketing pages (grouped route)
│   │   ├── layout.tsx          # Marketing layout (navbar + footer)
│   │   ├── page.tsx            # Landing page
│   │   ├── sign-in/            # Sign-in page
│   │   ├── blog/               # Blog pages
│   │   ├── help/               # Help/documentation
│   │   └── legal/              # Privacy, Terms
│   │
│   ├── api/                    # API routes
│   │   ├── auth/[...all]/      # Better-auth catch-all handler
│   │   └── plaid/              # Plaid integration endpoints
│   │
│   ├── dashboard/              # Protected dashboard area
│   │   ├── layout.tsx          # Dashboard layout (sidebar + header)
│   │   ├── page.tsx            # Main dashboard
│   │   ├── transactions/       # Transaction management
│   │   ├── financial/          # Financial accounts
│   │   └── ai-test/            # AI features testing
│   │
│   ├── layout.tsx              # Root layout (providers, fonts)
│   ├── globals.css             # Global styles
│   └── middleware.ts           # Auth protection middleware
│
├── components/
│   ├── ui/                     # Shadcn/ui base components (59 files)
│   ├── sections/               # Landing page sections
│   ├── dashboard/              # Dashboard-specific components
│   ├── financial/              # Financial feature components
│   ├── transactions/           # Transaction components
│   ├── auth/                   # Authentication forms
│   ├── dialog/                 # Modal dialogs
│   └── charts/                 # Chart components
│
├── lib/                        # Utilities and configurations
│   ├── auth.ts                 # Better-auth configuration
│   ├── auth-client.ts          # Client-side auth hooks
│   ├── config.tsx              # Site configuration (links, content)
│   ├── utils.ts                # Utility functions (cn, etc.)
│   └── construct-metadata.ts   # SEO metadata builder
│
├── hooks/                      # Custom React hooks
│   ├── use-mobile.ts           # Mobile detection
│   ├── useDebounce.ts          # Debounce hook
│   └── useTransactionFilters.ts # Transaction filtering
│
├── types/                      # TypeScript type definitions
│   ├── filters.ts              # Filter types
│   └── author.ts               # Author types for blog
│
├── generated/                  # Auto-generated code
│   └── prisma/                 # Prisma client
│
└── instrumentation.ts          # Next.js instrumentation (SSR polyfills)
```

---

## Core Concepts

### 1. User vs AppUser

```typescript
// AUTHENTICATION LAYER - Who you are
User {
  id: string;           // Auth identity
  email: string;        // Login email
  name: string;         // Display name
  sessions: Session[];  // Active sessions
  accounts: Account[];  // OAuth providers (Google, GitHub)
  
  appUser: AppUser;     // Link to application profile
}

// APPLICATION LAYER - What you can do
AppUser {
  id: string;
  userId: string;       // Link to auth User
  firstName: string;
  lastName: string;
  timezone: string;
  locale: string;
  status: AppUserStatus;
  preferences: Json;
  
  familyMemberships: FamilyMember[];  // Multi-tenant access
}
```

### 2. Family (Multi-Tenancy)

Families are the **tenant boundary** in OpenCopilotMoney. All financial data belongs to a Family:

```typescript
Family {
  id: string;
  name: string;
  currency: string;
  timezone: string;
  
  // Users can have different roles
  members: FamilyMember[];  // OWNER, ADMIN, MEMBER, VIEWER
  
  // All financial data scoped to family
  financialAccounts: FinancialAccount[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  goals: Goal[];
}
```

### 3. Role-Based Access Control

```typescript
enum FamilyRole {
  OWNER   // Full control, can delete family, manage all users
  ADMIN   // Can manage users, financial data, settings
  MEMBER  // Can view and edit shared financial data
  VIEWER  // Read-only access to shared financial data
}

// Usage in server actions:
const canManage = await checkFamilyPermission(familyId, ["OWNER", "ADMIN"]);
if (!canManage) throw new Error("Insufficient permissions");
```

---

## Data Flow Patterns

### Pattern 1: Dashboard Data Loading

```
┌─────────────────────────────────────────────────────────────────┐
│                    Dashboard Page                                │
├─────────────────────────────────────────────────────────────────┤
│  page.tsx                                                        │
│    └── SuspendedMetricsSection                                   │
│          └── <Suspense fallback={<MetricsSkeleton />}>          │
│                └── AsyncMetricsSection (async component)         │
│                      └── getFinancialMetrics() (server action)   │
│                            └── Returns data to MetricsSection    │
└─────────────────────────────────────────────────────────────────┘
```

**Code path:**
1. `src/app/dashboard/page.tsx` - Page renders suspended components
2. `src/components/dashboard/async-components.tsx` - Async wrappers with Suspense
3. `src/actions/dashboard-actions.ts` - Server actions fetch data
4. `src/components/dashboard/metrics-section.tsx` - UI component receives data

### Pattern 2: Server Action Data Flow

```typescript
// 1. Server Action (runs on server)
// src/actions/dashboard-actions.ts
export async function getTransactions(options) {
  // a) Get authenticated user's family
  const familyId = await getActiveFamilyId();
  
  // b) Query Prisma with family scope
  const transactions = await prisma.transaction.findMany({
    where: { familyId, ...filters },
    include: { account: true, category: true }
  });
  
  // c) Transform data for client (Decimal → number)
  return transactions.map(t => ({
    ...t,
    amount: Number(t.amount)
  }));
}

// 2. Async Component (server component)
async function AsyncTransactionSection() {
  const transactions = await getTransactions({ limit: 20 });
  return <TransactionTable transactions={transactions} />;
}

// 3. UI Component (client or server)
function TransactionTable({ transactions }) {
  return <table>...</table>;
}
```

### Pattern 3: Client-Side Mutations

```typescript
// Client Component using server action
"use client";

import { updateTransactionCategory } from "@/actions/dashboard-actions";

function TransactionRow({ transaction }) {
  const handleCategoryChange = async (categoryId: string) => {
    // Call server action directly from client
    const result = await updateTransactionCategory(
      transaction.id,
      categoryId
    );
    if (result.success) {
      // Optimistically update UI or refetch
    }
  };
  
  return <Select onChange={handleCategoryChange} />;
}
```

---

## Authentication System

### Better-Auth Configuration

```typescript
// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [nextCookies()],
});
```

### Auth API Routes

```typescript
// src/app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth.handler);
```

### Middleware Protection

```typescript
// src/middleware.ts
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard"], // Protected routes
};
```

### Getting Current User in Server Actions

```typescript
// src/actions/user-actions.ts

// Get auth session user
export async function getCurrentAuthUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user || null;
}

// Get application user profile (recommended)
export async function getCurrentAppUser() {
  const authUser = await getCurrentAuthUser();
  if (!authUser) return null;
  
  // Find or create AppUser linked to auth User
  const appUser = await prisma.appUser.findUnique({
    where: { userId: authUser.id },
    include: { familyMemberships: { include: { family: true } } }
  });
  
  return appUser;
}
```

---

## Database Schema

### Entity Relationship Diagram

```
                    AUTHENTICATION
┌───────────────────────────────────────────────────┐
│                                                    │
│  ┌──────┐      ┌─────────┐      ┌─────────┐      │
│  │ User │──────│ Session │      │ Account │      │
│  └──┬───┘      └─────────┘      │ (OAuth) │      │
│     │                            └─────────┘      │
└─────┼─────────────────────────────────────────────┘
      │
      │ 1:1 link
      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION                                 │
│                                                                  │
│  ┌─────────┐                                                     │
│  │ AppUser │──────────┐                                          │
│  └─────────┘          │                                          │
│                       ▼                                          │
│              ┌──────────────┐                                    │
│              │ FamilyMember │ (role: OWNER/ADMIN/MEMBER/VIEWER)  │
│              └──────┬───────┘                                    │
│                     │                                            │
│                     ▼                                            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                        Family                                ││
│  │  ┌──────────────────┐ ┌─────────────┐ ┌──────────┐          ││
│  │  │ FinancialAccount │ │ Transaction │ │ Category │          ││
│  │  └──────────────────┘ └─────────────┘ └──────────┘          ││
│  │  ┌────────┐ ┌──────┐ ┌─────────────────┐                    ││
│  │  │ Budget │ │ Goal │ │ InvestmentAsset │                    ││
│  │  └────────┘ └──────┘ └─────────────────┘                    ││
│  │  ┌────────────────┐ ┌─────────────┐                         ││
│  │  │ BankConnection │ │ PlaidItem   │                         ││
│  │  └────────────────┘ └─────────────┘                         ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Key Models Reference

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `User` | Auth identity | email, sessions, accounts |
| `AppUser` | Application profile | userId, familyMemberships, preferences |
| `Family` | Tenant/household | name, currency, all financial data |
| `FamilyMember` | User-Family link | role, familyId, appUserId |
| `FinancialAccount` | Bank accounts | type, balance, institution |
| `Transaction` | Financial transactions | amount, type, status, category |
| `Category` | Transaction categories | name, icon, color |
| `Budget` | Spending budgets | amount, period, category |
| `Goal` | Financial goals | targetAmount, currentAmount, type |
| `InvestmentAsset` | Investments | assetType, quantity, price |
| `BankConnection` | Bank integrations | provider, accessToken |

---

## Server Actions

### Best Practices

```typescript
// src/actions/example-action.ts
"use server";

import { PrismaClient } from "@/generated/prisma";
import { getCurrentAppUser } from "./user-actions";

// ✅ Create Prisma client per request (not global)
function getPrismaClient() {
  return new PrismaClient();
}

// ✅ Get family context for multi-tenant queries
async function getActiveFamilyId(): Promise<string | null> {
  const appUser = await getCurrentAppUser();
  if (!appUser?.familyMemberships.length) return null;
  return appUser.familyMemberships[0].familyId;
}

// ✅ Type-safe options
type GetDataOptions = {
  limit?: number;
  offset?: number;
  filter?: string;
};

// ✅ Proper error handling and cleanup
export async function getData(options: GetDataOptions = {}) {
  const familyId = await getActiveFamilyId();
  if (!familyId) return [];
  
  const prisma = getPrismaClient();
  
  try {
    // ✅ Always scope queries to familyId
    const data = await prisma.someModel.findMany({
      where: { familyId, ...buildWhereClause(options) },
      include: { relatedModel: true },
      take: options.limit ?? 20,
      skip: options.offset ?? 0,
    });
    
    // ✅ Transform Prisma Decimal to number for client
    return data.map(item => ({
      ...item,
      amount: Number(item.amount)
    }));
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  } finally {
    // ✅ Always disconnect
    await prisma.$disconnect();
  }
}
```

### Action Files Reference

| File | Responsibility |
|------|----------------|
| `user-actions.ts` | AppUser CRUD, family management, permissions |
| `dashboard-actions.ts` | Dashboard data, transactions, metrics |
| `financial-actions.ts` | Financial account operations |
| `asset-actions.ts` | Investment asset management |
| `auth-actions.ts` | Authentication flows |
| `plaid-actions.ts` | Plaid bank connection |
| `gocardless-actions.ts` | GoCardless bank connection |

---

## Component Patterns

### Pattern 1: Async Server Components with Suspense

```typescript
// async-components.tsx - Wrapper pattern
import { Suspense } from "react";

// Async component that fetches data
async function AsyncDataSection() {
  const data = await fetchData(); // Server action
  return <DataSection data={data} />;
}

// Exported with Suspense boundary
export function SuspendedDataSection() {
  return (
    <Suspense fallback={<DataSkeleton />}>
      <AsyncDataSection />
    </Suspense>
  );
}
```

### Pattern 2: Client Components with "use client"

```typescript
// interactive-component.tsx
"use client";

import { useState } from "react";
import { serverAction } from "@/actions/some-action";

export function InteractiveComponent({ initialData }) {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAction = async () => {
    setIsLoading(true);
    try {
      const result = await serverAction();
      setData(result);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button onClick={handleAction} disabled={isLoading}>
      {isLoading ? "Loading..." : "Action"}
    </Button>
  );
}
```

### Pattern 3: UI Components (Shadcn/ui)

All base UI components are in `src/components/ui/` and follow Shadcn conventions:

```typescript
// Example: Using the Button component
import { Button } from "@/components/ui/button";

<Button variant="default" size="lg">
  Click me
</Button>

// Variants: default, destructive, outline, secondary, ghost, link
// Sizes: default, sm, lg, icon
```

### Pattern 4: Dashboard Sections

```typescript
// header-section.tsx
export function HeaderSection() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview</p>
      </div>
      <div className="flex gap-2">
        <Button>Action</Button>
      </div>
    </div>
  );
}

// metrics-section.tsx
type MetricsSectionProps = {
  data: DashboardMetrics;
};

export function MetricsSection({ data }: MetricsSectionProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <MetricCard title="Income" value={data.monthlyIncome} />
      <MetricCard title="Expenses" value={data.monthlyExpenses} />
      {/* ... */}
    </div>
  );
}
```

---

## Key Code Paths

### Code Path 1: User Sign-In → Dashboard

```
1. User clicks "Sign In" on landing page
   └── src/app/(marketing)/sign-in/page.tsx
       └── renders <SignIn /> component
           └── src/components/auth/sign-in.tsx

2. User submits credentials
   └── better-auth handles via API route
       └── src/app/api/auth/[...all]/route.ts
           └── Creates Session in database

3. User redirected to /dashboard
   └── Middleware checks session cookie
       └── src/middleware.ts
           └── If valid, allows access

4. Dashboard page loads
   └── src/app/dashboard/page.tsx
       └── Renders SuspendedMetricsSection, etc.
           └── Each calls server actions
               └── src/actions/dashboard-actions.ts
                   └── getCurrentAppUser() for auth
                       └── getActiveFamilyId() for tenant
                           └── Prisma queries with familyId scope
```

### Code Path 2: Adding a Transaction

```
1. User views transactions page
   └── src/app/dashboard/transactions/page.tsx

2. Transaction list loads via server action
   └── src/actions/dashboard-actions.ts → getAllTransactions()

3. User changes category on a transaction
   └── src/components/transactions/category-selector.tsx
       └── Calls updateTransactionCategory()
           └── src/actions/dashboard-actions.ts

4. Server action validates and updates
   └── Checks familyId ownership
       └── Updates transaction.categoryId
           └── Sets status to RECONCILED
               └── Returns updated transaction

5. UI updates optimistically or refreshes
```

### Code Path 3: Bank Connection (Plaid)

```
1. User clicks "Connect Bank"
   └── src/components/financial/plaid-link-modal.tsx

2. Plaid Link opens
   └── API route creates link token
       └── src/app/api/plaid/link-token/route.ts

3. User completes bank auth in Plaid

4. Success callback receives public_token
   └── Server action exchanges token
       └── src/actions/plaid-actions.ts
           └── Creates PlaidItem + PlaidAccounts

5. Transactions synced
   └── Plaid webhook or manual sync
       └── Creates Transaction records
           └── Scoped to family
```

---

## Adding New Features

### Step 1: Database Schema (if needed)

```prisma
// prisma/schema.prisma

model NewFeature {
  id        String   @id @default(cuid())
  name      String
  value     Decimal  @db.Decimal(12, 2)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Always include family relationship for multi-tenancy
  familyId  String
  family    Family   @relation(fields: [familyId], references: [id], onDelete: Cascade)
  
  @@index([familyId])
  @@map("new_features")
}

// Don't forget to add relation in Family model:
// newFeatures NewFeature[]
```

```bash
# Apply changes
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push to database
```

### Step 2: Server Actions

```typescript
// src/actions/new-feature-actions.ts
"use server";

import { PrismaClient } from "@/generated/prisma";
import { getCurrentAppUser } from "./user-actions";

function getPrismaClient() {
  return new PrismaClient();
}

async function getActiveFamilyId() {
  const appUser = await getCurrentAppUser();
  if (!appUser?.familyMemberships.length) return null;
  return appUser.familyMemberships[0].familyId;
}

export async function getNewFeatures() {
  const familyId = await getActiveFamilyId();
  if (!familyId) return [];
  
  const prisma = getPrismaClient();
  
  try {
    return await prisma.newFeature.findMany({
      where: { familyId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

export async function createNewFeature(data: { name: string; value: number }) {
  const familyId = await getActiveFamilyId();
  if (!familyId) throw new Error("Not authenticated");
  
  const prisma = getPrismaClient();
  
  try {
    return await prisma.newFeature.create({
      data: {
        ...data,
        familyId,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}
```

### Step 3: Components

```typescript
// src/components/new-feature/feature-list.tsx
import { getNewFeatures } from "@/actions/new-feature-actions";

// Async server component
async function AsyncFeatureList() {
  const features = await getNewFeatures();
  return <FeatureList features={features} />;
}

// With Suspense
export function SuspendedFeatureList() {
  return (
    <Suspense fallback={<FeatureListSkeleton />}>
      <AsyncFeatureList />
    </Suspense>
  );
}

// UI Component
function FeatureList({ features }) {
  return (
    <div className="space-y-2">
      {features.map(f => (
        <FeatureCard key={f.id} feature={f} />
      ))}
    </div>
  );
}
```

### Step 4: Page

```typescript
// src/app/dashboard/new-feature/page.tsx
import { SuspendedFeatureList } from "@/components/new-feature/feature-list";

export default function NewFeaturePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">New Feature</h1>
      <SuspendedFeatureList />
    </div>
  );
}
```

---

## Common Patterns & Conventions

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Server Actions | `camelCase` verb-noun | `getTransactions`, `createFamily` |
| Components | `PascalCase` | `TransactionTable`, `MetricsSection` |
| Files | `kebab-case.tsx` | `transaction-table.tsx` |
| Hooks | `use` prefix | `useTransactionFilters` |
| Types | `PascalCase` | `DashboardMetrics`, `GetTransactionsOptions` |

### Import Aliases

```typescript
// Uses @/ alias for src/ directory
import { Button } from "@/components/ui/button";
import { getTransactions } from "@/actions/dashboard-actions";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@/generated/prisma";
```

### CSS/Styling

```typescript
// Uses Tailwind CSS with cn() helper for conditional classes
import { cn } from "@/lib/utils";

<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  variant === "primary" && "primary-classes"
)} />
```

### Error Handling Pattern

```typescript
// Server actions return objects, not throw
export async function riskyAction() {
  try {
    const result = await doSomething();
    return { success: true, data: result };
  } catch (error) {
    console.error("Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

// Client handles result
const result = await riskyAction();
if (result.success) {
  toast.success("Done!");
} else {
  toast.error(result.error);
}
```

---

## Troubleshooting

### Common Issues

**1. "User was denied access on the database"**
```bash
# Check DATABASE_URL includes username
DATABASE_URL="postgresql://YOUR_USERNAME@localhost:5432/badget"
```

**2. "localStorage.getItem is not a function"**
- This happens with Node.js v22+ experimental localStorage
- The app has a polyfill in `src/instrumentation.ts`
- Ensure it's being loaded before other code

**3. Prisma Client not found**
```bash
pnpm db:generate
```

**4. Database schema out of sync**
```bash
pnpm db:push
```

**5. TypeScript errors after schema change**
```bash
pnpm db:generate  # Regenerate Prisma types
```

### Debug Tips

```typescript
// Log current user context
const appUser = await getCurrentAppUser();
console.log("AppUser:", appUser);
console.log("Families:", appUser?.familyMemberships);

// Log Prisma queries
// In .env:
// DEBUG="prisma:query"

// Check family scoping
const familyId = await getActiveFamilyId();
console.log("Active Family ID:", familyId);
```

---

## Quick Reference

### Essential Files to Know

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout, providers, fonts |
| `src/middleware.ts` | Auth protection |
| `src/lib/auth.ts` | Better-auth config |
| `src/actions/user-actions.ts` | User/family management |
| `src/actions/dashboard-actions.ts` | All dashboard data |
| `prisma/schema.prisma` | Database schema |
| `src/lib/config.tsx` | Site content config |

### Key Commands

```bash
pnpm dev              # Start dev server
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to database
pnpm db:studio        # Open Prisma Studio
pnpm build            # Production build
pnpm lint             # Run ESLint
```

---

## Next Steps

1. **Explore the codebase** - Start with `src/app/dashboard/page.tsx` and trace the data flow
2. **Run the app locally** - Follow the README setup instructions
3. **Seed sample data** - Use the "Seed Data" button in the dashboard
4. **Read the Prisma schema** - Understand the data models in `prisma/schema.prisma`
5. **Check server actions** - Understand patterns in `src/actions/dashboard-actions.ts`

---

*Last updated: January 2026*

