# API_DOCUMENTATION.md

# Overview

The Shared Expenses Application exposes a REST API built using Django REST Framework.

The API supports:

* Authentication
* Group Management
* Expense Management
* Settlement Tracking
* CSV Import Processing
* Reporting

Interactive API documentation is available through Swagger.

Swagger UI:

```text
/api/docs/
```

OpenAPI Schema:

```text
/api/schema/
```

---

# Authentication

The API uses JWT Authentication.

Protected endpoints require:

```http
Authorization: Bearer <access_token>
```

---

# Authentication Endpoints

## Register User

```http
POST /api/auth/register/
```

Creates a new user account.

### Example Request

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

---

## Login

```http
POST /api/auth/login/
```

Authenticates a user and returns JWT tokens.

### Example Response

```json
{
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token"
}
```

---

## Refresh Token

```http
POST /api/auth/refresh/
```

Returns a new access token using a valid refresh token.

---

# Group Endpoints

## List Groups

```http
GET /api/groups/
```

Returns all groups available to the authenticated user.

---

## Create Group

```http
POST /api/groups/
```

Creates a new group.

### Example Request

```json
{
  "name": "Flatmates"
}
```

---

## Retrieve Group

```http
GET /api/groups/{id}/
```

Returns group details.

---

## Update Group

```http
PUT /api/groups/{id}/
```

Updates group information.

---

## Delete Group

```http
DELETE /api/groups/{id}/
```

Deletes a group.

---

# Expense Endpoints

## List Expenses

```http
GET /api/expenses/
```

Returns all visible expenses.

---

## Create Expense

```http
POST /api/expenses/
```

Creates a new expense.

### Example Request

```json
{
  "group": 1,
  "payer": 1,
  "amount": 1000,
  "description": "Groceries",
  "split_type": "equal"
}
```

---

## Retrieve Expense

```http
GET /api/expenses/{id}/
```

Returns expense details.

---

## Update Expense

```http
PUT /api/expenses/{id}/
```

Updates an expense.

---

## Delete Expense

```http
DELETE /api/expenses/{id}/
```

Deletes an expense.

---

# Settlement Endpoints

## List Settlements

```http
GET /api/settlements/
```

Returns recorded settlements.

---

## Create Settlement

```http
POST /api/settlements/
```

Records a settlement transaction.

### Example Request

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

### Form Data

```text
file=<csv file>
group=<group id>
```

---

## Import Session Details

```http
GET /api/imports/{id}/
```

Returns:

* Import status
* Detected anomalies
* Import report

---

## Review Import

```http
POST /api/imports/{id}/review/
```

Processes anomaly review actions.

### Example Request

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
    }
  ]
}
```

Available actions:

* merge
* keep_both
* ignore

---

# Reporting Endpoints

## Summary Report

```http
GET /api/reports/summary/
```

Returns application-level reporting data.

---

# Error Responses

Example:

```json
{
  "detail": "Validation error."
}
```

Common error categories:

* Authentication Errors
* Permission Errors
* Validation Errors
* Import Errors
* Resource Not Found

---

# CSV Import Workflow

The import system follows the workflow below:

```text
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
```

Potential duplicate records are never automatically removed.

User review is required before applying anomaly resolution actions.

---

# API Design Principles

The API was designed around:

* Simplicity
* Traceability
* Auditability
* Explicit Validation
* User-Controlled Import Decisions

All business operations are exposed through RESTful endpoints documented in Swagger.
