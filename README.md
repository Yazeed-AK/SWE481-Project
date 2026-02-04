# IMDb Movie Web Application

## SWE 481 – Advanced Web Applications Engineering  
King Saud University  
Spring 2026

---

## Project Overview

This project is a full-stack movie web application built using official IMDb datasets.  
Users can browse, search, and view detailed information about movies, including ratings and genres.

The system is designed to be:
- Scalable
- Secure
- Performant
- Fully deployed using free-tier services

---

## Technology Stack

### Stack Overview
| Layer      | Technology               | Purpose                          | Notes                         |
|------------|--------------------------|----------------------------------|-------------------------------|
| Frontend  | Next.js (App Router)     | UI rendering and navigation      | Server Components + SSR       |
| Backend   | Next.js Route Handlers   | API endpoints and server logic   | No separate backend server    |
| Database  | PostgreSQL (Supabase)    | Persistent data storage          | Free tier (≤ 500 MB)          |
| Auth      | Supabase Auth            | User authentication              | Email/password                |
| Hosting   | Vercel                   | App hosting                      | Free Hobby tier               |
| Dataset   | IMDb Official Datasets   | Movie data source                | TSV files                     |
| CI/CD     | GitHub Actions           | Linting, tests, checks           | Required for PRs              |


### Frontend & Backend
- **Framework:** Next.js (App Router)
- **Rendering:** Server-Side Rendering (SSR) and Server Components
- **API:** Next.js Route Handlers

### Database
- **Provider:** Supabase
- **DBMS:** PostgreSQL
- **Tier:** Free (≤ 500 MB)

### Hosting
- **Frontend & Backend:** Vercel (Hobby tier)

### Dataset
- **Source:** Official IMDb non-commercial datasets
- **Format:** `.tsv.gz`
- **Ingestion:** Local scripts / GitHub Actions

---

## Architecture Overview


```code
┌──────────┐
│  Browser │
└────┬─────┘
     │ HTTP requests
     ▼
┌────────────────────────────┐
│        Next.js App         │
│  (Vercel – App Router)     │
│                            │
│  • Server Components       │
│  • Route Handlers (API)    │
│  • Authentication          │
└───────────┬────────────────┘
            │ SQL queries
            ▼
┌────────────────────────────┐
│  Supabase PostgreSQL DB    │
│                            │
│  • Movies table            │
│  • Indexes & FTS           │
│  • Auth metadata           │
└────────────────────────────┘
```

---

## Database Design

Only required data is stored to remain within free-tier limits.

### Tables
- `movies`

### Filters Applied
- `titleType = 'movie'`
- `numVotes >= 100`
- Unused columns removed

Indexes are added after import for performance.

---

## Local Setup Instructions

### 1. Clone Repository
```bash
git clone https://github.com/Yazeed-AK/SWE481-Project.git
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create .env.local:
```env
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
Never commit this.

### 4. Database Setup

Run SQL scripts in Supabase:
- scripts/sql/schema.sql
- scripts/sql/indexes.sql


### 5. IMDb Data Ingestion

Download datasets from:

https://developer.imdb.com/non-commercial-datasets/

Run ingestion scripts locally:
```bash
npm run ingest:ratings
npm run ingest:movies
```

### 6. Run Development Server
```bash
npm run dev
```
App will be available at http://localhost:3000.

---

## API Specification

**GET /api/movies**

Returns paginated movie list.

**GET /api/movies?search=query**

Search movies by title.

**GET /api/movies/[id]**

Returns detailed movie information.

All responses are JSON and follow REST conventions.

---

## Authentication & Security
- Supabase Authentication
- Protected routes via Next.js middleware
- HTTPS enforced in production
- No secrets committed to GitHub

---

## Testing
- Unit tests for database queries
- API tests for route handlers
- UI component tests
- CI enforced via GitHub Actions

---

## Deployment
- Push to main
- Vercel auto-deploys
- Supabase handles database hosting
