# Shared Expenses Application

A production-ready shared expense management platform built for the Spreetail Software Engineering Internship Assignment.

The application helps groups track shared expenses, manage changing group memberships, calculate balances, record settlements, import historical expense data, detect anomalies, and maintain complete auditability of financial activity.

The system was designed around the assignment's central challenge: handling imperfect real-world financial data in a transparent, explainable, and auditable manner.

---

# Assignment Overview

The assignment scenario involves a group of flatmates managing shared expenses over time.

Key challenges include:

* Members joining and leaving groups
* Multi-currency expenses
* Duplicate transactions
* Incorrectly recorded settlements
* Data inconsistencies in imported spreadsheets
* Transparent balance calculations

The application addresses these challenges through timeline-aware memberships, traceable balance calculations, anomaly detection, review workflows, and audit logging.

---

# Requirement Coverage

| Requirement                    | Status        |
| ------------------------------ | ------------- |
| Login Module                   | ✅ Implemented |
| Group Management               | ✅ Implemented |
| Membership History Tracking    | ✅ Implemented |
| Expense Management             | ✅ Implemented |
| Equal Split Support            | ✅ Implemented |
| Exact Amount Split Support     | ✅ Implemented |
| Percentage Split Support       | ✅ Implemented |
| Group Balances                 | ✅ Implemented |
| Individual Balance Summaries   | ✅ Implemented |
| Settlement Recording           | ✅ Implemented |
| CSV Import Framework           | ✅ Implemented |
| Anomaly Detection Framework    | ✅ Implemented |
| Duplicate Review Workflow      | ✅ Implemented |
| Audit Logging                  | ✅ Implemented |
| Import Reporting               | ✅ Implemented |
| API Documentation              | ✅ Implemented |
| Docker Deployment              | ✅ Implemented |
| CI/CD Configuration            | ✅ Implemented |
| PostgreSQL Relational Database | ✅ Implemented |

---

# How the Application Addresses User Requirements

## Aisha

> "I just want one number per person. Who pays whom, how much, done."

Implemented:

* Net balance calculation
* Debt simplification
* "Who Owes Whom" summary

---

## Rohan

> "No magic numbers. If the app says I owe ₹2,300, I want to see exactly which expenses make that up."

Implemented:

* Traceable balance calculations
* Balance breakdowns
* Expense contribution history
* Audit logs

Every balance can be traced back to the underlying transactions.

---

## Priya

> "Half the trip was in dollars. The sheet pretends a dollar is a rupee."

Implemented:

* Multi-currency support
* Exchange rate tracking
* Currency-aware balances
* Historical conversion storage

Balances remain reproducible and auditable.

---

## Sam

> "I moved in mid-April. Why would March electricity affect my balance?"

Implemented:

* Membership timeline tracking
* Join and leave dates
* Membership-aware validation
* Timeline-aware balance calculations

Users are only affected by expenses during their active membership period.

---

## Meera

> "Clean up the duplicates — but I want to approve anything the app deletes or changes."

Implemented:

* Duplicate detection
* Review workflow
* User approval before destructive actions
* Import audit trail

No duplicate records are automatically removed.

---

# Technology Stack

## Frontend

* Next.js 15
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* React Hook Form
* TanStack Query
* Zod

## Backend

* Django 5
* Django REST Framework
* JWT Authentication
* drf-spectacular (OpenAPI / Swagger)

## Database

* PostgreSQL

## Infrastructure

* Docker
* Docker Compose
* GitHub Actions
* Render
* Vercel
* Neon PostgreSQL

---

# Core Features

## Authentication

* Email and Password Login
* JWT Authentication
* Google OAuth Support

---

## Group Management

* Create Groups
* Update Groups
* Add Members
* Remove Members

---

## Membership History

Memberships are stored historically.

Example:

* Meera leaves on March 31
* Sam joins on April 15

Historical balances remain accurate because calculations respect membership periods.

---

## Expense Management

* Create Expenses
* Update Expenses
* Delete Expenses
* Expense Categories
* Expense Notes
* Expense History Tracking

---

## Supported Split Types

Current implementation supports:

* Equal Split
* Exact Amount Split
* Percentage Split

The architecture allows additional split types to be added without major system changes.

---

## Settlement Management

* Record Payments
* Settlement History
* Settlement Audit Trail

---

## Audit Logging

The application records:

* Expense Creation
* Expense Updates
* Expense Deletion
* Settlement Activity
* Import Activity
* Duplicate Resolution Decisions

---

# Balance Calculation Engine

Balances are calculated from source transactions rather than stored as mutable running totals.

