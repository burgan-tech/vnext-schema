# Workflow Definition - Constraint Matrix
> Source: `schemas/workflow-definition.schema.json`
> Generated: 2026-05-14

---

## Envelope

| Field | Type | Required | Constraint |
|-------|------|----------|------------|
| key | string | Yes | `^[a-z0-9-]+$` |
| flow | string | Yes | `^[a-z0-9-]+$` |
| flowVersion | string | Yes | `^\d+\.\d+\.\d+(-[a-zA-Z]+\.\d+)?$` |
| domain | string | Yes | `^[a-z0-9-]+$` |
| version | string | Yes | `^\d+\.\d+\.\d+(-[a-zA-Z]+\.\d+)?$` |
| tags | string[] | Yes | - |
| _comment | string | No | - |
| $schema | string | No | JSON Schema reference |

---

## Attributes

| Field | Type | Required | Nullable | Description |
|-------|------|----------|----------|-------------|
| type | enum | Yes | No | `C` (Core), `F` (Flow), `S` (SubFlow), `P` (Sub Process) |
| labels | languageLabel[] | Yes | No | minItems: 1 |
| states | state[] | Yes | No | Must contain exactly 1 initial state (stateType: 1) |
| startTransition | startTransition | Yes | No | triggerType must be 0 (Manual) |
| timeout | workflowTimeout | No | Yes | Workflow-level timeout configuration |
| functions | reference[] | No | No | Functions used in the workflow |
| features | reference[] | No | No | Features (extensions) used in the workflow |
| sharedTransitions | sharedTransition[] | No | No | Shared transitions across multiple states |
| extensions | reference[] | No | No | Extensions used in the workflow |
| errorBoundary | errorBoundary | No | Yes | Global error boundary (since 0.0.39) |
| cancel | cancelTransition | No | Yes | Cancel transition, manual only (since 0.0.44) |
| exit | exitTransition | No | Yes | Exit transition, manual only (since 0.0.44) |
| updateData | updateDataTransition | No | Yes | Update data transition, manual only (since 0.0.44) |
| schema | object | No | No | Master schema definition (`schema.schema`: reference) |
| queryRoles | roleGrant[] | No | No | Root-level query roles. Used when state has no queryRoles. DENY overrides ALLOW |

---

## Definitions Reference

### triggerType (State Transition)
| Value | Name | Since |
|-------|------|-------|
| 0 | Manual | 0.0.1 |
| 1 | Automatic | 0.0.1 |
| 2 | Scheduled | 0.0.40 |
| 3 | Event | 0.0.42 |

### triggerType (Shared Transition)
| Value | Name | Since |
|-------|------|-------|
| 0 | Manual | 0.0.1 |
| 2 | Scheduled | 0.0.1 |
| 3 | Event | 0.0.1 |

> Auto (1) is **not supported** in shared transitions.

### triggerKind
| Value | Name | Since |
|-------|------|-------|
| 0 | Not applicable | 0.0.1 |
| 10 | Default auto transition | 0.0.1 |

### versionStrategy
| Value | Description | Since |
|-------|-------------|-------|
| None | No version update | 0.0.1 |
| Patch | Patch version update | 0.0.1 |
| Minor | Minor version update | 0.0.1 |
| Major | Major version update | 0.0.1 |

### stateType
| Value | Name | Since |
|-------|------|-------|
| 1 | Initial | 0.0.1 |
| 2 | Intermediate | 0.0.1 |
| 3 | Final | 0.0.1 |
| 4 | SubFlow | 0.0.1 |
| 5 | Wizard | 0.0.40 |

### stateSubType
| Value | Name | Since |
|-------|------|-------|
| 0 | No specific subtype (default) | 0.0.1 |
| 1 | Successful completion | 0.0.1 |
| 2 | Error condition | 0.0.1 |
| 3 | Manually terminated | 0.0.1 |
| 4 | Temporarily suspended | 0.0.1 |
| 5 | Busy | 0.0.1 |
| 6 | Human | 0.0.40 |

### errorAction
| Value | Name | Constraint | Since |
|-------|------|------------|-------|
| 0 | Abort | transition must NOT be set | 0.0.39 |
| 1 | Retry | retryPolicy required | 0.0.39 |
| 2 | Rollback | transition required | 0.0.39 |
| 3 | Ignore | - | 0.0.39 |
| 4 | Notify | transition required | 0.0.42 |
| 5 | Log | does not affect flow | 0.0.42 |

