# Import Policy

## Purpose

The import system is designed to ingest imperfect financial data while maintaining transparency, auditability, and user control.

The application never silently modifies imported data.

Every detected anomaly is surfaced to the user and recorded as part of the import session.

---

# Import Workflow

Every CSV import follows the same pipeline:

1. Upload CSV
2. Parse Rows
3. Normalize Data
4. Validate Records
5. Detect Anomalies
6. Present Review Screen
7. Collect User Decisions
8. Import Approved Records
9. Generate Import Report
10. Create Audit Records

---

# Import Principles

The importer follows the following rules:

### No Silent Data Modification

Imported data is never automatically changed without user visibility.

### User Approval For Destructive Actions

Potentially destructive actions require explicit user review.

### Auditability

All anomaly decisions are stored and traceable.

### Deterministic Imports

The same input and review decisions should produce the same output.

### No CSV-Specific Assumptions

The importer does not contain hardcoded logic based on unseen datasets.

---

# Anomaly Handling Policies

## Duplicate Expenses

### Detection

Potential duplicates are identified using:

* Transaction Date
* Amount
* Payer
* Description
* Group

### Severity

Warning

### User Options

* Merge
* Keep Both
* Ignore

### Policy

No duplicate is automatically removed.

User review is required before import.

---

## Missing Required Fields

### Detection

Missing:

* Amount
* Date
* Payer
* Group

### Severity

Blocking Error

### Policy

Row cannot be imported until corrected.

---

## Missing Participants

### Detection

Expense contains no valid participants.

### Severity

Blocking Error

### Policy

Expense is skipped until valid participants are provided.

---

## Invalid Dates

### Detection

Malformed or unsupported date values.

### Severity

Blocking Error

### Policy

Row cannot be imported.

---

## Future-Dated Transactions

### Detection

Transaction date occurs after import date.

### Severity

Warning

### Policy

User review required before import.

---

## Invalid Amounts

### Detection

Non-numeric or malformed monetary values.

### Severity

Blocking Error

### Policy

Row cannot be imported.

---

## Negative Amounts

### Detection

Amount is less than zero.

### Severity

Warning

### Policy

Negative values are treated as potential refunds, reversals, or adjustments.

User review is required before import.

---

## Unknown Users

### Detection

Referenced user does not exist.

### Severity

Blocking Error

### Policy

User must be mapped or created before import.

---

## Unknown Groups

### Detection

Referenced group does not exist.

### Severity

Blocking Error

### Policy

Group must be mapped or created before import.

---

## Membership Violations

### Detection

A user participates in a transaction outside their membership period.

Examples:

* Sam included before joining.
* Meera included after leaving.

### Severity

Blocking Error

### Policy

Row cannot be imported.

Membership timelines are treated as authoritative.

---

## Currency Mismatches

### Detection

Expense currency differs from group currency.

### Severity

Warning

### Policy

Exchange-rate validation required.

---

## Missing Exchange Rates

### Detection

Foreign-currency expense without exchange-rate information.

### Severity

Blocking Error

### Policy

Expense cannot be imported until an exchange rate is provided.

---

## Invalid Split Totals

### Detection

Participant allocations do not equal expense amount.

### Severity

Blocking Error

### Policy

Expense cannot be imported.

---

## Settlement Recorded As Expense

### Detection

Transaction appears to represent debt repayment rather than spending.

### Severity

Warning

### Policy

User reviews whether the row should:

* Remain an expense
* Be skipped
* Be recorded as a settlement

---

# Import Report Policy

Each import session generates a permanent report containing:

* Import Session ID
* Source Filename
* Import Timestamp
* Import Duration
* Rows Processed
* Rows Imported
* Rows Skipped
* Anomalies Detected
* User Actions Taken
* Imported Expense IDs

The report is stored with the import session and remains available for audit purposes.

---

# Audit Logging Policy

The following actions are recorded:

* Import Started
* Import Completed
* Import Failed
* Anomaly Detected
* Duplicate Resolution
* User Review Decisions
* Expense Creation
* Settlement Creation

---

# Official CSV Availability

The assignment references an official file named:

`expenses_export.csv`

During implementation, the referenced file was not present in the working repository.

To avoid unsupported assumptions, no dataset-specific anomaly rules were created.

The importer was intentionally designed as a generic framework capable of processing the official dataset once it becomes available, without requiring application code changes.