Calculation process:

1. Validate membership eligibility
2. Calculate participant shares
3. Apply settlement adjustments
4. Compute net balances
5. Simplify debts
6. Generate trace records

Benefits:

* Fully auditable
* Reproducible
* Easy to explain during review

---

# CSV Import Framework

The application contains a configurable CSV import pipeline.

Workflow:

Upload CSV

→ Parse

→ Normalize

→ Validate

→ Detect Anomalies

→ User Review

→ Import Approved Records

→ Generate Import Report

---

# Supported Anomaly Detection

The importer currently detects:

* Duplicate Expenses
* Missing Required Fields
* Missing Participants
* Invalid Dates
* Future Dates
* Invalid Amounts
* Negative Values
* Unknown Users
* Unknown Groups
* Membership Violations
* Currency Mismatches
* Missing Exchange Rates
* Invalid Split Totals
* Settlement Recorded As Expense

Potential duplicates require explicit user review.

Available actions:

* Merge
* Keep Both
* Ignore

---

# Database Overview

Core entities:

* User
* Group
* GroupMembership
* Currency
* Expense
* ExpenseParticipant
* ExpenseHistory
* Settlement
* ImportSession
* ImportAnomaly
* AuditLog

Full schema details are documented in SCOPE.md.

---

# Repository Structure

```text
shared-expenses-app/

├── backend/
├── frontend/
├── .github/
├── README.md
├── SCOPE.md
├── DECISIONS.md
├── AI_USAGE.md
├── ARCHITECTURE.md
├── API_DOCUMENTATION.md
├── IMPORT_POLICY.md
├── IMPORT_REPORT.md
├── docker-compose.yml
└── .env.example
```

# Local Development

## Docker Setup

```bash
cp .env.example .env
docker compose up --build
```

Services:

Frontend:
http://localhost:3000

Backend API:
http://localhost:8000/api

Swagger:
http://localhost:8000/api/docs

---

## Backend Setup

```bash
cd backend

python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux / macOS
source .venv/bin/activate

pip install -r requirements.txt

python manage.py migrate

python manage.py createsuperuser

python manage.py runserver
```

Run tests:

```bash
pytest
```

Seed demo data:

```bash
python manage.py seed_demo
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Run tests:

```bash
npm test
```

---

# Evaluator Quick Start

```bash
docker compose up --build
```

Optional demo data:

```bash
cd backend
python manage.py seed_demo
```

Open:

Frontend:
http://localhost:3000

Backend API:
http://localhost:8000/api

Swagger:
http://localhost:8000/api/docs

---

# API Documentation

Swagger UI:

http://localhost:8000/api/docs

OpenAPI Schema:

http://localhost:8000/api/schema

Additional endpoint documentation is available in API_DOCUMENTATION.md.

---

# Deployment

## Frontend

Platform:
Vercel

Required Environment Variables:

```env
NEXT_PUBLIC_API_BASE_URL=
```

## Backend

Platform:
Render

Required Environment Variables:

```env
DATABASE_URL=
DJANGO_SECRET_KEY=
DJANGO_ALLOWED_HOSTS=
CORS_ALLOWED_ORIGINS=
CSRF_TRUSTED_ORIGINS=
```

## Database

Platform:
Neon PostgreSQL

---

# AI Usage Disclosure

AI-assisted development tools were used during implementation.

Primary Tool:

* OpenAI Codex

AI was used for:

* Project scaffolding
* API generation
* UI generation
* Test generation
* Documentation drafting

All generated code was reviewed and modified before acceptance.

Detailed prompts, corrections, and validation examples are documented in AI_USAGE.md.

---

# Important Note About CSV Availability

The assignment references an official dataset named:

`expenses_export.csv`

At the time of implementation, the referenced CSV file was not present in the working repository.

To avoid making unsupported assumptions, no CSV-specific anomaly rules or hardcoded import logic were implemented.

Instead, a generic anomaly-detection and review framework was developed so that the official dataset can be imported without requiring application code changes.

The system is capable of:

* Parsing imported datasets
* Detecting anomalies
* Recording review decisions
* Importing approved records
* Generating import reports

once the dataset becomes available.

---

# Deliverables Included

✅ Source Code

✅ Frontend Application

✅ Backend APIs

✅ PostgreSQL Schema

✅ Documentation

✅ Docker Configuration

✅ CI/CD Configuration

✅ CSV Import Framework

✅ Anomaly Detection Framework

✅ Audit Logging

✅ Testing Suite

---

# Submission Information

Public Deployment URL:

GitHub Repository URL:

Import Report:
