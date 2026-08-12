/**
 * Document-level tests for function-definition.schema.json.
 *
 * validate-schemas.js only checks that each schema is itself a valid JSON Schema. That cannot catch a
 * contract slot that accepts the wrong shape, so this file validates real function documents against
 * the schema - in particular the polymorphic contract slots (inputSchema / outputSchema / inputView /
 * outputView), each of which accepts a single component reference, a rule-based entry array, or the
 * wrapped array object.
 */

const path = require('path');
const Ajv = require('ajv');

const schema = require(path.join(__dirname, '../schemas/function-definition.schema.json'));

const DOMAIN = 'test-domain';
const VERSION = '1.0.0';

const ref = (key, flow) => ({ key, domain: DOMAIN, flow, version: VERSION });
const rule = () => ({ location: '', code: 'true', encoding: 'NAT' });

/** A minimal, valid function document with the given attribute overrides merged in. */
const doc = (attributes = {}) => ({
  key: 'my-fn',
  version: VERSION,
  domain: DOMAIN,
  flow: 'sys-functions',
  flowVersion: VERSION,
  tags: ['function'],
  attributes: {
    scope: 'D',
    task: {
      order: 1,
      task: ref('my-task', 'sys-tasks'),
      mapping: { location: './my-task.csx', code: 'cmV0dXJuIHt9Ow==', encoding: 'B64' }
    },
    ...attributes
  }
});

const VIEW_SLOTS = ['inputView', 'outputView'];
const SCHEMA_SLOTS = ['inputSchema', 'outputSchema'];

const cases = [];

const expectValid = (name, document) => cases.push({ name, document, valid: true });
const expectInvalid = (name, document) => cases.push({ name, document, valid: false });

expectValid('minimal function', doc());

for (const slot of VIEW_SLOTS) {
  expectValid(`${slot}: single reference`, doc({ [slot]: ref('v1', 'sys-views') }));

  expectValid(`${slot}: rule entries with a trailing fallback`, doc({
    [slot]: [
      { rule: rule(), view: ref('v1', 'sys-views'), loadData: true },
      { view: ref('v2', 'sys-views') }
    ]
  }));

  expectValid(`${slot}: wrapped views array`, doc({
    [slot]: { views: [{ view: ref('v1', 'sys-views') }] }
  }));

  expectInvalid(`${slot}: entry without a view`, doc({ [slot]: [{ rule: rule() }] }));

  expectInvalid(`${slot}: reference to the wrong flow`, doc({ [slot]: ref('v1', 'sys-schemas') }));

  // 'extensions' only applies to state/transition views; the runtime validator rejects it on a
  // function, so the schema must not accept it either.
  expectInvalid(`${slot}: entry declaring extensions`, doc({
    [slot]: [{ view: ref('v1', 'sys-views'), extensions: ['e1'] }]
  }));

  expectInvalid(`${slot}: empty array`, doc({ [slot]: [] }));

  expectInvalid(`${slot}: schema-style entry`, doc({
    [slot]: [{ schema: ref('s1', 'sys-schemas') }]
  }));
}

for (const slot of SCHEMA_SLOTS) {
  expectValid(`${slot}: single reference`, doc({ [slot]: ref('s1', 'sys-schemas') }));

  expectValid(`${slot}: rule entries with a trailing fallback`, doc({
    [slot]: [
      { rule: rule(), schema: ref('s1', 'sys-schemas') },
      { schema: ref('s2', 'sys-schemas') }
    ]
  }));

  expectValid(`${slot}: wrapped schemas array`, doc({
    [slot]: { schemas: [{ schema: ref('s1', 'sys-schemas') }] }
  }));

  expectInvalid(`${slot}: entry without a schema`, doc({ [slot]: [{ rule: rule() }] }));

  expectInvalid(`${slot}: reference to the wrong flow`, doc({ [slot]: ref('s1', 'sys-views') }));

  // loadData is a view rendering hint; a payload contract has no use for it.
  expectInvalid(`${slot}: entry declaring loadData`, doc({
    [slot]: [{ schema: ref('s1', 'sys-schemas'), loadData: true }]
  }));

  expectInvalid(`${slot}: empty array`, doc({ [slot]: [] }));
}

expectValid('all four slots together, mixing shapes', doc({
  verbs: ['POST'],
  inputSchema: [
    { rule: rule(), schema: ref('s1', 'sys-schemas') },
    { schema: ref('s2', 'sys-schemas') }
  ],
  outputSchema: ref('s3', 'sys-schemas'),
  inputView: { views: [{ rule: rule(), view: ref('v1', 'sys-views') }, { view: ref('v2', 'sys-views') }] },
  outputView: ref('v3', 'sys-views')
}));

function run() {
  console.log('🔍 Function document validation starting...\n');

  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);

  let failures = 0;

  for (const { name, document, valid } of cases) {
    const actual = validate(document);

    if (actual === valid) {
      console.log(`✅ ${name}${valid ? '' : ' (correctly rejected)'}`);
      continue;
    }

    failures++;
    if (valid) {
      console.log(`❌ ${name} - expected valid but was rejected:`);
      (validate.errors || []).forEach(e => console.log(`   - ${e.instancePath}: ${e.message}`));
    } else {
      console.log(`❌ ${name} - expected rejection but was accepted`);
    }
  }

  console.log('');
  if (failures === 0) {
    console.log(`🎉 All ${cases.length} function documents behaved as expected!`);
    process.exit(0);
  }

  console.log(`💥 ${failures} of ${cases.length} function document cases failed.`);
  process.exit(1);
}

run();
