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
  for (const indexed of [true, false]){
    assert.strictEqual(validate(doc(type, indexed)), type === 'master');
  }
}

for (const type of ['MASTER', 'workflow', 42, {}, []]){
  assert.strictEqual(validate(doc(type)), false);
}

const example = doc('view');
example.attributes.schema.examples = [{ 'x-indexed': true }];
assert(validate(example));
assert.strictEqual(schema.properties.type.default, undefined);
console.log('Schema root purpose document validation passed.');
