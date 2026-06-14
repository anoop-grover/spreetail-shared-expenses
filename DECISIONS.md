# Engineering Decision Log

This document records the significant product and engineering decisions made during implementation, the alternatives considered, and the reasoning behind the final choices.

---

# Decision 1: Membership Timeline Support

## Problem

Group membership changes over time.

In the assignment scenario:

* Meera leaves at the end of March.
* Sam joins in mid-April.

Expenses should only affect users who were active members at the time the expense occurred.

## Options Considered

### Option A: Current Member Snapshot Only

Store only the current list of group members.

Pros:

* Simple implementation

Cons:

* Historical balances become incorrect.
* Cannot support users joining or leaving.

Rejected.

### Option B: Membership History Tracking

Store membership start and end dates.

Pros:

* Supports historical calculations.
* Correctly handles joins and leaves.
* Matches assignment requirements.

Cons:

* Additional validation complexity.

Chosen.

## Final Decision

Implemented a `GroupMembership` model with:

* `joined_at`
* `left_at`

Expenses and settlements validate membership status using the transaction date.

---

# Decision 2: Balance Calculation Strategy

## Problem

Users need both simple debt summaries and complete calculation transparency.

Aisha wants:

> "Who pays whom?"

Rohan wants:

> "Show exactly how that number was calculated."

## Options Considered

### Option A: Persist Running Balances

Update balance records whenever a transaction occurs.

Pros:

* Fast reads

Cons:

* Difficult to audit
* Can drift from source data
* Hard to explain during review

Rejected.

### Option B: Recalculate From Source Transactions

Compute balances from expenses and settlements.

Pros:

* Fully auditable
* Easy to trace
* Deterministic

Cons:

* Slightly more computational work

Chosen.

## Final Decision

Balances are derived from source transactions and trace rows are retained to explain every calculation.

---

# Decision 3: CSV Import Architecture

## Problem

The assignment requires importing a CSV containing unknown data-quality issues.

The official CSV was unavailable during implementation.

## Options Considered

### Option A: Hardcode CSV Assumptions

Build import logic around assumed columns and anomalies.

Pros:

* Faster implementation

Cons:

* Risks incorrect behavior
* Violates engineering reliability
* Difficult to maintain

Rejected.

### Option B: Generic Import Framework

Build a configurable import pipeline with anomaly detection.

Pros:

* Works with unknown datasets
* Extensible
* Supports review workflows

Cons:

* More initial development effort

Chosen.

## Final Decision

Implemented:

Upload → Parse → Validate → Detect Anomalies → Review → Import → Generate Report

The importer uses pluggable anomaly detectors and avoids CSV-specific assumptions.

---

# Decision 4: Anomaly Resolution Workflow

## Problem

Meera requested approval before any data is modified or removed.

## Options Considered

### Option A: Automatic Cleanup

Automatically resolve duplicates and invalid rows.

Pros:

* Minimal user effort

Cons:

* Loss of user control
* Risk of incorrect modifications

Rejected.

### Option B: User Review Workflow

Present anomalies and require user decisions.

Pros:

* Transparent
* Auditable
* Aligns with assignment requirements

Cons:

* Additional UI complexity

Chosen.

## Final Decision

Potentially destructive actions require user review before import execution.

---

# Decision 5: Multi-Currency Support

## Problem

The assignment scenario contains expenses recorded in USD while balances are expected in INR.

## Options Considered

### Option A: Treat All Currencies Equally

Pros:

* Simple

Cons:

* Produces incorrect balances

Rejected.

### Option B: Use Live Exchange Rates

Pros:

* Current conversion values

Cons:

* Historical balances change over time
* Difficult to audit

Rejected.

### Option C: Store Historical Exchange Rates

Pros:

* Reproducible balances
* Auditable calculations

Cons:

* Requires exchange-rate management

Chosen.

## Final Decision

Each foreign-currency expense stores:

* Original amount
* Original currency
* Exchange rate
* Converted group-currency value

Balances are calculated using stored historical rates.

---

# Decision 6: Auditability

## Problem

Financial records should remain explainable even after edits or deletions.

## Options Considered

### Option A: Hard Delete Records

Pros:

* Simpler database

Cons:

* Loses history
* Weak auditability

Rejected.

### Option B: Maintain Historical Records

Pros:

* Preserves traceability
* Supports audits
* Simplifies debugging

Chosen.

## Final Decision

Expenses use soft deletion and important actions are recorded through audit logs and history tables.

---

# Decision 7: Authentication Strategy

## Problem

The application requires both traditional and social login.

## Options Considered

### Option A: Email/Password Only

Pros:

* Simpler implementation

Cons:

* Reduced usability

Rejected.

### Option B: Email/Password + Google OAuth

Pros:

* Better user experience
* Common production pattern

Cons:

* Additional integration complexity

Chosen.

## Final Decision

Implemented JWT-based authentication with support for email/password login and Google OAuth integration.

---

# Decision 8: Relational Database Selection

## Problem

The assignment explicitly requires a relational database.

## Options Considered

### Option A: NoSQL Database

Rejected because the assignment explicitly requires relational storage.

### Option B: PostgreSQL

Chosen because it provides:

* Strong relational modeling
* ACID transactions
* Referential integrity
* Mature ecosystem

## Final Decision

PostgreSQL was selected as the primary database.
