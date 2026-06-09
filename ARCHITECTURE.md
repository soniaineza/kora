# KORA Architecture Diagram

## Overview

KORA is a driving exam platform with payment integration, built as a full-stack application with:
- **Frontend**: React + Vite + TypeScript + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + JWT
- **Payment**: MTN/Airtel (placeholder implementation)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                    React Frontend (Vite)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React Router                                          │   │
│  │  ├── / (Home)                                          │   │
│  │  ├── /packages (Package selection)                     │   │
│  │  ├── /buy (Payment initiation)                         │   │
│  │  ├── /verify (OTP verification)                        │   │
│  │  ├── /exams (Exam taking)                              │   │
│  │  ├── /library (Study materials)                        │   │
│  │  ├── /login, /register (Auth)                          │   │
│  │  └── /about, /contact, etc.                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Context Providers                                       │   │
│  │  ├── AuthProvider (src/lib/auth)                        │   │
│  │  └── LanguageProvider (i18n)                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  API Layer (src/lib/api.ts)                              │   │
│  │  - JWT token management (localStorage)                  │   │
│  │  - API fetch wrapper with auth headers                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/JSON
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Server (Express)                      │
│                      Port: 5001                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Middleware                                              │   │
│  │  ├── Helmet (security headers)                          │   │
│  │  ├── CORS (cross-origin)                                │   │
│  │  ├── requireAuth (JWT verification)                     │   │
│  │  └── requireAdminDemo (admin protection)                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  API Endpoints                                           │   │
│  │                                                          │   │
│  │  PUBLIC:                                                │   │
│  │  ├── GET /api/health                                    │   │
│  │  ├── POST /api/otp/send                                 │   │
│  │  └── POST /api/otp/verify                               │   │
│  │                                                          │   │
│  │  PROTECTED (requireAuth):                               │   │
│  │  ├── POST /api/payments/mtn/start                       │   │
│  │  ├── POST /api/payments/airtel/start                     │   │
│  │  ├── GET /api/internal/package-def                      │   │
│  │  ├── POST /api/internal/start-exam                      │   │
│  │  ├── GET /api/internal/session                          │   │
│  │  ├── POST /api/internal/submit-exam                      │   │
│  │  └── GET /api/internal/active-package                   │   │
│  │                                                          │   │
│  │  WEBHOOKS:                                              │   │
│  │  ├── POST /webhooks/mtn                                 │   │
│  │  └── POST /webhooks/airtel                               │   │
│  │                                                          │   │
│  │  ADMIN (requireAuth + requireAdminDemo):                 │   │
│  │  ├── GET /api/admin/package-sales                       │   │
│  │  ├── GET /api/admin/exam-session-counts                 │   │
│  │  └── GET /api/admin/most-popular                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Business Logic                                         │   │
│  │  ├── Phone normalization (phone → email format)        │   │
│  │  ├── OTP generation & validation                        │   │
│  │  ├── Payment session creation                           │   │
│  │  ├── Exam session management                             │   │
│  │  ├── Attempt counting & enforcement                     │   │
│  │  └── Admin analytics aggregation                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Supabase Client
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase (PostgreSQL)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Database Tables                                         │   │
│  │                                                          │   │
│  │  phone_verifications:                                   │   │
│  │  ├── phone (PK, text) - normalized phone/email          │   │
│  │  ├── code (text) - 6-digit OTP                          │   │
│  │  ├── expires_at (timestamptz)                           │   │
│  │  ├── purpose (text) - 'registration'                    │   │
│  │  ├── verified_at (timestamptz)                         │   │
│  │  ├── created_at, updated_at                            │   │
│  │                                                          │   │
│  │  user_packages:                                         │   │
│  │  ├── id (PK, text) - payment session ID                │   │
│  │  ├── phone (text) - user identifier                    │   │
│  │  ├── package_key (text) - STARTER/BASIC/etc.            │   │
│  │  ├── network (text) - mtn/airtel                        │   │
│  │  ├── amount_rwf (integer)                               │   │
│  │  ├── status (text) - pending/active/failed             │   │
│  │  ├── payment_reference (text)                          │   │
│  │  ├── activated_at, expires_at (timestamptz)            │   │
│  │  ├── remaining_attempts (integer)                      │   │
│  │  ├── unlimited (boolean)                               │   │
│  │  ├── created_at, updated_at                            │   │
│  │                                                          │   │
│  │  exam_sessions:                                         │   │
│  │  ├── id (PK, text) - session ID                         │   │
│  │  ├── phone (text) - user identifier                    │   │
│  │  ├── plan (text) - package plan                        │   │
│  │  ├── status (text) - active/completed                  │   │
│  │  ├── expires_at (timestamptz) - package expiry         │   │
│  │  ├── user_package_id (text) - reference                 │   │
│  │  ├── created_at, updated_at                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Also uses Supabase Auth for user authentication                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Structure

