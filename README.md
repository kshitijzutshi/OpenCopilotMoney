<a href="https://badget-eight-gilt.vercel.app/">
  <h1 align="center">Badget: AI-Powered Financial Management Platform</h1>
</a>

 <img width="1440" alt="dashboard_mockup" src="https://github.com/projectx-codehagen/Badget/assets/24507211/2c2b8e43-3d18-4b28-b8d0-5dc0cbdb530f">

<p align="center">
  Ushering in a new era of financial management with cutting-edge AI. Badget redefines how you track, analyze, and optimize your finances, ensuring smarter, more secure financial decisions. 
</p>

<p align="center">
  <!-- <a href="https://twitter.com/placeholder">
    <img src="https://img.shields.io/twitter/follow/badget?style=flat&label=%40badgety&logo=twitter&color=0bf&logoColor=fff" alt="Twitter" />
  </a> -->
  <a href="https://github.com/projectx-codehagen/Badget/blob/main/LICENSE.md">
    <img src="https://img.shields.io/github/license/projectx-codehagen/Badget?label=license&logo=github&color=f80&logoColor=fff" alt="License" />
  </a>
</p>

<p align="center">
  <a href="#introduction"><strong>Introduction</strong></a> ·
  <a href="#installation"><strong>Installation</strong></a> ·
  <a href="#tech-stack--features"><strong>Tech Stack + Features</strong></a> ·
  <a href="#architecture"><strong>Architecture</strong></a> ·
  <a href="#contributing"><strong>Contributing</strong></a>
</p>
<br/>

## Introduction

Welcome to Badget, the "Copilot for Money" - an AI-powered financial management platform that provides unparalleled insights into your spending habits and financial patterns. Built with a family-first design, Badget empowers households to budget better, track expenses effortlessly, and achieve their financial goals through intelligent automation and real-time insights.

