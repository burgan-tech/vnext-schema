const assert = require('assert');
const Ajv = require('ajv');

const schema = require('../schemas/schema-definition.schema.json');
const validate = new Ajv({ strict: false }).compile(schema);

const doc = (type, indexed) => ({
  key: 'orders', domain: 'test', flow: 'sys-schemas', version: '1.0.0', flowVersion: '1.0.0', tags: ['test'],
  ...(type === undefined ? {} : { type }),
  attributes: {
    type: 'workflow', schema: {
      type: 'object', properties: {
        nested: {
          type: 'object',
          properties: {
            amount: {
              type: 'number',
              ...(indexed === undefined ? {} : { 'x-indexed': indexed })
            }
          }
        }
      }
    }
  }
});

for (const type of ['master', 'transition', 'view', 'function', undefined, null, '', '   ']) {
  assert(validate(doc(type)), JSON.stringify(validate.errors));
  for (const indexed of [true, false]) {
    assert.strictEqual(validate(doc(type, indexed)), type === 'master');
  }
}

for (const type of ['MASTER', 'workflow', 42, {}, []]) {
  assert.strictEqual(validate(doc(type)), false);
}

const example = doc('view');
example.attributes.schema.examples = [{ 'x-indexed': true }];
assert(validate(example));
assert.strictEqual(schema.properties.type.default, undefined);
console.log('Schema root purpose document validation passed.');

let indexCases = 0;
const checkIndexSchema = (jsonSchema, expected, label) => {
  const document = doc('master');
  document.attributes.schema = jsonSchema;
  assert.strictEqual(validate(document), expected, `${label}: ${JSON.stringify(validate.errors)}`);
  indexCases++;
};

const indexedField = { type: 'number', 'x-indexed': true };
const withField = field => ({ type: 'object', properties: { amount: field } });
for (const type of ['string', 'number', 'integer', 'boolean']) {
  checkIndexSchema(withField({ type, 'x-indexed': true }), true, `scalar ${type}`);
}

checkIndexSchema(withField({ type: 'string', format: 'date-time', 'x-indexed': true }), true, 'date-time');

for (const indexed of ['true', 1, null, {}, []]) {
  checkIndexSchema(withField({ type: 'number', 'x-indexed': indexed }), false, 'boolean metadata required');
}

for (const type of ['object', 'array', 'null', ['number', 'null'], undefined]) {
  checkIndexSchema(withField({ ...(type === undefined ? {} : { type }), 'x-indexed': true }), false, 'explicit scalar required');
  checkIndexSchema(withField({ ...(type === undefined ? {} : { type }), 'x-indexed': false }), true, 'false does not request projection');
}

checkIndexSchema({ type: 'number', 'x-indexed': true }, false, 'document root cannot be indexed');
checkIndexSchema({ properties: { nested: { properties: { '0': indexedField } } } }, true, 'implicit objects and nested numeric key');

for (const name of ['a.b', 'a-b', 'İsim', '']) {
  checkIndexSchema({ properties: { [name]: indexedField } }, false, 'unsupported root path');
  checkIndexSchema({ properties: { nested: { properties: { [name]: indexedField } } } }, false, 'unsupported nested path');
}

for (const name of ['0', '_amount']) {
  checkIndexSchema({ properties: { [name]: indexedField } }, false, 'first path segment must start with letter');
}

for (const type of ['array', 'string', ['object', 'null']]) {
  checkIndexSchema({ properties: { nested: { type, properties: { amount: indexedField } } } }, false, 'unsupported parent type');
}

const conditions = {
  $ref: '#/$defs/amount',
  allOf: [],
  anyOf: [],
  oneOf: [],
  not: {},
  if: {},
  then: {},
  else: {},
  dependentSchemas: {}
};

for (const [keyword, value] of Object.entries(conditions)) {
  checkIndexSchema(withField({ ...indexedField, [keyword]: value }), false, `${keyword} on indexed node`);
  checkIndexSchema({ [keyword]: value, properties: { amount: indexedField } }, false, `${keyword} on ancestor`);
  checkIndexSchema({ properties: { amount: indexedField, sibling: { [keyword]: value } } }, true, `${keyword} on unrelated sibling`);
}

for (const keyword of ['items', 'additionalProperties', 'contains', 'propertyNames', 'additionalItems', 'unevaluatedProperties', 'unevaluatedItems']) {
  checkIndexSchema({ [keyword]: withField(indexedField) }, false, `unsupported location ${keyword}`);
  checkIndexSchema({ [keyword]: withField({ type: 'number', 'x-indexed': false }) }, true, `disabled ${keyword}`);
}

for (const keyword of ['$defs', 'definitions', 'patternProperties', 'dependentSchemas']) {
  checkIndexSchema({ [keyword]: { entry: withField(indexedField) } }, false, `unsupported dictionary ${keyword}`);
}

for (const keyword of ['allOf', 'anyOf', 'oneOf', 'prefixItems', 'items']) {
  checkIndexSchema({ [keyword]: [withField(indexedField)] }, false, `unsupported array ${keyword}`);
}

for (const keyword of ['examples', 'default', 'const', 'enum']) {
  checkIndexSchema({ ...withField(indexedField), [keyword]: [{ 'x-indexed': 'data, not metadata' }] }, true, `literal ${keyword}`);
}

checkIndexSchema({ properties: { 'x-indexed': { type: 'string' } } }, true, 'property named x-indexed');
console.log(`${indexCases} master index metadata cases passed.`);
