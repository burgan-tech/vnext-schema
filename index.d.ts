export interface SchemaDefinitions {
  schemas: {
    coreSchema: object;
    workflowDefinition: object;
    taskDefinition: object;
    viewDefinition: object;
    functionDefinition: object;
    extensionDefinition: object;
    schemaDefinition: object;
    mappingDefinition: object;
    coreHeader: object;
  };

  vocabularies: {
    dataVocab: object;
    viewVocab: object;
    rolesVocab: object;
    dataBaseVocab: object;
    recordVocab: object;
    inputVocab: object;
    componentVocab: object;
    viewHintsVocab: object;
  };

  // Individual schema exports
  coreSchema: object;
  workflowDefinition: object;
  taskDefinition: object;
  viewDefinition: object;
  functionDefinition: object;
  extensionDefinition: object;
  schemaDefinition: object;
  mappingDefinition: object;
  coreHeader: object;

  // Helper functions
  getSchema(type: 'core' | 'workflow' | 'task' | 'view' | 'function' | 'extension' | 'schema' | 'mapping' | 'header'): object | null;
  getAvailableTypes(): string[];
  /** Registers every vocabulary on the validator so cross-file $refs (e.g. schema-definition → role vocabularies) resolve. Idempotent. */
  addVocabularies<T extends { getSchema(id: string): unknown; addSchema(schema: object): unknown }>(ajv: T): T;
}

declare const schemas: SchemaDefinitions;
export = schemas; 