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
- **Core Header**: Schema for runtime HTTP headers and metadata (`sys-schemas`)

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

- 
- Documentation: Available through [@vnext/cli](https://github.com/vnext/vNext.Cli/pkgs/npm/cli)

---

**Note**: This package is part of the vNext ecosystem and is primarily intended for use with the official vNext CLI tools and vNext Workflow platform. 
