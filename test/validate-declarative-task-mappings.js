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
  'input set on task-config fields': bind({
    input: { set: { '$.body.customerId': 'data.customer.id', '$.headers.x-channel': '"web"', '$.queryString': '"lang=tr"' } }
  }),
  'input set on the url from task + config': bind({
    input: { set: { '$.url': 'task.url.ToString().Replace("API_BASEURL", config.get("Example:ApiBaseUrl")) + "/" + urlEncode(data.id)' } }
  }),
  'input target on any config field': bind({ input: { set: { '$.route.id': '1', '$.timeoutSeconds': '60' } } }),
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
  'input target at the root': bind({ input: { set: { '$': '1' } } }),
  'input target with index': bind({ input: { set: { '$.body.items[0]': '1' } } })
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

// --- Phase B: the same blocks passed through to real task executors -----------------------------
// CacheAside (task type 18): sourceInput / sourceOutput, alternative to sourceMapping (not both).
// AI agent kind-1 tool binding: input / output, alternative to mapping (not both).
const taskSchema = require('../schemas/task-definition.schema.json');
const agentSchema = require('../schemas/agent-definition.schema.json');
const validateTask = new Ajv({ strict: false, allErrors: true, validateFormats: false }).compile(taskSchema);
const validateAgent = new Ajv({ strict: false, allErrors: true, validateFormats: false }).compile(agentSchema);

const cacheAsideDoc = config => ({
  key: 'ca', domain: 'test', flow: 'sys-tasks', flowVersion: '1.0.0', version: '1.0.0', tags: ['test'],
  attributes: { type: '18', config: { sourceTask: { key: 'src', domain: 'test', version: '1.0.0' }, ...config } }
});
const agentDoc = binding => ({
  key: 'triage-agent', domain: 'test', flow: 'sys-agents', flowVersion: '1.0.0', version: '1.0.0', tags: ['test'],
  attributes: {
    provider: 'bank-llm',
    instructions: { text: 'You classify.' },
    output: { schema: { type: 'object', properties: { category: { type: 'string' } }, required: ['category'] } },
    policy: { maxIterations: 6, maxToolCalls: 10, timeoutSeconds: 60 },
    tools: [{
      kind: 1, name: 'get_customer', description: 'Customer by id.',
      parameters: { type: 'object', properties: { customerId: { type: 'string' } }, required: ['customerId'] },
      binding: { task: taskRef, ...binding }
    }]
  }
});

const inputBlock = { set: { '$.url': 'task.url + "/" + urlEncode(input.customerId)' } };
const outputBlock = { select: '$.body.customer', set: { '$.fetchedAt': 'now' } };

const phaseB = [
  ['cacheAside', 'no source mapping (unchanged)', cacheAsideDoc({}), true],
  ['cacheAside', 'sourceMapping only (unchanged)', cacheAsideDoc({ sourceMapping: script }), true],
  ['cacheAside', 'sourceInput only', cacheAsideDoc({ sourceInput: inputBlock }), true],
  ['cacheAside', 'sourceOutput only', cacheAsideDoc({ sourceOutput: outputBlock }), true],
  ['cacheAside', 'sourceInput and sourceOutput', cacheAsideDoc({ sourceInput: inputBlock, sourceOutput: outputBlock }), true],
  ['cacheAside', 'sourceMapping and sourceInput', cacheAsideDoc({ sourceMapping: script, sourceInput: inputBlock }), false],
  ['cacheAside', 'sourceMapping and sourceOutput', cacheAsideDoc({ sourceMapping: script, sourceOutput: outputBlock }), false],
  ['cacheAside', 'empty sourceOutput', cacheAsideDoc({ sourceOutput: {} }), false],
  ['cacheAside', 'sourceInput select without into', cacheAsideDoc({ sourceInput: { select: '$.data' } }), false],
  ['agent tool', 'mapping only (unchanged)', agentDoc({ mapping: script }), true],
  ['agent tool', 'no mapping (unchanged)', agentDoc({}), true],
  ['agent tool', 'input only', agentDoc({ input: inputBlock }), true],
  ['agent tool', 'output only', agentDoc({ output: outputBlock }), true],
  ['agent tool', 'input and output', agentDoc({ input: inputBlock, output: outputBlock }), true],
  ['agent tool', 'mapping and input', agentDoc({ mapping: script, input: inputBlock }), false],
  ['agent tool', 'mapping and output', agentDoc({ mapping: script, output: outputBlock }), false],
  ['agent tool', 'output into root', agentDoc({ output: { into: '$' } }), false]
];
for (const [surface, name, doc, expected] of phaseB) {
  checked++;
  const validate = surface === 'cacheAside' ? validateTask : validateAgent;
  if (validate(doc) !== expected) {
    failures.push(`${surface} / ${name}: expected ${expected ? 'valid' : 'invalid'}, got ${expected ? JSON.stringify(validate.errors) : 'valid'}`);
  }
}

// --- Phase A: Dynamic Expresso in value slots (timer, workflow timeout and subflow timeout override) ---
const expr = code => ({ location: 'dynamicExpresso', encoding: 'NAT', code });
const timedDoc = () => {
  const doc = workflowDoc(bind({ mapping: script }));
  const timeout = {
    key: 'expired', target: 'end', versionStrategy: 'Minor', timer: { reset: 'N', duration: 'PT1H' },
    mapping: expr('now.AddHours(2)')
  };
  doc.attributes.timeout = timeout;
  doc.attributes.states[0].transitions.push({
    key: 'auto-timer', target: 'end', triggerType: 2, versionStrategy: 'Minor', labels: labels('Timer'),
    timer: expr('TimeSpan.FromMinutes(15)')
  });
  doc.attributes.states.splice(1, 0, {
    key: 'child', stateType: 4, versionStrategy: 'Minor', labels: labels('Child'),
    subFlow: {
      type: 'S', process: { key: 'child-flow', domain: 'test', flow: 'sys-flows', version: '1.0.0' }, mapping: script,
      overrides: { timeout: { ...timeout, mapping: expr('"PT15M"') } }
    },
    transitions: [{ key: 'child-done', target: 'end', triggerType: 1, versionStrategy: 'Minor', labels: labels('Done') }]
  });
  return doc;
};
checked++;
if (!validateWorkflow(timedDoc())) {
  failures.push(`workflow / dynamicExpresso timer + timeout mappings: expected valid, got ${JSON.stringify(validateWorkflow.errors)}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  console.error(`\n❌ ${failures.length} of ${checked} declarative mapping checks failed`);
  process.exit(1);
}
console.log(`🎉 All ${checked} declarative task mapping documents behaved as expected!`);