### backoffType
| Value | Name | Since |
|-------|------|-------|
| 0 | Fixed | 0.0.39 |
| 1 | Exponential (default) | 0.0.39 |

---

## State

| Field | Type | Required | Nullable | Constraint |
|-------|------|----------|----------|------------|
| key | string | Yes | No | `^[a-z0-9-]+$` |
| stateType | stateType | Yes | No | enum: 1-5 |
| versionStrategy | versionStrategy | Yes | No | enum |
| labels | languageLabel[] | Yes | No | minItems: 1 |
| subType | stateSubType | No | No | enum: 0-6, default: 0 |
| view | viewDefinition | No | Yes | Single or rule-based |
| subFlow | subFlow | No | Yes | SubFlow/SubProcess config |
| transitions | transition[] | No | No | max 1 if stateType=5 (Wizard) |
| onEntries | onExecuteTask[] | No | No | Tasks on state entry |
| onExits | onExecuteTask[] | No | No | Tasks on state exit |
| errorBoundary | errorBoundary | No | Yes | State-level error handling (since 0.0.39) |
| queryRoles | roleGrant[] | No | No | Overrides root queryRoles. DENY overrides ALLOW |
| _comment | string | No | No | - |

### State - stateType Constraint

| Constraint | stateType = 5 (Wizard) | All Others |
|------------|:----------------------:|:----------:|
| transitions | max 1 item | no limit |

---

## State Transition - triggerType Constraint Matrix

Discriminator: `triggerType` (with `triggerKind` sub-discriminator for Auto)

| Field | Manual (0) | Auto (1) | Auto Default (1+kind:10) | Scheduled (2) | Event (3) |
|-------|:----------:|:--------:|:------------------------:|:--------------:|:---------:|
| **key** | **Required** | **Required** | **Required** | **Required** | **Required** |
| **target** | **Required** | **Required** | **Required** | **Required** | **Required** |
| **versionStrategy** | **Required** | **Required** | **Required** | **Required** | **Required** |
| **triggerType** | **Required** (=0) | **Required** (=1) | **Required** (=1) | **Required** (=2) | **Required** (=3) |
| **labels** | **Required** | **Required** | **Required** | **Required** | **Required** |
| triggerKind | Optional | Optional | **Required** (=10) | Optional | Optional |
| rule | null | **Required** (scriptCode) | Optional/null | null | null |
| timer | null | null | null | **Required** (scriptCode) | null |
| view | Optional/null (viewDefinition) | null | null | null | null |
| schema | Optional/null | null | null | null | Optional/null |
| mapping | Optional/null | null | null | null | Optional/null |
| onExecutionTasks | Optional | Optional | Optional | Optional | Optional |
| roles | Optional | Optional | Optional | Optional | Optional |
| annotations | Optional/null | Optional/null | Optional/null | Optional/null | Optional/null |
| from | Optional | Optional | Optional | Optional | Optional |
| _comment | Optional | Optional | Optional | Optional | Optional |

**Notes:**
- Auto (1): `rule` is a mandatory scriptCode (routing logic)
- Auto Default (1+kind:10): `rule` is optional (default auto path, no routing needed)
- Manual (0): `view` supports both single and rule-based viewDefinition
- `additionalProperties` is **not** restricted (open schema)

---

## Shared Transition - triggerType Constraint Matrix

Discriminator: `triggerType` (only 0, 2, 3 -- Auto is not supported)

| Field | Manual (0) | Scheduled (2) | Event (3) |
|-------|:----------:|:-------------:|:---------:|
| **key** | **Required** | **Required** | **Required** |
| **target** | **Required** | **Required** | **Required** |
| **versionStrategy** | **Required** | **Required** | **Required** |
| **triggerType** | **Required** (=0) | **Required** (=2) | **Required** (=3) |
| **labels** | **Required** | **Required** | **Required** |
| availableIn | Optional | null | null |
| rule | null | null | null |
| timer | null | **Required** (scriptCode) | null |
| view | Optional/null (viewDefinition) | null | null |
| schema | Optional/null | null | Optional/null |
| mapping | Optional/null | null | Optional/null |
| onExecutionTasks | Optional | Optional | Optional |
| roles | Optional | Optional | Optional |
| annotations | Optional/null | Optional/null | Optional/null |
| from | Optional | Optional | Optional |
| _comment | Optional | Optional | Optional |

