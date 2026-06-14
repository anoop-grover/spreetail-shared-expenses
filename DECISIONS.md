# DECISIONS.md

# Engineering Decision Log

This document records the major architectural, product, and implementation decisions made during development of the Shared Expenses Application.

Each decision includes:

* Problem statement
* Alternatives considered
* Final choice
* Reasoning

---

# Decision 1: Balance Calculation Strategy

## Problem

Users need accurate balances that can always be explained and reproduced.

## Options Considered

### Option A: Store Running Balances

Pros:

* Fast reads

Cons:

* Can become inconsistent
* Difficult to audit
* Requires synchronization logic

Rejected.

---

### Option B: Calculate Balances From Transactions

Pros:

* Always derived from source data
* Easier to validate
* Fully reproducible

Cons:

* Additional computation when viewing balances

Chosen.

---

## Final Decision

Balances are calculated from recorded expenses and settlements rather than stored as mutable totals.

---

# Decision 2: Membership Management

## Problem

Groups need controlled membership management.

## Options Considered

### Option A: Store Members Directly Inside Groups

Pros:

* Simple implementation

Cons:

* Difficult to extend
* Poor relationship tracking

Rejected.

---

### Option B: Separate Membership Model

Pros:

* Clear relationship management
* Easier validation
* Scalable design

Cons:

* Additional database table

Chosen.

---

## Final Decision

Memberships are stored in a dedicated Membership model linking users and groups.

---

# Decision 3: Expense Split Architecture

## Problem

Different expenses require different sharing strategies.

## Options Considered

### Option A: Equal Splits Only

Pros:

* Very simple

Cons:

* Limited flexibility

Rejected.

---

### Option B: Multiple Split Types

Pros:

* Flexible
* Matches real-world usage
* Supports assignment requirements

Cons:

* Additional validation rules

Chosen.

---

## Final Decision

The application supports:

* Equal Split
* Exact Amount Split
* Percentage Split

---

# Decision 4: CSV Import Workflow

## Problem

Imported data may contain mistakes or inconsistencies.

## Options Considered

### Option A: Direct Import

Pros:

* Fast

Cons:

* Invalid data enters system
* Difficult to correct later

Rejected.

---

### Option B: Review Before Import

Pros:

* Safer
* Transparent
* Prevents bad data

Cons:

* Additional workflow

Chosen.

---

## Final Decision

The import process follows:

Upload

↓

Parse

↓

Validate

↓

Detect Anomalies

↓

Review

↓

Import

↓

Generate Report

---

# Decision 5: Duplicate Handling

## Problem

Imported CSV files may contain duplicate expense records.

## Options Considered

### Option A: Automatically Remove Duplicates

Pros:

* Minimal user effort

Cons:

* Risk of removing valid records

Rejected.

---

### Option B: User Review Workflow

Pros:

* Safer
* Auditable
* Gives users control

Cons:

* Additional review step

Chosen.

---

## Final Decision

Potential duplicates are surfaced to the user and require an explicit review decision.

Available actions:

* Merge
* Keep Both
* Ignore

---

# Decision 6: Audit Logging

## Problem

Financial systems require accountability and traceability.

## Options Considered

### Option A: No Audit Logs

Pros:

* Simpler implementation

Cons:

* Difficult troubleshooting
* Poor traceability

Rejected.

---

### Option B: Audit Log System

Pros:

* Better transparency
* Easier debugging
* Tracks important actions

Cons:

* Additional storage requirements

Chosen.

---

## Final Decision

Audit logs are generated for:

* Expense actions
* Settlement actions
* Import actions
* Review decisions

---

# Decision 7: Authentication Strategy

## Problem

The application requires secure API access.

## Options Considered

### Option A: Session Authentication

Pros:

* Traditional Django approach

Cons:

* Less suitable for separate frontend applications

Rejected.

---

### Option B: JWT Authentication

Pros:

* Stateless
* API-friendly
* Works well with Next.js frontend

Cons:

* Token management required

Chosen.

---

## Final Decision

JWT authentication was implemented using Django REST Framework and SimpleJWT.

---

# Decision 8: Database Selection

## Problem

The assignment requires a relational database.

## Options Considered

### Option A: SQLite

Pros:

* Simple local development

Cons:

* Not ideal for production deployment

Rejected.

---

### Option B: PostgreSQL

Pros:

* Strong relational support
* Reliable transactions
* Production-ready
* Excellent Django support

Cons:

* Additional deployment configuration

Chosen.

---

## Final Decision

PostgreSQL was selected as the primary database.

---

# Decision 9: Frontend Architecture

## Problem

The application requires a responsive user interface with strong developer experience.

## Options Considered

### Option A: Traditional Django Templates

Pros:

* Simple deployment

Cons:

* Limited frontend flexibility

Rejected.

---

### Option B: Next.js Frontend

Pros:

* Modern React ecosystem
* Strong TypeScript support
* Better UI development experience

Cons:

* Separate frontend deployment

Chosen.

---

## Final Decision

Next.js and TypeScript were used for the frontend application.

---

# Decision 10: API Design

## Problem

Frontend and backend must communicate consistently.

## Options Considered

### Option A: Server-rendered Pages Only

Rejected.

---

### Option B: REST API

Pros:

* Clear separation of concerns
* Easy frontend integration
* Easy future expansion

Chosen.

---

## Final Decision

The backend exposes RESTful APIs through Django REST Framework.

---

# Summary

The system prioritizes:

* Transparency
* Auditability
* Data integrity
* User-controlled imports
* Maintainable architecture
* Production-ready deployment

All major design decisions were made with correctness, explainability, and extensibility in mind.
