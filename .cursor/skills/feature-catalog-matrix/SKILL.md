---
name: feature-catalog-matrix
description: >-
  Generate a component-based feature matrix from features.json after schema changes.
  Use after modifying schema files, running generate-features, or when the user asks
  for a feature catalog summary, matrix, or support table.
---

# Feature Catalog Matrix

After any schema development work, generate a human-readable feature matrix document under `docs/feature-catalogs/`.

## When to Run

- After adding, modifying, or removing fields in any `schemas/*.schema.json`
- After running `npm run generate-features`
- When the user explicitly asks for a feature matrix or catalog summary

## Workflow

1. Ensure `features.json` is up to date: `npm run generate-features`
2. Read `features.json` from the project root
3. Generate the matrix document at `docs/feature-catalogs/feature-matrix.md`
4. If the change is scoped (only specific components changed), also produce a **delta summary** showing only the affected fields

## Output Format

The generated markdown must follow this structure:

### Header

```markdown
# vNext Feature Catalog Matrix
> Generated from `features.json` (schema version X.X.X)
> Date: YYYY-MM-DD
```

### Component Overview Table

One row per component with field counts and version range.

```markdown
## Component Overview

| Component | Fields | Earliest Since | Latest Since |
|-----------|--------|----------------|--------------|
| workflow  | 12     | 0.0.1          | 0.0.44       |
| task      | 8      | 0.0.1          | 0.0.1        |
| ...       |        |                |              |
```

### Per-Component Field Matrix

For each component, a detailed table covering every field:

```markdown
## workflow

| Field | Type | Since | Stable | Experimental | Enum Values |
|-------|------|-------|--------|--------------|-------------|
| type | enum | 0.0.1 | Yes | - | C (0.0.1), F (0.0.1), S (0.0.1), P (0.0.1) |
| cancel | object | 0.0.44 | Yes | - | - |
| cancel.key | string | 0.0.44 | Yes | - | - |
| errorBoundary | object | 0.0.39 | Yes | - | - |
```

Rules for the field matrix:
- Flatten nested fields with dot notation: `cancel.key`, `cancel.target`
- For array items, use bracket notation: `transitions[].key`
- Show enum values inline as `Value (since)` -- truncate if more than 5 values and note "(+N more)"
- Mark experimental fields with "Yes" in the Experimental column
- Sort fields alphabetically within each component

### Definitions Matrix

If the component has `definitions` with enum types or constraints, list them separately:

```markdown
### Definitions

| Definition | Type | Since | Values |
|------------|------|-------|--------|
| triggerType | enum | 0.0.1 | 0:Manual (0.0.1), 1:Automatic (0.0.1), 2:Scheduled (0.0.40), 3:Event (0.0.42) |
| errorAction | enum | 0.0.39 | 0:Abort (0.0.39), 1:Retry (0.0.39), ... (+2 more) |
```

## Delta Summary (for scoped changes)

When only specific components changed, produce a short delta block at the top of the document:

```markdown
## Changes in This Version

### Added
| Component | Field | Since | Type |
|-----------|-------|-------|------|
| workflow | updateData | 0.0.44 | object |

### Modified
| Component | Field | Change |
|-----------|-------|--------|
| workflow | triggerType | Added value 3 (Event) since 0.0.42 |

### Breaking Changes
| Component | Field | Description |
|-----------|-------|-------------|
| (none) | | |
```

## Implementation Notes

- Read `features.json` using the Read tool, then write the matrix using the Write tool
- The matrix document is purely derived -- never hand-edit it
- Use `ctx_execute` or direct JS to compute counts and flatten nested fields if the catalog is large
- Keep the file at `docs/feature-catalogs/feature-matrix.md`
