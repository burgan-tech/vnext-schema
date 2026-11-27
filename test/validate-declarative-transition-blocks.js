/**
 * Document-level tests for declarative blocks on transitions and SubFlow states (runtime phase C1).
 *
 * - A transition (state transitions, startTransition, sharedTransitions, cancel / updateData / exit) may
 *   carry `output` instead of `mapping`; both together are invalid. Transitions have no `input`.
 * - A state's `subFlow` may carry `input` and/or `output` instead of `mapping`; `mapping` is no longer
 *   required when a block is present, but is exclusive with them.
 */
const Ajv2019 = require('ajv/dist/2019');
const workflowSchema = require('../schemas/workflow-definition.schema.json');

const validate = new Ajv2019({ strict: false, allErrors: true, validateFormats: false }).compile(workflowSchema);

const labels = label => [{ language: 'en', label }];
const script = { location: './src/Map.csx', code: 'cmV0dXJuIG51bGw7' };
const out = { select: '$.data.score', into: '$.kyc.score' };
const inp = { set: { '$.attributes.customerId': 'data.customer.id' } };
const base = { versionStrategy: 'Minor', labels: labels('X') };
const processRef = { key: 'child', domain: 'test', flow: 'sys-flows', version: '1.0.0' };

const doc = ({ start, state, shared, wk } = {}) => ({
  key: 'kyc', domain: 'test', flow: 'sys-flows', flowVersion: '1.0.0', version: '1.0.0', tags: ['test'],
  attributes: {
    type: 'F', labels: labels('KYC'),
    startTransition: { key: 'start', target: 'check', triggerType: 0, ...base, ...start },
    sharedTransitions: shared ? [{ key: 'sh', target: 'end', triggerType: 0, availableIn: ['check'], ...base, ...shared }] : undefined,
    ...(wk || {}),
    states: [
      {
        key: 'check', stateType: 1, ...base,
        transitions: [{ key: 'done', target: 'end', triggerType: 0, ...base, ...state }]
      },
      { key: 'end', stateType: 3, ...base }
    ]
  }
});
const subflowDoc = sub => {
  const d = doc();
  d.attributes.states.splice(1, 0, {
    key: 'child', stateType: 4, ...base,
    subFlow: { type: 'S', process: processRef, ...sub },
    transitions: [{ key: 'back', target: 'end', triggerType: 1, ...base }]
  });
  return d;
};
const wellKnown = (name, extra) => doc({ wk: { [name]: { key: name === 'updateData' ? 'update-data' : name, target: '$self', triggerType: 0, ...base, ...extra } } });

const cases = [
  // transition output
  ['transition output', true, doc({ state: { output: out } })],
  ['transition output set only', true, doc({ state: { output: { set: { '$.a': '1' } } } })],
  ['transition mapping only (unchanged)', true, doc({ state: { mapping: script } })],
  ['transition null mapping + output', true, doc({ state: { mapping: null, output: out } })],
  ['startTransition output', true, doc({ start: { output: out } })],
  ['sharedTransition output', true, doc({ shared: { output: out } })],
  ['cancel output', true, wellKnown('cancel', { output: out })],
  ['updateData output', true, wellKnown('updateData', { output: out })],
  ['exit output', true, wellKnown('exit', { output: out })],
  ['transition mapping + output', false, doc({ state: { mapping: script, output: out } })],
  ['startTransition mapping + output', false, doc({ start: { mapping: script, output: out } })],
  ['sharedTransition mapping + output', false, doc({ shared: { mapping: script, output: out } })],
  ['cancel mapping + output', false, wellKnown('cancel', { mapping: script, output: out })],
  ['updateData mapping + output', false, wellKnown('updateData', { mapping: script, output: out })],
  ['exit mapping + output', false, wellKnown('exit', { mapping: script, output: out })],
  ['transition empty output', false, doc({ state: { output: {} } })],
  ['startTransition input is not a member', false, doc({ start: { input: inp } })],
  // automatic and scheduled transitions take no output (the runtime rejects it at publish)
  ['automatic transition output', false, doc({ state: { triggerType: 1, rule: script, output: out } })],
  ['automatic default transition output', false, doc({ state: { triggerType: 1, triggerKind: 10, output: out } })],
  ['scheduled transition output', false, doc({ state: { triggerType: 2, timer: script, output: out } })],
  ['scheduled sharedTransition output', false, doc({ shared: { triggerType: 2, timer: script, output: out } })],
  ['automatic transition without output (control)', true, doc({ state: { triggerType: 1, rule: script } })],
  ['automatic default transition without output (control)', true, doc({ state: { triggerType: 1, triggerKind: 10 } })],
  ['scheduled transition without output (control)', true, doc({ state: { triggerType: 2, timer: script } })],
  ['scheduled sharedTransition without output (control)', true, doc({ shared: { triggerType: 2, timer: script } })],
  // subFlow blocks
  ['subFlow mapping only (unchanged)', true, subflowDoc({ mapping: script })],
  ['subFlow input + output, no mapping', true, subflowDoc({ input: inp, output: out })],
  ['subFlow input only', true, subflowDoc({ input: inp })],
  ['subFlow output only', true, subflowDoc({ output: out })],
  ['subFlow mapping + input', false, subflowDoc({ mapping: script, input: inp })],
  ['subFlow mapping + output', false, subflowDoc({ mapping: script, output: out })],
  ['subFlow neither mapping nor blocks', false, subflowDoc({})],
  ['subFlow empty input', false, subflowDoc({ input: {} })],
  ['subFlow null mapping + input (null counts as absent)', true, subflowDoc({ mapping: null, input: inp })],
  ['subFlow null mapping + output (null counts as absent)', true, subflowDoc({ mapping: null, output: out })],
  ['subFlow null mapping only', false, subflowDoc({ mapping: null })]
];

const failures = [];
for (const [name, expected, document] of cases) {
  const ok = validate(document);
  if (ok !== expected) failures.push(`${name}: expected ${expected ? 'valid' : 'invalid'}, got ${ok ? 'valid' : 'invalid ' + JSON.stringify(validate.errors.slice(0, 3))}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  console.error(`\n❌ ${failures.length} of ${cases.length} declarative transition/subFlow checks failed`);
  process.exit(1);
}
console.log(`🎉 All ${cases.length} declarative transition/subFlow documents behaved as expected!`);