**Key Features:**
- **Unified Financial Dashboard** - All accounts in one place with smart categorization
- **AI-Driven Insights** - Intelligent spending analysis and personalized recommendations  
- **Family-First Design** - Multi-user households with role-based permissions
- **Real-time Financial Health** - Instant alerts, goal tracking, and financial scoring
- **Automated Budgeting** - Dynamic budget creation based on spending patterns
  - *See [AI Budgeting Guide](docs/ai-budgeting-guide.md) (including [Using Vercel AI](docs/ai-budgeting-guide.md#using-vercel-ai)) for how to leverage these features*
- **Advanced AI Tools** - Anomaly detection, spending forecasts and natural-language insights

## Architecture

Badget implements a **dual-layer architecture** with clean separation between authentication and business logic:

### Authentication Layer
- User identity and session management via **Better-auth**  
- OAuth provider integration (Google, GitHub, etc.)
- Independent of business domain

### Application Layer  
- Financial domain models (accounts, transactions, budgets)
- Family/household organization with role-based access
- AI insights and recommendations engine
- Core application business logic

## What we are using

Next.js 15, Better-auth, Prisma, PostgreSQL, Shadcn/ui, Tailwind CSS, Framer Motion, and TypeScript.
<br/>
All seamlessly integrated to accelerate financial management innovation.

## Directory Structure

Badget follows a clean, scalable architecture:

    .
    ├── src                          # Main project lives here
    │    ├── actions                 # Server actions for auth and business logic
    │    ├── app                     # Next.js App Router structure
    │    │   ├── (marketing)         # Public marketing pages
    │    │   ├── api                 # API routes
    │    │   └── dashboard           # Protected dashboard area
    │    ├── components              # Reusable UI components
    │    │   ├── auth               # Authentication components
    │    │   ├── sections           # Landing page sections
    │    │   └── ui                 # Shadcn/ui components
    │    ├── lib                    # Utilities and configurations
    │    └── generated              # Generated Prisma client
    ├── prisma                      # Database schema and migrations
    └── README.md

## Installation

Clone & create this repo locally with the following command:

```bash
git clone https://github.com/codehagen/Badget
```

1. Install dependencies using pnpm:

```bash
pnpm install
```

2. Initialize Prisma with custom output directory:

```bash
npx prisma init --db --output ../src/generated/prisma
```

3. Copy `.env.example` to `.env.local` and update the variables:

```bash
cp .env.example .env.local
```

4. Set up your environment variables:

   The `.env.example` file contains detailed explanations for each variable. Key requirements:

   1. **Database**: We are using [Prisma Database](http://prisma.io/) (This is created over)  
   2. **Authentication**: Configure Better-auth OAuth providers

   **For Google Auth Setup:**
   
   To use Google as a social provider, create a new project in the [Google Cloud Console](https://console.cloud.google.com/).
   
   In **Google Cloud Console > Credentials > Authorized redirect URIs**, set:
   - **Local development**: `http://localhost:3000/api/auth/callback/google`
   - **Production**: `https://yourdomain.com/api/auth/callback/google`

5. Push the database schema:
```bash
# Generate Prisma client and push schema
pnpm db:generate
pnpm db:push
``` 

6. Start the development server:
```bash
# Start the development server with Turbopack
pnpm dev
```

## Local Development Setup (Without Docker)

For local development without Docker or cloud services, follow these steps:

### Prerequisites

- **Node.js 18+** 
- **pnpm** (`npm install -g pnpm`)
- **PostgreSQL 14+** installed locally

### Step 1: Install PostgreSQL Locally

**macOS (Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

### Step 2: Create the Database

```bash
# Create the badget database
createdb badget

# Or using psql
psql -c "CREATE DATABASE badget;"
```

### Step 3: Configure Environment

Create a `.env` file (Prisma reads from `.env`, not `.env.local`):

```bash
# Database - Local PostgreSQL (include your username)
DATABASE_URL="postgresql://YOUR_USERNAME@localhost:5432/badget"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Better-Auth Secret (use any random string for local dev)
BETTER_AUTH_SECRET="local-development-secret-key-change-in-production"

# Google OAuth - Placeholders (email/password auth still works without these)
GOOGLE_CLIENT_ID="placeholder-google-client-id"
GOOGLE_CLIENT_SECRET="placeholder-google-client-secret"
```

Replace `YOUR_USERNAME` with your system username (run `whoami` to find it).

### Step 4: Install Dependencies and Setup Database

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push
```

### Step 5: Start Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

### Bypassing Authentication and Waitlist (Local Dev Only)

For local testing, both authentication and the waitlist are bypassed:
- Clicking "Get Started" or "Try for free" goes directly to the dashboard
- No sign-in is required to access the dashboard

**To re-enable for production:**

1. **Re-enable Authentication:**
   In `src/middleware.ts`, set `BYPASS_AUTH_FOR_LOCAL_DEV = false`

2. **Re-enable Waitlist:**
   Search for `TODO: Change back to "/waitlist"` in the codebase and update the links:
   - `src/lib/config.tsx` - Hero CTA and footer links
   - `src/components/sections/navbar.tsx` - Navigation buttons

### Troubleshooting

**"Error: P1010: User was denied access"**
- Ensure your `DATABASE_URL` includes your username: `postgresql://yourusername@localhost:5432/badget`

**"psql: command not found"**
- PostgreSQL is not installed or not in PATH. Install via Homebrew/apt or add to PATH.

**"localStorage.getItem is not a function"**
- This can happen with Node.js v25's experimental localStorage. The app includes a polyfill to handle this.

## Tech Stack + Features

### Frameworks

- [Next.js 15](https://nextjs.org/) – React framework with App Router for optimal performance
- [Better-auth](https://better-auth.com/) – Modern authentication with OAuth providers (Google, GitHub)
- [Prisma](https://www.prisma.io/) – Type-safe ORM with PostgreSQL
- [React Email](https://react.email/) – Powerful email framework for notifications

### Platforms

- [Vercel](https://vercel.com/) – Seamless deployment and preview environments
- [Neon](https://neon.tech/) – Serverless PostgreSQL for scalable data management
- [Resend](https://resend.com/) – Reliable email delivery infrastructure

### UI & Design

- [Shadcn/ui](https://ui.shadcn.com/) – Beautiful components built on Radix UI and Tailwind CSS
- [Magic UI](https://magicui.design/) – 150+ free animated components and effects for modern landing pages
- [Tailark](https://tailark.com/) – Modern, responsive pre-built UI blocks for marketing websites
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS for rapid development
- [Framer Motion](https://framer.com/motion) – Smooth animations and micro-interactions
- [Lucide](https://lucide.dev/) – Consistent, beautiful icons
- [Recharts](https://recharts.org/) – Financial data visualization

### Core Features

- **Multi-tenant Family System** - Role-based access control (Owner, Admin, Member, Viewer)
- **Dual-layer Architecture** - Clean separation of auth and business logic
- **Real-time Dashboard** - Live financial insights and account overview
- **Responsive Design** - Mobile-first approach with beautiful UI/UX
- **Type Safety** - End-to-end TypeScript for reliability

## Contributing

We love our contributors! Here's how you can contribute:

- [Open an issue](https://github.com/codehagen/badget/issues) if you believe you've encountered a bug.
- Make a [pull request](https://github.com/codehagen/badget/pull) to add new features/make quality-of-life improvements/fix bugs.

<a href="https://github.com/codehagen/badget/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=codehagen/badget" />
</a>

## Repo Activity

![Nextify repo activity – generated by Axiom](https://repobeats.axiom.co/api/embed/c03baff974deeb73d0da7788b8455d04f8e17fc8.svg "Repobeats analytics image")