```
src/
├── index.tsx                 # Entry point
├── App.tsx                   # Route definitions
├── index.css                 # Global styles
├── i18n.tsx                  # Internationalization
├── useScreenInit.js          # Screen initialization
│
├── components/               # Reusable UI components
│   ├── Layout.tsx           # Main layout wrapper
│   ├── Nav.tsx              # Navigation bar
│   ├── Footer.tsx           # Footer
│   ├── Hero.tsx             # Hero section
│   ├── PageHeader.tsx       # Page header
│   ├── Pricing.tsx          # Pricing display
│   ├── Quiz.tsx             # Quiz component
│   ├── HowItWorks.tsx       # How it works section
│   ├── TrafficLaws.tsx      # Traffic laws content
│   ├── LanguageToggle.tsx   # Language switcher
│   └── ThemeToggle.tsx      # Theme switcher
│
├── pages/                   # Page components
│   ├── Home.tsx             # Landing page
│   ├── About.tsx            # About page
│   ├── Contact.tsx          # Contact page
│   ├── Terms.tsx            # Terms of service
│   ├── Privacy.tsx          # Privacy policy
│   ├── Library.tsx          # Study materials
│   ├── Packages.tsx         # Package selection
│   ├── Buy.tsx              # Payment initiation
│   ├── Verify.tsx           # OTP verification
│   ├── Exams.tsx            # Exam taking
│   ├── SuccessStories.tsx   # Success stories
│   ├── Login.tsx            # Login page
│   └── Register.tsx         # Registration page
│
├── contexts/                # React contexts
│   └── AuthContext.tsx      # Authentication state
│
├── lib/                     # Utilities
│   ├── auth.tsx             # Auth utilities (Supabase)
│   ├── api.ts               # API fetch wrapper
│   └── supabase.ts          # Supabase client
│
└── assets/                  # Static assets
```

---

## Backend Structure

```
server/
├── index.js                 # Main Express server
├── package.json             # Dependencies
├── .env                     # Environment variables
├── .env.example             # Environment template
├── admin_demo_allowlist.txt # Admin phone allowlist
└── supabase_schema.sql      # Database schema
```

---

## Data Flow Diagrams

### 1. User Registration & OTP Flow

```
User
  │
  ├─► POST /register (Supabase Auth)
  │     └─ Creates user account (phone → email)
  │
  ├─► POST /api/otp/send
  │     ├─ Generate 6-digit code
  │     ├─ Store in phone_verifications table
  │     └─ Send SMS (placeholder - logs to console)
  │
  ├─► Enter OTP code
  │
  └─► POST /api/otp/verify
        ├─ Validate code & expiry
        ├─ Update verified_at timestamp
        └─ Return JWT token (stored in localStorage)
```

### 2. Package Purchase Flow

```
User
  │
  ├─► View /packages
  │     └─ Display available plans (STARTER to UNLIMITED)
  │
  ├─► Select package → /buy
  │
  ├─► POST /api/payments/mtn/start (or airtel)
  │     ├─ requireAuth middleware checks JWT
  │     ├─ Create pending user_packages row
  │     ├─ Generate payment_session_id
  │     └─ Return payment_session_id to frontend
  │
  ├─► User completes payment via MTN/Airtel
  │
  └─► POST /webhooks/mtn (or airtel)
        ├─ Receive payment status from provider
        ├─ Update user_packages status (pending → active/failed)
        ├─ Set activated_at timestamp
        ├─ Calculate expires_at based on plan
        ├─ Set remaining_attempts based on plan
        └─ Set unlimited flag for UNLIMITED plan
```

### 3. Exam Taking Flow

