/**
 * Document-level tests for task-definition.schema.json - Python task (type 23).
 *
 * A Python task names a handler in the domain's Python runtime image; the code never travels in
 * the task. The config is closed, so the earlier inline-script shape (script, executionMode) is
 * rejected.
 */

const path = require('path');
const Ajv = require('ajv');

const schema = require(path.join(__dirname, '../schemas/task-definition.schema.json'));

const VERSION = '1.0.0';

/** A minimal, valid Python task document with the given config. */
const doc = (config = { handler: 'risk_score' }) => ({
  key: 'calculate-risk',
  version: VERSION,
  domain: 'test-domain',
  flow: 'sys-tasks',
  flowVersion: VERSION,
  tags: ['python'],
  attributes: { type: '23', config }
});

const cases = [];
const expectValid = (name, document) => cases.push({ name, document, valid: true });
const expectInvalid = (name, document) => cases.push({ name, document, valid: false });

expectValid('handler only', doc());
expectValid('handler + object input + timeout', doc({ handler: 'risk_score', input: { income: 85000 }, timeoutSeconds: 20 }));
expectValid('array input', doc({ handler: 'sum_values', input: [2, 3, 5] }));
expectValid('null input', doc({ handler: 'noop', input: null }));
expectValid('dotted and dashed handler name', doc({ handler: 'models.risk-v2' }));
expectValid('timeout at the 50 s limit', doc({ handler: 'h', timeoutSeconds: 50 }));

expectInvalid('missing handler', doc({ input: { a: 1 } }));
expectInvalid('handler starting with a digit', doc({ handler: '1risk' }));
expectInvalid('handler with a space', doc({ handler: 'risk score' }));
expectInvalid('handler with a slash', doc({ handler: 'models/risk' }));
expectInvalid('timeout 0', doc({ handler: 'h', timeoutSeconds: 0 }));
expectInvalid('timeout over 50', doc({ handler: 'h', timeoutSeconds: 51 }));
expectInvalid('inline script is not part of the contract', doc({
  handler: 'h', script: { location: 'inline.py', code: 'def main(input): return input', encoding: 'NAT' }
}));
expectInvalid('executionMode is not part of the contract', doc({ handler: 'h', executionMode: 'process' }));
expectInvalid('missing config', { ...doc(), attributes: { type: '23' } });

function run() {
  console.log('🔍 Python task document validation starting...\n');

  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);

  let failures = 0;
  for (const { name, document, valid } of cases) {
    if (validate(document) === valid) {
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
    console.log(`🎉 All ${cases.length} Python task documents behaved as expected!`);
    process.exit(0);
  }
  console.log(`💥 ${failures} of ${cases.length} Python task documents misbehaved.`);
  process.exit(1);
}

run();
