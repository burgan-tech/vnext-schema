/**
 * Document-level tests for declarative task mappings (runtime #1229).
 *
 * A task binding (workflow onExecuteTask, function task / onExecutionTasks, extension task) may carry
 * `input` / `output` blocks — `select` (read path), `into` (write path), `set` (write path -> Dynamic
 * Expresso expression) — instead of a C# `mapping`. Exactly one of the two forms: `mapping` alone, or
 * one or both blocks. Existing bindings with `mapping` validate unchanged.
 */
const Ajv2019 = require('ajv/dist/2019');
const Ajv = require('ajv');

const workflowSchema = require('../schemas/workflow-definition.schema.json');
const functionSchema = require('../schemas/function-definition.schema.json');
const extensionSchema = require('../schemas/extension-definition.schema.json');

const validateWorkflow = new Ajv2019({ strict: false, allErrors: true, validateFormats: false }).compile(workflowSchema);
const validateFunction = new Ajv({ strict: false, allErrors: true, validateFormats: false }).compile(functionSchema);
const validateExtension = new Ajv({ strict: false, allErrors: true, validateFormats: false }).compile(extensionSchema);

const labels = label => [{ language: 'en', label }];
const taskRef = { key: 'score-task', domain: 'test', flow: 'sys-tasks', version: '1.0.0' };
const script = { location: './src/Score.csx', code: 'cmV0dXJuIG51bGw7' };

const workflowDoc = binding => ({
  key: 'kyc', domain: 'test', flow: 'sys-flows', flowVersion: '1.0.0', version: '1.0.0', tags: ['test'],
  attributes: {
    type: 'F', labels: labels('KYC'),
    startTransition: { key: 'start', target: 'check', triggerType: 0, versionStrategy: 'Minor', labels: labels('Start') },
    states: [
      {
        key: 'check', stateType: 1, versionStrategy: 'Minor', labels: labels('Check'),
        onEntries: [binding],
        transitions: [{
          key: 'done', target: 'end', triggerType: 0, versionStrategy: 'Minor', labels: labels('Done'),
          onExecutionTasks: [binding]
        }]
      },
      { key: 'end', stateType: 3, versionStrategy: 'Minor', labels: labels('End') }
    ]
  }
});

const functionDoc = (binding, multi) => ({
  key: 'score-fn', domain: 'test', flow: 'sys-functions', flowVersion: '1.0.0', version: '1.0.0', tags: ['test'],
  attributes: multi ? { scope: 'I', onExecutionTasks: [binding], output: script } : { scope: 'I', task: binding }
});

const extensionDoc = binding => ({
  key: 'score-ext', domain: 'test', flow: 'sys-extensions', flowVersion: '1.0.0', version: '1.0.0', tags: ['test'],
  attributes: { type: 1, scope: 1, task: binding }
});

const bind = extra => ({ order: 1, task: taskRef, ...extra });

const valid = {
  'mapping only (unchanged)': bind({ mapping: script }),
  'output select/into/set': bind({
    output: { select: '$.body.score', into: '$.kyc.score', set: { '$.kyc.checkedAt': 'now', '$.kyc.state': 'instance.currentState' } }
  }),
  'output into only': bind({ output: { into: '$.response' } }),
  'output select only': bind({ output: { select: '$.body' } }),
  'output set with quoted and hyphenated names': bind({ output: { set: { '$.kyc[\'risk level\']': '1', '$.x-ref.id': '"a"' } } }),
  'output select with index and wildcard': bind({ output: { select: '$.body.items[0].tags[*]', into: '$.tags' } }),
  'input set on every surface': bind({
    input: { set: { '$.body.customerId': 'data.customer.id', '$.headers.x-channel': '"web"', '$.query.lang': '"tr"' } }
  }),
  'input select + into': bind({ input: { select: '$.data.customer', into: '$.body.customer' } }),
  'input whole body': bind({ input: { select: '$.data', into: '$.body' } }),
  'input and output together': bind({ input: { set: { '$.body.a': '1' } }, output: { into: '$.b' } })
};

const invalid = {
  'neither mapping nor blocks': bind({}),
  'mapping and output together': bind({ mapping: script, output: { into: '$.x' } }),
  'mapping and input together': bind({ mapping: script, input: { set: { '$.body.a': '1' } } }),
  'empty output block': bind({ output: {} }),
  'empty set': bind({ output: { set: {} } }),
  'unknown block member': bind({ output: { into: '$.x', where: 'true' } }),
  'set value not a string': bind({ output: { set: { '$.x': 1 } } }),
  'set value empty': bind({ output: { set: { '$.x': '' } } }),
  'set value too long': bind({ output: { set: { '$.x': 'a'.repeat(8001) } } }),
  'output into root': bind({ output: { into: '$' } }),
  'output write target with index': bind({ output: { into: '$.items[0]' } }),
  'output write target with wildcard': bind({ output: { set: { '$.items[*]': '1' } } }),
  'set key without $': bind({ output: { set: { 'kyc.score': '1' } } }),
  'malformed select': bind({ output: { select: 'body.score' } }),
  'input select without into': bind({ input: { select: '$.data.customer' } }),
  'input into without select': bind({ input: { into: '$.body.customer' } }),
  'input target on $.route': bind({ input: { set: { '$.route.id': '1' } } }),
  'input target outside a surface': bind({ input: { set: { '$.data.x': '1' } } })
};

let checked = 0;
const failures = [];
const surfaces = [
  ['workflow', b => validateWorkflow(workflowDoc(b)), () => validateWorkflow.errors],
  ['function task', b => validateFunction(functionDoc(b, false)), () => validateFunction.errors],
  ['function onExecutionTasks', b => validateFunction(functionDoc(b, true)), () => validateFunction.errors],
  ['extension task', b => validateExtension(extensionDoc(b)), () => validateExtension.errors]
];

for (const [surface, run, errors] of surfaces) {
  for (const [name, binding] of Object.entries(valid)) {
    checked++;
    if (!run(binding)) failures.push(`${surface} / ${name}: expected valid, got ${JSON.stringify(errors())}`);
  }
  for (const [name, binding] of Object.entries(invalid)) {
    checked++;
    if (run(binding)) failures.push(`${surface} / ${name}: expected invalid, got valid`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  console.error(`\n❌ ${failures.length} of ${checked} declarative mapping checks failed`);
  process.exit(1);
}
console.log(`🎉 All ${checked} declarative task mapping documents behaved as expected!`);
