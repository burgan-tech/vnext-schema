# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm test                    # Validate all JSON schemas using AJV
npm run test:coverage       # Run tests with NYC coverage reporting
npm run lint                # ESLint with auto-fix
npm run validate            # Alias for npm test

# Publishing (CI handles these; run locally only for debugging)
npm run inject-schema-version   # Replace version placeholders before publish
npm run restore-schema-version  # Restore version placeholders after publish
```

## Architecture

This is an NPM package (`@burgan-tech/vnext-schema`) that exports JSON Schema definitions for validating vNext Workflow component files. It is consumed by `@burgan-tech/vnext-cli`.

### Schema files (`schemas/`)

Each schema validates a specific component type in the workflow system. All component schemas share a common envelope:

| Field | Constraint |
|-------|-----------|
| `key` | kebab-case identifier |
| `version` | semantic version |
| `domain` / `flow` / `flowVersion` | identifiers |
| `tags` | array of strings |
| `attributes` | component-specific object |

The `attributes` object is where each schema diverges. Schemas use JSON Schema `if/then` conditionals extensively to handle multiple subtypes within a single schema (e.g., `task-definition.schema.json` covers 21 task types via the `type` discriminator; `workflow-definition.schema.json` covers types C/F/S/P).

#### Task types (`task-definition.schema.json`)

`attributes.type` is a **string** discriminator (`"1"`–`"21"`), and each value has a matching `if/then` branch that constrains `attributes.config`. When adding a task type:

1. Append the value to the `type` `enum` **and** its label to the parallel `enumDescriptions` array — the two arrays are index-aligned and must stay the same length.
2. Add a new `if/then` entry at the end of the `attributes.allOf` list, with `then.title` set to the human-readable task name.
3. Inside the branch, re-assert `type` as a `const` and set `additionalProperties: false` on both the branch and `config`.

`1` Dapr HTTP Endpoint · `2` Dapr Binding · `3` Dapr Service · `4` Dapr PubSub · `5` Human · `6` HTTP · `7` Script · `8` Condition · `9` Timer · `10` Notification · `11` Start Flow · `12` Trigger Transition · `13` Get Instance Data · `14` SubProcess · `15` Get Instances · `16` SOAP · `17` State Store · `18` Cache Aside · `19` Get Instance · `20` Dapr Conversation · `21` FanOut

#### FanOut task (`type: "21"`)

Runs a referenced inner task once per item of a runtime-resolved collection, in parallel, then joins the per-item outcomes. Notable authoring rules:

- `config.task` (inner task `key`/`domain`/`flow`/`version`) is the only required member of `config`.
- `config.mode` accepts `inline` only; `durable` is reserved for a later phase and is rejected at parse time.
- `config.join.policy` is one of `all` / `allSettled` (default) / `quorum` / `firstSuccess`. A conditional inside `config.allOf` requires `join.minSuccess` when the policy is `quorum`.
- `config.errorBoundary.onError` reuses the same rule shape as state/transition error boundaries (`action` 0–5, `retryPolicy`, `priority`), applied **per item**.

### Constraints the schema cannot express

Some rules are cross-field or runtime-resolved and are deliberately **not** encoded as JSON Schema keywords — they are enforced by the runtime at parse/execution time and documented in the relevant `description` text instead. Keep that convention: describe the rule in the `description`, don't contort the schema. Current examples, all on the FanOut task:

- `execution.itemTimeoutSeconds` must be `<=` `execution.batchTimeoutSeconds`.
- Exactly one item source must be configured — either `config.itemsPath` or the task mapping's `ItemSelector`, never both and never neither.
- A FanOut task must not reference another FanOut task (`type: "21"`) as its inner task.

### Version placeholder mechanism

Schema files contain a `__SCHEMA_VERSION__` placeholder in their `$id` and `$schema` fields. The `scripts/inject-schema-version.js` script replaces this with the real version at publish time and restores it afterward. **Do not hardcode version strings in schema files.**

### Entry point (`index.js` / `index.d.ts`)

`index.js` exports all schemas as named exports and a `schemas` array. `index.d.ts` provides TypeScript typings. When adding a new schema, update both files.

### Test approach (`test/`)

`npm test` runs two scripts:

- `test/validate-schemas.js` reads every `*.schema.json` from `schemas/`, compiles each with AJV (draft-07), and reports success/failure — i.e. it only proves the schema itself is a valid JSON Schema.
- `test/validate-function-documents.js` is fixture-based: it asserts that specific function documents are accepted or rejected as expected.

Only `function-definition.schema.json` currently has document-level fixtures. New task types (including FanOut) are covered by compile-only validation, so verify sample task documents manually — or add fixtures in the same style — when changing `task-definition.schema.json`.

### Vocabulary (`vocabularies/roles-vocab.json`)

A reusable sub-schema fragment for role grants (domain.rolename + allow/deny). Referenced by several schemas for access control fields.

## Code style

- ESLint v9 flat config; 2-space indent, single quotes, required semicolons, Unix line endings.
- CommonJS (`require`/`module.exports`), Node ≥ 14.

## CI/CD

- **SonarCloud** runs on PRs to `master` or `release-v*` branches.
- **Publishing** triggers on push to `release-v*` branches or manual dispatch. Supports publishing to npmjs, GitHub Packages, or both. Version is derived from the branch name (e.g., `release-v1.2` → `1.2.x`) with auto-incremented patch.
