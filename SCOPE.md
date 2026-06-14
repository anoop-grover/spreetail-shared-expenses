# SCOPE.md

# Project Scope

This document describes the scope of the Shared Expenses Application, the implemented data model, anomaly detection behavior, and CSV import handling.

---

# Assignment Objective

The goal of this project is to provide a production-ready shared expense management platform capable of:

* Managing groups and memberships
* Recording shared expenses
* Calculating balances transparently
* Recording settlements
* Importing historical expense data
* Detecting data-quality issues
* Providing auditability for financial records

---

# CSV Import Analysis

The application includes a CSV import workflow designed to ingest expense data, validate records, detect anomalies, and generate review reports before final import.

Import Workflow:

Upload CSV

↓

Parse Records

↓

Normalize Data

↓

Validate Data

↓

Detect Anomalies

↓

Review Required Issues

↓

Import Approved Records

↓

Generate Import Report

---

# Implemented Anomaly Detection

The importer currently detects the following anomaly categories.

## Duplicate Expenses

Detection Criteria:

* Same payer
* Same amount
* Same transaction date
* Same description
* Same group

Action:

* User review required
* Merge
* Keep Both
* Ignore

Severity:

Warning

---

## Missing Required Fields

Detection:

* Missing payer
* Missing amount
* Missing date
* Missing group

Action:

* Row blocked from import

Severity:

Error

---

## Missing Participants

Detection:

* Expense contains no valid participants

Action:

* Row blocked from import

Severity:

Error

---

## Invalid Dates

Detection:

* Invalid date format
* Unparseable date values

Action:

* Row blocked from import

Severity:

Error

---

## Future Transactions

Detection:

* Transaction date is later than import date

Action:

* User review required

Severity:

Warning

---

## Invalid Amounts

Detection:

* Non-numeric values
* Malformed currency amounts

Action:

* Row blocked from import

Severity:

Error

---

## Negative Amounts

Detection:

* Expense amount less than zero

Action:

* Flagged for review

Severity:

Warning

---

## Unknown Users

Detection:

* Referenced user does not exist

Action:

* Row blocked until user is mapped or created

Severity:

Error

---

## Unknown Groups

Detection:

* Referenced group does not exist

Action:

* Row blocked until group is mapped

Severity:

Error

---

## Membership Violations

Detection:

* User was not an active member when transaction occurred

Action:

* Row blocked from import

Severity:

Error

---

## Invalid Split Totals

Detection:

* Participant allocations do not equal expense amount

Action:

* Row blocked from import

Severity:

Error

---

# Import Review Actions

For reviewable anomalies the user may choose:

## Merge

Combine imported data with an existing record.

## Keep Both

Preserve both records.

## Ignore

Skip importing the flagged row.

All review decisions are recorded in the audit log.

---

# Database Schema

## User

Stores application users.

Fields:

* id
* email
* password
* first_name
* last_name

---

## Group

Stores expense groups.

Fields:

* id
* name
* created_at

---

## Membership

Tracks group membership history.

Fields:

* id
* group_id
* user_id
* joined_at
* left_at

---

## Expense

Stores expenses.

Fields:

* id
* description
* amount
* paid_by
* group_id
* created_at

---

## ExpenseParticipant

Stores participant shares.

Fields:

* id
* expense_id
* user_id
* share_amount

---

## Settlement

Stores repayments between users.

Fields:

* id
* payer
* receiver
* amount
* created_at

---

## ImportSession

Stores CSV import metadata.

Fields:

* id
* uploaded_by
* original_filename
* status
* report
* created_at

---

## ImportAnomaly

Stores detected anomalies.

Fields:

* id
* import_session_id
* row_number
* code
* severity
* message

---

## AuditLog

Stores system activity.

Fields:

* id
* actor
* action
* target_type
* target_id
* before_state
* after_state
* created_at

---

# Auditability

The system records:

* Expense creation
* Expense updates
* Expense deletion
* Settlement activity
* Import activity
* Duplicate review decisions

This ensures every important financial action remains traceable and explainable.

---

# Scope Boundaries

Implemented:

✅ Authentication

✅ Group Management

✅ Expense Tracking

✅ Settlement Tracking

✅ Balance Calculation

✅ CSV Import

✅ Anomaly Detection

✅ Audit Logging

✅ Import Reporting

Not Included:

* Real-time notifications
* Mobile application
* Offline synchronization
* Bank integrations
* External payment gateways

---

# Deliverable Summary

The application provides:

* Shared expense management
* Historical membership tracking
* Settlement management
* CSV import and review workflow
* Anomaly detection
* Import reporting
* Audit logging
* REST API backend
* Next.js frontend
* PostgreSQL persistence
* Docker deployment support
