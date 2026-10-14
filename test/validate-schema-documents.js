const assert = require('assert');
const Ajv = require('ajv');

const { addVocabularies } = require('../index');
const schema = require('../schemas/schema-definition.schema.json');
const validate = addVocabularies(new Ajv({ strict: false })).compile(schema);

const doc = (type, indexed, extra = {}) => ({
  key: 'orders',
  domain: 'test',
  flow: 'sys-schemas',
  version: '1.0.0',
  flowVersion: '1.0.0',
  tags: ['test'],
  attributes: {
    ...(type === undefined ? {} : { type }),
    schema: {
      type: 'object', properties: {
        nested: {
          type: 'object',
          properties: {
            amount: {
              type: 'number',
              ...(indexed === undefined ? {} : { 'x-indexed': indexed }),
              ...extra
            }
          }
        }
      }
    }
  }
});

// attributes.type is an optional role enum; absent and '' mean "no role".
for (const type of ['master', 'transition', 'component', 'function', '', undefined]) {
  assert(validate(doc(type)), `${type}: ${JSON.stringify(validate.errors)}`);
  for (const indexed of [true, false]) {
    assert.strictEqual(validate(doc(type, indexed)), type === 'master', `${type} x-indexed ${indexed}`);
  }
}

// Legacy free-text values and non-strings are refused.
for (const type of ['view', 'workflow', 'task', 'schema', 'headers', 'custom-schema', 'MASTER', '   ', null, 42, {}, []]) {
  assert.strictEqual(validate(doc(type)), false, `legacy type ${JSON.stringify(type)} must be refused`);
}

// The role selects the vocabulary: each keyword is accepted in its own role only.
const placement = [
  // [keyword fragment, roles that accept it]
  [{ 'x-roles': [{ role: 'ops', grant: 'allow' }] }, ['master', '', undefined]],
  [{ 'x-filterOperators': ['eq', 'gte'] }, ['master', '', undefined]],
  [{ 'x-encryption': { type: 'encrypt' } }, ['master', '', undefined]],
  [{ 'x-encryption': { source: 'client', key: 'urn:k', algorithm: 'HPKE-P256-SHA256-AES128GCM' } }, ['master', 'transition', 'function', '', undefined]],
  [{ 'x-context-source': { const: 1 } }, ['transition', 'function', '', undefined]],
  [{ 'x-binding': 'required' }, ['component', '', undefined]],
  [{ readOnly: true, 'x-computed': { evaluatedBy: 'runtime', fallback: { arithmetic: { op: 'add', fields: ['a', 'b'] } } } }, ['master', '', undefined]],
  [{ 'x-labels': { en: 'Amount' }, 'x-order': 1 }, ['master', 'transition', 'component', 'function', '', undefined]]
];
for (const [fragment, accepting] of placement) {
  for (const type of ['master', 'transition', 'component', 'function', '', undefined]) {
    assert.strictEqual(validate(doc(type, undefined, fragment)), accepting.includes(type),
      `${JSON.stringify(fragment)} on type ${JSON.stringify(type)}: ${JSON.stringify(validate.errors)}`);
  }
}

// Removed keywords are refused in every role.
for (const fragment of [{ 'x-persistance': 'transient' }, { 'x-encrypt': { key: 'urn:k', algorithm: 'RSA-OAEP-256' } }]) {
  for (const type of ['master', 'transition', 'component', 'function']) {
    assert.strictEqual(validate(doc(type, undefined, fragment)), false, `${Object.keys(fragment)[0]} on ${type}`);
  }
}

const example = doc('transition');
example.attributes.schema.examples = [{ 'x-indexed': true }];
assert(validate(example));
assert.strictEqual(schema.properties.type, undefined);
const obsoleteRoot = { ...doc('transition', true), type: 'master' };
assert.strictEqual(validate(obsoleteRoot), false);
assert.deepStrictEqual(schema.properties.attributes.required, ['schema']);
console.log('Schema attributes.type document validation passed.');

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
