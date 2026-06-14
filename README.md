# Shared Expenses Application

A production-ready shared expense management platform built for the Spreetail Software Engineering Internship Assignment.

The application helps groups track shared expenses, manage memberships, calculate balances, record settlements, import historical expense data, detect anomalies, and maintain complete auditability of financial activity.

The system was designed around the assignment's central challenge: handling imperfect real-world financial data in a transparent, explainable, and auditable manner.

---

# Assignment Overview

The assignment scenario involves a group of flatmates managing shared expenses over time.

Key challenges include:

* Members joining and leaving groups
* Duplicate transactions
* Incorrectly recorded settlements
* Data inconsistencies in imported spreadsheets
* Transparent balance calculations

The application addresses these challenges through membership management, traceable balance calculations, anomaly detection, review workflows, and audit logging.

---

# Requirement Coverage

| Requirement                  | Status        |
| ---------------------------- | ------------- |
| Authentication               | ✅ Implemented |
| Group Management             | ✅ Implemented |
| Membership Management        | ✅ Implemented |
| Expense Management           | ✅ Implemented |
| Equal Split Support          | ✅ Implemented |
| Exact Amount Split Support   | ✅ Implemented |
| Percentage Split Support     | ✅ Implemented |
| Group Balances               | ✅ Implemented |
| Individual Balance Summaries | ✅ Implemented |
| Settlement Recording         | ✅ Implemented |
| CSV Import Framework         | ✅ Implemented |
| Anomaly Detection Framework  | ✅ Implemented |
| Duplicate Review Workflow    | ✅ Implemented |
| Audit Logging                | ✅ Implemented |
| Import Reporting             | ✅ Implemented |
| API Documentation            | ✅ Implemented |
| Docker Deployment            | ✅ Implemented |
| CI/CD Configuration          | ✅ Implemented |
| PostgreSQL Database          | ✅ Implemented |

---

# User Requirement Mapping

## Aisha

> "I just want one number per person. Who pays whom, how much, done."

Implemented:

* Net balance calculation
* Debt simplification
* Balance summaries

---

## Rohan

> "No magic numbers. If the app says I owe money, I want to know why."

Implemented:

* Traceable balance calculations
* Expense history visibility
* Audit logs

Every balance can be traced back to the underlying transactions.

---

## Sam

> "I joined later. Older expenses shouldn't affect me."

Implemented:

* Membership tracking
* Join and leave date support
* Membership-aware validations

---

## Meera

> "Clean up duplicates, but let me approve changes."

Implemented:

* Duplicate detection
* Review workflow
* User approval before import
* Import audit trail

No records are automatically removed.

---

# Technology Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* React Hook Form
* TanStack Query

## Backend

* Django 5
* Django REST Framework
* JWT Authentication
* drf-spectacular

## Database

* PostgreSQL

## Infrastructure

* Docker
* Docker Compose
* GitHub Actions
* Render
* Vercel

---

# Core Features

## Authentication

* User Registration
* User Login
* JWT Authentication
* Access Token Refresh

---

## Group Management

* Create Groups
* Update Groups
* Add Members
* Remove Members

---

## Expense Management

* Create Expenses
* Update Expenses
* Delete Expenses
* Expense Splitting

---

## Supported Split Types

* Equal Split
* Exact Amount Split
* Percentage Split

The architecture supports adding additional split strategies in the future.

---

## Settlement Management

* Record Settlements
* Settlement History
* Settlement Tracking

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

Balances are calculated from source transactions instead of being stored as mutable running totals.

Calculation flow:

1. Validate participants
2. Calculate participant shares
3. Apply settlements
4. Compute net balances
5. Generate summaries

Benefits:

* Reproducible
* Auditable
* Explainable

---

# CSV Import Workflow

The application includes a CSV import and review system.

Workflow:

Upload CSV

↓

Parse Data

↓

Validate Records

↓

Detect Anomalies

↓

User Review

↓

Import Approved Records

↓

Generate Report

---

# Supported Anomaly Detection

The importer currently detects:

* Duplicate Expenses
* Missing Required Fields
* Invalid Amounts
* Negative Values
* Invalid Dates
* Future Dates
* Unknown Users
* Unknown Groups
* Invalid Split Totals

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
* Membership
* Expense
* ExpenseParticipant
* Settlement
* ImportSession
* ImportAnomaly
* AuditLog

Detailed schema documentation is available in SCOPE.md.

---

# Repository Structure

```text
spreetail-shared-expenses/

├── backend/
├── frontend/
├── .github/
├── README.md
├── SCOPE.md
├── DECISIONS.md
├── AI_USAGE.md
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

Backend:
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

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

# API Documentation

Swagger UI:

http://localhost:8000/api/docs

OpenAPI Schema:

http://localhost:8000/api/schema

---

# Deployment

## Frontend

Platform:
Vercel

Environment Variables:

```env
NEXT_PUBLIC_API_BASE_URL=
```

---

## Backend

Platform:
Render

Environment Variables:

```env
DATABASE_URL=
SECRET_KEY=
DJANGO_ALLOWED_HOSTS=
CORS_ALLOWED_ORIGINS=
CSRF_TRUSTED_ORIGINS=
```

---

# AI Usage Disclosure

AI-assisted development tools were used during implementation.

Tools Used:

* Codex

AI was used for:

* Architecture discussions
* Debugging assistance
* Documentation drafting
* Code review support

All generated code was reviewed, tested, and modified before being accepted into the project.

Detailed prompts, corrections, and validation examples are documented in AI_USAGE.md.

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

✅ Import Reporting

---

# Submission Information

Public Deployment URL:

https://spreetail-shared-expenses.vercel.app/

GitHub Repository URL:

https://github.com/anoop-grover/spreetail-shared-expenses

Import Report:

See IMPORT_REPORT.md