**Notes:**
- Auto (1) is **not supported** -- `triggerType` enum is `[0, 2, 3]`
- `triggerKind` is **not available** in shared transitions
- Manual (0): `availableIn` specifies which states this transition applies to
- Scheduled/Event: `availableIn` must be null (applies globally)
- `additionalProperties` is **not** restricted (open schema)

---

## startTransition (Manual Only)

`additionalProperties: false` -- only listed fields are allowed.

| Field | Type | Required | Nullable | Constraint |
|-------|------|----------|----------|------------|
| key | string | Yes | No | `^[a-z0-9-]+$` |
| target | string | Yes | No | `^[a-z0-9-]+$` (must point to Initial state) |
| triggerType | integer | Yes | No | **const: 0** (Manual only) |
| versionStrategy | versionStrategy | Yes | No | enum |
| labels | languageLabel[] | Yes | No | minItems: 1 |
| schema | reference | No | Yes | Data schema for start |
| mapping | scriptCode | No | Yes | Input mapping |
| onExecutionTasks | onExecuteTask[] | No | No | Tasks during transition |
| roles | roleGrant[] | No | No | Authorization roles |
| annotations | object | No | Yes | Key-value metadata (since 0.0.42) |

**Not available:** view, rule, timer, from, availableIn, triggerKind

---

## cancelTransition (Manual Only)

`additionalProperties: false` -- only listed fields are allowed.

| Field | Type | Required | Nullable | Constraint |
|-------|------|----------|----------|------------|
| key | string | Yes | No | `^[a-z0-9-]+$` |
| target | string | Yes | No | `^(\$self\|[a-z0-9-]+)$` |
| triggerType | integer | Yes | No | **const: 0** (Manual only) |
| versionStrategy | versionStrategy | Yes | No | enum |
| labels | languageLabel[] | Yes | No | - |
| schema | reference | No | Yes | Data schema for cancel |
| view | viewDefinition | No | Yes | Single or rule-based |
| mapping | scriptCode | No | Yes | Input mapping |
| onExecutionTasks | onExecuteTask[] | No | No | Tasks during transition |
| roles | roleGrant[] | No | No | Authorization roles |
| from | string | No | No | `^[a-z0-9-]+$` |
| annotations | object | No | Yes | Key-value metadata (since 0.0.42) |
| _comment | string | No | No | - |

**Not available:** rule, timer, triggerKind

---

## exitTransition (Manual Only)

`additionalProperties: false` -- only listed fields are allowed.

| Field | Type | Required | Nullable | Constraint |
|-------|------|----------|----------|------------|
| key | string | Yes | No | `^[a-z0-9-]+$` |
| target | string | Yes | No | `^(\$self\|[a-z0-9-]+)$` |
| triggerType | integer | Yes | No | **const: 0** (Manual only) |
| versionStrategy | versionStrategy | Yes | No | enum |
| labels | languageLabel[] | Yes | No | - |
| schema | reference | No | Yes | Data schema for exit |
| view | viewDefinition | No | Yes | Single or rule-based |
| mapping | scriptCode | No | Yes | Input mapping |
| onExecutionTasks | onExecuteTask[] | No | No | Tasks during transition |
| roles | roleGrant[] | No | No | Authorization roles |
| from | string | No | No | `^[a-z0-9-]+$` |
| annotations | object | No | Yes | Key-value metadata (since 0.0.42) |
| _comment | string | No | No | - |

**Not available:** rule, timer, triggerKind

---

## updateDataTransition (Manual Only)

`additionalProperties: false` -- only listed fields are allowed.

| Field | Type | Required | Nullable | Constraint |
|-------|------|----------|----------|------------|
| key | string | Yes | No | `^[a-z0-9-]+$` |
| target | string | Yes | No | **const: `$self`** |
| triggerType | integer | Yes | No | **const: 0** (Manual only) |
| versionStrategy | versionStrategy | Yes | No | enum |
| labels | languageLabel[] | Yes | No | - |
| schema | reference | No | Yes | Data schema for update |
| view | viewDefinition | No | Yes | Single or rule-based |
| mapping | scriptCode | No | Yes | Input mapping |
| onExecutionTasks | onExecuteTask[] | No | No | Tasks during transition |
| roles | roleGrant[] | No | No | Authorization roles |
| from | string | No | No | `^[a-z0-9-]+$` |
| annotations | object | No | Yes | Key-value metadata (since 0.0.42) |
| _comment | string | No | No | - |

