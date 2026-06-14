# AI_USAGE.md

## AI Tools Used

Primary AI Tool:

* OpenAI Codex

AI was used as a development collaborator for code generation, and implementation review.

All generated code was manually reviewed before acceptance.

---

# Key Prompts Used

## Prompt 1

Build a production-ready Splitwise-like shared expenses application using:

* Django + DRF
* Next.js
* PostgreSQL
* Docker
* JWT Authentication
* Google OAuth
* CSV Import Framework
* Audit Logs
* Group Membership History
* Multi-Currency Support

Generate a complete repository with deployment configuration, and tests.

---

## Prompt 2

Cross-check the implementation against the assignment requirements and identify missing functionality, architectural weaknesses, or documentation gaps.

---

## Prompt 3

Design a generic CSV import system that can detect, surface, review, and resolve anomalies without assuming the structure of an unavailable CSV file.

---

# AI Mistakes Identified and Corrected

The assignment specifically requires that AI-generated output be reviewed rather than accepted blindly.

The following issues were identified during manual review.

---

## Case 1: Import Pipeline Did Not Create Expenses

### AI Output

The initial CSV import implementation successfully:

* Parsed CSV files
* Detected anomalies
* Generated reports

However, approved rows were never converted into actual application records.

### Problem

The import workflow appeared complete but did not create:

* Expense records
* Expense participant records

As a result, imported data would never affect balances.

### Detection Method

Manual code review of:

```text
CsvImportService.apply_review_actions
```

revealed that review actions only updated anomaly status.

### Correction

The importer was modified so approved rows create:

* Expense
* ExpenseParticipant

records during import execution.

### Validation

Verified through import workflow testing and additional unit tests.

---

## Case 2: Currency Conversion Was Missing

### AI Output

The first balance implementation treated all expense amounts as if they shared the same currency.

### Problem

This violated one of the assignment's core business requirements:

> Priya: "Half the trip was in dollars."

Balances would be incorrect whenever multiple currencies existed.

### Detection Method

Manual review against assignment requirements.

### Correction

Added:

* Currency entity
* Exchange-rate support
* `exchange_rate_to_group`
* Conversion during balance calculation
* Trace records showing source currency and rate

### Validation

Verified through balance calculation tests involving foreign-currency expenses.

---

## Case 3: Documentation Claimed CSV Access Restrictions

### AI Output

Initial documentation stated that the official CSV was unavailable due to access restrictions.

### Problem

The assignment brief states that a CSV should exist.

The actual issue was that the file was not present in the implementation workspace.

The documentation therefore overstated the cause of the problem.

### Detection Method

Comparison between:

* Assignment brief
* Actual workspace contents

### Correction

Documentation was updated to describe the precise implementation constraint:

* CSV referenced by assignment
* CSV not present in workspace during implementation

### Validation

All project documents were updated to remain factually accurate.

---

## Case 4: Duplicate Resolution Was Too Aggressive

### AI Output

The initial duplicate-expense workflow favored automatic cleanup.

### Problem

The assignment explicitly includes the requirement:

> "I want to approve anything the app deletes or changes."

Automatic resolution could violate this requirement.

### Detection Method

Requirement review against implemented behavior.

### Correction

A review-and-approval workflow was enforced before potentially destructive actions.

### Validation

Duplicate handling now requires explicit user action before import execution.

---

# Human Responsibilities Retained

The following activities remained the responsibility of the developer:

* Architecture review
* Documentation Work
* Requirement verification
* Database design validation
* Security review
* Deployment configuration
* Environment setup
* Testing strategy
* Documentation review
* Assignment compliance review

No AI-generated code was merged without manual inspection.

---

# Remaining Manual Verification Before Submission

The following items require final human verification:

* OAuth credentials
* Deployment environment variables
* Production database configuration
* Public deployment URLs
* End-to-end testing
* Final import report generation if the official CSV becomes available

The developer remains responsible for all submitted code and documentation.
