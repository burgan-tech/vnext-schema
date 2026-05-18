---
name: component-matrix-docs
description: >-
  Generate a detailed component constraint matrix document from a vNext schema file.
  Analyzes required/optional/conditional fields, type-based constraints, if/then rules,
  and enum restrictions. Outputs to docs/components/. Use when the user asks for a
  component matrix, constraint documentation, field reference, or says a component name
  like "workflow", "task", "view", "function", "extension", "schema".
---

# Component Matrix Documentation Generator

Generate a comprehensive constraint matrix for a vNext schema component and write it to `docs/components/<component-name>.md`.

## Input

The user provides a **component name**. Map it to the schema file:

| Input | Schema File |
|-------|-------------|
| workflow | `schemas/workflow-definition.schema.json` |
| task | `schemas/task-definition.schema.json` |
| view | `schemas/view-definition.schema.json` |
| function | `schemas/function-definition.schema.json` |
| extension | `schemas/extension-definition.schema.json` |
| schema | `schemas/schema-definition.schema.json` |
| core-header | `schemas/core-header.schema.json` |
| core-schema | `schemas/core-schema.schema.json` |

## Workflow

1. Read the full schema file
2. Analyze all structures: top-level properties, `attributes`, nested objects, `definitions`, `if/then/else` conditionals
3. Generate the matrix document
4. Write to `docs/components/<component-name>.md`

## Output Format

Use the structure below. Adapt sections based on schema complexity -- simple components may skip the conditional matrix section.

### Document Header

```markdown
# <Component Title> - Constraint Matrix
> Source: `schemas/<file>.schema.json`
> Generated: YYYY-MM-DD
```

### 1. Envelope (Top-Level Fields)

Every component shares a common envelope. Document it first:

```markdown
## Envelope

| Field | Type | Required | Constraint |
|-------|------|----------|------------|
| key | string | Yes | `^[a-z0-9-]+$` |
| version | string | Yes | semver pattern |
| domain | string | Yes | `^[a-z0-9-]+$` |
| flow | string | Yes | `^[a-z0-9-]+$` |
| flowVersion | string | Yes | semver pattern |
| tags | string[] | Yes | - |
```

### 2. Attributes Overview

List all `attributes` properties with their type, required status, and brief constraint:

```markdown
## Attributes

| Field | Type | Required | Nullable | Description |
|-------|------|----------|----------|-------------|
| type | enum | Yes | No | C, F, S, P |
| states | state[] | Yes | No | Must contain exactly 1 initial state |
| startTransition | object | Yes | No | triggerType must be 0 |
| cancel | object | No | Yes | triggerType must be 0 |
```

### 3. Definitions / Enum Reference

List all `definitions` that are enums or reusable types:

```markdown
## Definitions Reference

### triggerType
| Value | Name | Description |
|-------|------|-------------|
| 0 | Manual | User-triggered |
| 1 | Automatic | Rule-based auto trigger |
| 2 | Scheduled | Timer-based trigger |
| 3 | Event | External event trigger |

### stateType
| Value | Name |
|-------|------|
| 1 | Initial |
| 2 | Intermediate |
| ... | ... |
```

### 4. Sub-Structure Detail Tables

For each complex nested structure (state, transition, etc.), create a dedicated section:

```markdown
## State

| Field | Type | Required | Nullable | Constraint |
|-------|------|----------|----------|------------|
| key | string | Yes | No | kebab-case |
| stateType | enum | Yes | No | 1-5 |
| transitions | transition[] | No | No | max 1 if stateType=5 (Wizard) |
```

### 5. Conditional Constraint Matrix (Key Section)

This is the most important section. For structures that behave differently based on a discriminator field (e.g., `triggerType`, `type`, `stateType`), produce a **cross-reference matrix**.

#### Rules for Building the Matrix

1. **Identify the discriminator**: the field whose value activates `if/then` blocks
2. **List all discriminator values** as column headers
3. **List all conditional fields** as rows
4. **Cell values**:
   - **Required** = field is mandatory for this discriminator value
   - **Optional** = field is allowed but not required
   - **Nullable** = field can be explicitly null
   - **null** = field must be null or absent (forbidden)
   - **Optional/null** = field is allowed, can be null
   - **"value"** = field has a fixed `const` value

Example for state transitions:

```markdown
## State Transition - triggerType Constraint Matrix

| Field | Manual (0) | Auto (1) | Auto Default (1+kind:10) | Scheduled (2) | Event (3) |
|-------|:----------:|:--------:|:------------------------:|:--------------:|:---------:|
| key | **Required** | **Required** | **Required** | **Required** | **Required** |
| target | **Required** | **Required** | **Required** | **Required** | **Required** |
| triggerType | **Required** | **Required** | **Required** | **Required** | **Required** |
| triggerKind | Optional | Optional | **Required** (=10) | Optional | Optional |
| rule | null | **Required** | Optional/null | null | null |
| timer | null | null | null | **Required** | null |
| view | Optional/null | null | null | null | null |
| schema | Optional/null | null | null | null | Optional/null |
| mapping | Optional/null | null | null | null | Optional/null |
```

#### Multiple Matrices per Component

A single component may need multiple matrices. For workflow, produce separate matrices for:
- State transition by triggerType
- Shared transition by triggerType
- startTransition (single-column, manual only)
- cancelTransition (single-column, manual only)
- exitTransition (single-column, manual only)
- updateDataTransition (single-column, manual only)
- state by stateType (if constraints differ)

For task, produce matrices by task `type` (HTTP, gRPC, AMQP, etc.).

### 6. View Definition Variants

When `viewDefinition` is referenced, document both supported formats:

```markdown
## viewDefinition

Supports two formats:

### Single View
| Field | Type | Required |
|-------|------|----------|
| view | reference | Yes |
| extensions | string[] | No |
| loadData | boolean | No |

### Rule-Based View
| Field | Type | Required |
|-------|------|----------|
| rules | viewRule[] | Yes (min 1) |
| default | object | No |
| default.view | reference | Yes (if default) |
| default.extensions | string[] | No |
| default.loadData | boolean | No |
```

### 7. Cross-References

At the end, list which other components this schema references and where:

```markdown
## Cross-References

| Referenced Component | Used In |
|---------------------|---------|
| view-definition | state.view, transition.view, cancel.view |
| task-definition | onExecutionTasks[].task |
| schema-definition | transition.schema, startTransition.schema |
```

## Quality Checks

Before writing the file:
- Every `required` array in the schema must be reflected as "Required" in the matrix
- Every `if/then` conditional must produce matrix columns or notes
- Every `const` constraint must show the fixed value
- Every `anyOf: [type, null]` must show as "Nullable"
- Every `additionalProperties: false` must be noted
- Nested structures must have their own section (don't inline deeply)

## Notes

- The output path is always `docs/components/<component-name>.md`
- One document per component, regenerate fully on each run
- Use Turkish for descriptions only if the user writes in Turkish; otherwise default to English
- For detailed viewRule and scriptCode structures, see `workflow-definition.schema.json` definitions
