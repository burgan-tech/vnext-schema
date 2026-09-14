# @burgan-tech/vnext-schema

JSON Schema definitions for vNext Workflow components validation.

## Overview

This package provides comprehensive JSON Schema definitions used by the vNext ecosystem to validate workflows and components developed with the vNext Workflow product. These schemas ensure consistency and validity of workflow definitions, tasks, views, functions, and other components within the vNext platform.

## Included Schemas

- **Core Schema**: Base schema definition for all vNext components
- **Workflow Definition**: Schema for workflow component definitions (`sys-flows`)
- **Task Definition**: Schema for task component definitions (`sys-tasks`)
- **View Definition**: Schema for view component definitions (`sys-views`)
- **Function Definition**: Schema for function component definitions (`sys-functions`)
- **Extension Definition**: Schema for extension component definitions (`sys-extensions`)
- **Schema Definition**: Meta-schema for schema definitions (`sys-schemas`)
- **Mapping Definition**: Schema for mapping component definitions (`sys-mappings`)
- **Core Header**: Schema for runtime HTTP headers and metadata (`sys-schemas`)

### Supported Task Types

`task-definition.schema.json` validates 21 task types, selected through the `attributes.type` discriminator. Each type has its own `attributes.config` shape:

| `type` | Task | Purpose |
|--------|------|---------|
| `1` | Dapr HTTP Endpoint | Call an external HTTP endpoint through Dapr |
| `2` | Dapr Binding | Invoke a Dapr output binding |
| `3` | Dapr Service | Service-to-service invocation via Dapr |
| `4` | Dapr PubSub | Publish a message to a Dapr pub/sub topic |
| `5` | Human Task | Wait for a human decision |
| `6` | HTTP Task | Direct HTTP call |
| `7` | Script Task | Execute a C# script (`.csx`) |
| `8` | Condition Task | Evaluate a condition |
| `9` | Timer Task | Delay / scheduled continuation |
| `10` | Notification Task | Send a notification |
| `11` | Start Flow Task | Start another workflow instance |
| `12` | Trigger Transition Task | Trigger a transition on an instance |
| `13` | Get Instance Data Task | Read instance data |
| `14` | SubProcess Task | Run a sub-process |
| `15` | Get Instances Task | Query workflow instances |
| `16` | SOAP Task | Call a SOAP service |
| `17` | State Store Task | Read/write a Dapr state store |
| `18` | Cache Aside Task | Cache-aside read-through |
| `19` | Get Instance Task | Read a single instance |
| `20` | Dapr Conversation Task | Dapr conversation (LLM) call |
| `21` | FanOut Task | Run an inner task once per collection item, in parallel, and join the results |

#### FanOut Task (`type: "21"`)

The FanOut task executes a **referenced inner task** once per item of a runtime-resolved collection, in parallel, then joins the per-item outcomes into a single output.

```jsonc
{
  "type": "21",
  "config": {
    "mode": "inline",                 // only 'inline' is accepted in this phase
    "itemsPath": "$.documents.online", // dot-path into instance data (or use the mapping's ItemSelector)
    "itemAlias": "document",           // readability label for logs/traces only
    "task": {                          // required: the inner task run per item
      "key": "upload-document",
      "domain": "core",
      "flow": "sys-tasks",
      "version": "1.0.0"
    },
    "execution": {
      "maxDegreeOfParallelism": 4,     // default 4
      "itemTimeoutSeconds": 30,        // must be <= batchTimeoutSeconds
      "batchTimeoutSeconds": 120
    },
    "join": {
      "policy": "allSettled",          // all | allSettled | quorum | firstSuccess
      "resultKey": "fanOutResults"     // instance data key for item results + '{resultKey}Summary'
    },
    "errorBoundary": {                 // applied per ITEM, same rule shape as state/transition boundaries
      "onError": [
        { "action": 1, "errorCodes": ["FanOut:ItemTimeout"], "retryPolicy": { "initialDelay": "PT2S" } }
      ]
    }
  }
}
```

Authoring notes:

- Only `config.task` is required; every other member has a runtime default.
- `join.minSuccess` is **required** when `join.policy` is `quorum`.
- Exactly one item source must be configured — either `config.itemsPath` **or** the task mapping's `ItemSelector`, never both and never neither. This rule is enforced by the runtime, not by the schema.
- `execution.itemTimeoutSeconds` must be less than or equal to `execution.batchTimeoutSeconds` (also runtime-enforced).
- A FanOut task cannot reference another FanOut task as its inner task.
- `join.ordered` is accepted for forward compatibility; in `inline` mode item results are always ordered by item index.

## Installation

```bash
npm install @burgan-tech/vnext-schema
```

## Usage

This package is primarily designed to be used with the [@vnext/cli](https://www.npmjs.com/package/@burgan-tech/vnext-cli) tool for workflow development and validation.

### Using with @burgan-tech/vnext-cli

The recommended way to use these schemas is through the official vNext CLI:

```bash
npm install -g @burgan-tech/vnext-cli
```

The CLI automatically uses these schema definitions for:
- Validating workflow definitions
- Checking component structure
- Ensuring compliance with vNext standards
- Development-time validation

For detailed CLI usage and workflow development guide, please refer to the [@vnext/cli documentation](https://github.com/burgan-tech/vnext-cli).

### Programmatic Usage

If you need to access the schemas programmatically:

```javascript
const schemas = require('@burgan-tech/vnext-schema');

// Get specific schema
const workflowSchema = schemas.workflowDefinition;
const taskSchema = schemas.taskDefinition;
const headerSchema = schemas.coreHeader;

// Get schema by type
const coreSchema = schemas.getSchema('core');
const headerSchemaByType = schemas.getSchema('header');

// Get all available schema types
const availableTypes = schemas.getAvailableTypes();
// Returns: ['core', 'workflow', 'task', 'view', 'function', 'extension', 'schema', 'header']
```

## Schema Structure

All schemas follow the vNext component structure with required fields:
- `key`: Component identifier
- `version`: Semantic version (Major.Minor.Patch)
- `domain`: Domain identifier
- `flow`: Flow identifier
- `flowVersion`: Flow version
- `tags`: Component tags
- `attributes`: Component-specific attributes

## Contributing

This package is maintained by the vNext Team. For issues, feature requests, or contributions, please visit the [GitHub repository](https://github.com/burgan-tech/vnext-schema).

## License

MIT

## Support

For support and questions:
- GitHub Issues: [https://github.com/burgan-tech/vnext-schema/issues](https://github.com/burgan-tech/vnext-schema/issues)

---

**Note**: This package is part of the vNext ecosystem and is primarily intended for use with the official vNext CLI tools and vNext Workflow platform. 

### Schema component purpose

Schema component documents (`sys-schemas`) accept an optional root `type` beside `key`, `domain`
and `flow`: `master`, `transition`, `view`, or `function`. It has no default; absent, null and blank
values never mean master. `x-indexed` metadata (including `false`) is allowed only with explicit
root `type: "master"`. The existing `attributes.type` and nested JSON Schema `type` keywords remain
independent and unchanged. These contract changes require a package release before downstream
consumers using the published package see the new root field.
