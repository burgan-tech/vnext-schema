// Load all schema files
const schemas = {
  coreSchema: require('./schemas/core-schema.schema.json'),
  workflowDefinition: require('./schemas/workflow-definition.schema.json'),
  taskDefinition: require('./schemas/task-definition.schema.json'),
  viewDefinition: require('./schemas/view-definition.schema.json'),
  functionDefinition: require('./schemas/function-definition.schema.json'),
  extensionDefinition: require('./schemas/extension-definition.schema.json'),
  schemaDefinition: require('./schemas/schema-definition.schema.json'),
  coreHeader: require('./schemas/core-header.schema.json')
};

// Export schemas individually
module.exports = {
  schemas,
  
  // Individual schema exports for convenience
  coreSchema: schemas.coreSchema,
  workflowDefinition: schemas.workflowDefinition,
  taskDefinition: schemas.taskDefinition,
  viewDefinition: schemas.viewDefinition,
  functionDefinition: schemas.functionDefinition,
  extensionDefinition: schemas.extensionDefinition,
  schemaDefinition: schemas.schemaDefinition,
  coreHeader: schemas.coreHeader,
  
  // Helper function to get schema by type
  getSchema: function(type) {
    const schemaMap = {
      'core': schemas.coreSchema,
      'workflow': schemas.workflowDefinition,
      'task': schemas.taskDefinition,
      'view': schemas.viewDefinition,
      'function': schemas.functionDefinition,
      'extension': schemas.extensionDefinition,
      'schema': schemas.schemaDefinition,
      'header': schemas.coreHeader
    };
    return schemaMap[type] || null;
  },
  
  // Get all available schema types
  getAvailableTypes: function() {
    return ['core', 'workflow', 'task', 'view', 'function', 'extension', 'schema', 'header'];
  }
}; 