**Unique constraint:** `target` is always `$self` -- update data never changes state.

**Not available:** rule, timer, triggerKind

---

## Transition Type Comparison Matrix

Summary of all 6 transition types side by side:

| Capability | State Transition | Shared Transition | startTransition | cancelTransition | exitTransition | updateDataTransition |
|------------|:----------------:|:-----------------:|:---------------:|:----------------:|:--------------:|:--------------------:|
| triggerType: Manual (0) | Yes | Yes | **Only** | **Only** | **Only** | **Only** |
| triggerType: Auto (1) | Yes | No | No | No | No | No |
| triggerType: Scheduled (2) | Yes | Yes | No | No | No | No |
| triggerType: Event (3) | Yes | Yes | No | No | No | No |
| target: any state | Yes | Yes | Yes | Yes | Yes | No |
| target: `$self` | Yes | Yes | No | Yes | Yes | **Only** |
| view | Manual only | Manual only | No | Yes | Yes | Yes |
| rule | Auto required | No | No | No | No | No |
| timer | Scheduled required | Scheduled required | No | No | No | No |
| triggerKind | Yes | No | No | No | No | No |
| availableIn | No | Manual only | No | Optional | Optional | Optional |
| schema | Manual/Event | Manual/Event | Optional | Optional | Optional | Optional |
| mapping | Manual/Event | Manual/Event | Optional | Optional | Optional | Optional |
| onExecutionTasks | Optional | Optional | Optional | Optional | Optional | Optional |
| roles | Optional | Optional | Optional | Optional | Optional | Optional |
| annotations | Optional | Optional | Optional | Optional | Optional | Optional |
| additionalProperties | open | open | **false** | **false** | **false** | **false** |

---

## viewDefinition

Supports two formats (or null):

### Single View
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| view | reference | Yes | View component reference |
| extensions | string[] | No | Extension identifiers |
| loadData | boolean | No | Whether to load data |

`additionalProperties: false`

### Rule-Based View
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| rules | viewRule[] | Yes | minItems: 1. Evaluated in order, first match wins |
| default | object | No | Fallback view when no rule matches |
| default.view | reference | Yes (if default) | Fallback view reference |
| default.extensions | string[] | No | Fallback extensions |
| default.loadData | boolean | No | Fallback load data flag |

`additionalProperties: false`

### viewRule
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| rule | scriptCode | Yes | Condition script |
| view | reference | Yes | View to use when rule matches |
| extensions | string[] | No | Extension identifiers |
| loadData | boolean | No | Whether to load data |

`additionalProperties: false`

---

## reference

Two formats (oneOf):

### Explicit Reference
| Field | Type | Required |
|-------|------|----------|
| key | string | Yes (or id) |
| id | string | Yes (or key) |
| domain | string | Yes |
| flow | string | Yes |
| version | string | Yes |

### Short Reference
| Field | Type | Required |
|-------|------|----------|
| ref | string | Yes |

`additionalProperties: false`

---

## scriptCode

| Field | Type | Required | Constraint |
|-------|------|----------|------------|
| type | enum | No | `G` (Global), `L` (Local). Default: `L` |
| code | string | Conditional | **Required** when type=`L`. Not required when type=`G` |
| location | string | No | Script file location |
| encoding | enum | No | `B64` (Base64), `NAT` (Native). Default: `B64` |

`additionalProperties: false`

---

## onExecuteTask

| Field | Type | Required | Nullable | Constraint |
|-------|------|----------|----------|------------|
| order | integer | Yes | No | minimum: 1 |
| task | reference | Yes | No | Task component reference |
| mapping | scriptCode | Yes | No | Input/output mapping |
| errorBoundary | errorBoundary | No | Yes | Task-level error boundary |
| _comment | string | No | No | - |

---

## subFlow

Nullable (`anyOf: [object, null]`).

| Field | Type | Required | Constraint |
|-------|------|----------|------------|
| type | enum | Yes | `S` (SubFlow), `P` (SubProcess) |
| process | reference | Yes | SubFlow process reference |
| mapping | scriptCode | Yes | Data mapping |
| viewOverrides | object | No | Dictionary: key (kebab-case) -> reference |
| overrides | subFlowOverrides | No | Unified overrides (views, transitions, states, timeout) |

