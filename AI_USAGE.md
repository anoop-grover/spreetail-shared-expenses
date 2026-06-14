# AI_USAGE.md

# AI Usage Disclosure

This document describes how AI-assisted tools were used during development of the Shared Expenses Application, the prompts used, mistakes identified in generated output, and the corrections made before accepting the code.

---

# AI Tools Used

Primary AI Tool:

* OpenAI Codex / ChatGPT

AI was used as a development assistant for:

* Project scaffolding
* Code generation
* UI generation
* Documentation drafting
* Debugging assistance
* Architecture discussions

All generated output was manually reviewed, tested, and modified before being accepted into the project.

---

# Key Prompts Used

## Prompt 1

Build a Splitwise-like shared expenses application using:

* Django
* Django REST Framework
* Next.js
* PostgreSQL
* JWT Authentication
* Docker
* CSV Import Workflow
* Audit Logging

Generate a complete project structure including backend APIs, frontend pages, database models, and deployment configuration.

---

## Prompt 2

Review the implementation against the assignment requirements and identify:

* Missing functionality
* Architectural weaknesses
* Data consistency issues
* Documentation gaps

---

## Prompt 3

Design a CSV import workflow capable of:

* Parsing uploaded files
* Detecting anomalies
* Supporting review actions
* Generating import reports

without making assumptions about future datasets.

---

# AI Mistakes Identified and Corrected

The assignment requires manual review of AI-generated output. The following issues were identified and corrected.

---

## Case 1: Incorrect Import Workflow Assumption

### AI Output

AI initially suggested that CSV upload should directly create records immediately after parsing.

### Problem

This bypassed the review workflow required by the assignment.

Potential duplicate or invalid records could enter the database without user approval.

### Detection Method

Requirement review and manual testing of the import process.

### Correction

A review stage was retained between parsing and final import.

The workflow became:

Upload

↓

Parse

↓

Validate

↓

Review

↓

Import

---

## Case 2: Frontend Group Import Integration Error

### AI Output

AI-generated frontend code attempted to upload CSV files without properly handling group selection.

### Problem

The backend expected a valid group identifier when importing data into a group.

This caused import failures and invalid requests.

### Detection Method

Runtime testing and API error inspection.

### Correction

Added:

* Group selection dropdown
* Group ID submission through FormData
* Validation before upload

### Validation

Verified through successful import requests after selecting a group.

---

## Case 3: TypeScript State Typing Error

### AI Output

AI-generated code used:

```typescript
const [groups, setGroups] = useState([]);
```

### Problem

TypeScript inferred the array type as `never[]`.

This caused build failures during CI execution.

### Detection Method

GitHub Actions build logs.

### Correction

Introduced an explicit type:

```typescript
type Group = {
  id: number;
  name: string;
};

const [groups, setGroups] = useState<Group[]>([]);
```

### Validation

Application built successfully after the correction.

---

## Case 4: Documentation Contained Unsupported Assumptions

### AI Output

Some generated documentation described functionality that was not fully implemented.

### Problem

Documentation must accurately reflect the actual system.

Overstating implemented features creates risk during technical review.

### Detection Method

Manual comparison between:

* Source code
* Assignment requirements
* Generated documentation

### Correction

Documentation was revised to describe only functionality that exists in the codebase.

### Validation

README, SCOPE, and DECISIONS documents were updated for consistency.

---

# Human Responsibilities Retained

The following responsibilities remained entirely manual:

* Requirement analysis
* Architecture decisions
* Database review
* API review
* UI review
* Deployment setup
* Environment configuration
* Bug fixing
* Testing
* Documentation review
* Assignment compliance verification

No AI-generated output was accepted without inspection.

---

# Verification Performed

The following validation activities were completed manually:

* API testing
* Authentication testing
* Expense workflow testing
* Settlement workflow testing
* CSV import testing
* Frontend build verification
* Backend deployment verification
* GitHub Actions verification

---

# Responsibility Statement

AI was used as a development assistant and productivity tool.

Final responsibility for all submitted code, documentation, deployment configuration, testing, and assignment deliverables remains with the developer.
