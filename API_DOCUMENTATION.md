# API_DOCUMENTATION.md

# Overview

The Shared Expenses Application exposes a REST API built using Django REST Framework.

The API supports:

* Authentication
* Group Management
* Membership History
* Expense Management
* Settlement Tracking
* Balance Calculation
* CSV Import Processing
* Audit Logging
* Reporting

Interactive API documentation is available through Swagger and Redoc.

Swagger UI:

```text
/api/docs/
```

Redoc:

```text
/api/redoc/
```

OpenAPI Schema:

```text
/api/schema/
```

---

# Authentication

The API uses JWT-based authentication.

After login, clients must include the access token in every protected request.

Example:

```http
Authorization: Bearer <access_token>
```

---

# Authentication Endpoints

## Register User

```http
POST /api/auth/register/
```

Creates a new account.

---

## Login

```http
POST /api/auth/login/
```

Returns JWT access and refresh tokens.

---

## Google Authentication

```http
POST /api/auth/google/
```

Authenticates a user through Google OAuth.

---

## Current User

```http
GET /api/users/me/
```

Returns the authenticated user's profile.

---

# Currency Endpoints

## List Currencies

```http
GET /api/currencies/
```

Returns supported currencies.

---

## Create Currency

```http
POST /api/currencies/
```

Creates a new currency.

---

# Group Endpoints

## List Groups

```http
GET /api/groups/
```

Returns groups visible to the authenticated user.

---

## Create Group

```http
POST /api/groups/
```

Creates a new group.

---

## Group Balances

```http
GET /api/groups/{group_id}/balances/
```

Returns detailed balances for a group.

Example Response:

```json
{
  "group_id": 1,
  "balances": [
    {
      "user": "Aisha",
      "net_balance": 1200.00
    },
    {
      "user": "Rohan",
      "net_balance": -1200.00
    }
  ]
}
```

---

## Simplified Debts

```http
GET /api/groups/{group_id}/simplified-debts/
```

Returns debt simplification results.

Example Response:

```json
{
  "transactions": [
    {
      "from": "Rohan",
      "to": "Aisha",
      "amount": 1200
    }
  ]
}
```

---

# Membership Endpoints

## List Memberships

```http
GET /api/memberships/
```

Returns group membership history.

---

## Create Membership

```http
POST /api/memberships/
```

Adds a member to a group.

Example:

```json
{
  "group": 1,
  "user": 4,
  "joined_at": "2025-04-15"
}
```

---

# Expense Endpoints

## List Expenses

```http
GET /api/expenses/
```

Returns expenses visible to the authenticated user.

---

## Create Expense

```http
POST /api/expenses/
```

Creates a new expense.

Example:

```json
{
  "group": 1,
  "payer": 2,
  "amount": 1000,
  "currency": "INR",
  "description": "Groceries",
  "split_type": "equal"
}
```

---

## Expense History

```http
GET /api/expenses/{expense_id}/history/
```

Returns historical changes for an expense.

---

# Settlement Endpoints

## List Settlements

```http
GET /api/settlements/
```

Returns settlement history.

---

## Record Settlement

```http
POST /api/settlements/
```

Records a payment between members.

Example:

```json
{
  "group": 1,
  "payer": 2,
  "recipient": 1,
  "amount": 500
}
```

---

# Import Endpoints

## Upload CSV

```http
POST /api/imports/
```

Creates a new import session and uploads a CSV file.

---

## Import Session Details

```http
GET /api/imports/{import_id}/
```

Returns:

* Import status
* Anomalies
* Review decisions
* Import report

---

## Review Import

```http
POST /api/imports/{import_id}/review/
```

Used to resolve detected anomalies.

Example:

```json
{
  "actions": [
    {
      "row_number": 2,
      "action": "merge"
    },
    {
      "row_number": 3,
      "action": "keep_both"
    },
    {
      "row_number": 4,
      "action": "ignore"
    }
  ]
}
```

Available actions:

* merge
* keep_both
* ignore

---

# Audit Endpoints

## Audit Log List

```http
GET /api/audit-logs/
```

Returns historical system activity.

Examples:

* Expense creation
* Expense modification
* Settlement creation
* Import execution
* Duplicate resolution

---

# Reporting Endpoints

## Summary Report

```http
GET /api/reports/summary/
```

Returns high-level financial summaries.

---

## Category Spend Report

```http
GET /api/reports/category-spend/
```

Returns spending grouped by category.

---

# Error Responses

Example Validation Error:

```json
{
  "detail": "Membership violation detected."
}
```

Common error categories:

* Authentication Errors
* Validation Errors
* Membership Violations
* Currency Errors
* Import Errors
* Permission Errors

---

# Import Framework Notes

The assignment references a CSV file named:

```text
expenses_export.csv
```

The importer was intentionally designed without hardcoded assumptions about that dataset.

Import behavior is determined through validation rules and anomaly detectors rather than CSV-specific logic.

This allows the official dataset to be imported without requiring application code changes once the file becomes available.

---

# API Design Principles

The API was designed around the following principles:

* Traceability
* Auditability
* Deterministic calculations
* Explicit validation
* User-controlled anomaly resolution

Every financial result returned by the API can be traced back to source transactions.