`additionalProperties: false`

### subFlowOverrides

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| views | object | No | Dictionary: view key -> reference |
| transitions | object | No | Dictionary: transition key -> subFlowTransitionOverride |
| states | object | No | Dictionary: state key -> subFlowStateOverride |
| timeout | workflowTimeout | No | Timeout override (nullable) |

`additionalProperties: false`

### subFlowTransitionOverride
| Field | Type | Required |
|-------|------|----------|
| roles | roleGrant[] | No |

`additionalProperties: false`

### subFlowStateOverride
| Field | Type | Required |
|-------|------|----------|
| queryRoles | roleGrant[] | No |

`additionalProperties: false`

---

## workflowTimeout

| Field | Type | Required | Constraint |
|-------|------|----------|------------|
| key | string | Yes | `^[a-z0-9-]+$` |
| target | string | Yes | `^(\$self\|[a-z0-9-]+)$` |
| versionStrategy | versionStrategy | Yes | enum |
| timer | timerConfig | Yes | ISO 8601 duration |
| mapping | scriptCode | No | Nullable. Dynamic timeout calculation |
| _comment | string | No | - |

### timerConfig
| Field | Type | Required | Constraint |
|-------|------|----------|------------|
| reset | string | Yes | Timer reset strategy |
| duration | string | Yes | ISO 8601 duration pattern |

---

## errorBoundary

Used at workflow, state, and task levels.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| onError | errorHandlerRule[] | No | Rules evaluated by priority (lower first) |
| onTimeout | timeoutPolicy | No | Timeout-specific handling |

### errorHandlerRule

| Field | Type | Required | Constraint |
|-------|------|----------|------------|
| action | errorAction | Yes | enum: 0-5 |
| errorTypes | string[] | No | Exception types to match. `*` = match all |
| errorCodes | string[] | No | Error codes to match. `*` = match all |
| transition | string | No | Required for Rollback(2)/Notify(4). Forbidden for Abort(0) |
| priority | integer | No | minimum: 1, default: 100. Lower = evaluated first |
| retryPolicy | retryPolicy | No | Required when action=Retry(1) |
| logOnly | boolean | No | default: false |

**Conditional:** When `action=0` (Abort), `transition` must have maxLength: 0 (empty/absent).

### timeoutPolicy

| Field | Type | Required | Constraint |
|-------|------|----------|------------|
| action | errorAction | No | enum: 0-5 |
| defaultRetryPolicy | retryPolicy | No | Required when action=Retry(1) |
| transition | string | No | Must reference valid state key. Forbidden for Abort(0) |

**Conditional:** When `action=0` (Abort), `transition` must have maxLength: 0.

### retryPolicy

| Field | Type | Required | Constraint |
|-------|------|----------|------------|
| initialDelay | string | Yes | ISO 8601 duration, must be > 0 |
| maxRetries | integer | No | minimum: 0, default: 3 |
| backoffType | backoffType | No | enum: 0 (Fixed), 1 (Exponential). Default: 1 |
| backoffMultiplier | number | No | minimum: 1, default: 2.0 |
| maxDelay | string | No | ISO 8601 duration, >= initialDelay |
| useJitter | boolean | No | default: true |

---

## roleGrant

| Field | Type | Required | Constraint |
|-------|------|----------|------------|
| role | string | Yes | Role name |
| grant | enum | Yes | `allow`, `deny`. DENY always overrides ALLOW |

`additionalProperties: false`

---

## languageLabel

| Field | Type | Required | Constraint |
|-------|------|----------|------------|
| label | string | Yes | Label text |
| language | string | Yes | `^[a-z]{2}(-[A-Z]{2})?$` (ISO 639-1) |

---

## Cross-References

| Referenced Component | Used In |
|---------------------|---------|
| view-definition | state.view, transition.view, sharedTransition.view, cancelTransition.view, exitTransition.view, updateDataTransition.view, viewRule.view |
| task-definition | onExecuteTask.task |
| schema-definition | startTransition.schema, transition.schema, cancelTransition.schema, exitTransition.schema, updateDataTransition.schema, attributes.schema.schema |
| function-definition | attributes.functions[] |
| extension-definition | attributes.extensions[], attributes.features[] |
