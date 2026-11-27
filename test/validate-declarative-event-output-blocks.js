/**
 * Document-level tests for declarative event and output blocks (runtime phase C2).
 *
 * - Workflow `event` and transition `event`: `mapping` (script) XOR `input` (declarative block).
 * - Workflow `attributes.output` and function `output`: a script (location/code) XOR a declarative
 *   block (select/into/set); a mixed object is invalid; null stays allowed on the workflow output.
 * Expression semantics (e.g. "user is not readable in a function output") are publish-time rules and
 * are not encoded here.
 */
const Ajv2019 = require('ajv/dist/2019');
const Ajv = require('ajv');
const workflowSchema = require('../schemas/workflow-definition.schema.json');
const functionSchema = require('../schemas/function-definition.schema.json');

const validateWorkflow = new Ajv2019({ strict: false, allErrors: true, validateFormats: false }).compile(workflowSchema);
const validateFunction = new Ajv({ strict: false, allErrors: true }).compile(functionSchema);

const labels = label => [{ language: 'en', label }];
const base = { versionStrategy: 'Minor', labels: labels('X') };
const script = { location: './src/Map.csx', code: 'cmV0dXJuIG51bGw7' };
const evInput = { set: { '$.key': 'input.id', '$.attributes.amount': 'input.amount' } };
const evSelect = { select: '$.input.id', into: '$.key' };
const outBlock = { select: '$.data.customer', into: '$.data' };
const outSet = { set: { '$.statusCode': '201', '$.headers.x-trace': 'context.traceId' } };

const wf = ({ output, event, transitionEvent } = {}) => ({
  key: 'kyc', domain: 'test', flow: 'sys-flows', flowVersion: '1.0.0', version: '1.0.0', tags: ['test'],
  attributes: {
    type: 'F', labels: labels('KYC'),
    ...(output !== undefined ? { output } : {}),
    ...(event !== undefined ? { event } : {}),
    startTransition: { key: 'start', target: 'check', triggerType: 0, ...base },
    states: [
      {
        key: 'check', stateType: 1, ...base,
        transitions: [{
          key: 'done', target: 'end', triggerType: transitionEvent !== undefined ? 3 : 0, ...base,
          ...(transitionEvent !== undefined ? { event: transitionEvent } : {})
        }]
      },
      { key: 'end', stateType: 3, ...base }
    ]
  }
});

const fn = output => ({
  key: 'my-fn', version: '1.0.0', domain: 'test', flow: 'sys-functions', flowVersion: '1.0.0', tags: ['function'],
  attributes: {
    scope: 'D',
    task: { order: 1, task: { key: 't', domain: 'test', flow: 'sys-tasks', version: '1.0.0' }, mapping: script },
    ...(output !== undefined ? { output } : {})
  }
});

const W = validateWorkflow, F = validateFunction;
const cases = [
  // event
  [W, 'workflow event mapping (unchanged)', true, wf({ event: { mapping: script } })],
  [W, 'workflow event input set', true, wf({ event: { input: evInput } })],
  [W, 'workflow event input select/into', true, wf({ event: { input: evSelect } })],
  [W, 'workflow event null', true, wf({ event: null })],
  [W, 'workflow event mapping + input', false, wf({ event: { mapping: script, input: evInput } })],
  [W, 'workflow event neither', false, wf({ event: {} })],
  [W, 'workflow event input empty', false, wf({ event: { input: {} } })],
  [W, 'workflow event input select without into', false, wf({ event: { input: { select: '$.input.id' } } })],
  [W, 'workflow event input into without select', false, wf({ event: { input: { into: '$.key' } } })],
  [W, 'workflow event input unknown member', false, wf({ event: { input: { ...evInput, code: 'x' } } })],
  [W, 'transition event mapping (unchanged)', true, wf({ transitionEvent: { mapping: script } })],
  [W, 'transition event input', true, wf({ transitionEvent: { input: evInput } })],
  [W, 'transition event mapping + input', false, wf({ transitionEvent: { mapping: script, input: evInput } })],
  [W, 'transition event neither', false, wf({ transitionEvent: {} })],
  // workflow output
  [W, 'workflow output script (unchanged)', true, wf({ output: script })],
  [W, 'workflow output null', true, wf({ output: null })],
  [W, 'workflow output select/into', true, wf({ output: outBlock })],
  [W, 'workflow output set', true, wf({ output: outSet })],
  [W, 'workflow output select/into + set', true, wf({ output: { ...outBlock, ...outSet } })],
  [W, 'workflow output script + select', false, wf({ output: { ...script, select: '$.data.a' } })],
  [W, 'workflow output script + set', false, wf({ output: { ...script, ...outSet } })],
  [W, 'workflow output location + into', false, wf({ output: { location: './a.csx', into: '$.data' } })],
  [W, 'workflow output select without into', false, wf({ output: { select: '$.data.a' } })],
  [W, 'workflow output into without select', false, wf({ output: { into: '$.data' } })],
  [W, 'workflow output into root', false, wf({ output: { select: '$.data', into: '$' } })],
  [W, 'workflow output empty set', false, wf({ output: { set: {} } })],
  // function output
  [F, 'function output script (unchanged)', true, fn(script)],
  [F, 'function output absent', true, fn()],
  [F, 'function output select/into', true, fn({ select: '$.result.lookup.body', into: '$.data' })],
  [F, 'function output set', true, fn(outSet)],
  [F, 'function output select/into + set', true, fn({ ...outBlock, ...outSet })],
  [F, 'function output script + select', false, fn({ ...script, select: '$.result.a.body' })],
  [F, 'function output script + set', false, fn({ ...script, ...outSet })],
  [F, 'function output location + into', false, fn({ location: './a.csx', into: '$.data' })],
  [F, 'function output select without into', false, fn({ select: '$.result.a.body' })],
  [F, 'function output into without select', false, fn({ into: '$.data' })],
  [F, 'function output into root', false, fn({ select: '$.result.a.body', into: '$' })],
  [F, 'function output empty', false, fn({})]
];

const failures = [];
for (const [validate, name, expected, document] of cases) {
  const ok = validate(document);
  if (ok !== expected) failures.push(`${name}: expected ${expected ? 'valid' : 'invalid'}, got ${ok ? 'valid' : 'invalid ' + JSON.stringify((validate.errors || []).slice(0, 3))}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  console.error(`\n❌ ${failures.length} of ${cases.length} declarative event/output checks failed`);
  process.exit(1);
}
console.log(`🎉 All ${cases.length} declarative event/output documents behaved as expected!`);