```
User
  │
  ├─► View /exams?plan=PREMIUM&start=0
  │     ├─ Check active package via /api/internal/active-package
  │     │   ├─ requireAuth middleware
  │     │   ├─ Query user_packages for active plan
  │     │   └─ Return remaining_attempts & expires_at
  │     └─ Display package info & "Start Exam" button
  │
  ├─► Click "Start Exam"
  │
  ├─► POST /api/internal/start-exam
  │     ├─ requireAuth middleware
  │     ├─ Validate active package exists
  │     ├─ Check remaining_attempts > 0 (or unlimited)
  │     ├─ Decrement remaining_attempts
  │     ├─ Create exam_sessions row (sessionId)
  │     └─ Return sessionId
  │
  ├─► Redirect to /exams?plan=PREMIUM&start=1&sessionId=xxx
  │
  ├─► GET /api/internal/session?sessionId=xxx
  │     ├─ requireAuth middleware
  │     ├─ Validate session exists & is active
  │     ├─ Check session not expired
  │     └─ Allow quiz rendering
  │
  ├─► Render Quiz component (20 questions)
  │
  └─► POST /api/internal/submit-exam (placeholder)
        └─ Can be extended for score tracking
```

### 4. Admin Analytics Flow

```
Admin User
  │
  ├─► Set header: x-admin-demo: 1
  │
  ├─► GET /api/admin/package-sales
  │     ├─ requireAuth middleware
  │     ├─ requireAdminDemo middleware (checks allowlist)
  │     ├─ Query user_packages grouped by package_key
  │     └─ Return sales counts per plan
  │
  ├─► GET /api/admin/exam-session-counts
  │     ├─ requireAuth + requireAdminDemo
  │     ├─ Query exam_sessions grouped by plan
  │     └─ Return session counts per plan
  │
  └─► GET /api/admin/most-popular
        ├─ requireAuth + requireAdminDemo
        ├─ Query user_packages, count by package_key
        ├─ Find highest count
        ├─ Map PREMIUM → 3000 RWF
        └─ Return most popular package
```

---

## Package Configuration

| Plan Key | Price (RWF) | Exams | Days | Description |
|----------|-------------|-------|------|-------------|
| STARTER  | 500         | 10    | 3    | Basic plan |
| BASIC    | 1,000       | 15    | 5    | Entry level |
| STANDARD | 1,500       | 20    | 7    | Standard plan |
| MASTER   | 2,000       | 20    | 10   | Extended access |
| PREMIUM  | 3,000       | 25    | 15   | Most popular |
| PRO      | 5,000       | 50    | 30   | Professional |
| UNLIMITED| 7,000       | ∞     | ∞    | Unlimited access |

---

## Security Features

1. **JWT Authentication**: All protected endpoints require valid JWT token
2. **Admin Protection**: Admin endpoints require `x-admin-demo: 1` header + phone allowlist
3. **Session Enforcement**: Exam access requires valid sessionId to prevent bypass
4. **Attempt Limiting**: Server-side enforcement of exam attempts
5. **Package Expiry**: Automatic expiry based on plan duration
6. **Helmet**: Security headers on Express server
7. **CORS**: Configured for cross-origin requests

---

## Environment Variables

### Frontend (.env.local)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE=http://localhost:5001
```

### Backend (server/.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
PORT=5001
```

---

## Key Technologies

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Framer Motion, Lucide React
- **Backend**: Node.js, Express, JWT, Helmet, CORS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + custom JWT
- **Routing**: React Router DOM
- **Styling**: TailwindCSS + PostCSS + Autoprefixer
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Build**: Vite

---

## Development Workflow

1. **Start Backend**: `cd server && npm run dev` (runs on port 5001)
2. **Start Frontend**: `npm run dev` (runs on port 5173)
3. **Build**: `npm run build`
4. **Lint**: `npm run lint`

---

## Current Status (from TODO.md)

### Completed
- OTP/buy/verify frontend wiring
- Server health endpoint
- Exam session enforcement (sessionId)
- Frontend build passes

### In Progress
- Admin Dashboard UI + routes
- User Dashboard UI + routes
- Backend admin endpoints (implemented but UI pending)
- Admin route protection (demo allowlist implemented)

### Pending
- Real MTN/Airtel payment integration (currently placeholder)
- Package mapping verification
- Admin/user dashboard UI implementation
