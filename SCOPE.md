# CSV Availability and Anomaly Analysis

## CSV Availability Status

The assignment references an official `expenses_export.csv` containing deliberately introduced data-quality issues.

At the time of implementation, the official CSV file was not available in the provided workspace. Because the file contents were unavailable, no attempt was made to infer, fabricate, or hardcode CSV-specific anomalies.

Instead, the application was designed around a generic anomaly-detection and review framework capable of analyzing unknown datasets at import time.

## Expected Anomaly Log Deliverable

The assignment requires a row-by-row anomaly log documenting:

* The anomaly detected
* The affected row(s)
* The action taken
* The final import outcome

Because the official CSV was unavailable, a CSV-specific anomaly log could not be produced truthfully.

The application instead generates this report automatically whenever a CSV is imported.

## Implemented Anomaly Detection Policies

The importer currently detects, surfaces, and records the following anomaly classes:

### Duplicate Expenses

Detection:

* Matching payer
* Matching amount
* Matching transaction date
* Matching description
* Matching group

Handling:

* User review required
* User may merge, keep both, or ignore

### Missing Required Fields

Detection:

* Missing payer
* Missing amount
* Missing date
* Missing group

Handling:

* Blocking error
* Row skipped until corrected

### Missing Participants

Detection:

* Expense contains no valid split participants

Handling:

* Blocking error

### Invalid Dates

Detection:

* Unsupported or malformed date formats

Handling:

* Blocking error

### Future-Dated Transactions

Detection:

* Transaction date greater than import date

Handling:

* Warning requiring review

### Invalid Amounts

Detection:

* Non-numeric or malformed monetary values

Handling:

* Blocking error

### Negative Values

Detection:

* Expense amount below zero

Handling:

* Warning
* Treated as potential refund or adjustment

### Unknown Users

Detection:

* User referenced in CSV does not exist

Handling:

* Blocking error until mapped or created

### Unknown Groups

Detection:

* Group referenced in CSV does not exist

Handling:

* Blocking error until mapped or created

### Membership Violations

Detection:

* User was not an active group member on the transaction date

Handling:

* Blocking error

### Currency Mismatches

Detection:

* Currency code differs from group currency

Handling:

* Warning requiring exchange-rate validation

### Missing Exchange Rates

Detection:

* Foreign-currency expense without exchange-rate information

Handling:

* Blocking error

### Invalid Split Totals

Detection:

* Participant shares do not equal expense amount

Handling:

* Blocking error

### Settlement Recorded as Expense

Detection:

* Expense appears to represent debt repayment rather than spending

Handling:

* Warning requiring user review

## Design Decision

The system intentionally avoids making assumptions about unseen CSV data.

When the official CSV becomes available, the importer can generate a complete anomaly report without requiring application code changes.
