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

The `attributes` object is where each schema diverges. Schemas use JSON Schema `if/then` conditionals extensively to handle multiple subtypes within a single schema (e.g., `task-definition.schema.json` covers 15 task types via `type` discriminator; `workflow-definition.schema.json` covers types C/F/S/P).

### Version placeholder mechanism

Schema files contain a `__SCHEMA_VERSION__` placeholder in their `$id` and `$schema` fields. The `scripts/inject-schema-version.js` script replaces this with the real version at publish time and restores it afterward. **Do not hardcode version strings in schema files.**

### Entry point (`index.js` / `index.d.ts`)

`index.js` exports all schemas as named exports and a `schemas` array. `index.d.ts` provides TypeScript typings. When adding a new schema, update both files.

### Test approach (`test/validate-schemas.js`)

The test script reads every `*.schema.json` from `schemas/`, compiles each with AJV (draft-07), and reports success/failure. There are no fixture-based tests for valid/invalid documents — only that the schema itself is a valid JSON Schema.

### Vocabulary (`vocabularies/roles-vocab.json`)

A reusable sub-schema fragment for role grants (domain.rolename + allow/deny). Referenced by several schemas for access control fields.

## Code style

- ESLint v9 flat config; 2-space indent, single quotes, required semicolons, Unix line endings.
- CommonJS (`require`/`module.exports`), Node ≥ 14.

## CI/CD

- **SonarCloud** runs on PRs to `master` or `release-v*` branches.
- **Publishing** triggers on push to `release-v*` branches or manual dispatch. Supports publishing to npmjs, GitHub Packages, or both. Version is derived from the branch name (e.g., `release-v1.2` → `1.2.x`) with auto-incremented patch.
