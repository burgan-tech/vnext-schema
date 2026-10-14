// Load all schema files
const schemas = {
  coreSchema: require('./schemas/core-schema.schema.json'),
  workflowDefinition: require('./schemas/workflow-definition.schema.json'),
  taskDefinition: require('./schemas/task-definition.schema.json'),
  viewDefinition: require('./schemas/view-definition.schema.json'),
  functionDefinition: require('./schemas/function-definition.schema.json'),
  extensionDefinition: require('./schemas/extension-definition.schema.json'),
  schemaDefinition: require('./schemas/schema-definition.schema.json'),
  mappingDefinition: require('./schemas/mapping-definition.schema.json'),
  coreHeader: require('./schemas/core-header.schema.json')
};

// Load all vocabulary files. Schemas $ref them by $id (schema-definition → the role vocabularies), so a
// validator must register them before compiling — see addVocabularies.
const vocabularies = {
  dataVocab: require('./vocabularies/data-vocab.json'),
  viewVocab: require('./vocabularies/view-vocab.json'),
  rolesVocab: require('./vocabularies/roles-vocab.json'),
  dataBaseVocab: require('./vocabularies/data-base-vocab.json'),
  recordVocab: require('./vocabularies/record-vocab.json'),
  inputVocab: require('./vocabularies/input-vocab.json'),
  componentVocab: require('./vocabularies/component-vocab.json'),
  viewHintsVocab: require('./vocabularies/view-hints-vocab.json')
};

// Export schemas individually
module.exports = {
  schemas,
  vocabularies,
  
  // Individual schema exports for convenience
  coreSchema: schemas.coreSchema,
  workflowDefinition: schemas.workflowDefinition,
  taskDefinition: schemas.taskDefinition,
  viewDefinition: schemas.viewDefinition,
  functionDefinition: schemas.functionDefinition,
  extensionDefinition: schemas.extensionDefinition,
  schemaDefinition: schemas.schemaDefinition,
  mappingDefinition: schemas.mappingDefinition,
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
      'mapping': schemas.mappingDefinition,
      'header': schemas.coreHeader
    };
    return schemaMap[type] || null;
  },

  // Register every vocabulary on an AJV (or compatible) instance so cross-file $refs resolve.
  // Idempotent: a vocabulary already registered under its $id is skipped.
  addVocabularies: function(ajv) {
    Object.values(vocabularies).forEach(vocabulary => {
      if (!ajv.getSchema(vocabulary.$id)) {
        ajv.addSchema(vocabulary);
      }
    });
    return ajv;
  },

  // Get all available schema types
  getAvailableTypes: function() {
    return ['core', 'workflow', 'task', 'view', 'function', 'extension', 'schema', 'mapping', 'header'];
  }
}; 