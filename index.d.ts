export interface SchemaDefinitions {
  schemas: {
    coreSchema: object;
    workflowDefinition: object;
    taskDefinition: object;
    viewDefinition: object;
    functionDefinition: object;
    extensionDefinition: object;
    schemaDefinition: object;
    coreHeader: object;
  };
  
  // Individual schema exports
  coreSchema: object;
  workflowDefinition: object;
  taskDefinition: object;
  viewDefinition: object;
  functionDefinition: object;
  extensionDefinition: object;
  schemaDefinition: object;
  coreHeader: object;
  
  // Helper functions
  getSchema(type: 'core' | 'workflow' | 'task' | 'view' | 'function' | 'extension' | 'schema' | 'header'): object | null;
  getAvailableTypes(): string[];
}

declare const schemas: SchemaDefinitions;
export = schemas; 