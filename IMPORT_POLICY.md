# IMPORT_POLICY.md

# Import Policy

## Purpose

The CSV import system is designed to allow users to upload expense data, review detected issues, and import records in a controlled and auditable manner.

The system follows a review-first approach and records all import activity for future reference.

---

# Import Workflow

Every import follows the same process:

```text
Upload CSV
   ↓
Parse File
   ↓
Validate Data
   ↓
Detect Anomalies
   ↓
Review Results
   ↓
Apply Review Actions
   ↓
Generate Import Report
```

---

# Import Principles

## Transparency

Detected issues are surfaced to the user instead of being silently ignored.

## Review Before Import

Potentially problematic records require review before actions are applied.

## Auditability

Import activity and review decisions are recorded and remain traceable.

## Deterministic Processing

The same file and review decisions should produce the same import result.

---

# Supported Import Features

The importer currently supports:

* CSV file uploads
* Import sessions
* Import reports
* Anomaly tracking
* Review actions
* Audit logging

---

# Anomaly Detection

The importer validates uploaded records and records detected anomalies.

Examples of anomalies that may be detected include:

## Duplicate Records

Potential duplicate expenses based on imported data.

Available actions:

* merge
* keep_both
* ignore

Duplicates are not automatically removed.

---

## Missing Required Data

Examples:

* Missing amount
* Missing payer
* Missing date
* Missing group information

Such records are flagged for review.

---

## Invalid Values

Examples:

* Invalid dates
* Invalid amounts
* Malformed records

Such records are reported as anomalies.

---

## Data Consistency Issues

Records that do not satisfy validation rules are surfaced for review before import processing continues.

---

# Review Actions

When anomalies are detected, users may choose one of the following actions:

## Merge

Merge the imported record with an existing matching record.

---

## Keep Both

Retain both records.

---

## Ignore

Ignore the detected anomaly during review.

---

# Import Report

Each import session generates a report containing:

* Import Session Identifier
* Source Filename
* Import Status
* Detected Anomalies
* Review Decisions
* Processing Results

The report remains attached to the import session for auditing purposes.

---

# Audit Logging

Import-related actions generate audit records.

Examples include:

* Import Created
* Import Processed
* Anomaly Reviewed
* Import Completed

---

# Design Philosophy

The import system follows three principles:

## Transparency

Users should understand what was detected during import.

## User Control

Potentially sensitive actions require user review.

## Traceability

Import decisions should remain available for future inspection.

---

# Notes

The importer was designed as a reusable framework rather than a dataset-specific solution.

Validation, anomaly detection, review actions, and reporting are handled through the import workflow, allowing different CSV datasets to be processed through the same review pipeline.
