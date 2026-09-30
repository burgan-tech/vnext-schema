const assert = require('assert');
const Ajv2019 = require('ajv/dist/2019');

const schema = require('../schemas/workflow-definition.schema.json');
const validate = new Ajv2019({ strict: false, allErrors: true }).compile(schema);
const labels = label => [{ language: 'en', label }];
const script = code => ({ type: 'L', encoding: 'NAT', code });
const boundary = () => ({ onError: [{ action: 2, transition: 'recover' }] });

// Complete workflow documents exercise the shared transition's combined allOf rules.
// Validating definitions.availableIn alone would miss the conflicting null-only branch.
const document = (triggerType = 0, scope = 'global') => {
  const transition = {
    key: 'recover', target: 'failed', triggerType, versionStrategy: 'Minor', labels: labels('Recover')
  };
  if (triggerType === 2) transition.timer = script('return TimeSpan.FromMinutes(1);');
  if (triggerType === 3) transition.event = { mapping: script('return new EventMappingResult();') };

  const attributes = {
    type: 'F', labels: labels('Recovery'),
    startTransition: {
      key: 'start', target: 'processing', triggerType: 0, versionStrategy: 'Minor', labels: labels('Start')
    },
    states: [
      { key: 'processing', stateType: 1, versionStrategy: 'Minor', labels: labels('Processing') },
      { key: 'review', stateType: 2, versionStrategy: 'Minor', labels: labels('Review') },
      { key: 'failed', stateType: 3, versionStrategy: 'Minor', labels: labels('Failed') }
    ],
    sharedTransitions: [transition]
  };
  if (scope === 'global') attributes.errorBoundary = boundary();
  if (scope === 'state') attributes.states[0].errorBoundary = boundary();
  if (scope === 'task') attributes.states[0].onEntries = [{
    order: 1,
    task: { key: 'work', domain: 'test', flow: 'sys-tasks', version: '1.0.0' },
    mapping: script('return null;'), errorBoundary: boundary()
  }];
  if (scope === 'timeout') attributes.errorBoundary = { onTimeout: { action: 2, transition: 'failed' } };

  return {
    key: 'recovery', domain: 'test', flow: 'sys-flows', flowVersion: '1.0.0',
    version: '1.0.0', tags: [], attributes
  };
};

const validForms = [
  ['omitted', undefined], ['null', null], ['empty', []], ['strings', ['review']],
  ['objects', [{ state: 'review', roles: [{ role: 'test.reviewer', grant: 'allow' }] }]],
  ['mixed', ['processing', { state: 'review', roles: [{ role: 'test.reviewer', grant: 'deny' }] }]]
];
const invalidForms = [
  42, 'review', {}, [null], [42], [{}], [{ state: 42 }], ['Invalid State'],
  [{ state: 'review', roles: [{ role: 'test.reviewer', grant: 'invalid' }] }],
  [{ state: 'review', unexpected: true }]
];
let checked = 0;
const failures = [];
const check = (name, input, expected, errorPath) => {
  const actual = validate(input);
  checked++;
  if (actual !== expected || (!expected && !validate.errors.some(error => error.instancePath.startsWith(errorPath)))) {
    failures.push(`${name}: expected ${expected}, got ${actual}: ${JSON.stringify(validate.errors)}`);
  }
};

// An error-boundary reference never changes the allowed shape of the referenced transition.
for (const trigger of [0, 2, 3]) {
  for (const scope of ['none', 'global', 'state', 'task', 'timeout']) {
    for (const [name, availableIn] of validForms) {
      const input = document(trigger, scope);
      if (availableIn !== undefined) input.attributes.sharedTransitions[0].availableIn = availableIn;
      check(`shared ${trigger}, ${scope}, ${name}`, input, true);
    }
  }
  for (const availableIn of invalidForms) {
    const input = document(trigger);
    input.attributes.sharedTransitions[0].availableIn = availableIn;
    check(`shared ${trigger}, malformed availableIn ${JSON.stringify(availableIn)}`, input, false,
      '/attributes/sharedTransitions/0/availableIn');
  }
}

// The shared definition also governs these manual workflow-level transitions.
for (const kind of ['cancel', 'exit', 'updateData']) {
  for (const [name, availableIn] of validForms) {
    const input = document();
    const transition = input.attributes.sharedTransitions.pop();
    if (kind === 'updateData') transition.target = '$self';
    if (availableIn !== undefined) transition.availableIn = availableIn;
    input.attributes[kind] = transition;
    check(`${kind}, ${name}`, input, true);
  }
  for (const availableIn of invalidForms) {
    const input = document();
    const transition = input.attributes.sharedTransitions.pop();
    if (kind === 'updateData') transition.target = '$self';
    transition.availableIn = availableIn;
    input.attributes[kind] = transition;
    check(`${kind}, malformed availableIn ${JSON.stringify(availableIn)}`, input, false,
      `/attributes/${kind}/availableIn`);
  }
}

// Availability changes must not relax the other trigger-specific requirements.
for (const [name, trigger, mutate, errorPath] of [
  ['scheduled requires timer', 2, transition => { delete transition.timer; }, '/attributes/sharedTransitions/0'],
  ['scheduled rejects null timer', 2, transition => { transition.timer = null; }, '/attributes/sharedTransitions/0/timer'],
  ['event requires mapping', 3, transition => { delete transition.event; }, '/attributes/sharedTransitions/0'],
  ['event rejects empty mapping', 3, transition => { transition.event = {}; }, '/attributes/sharedTransitions/0/event'],
  ['manual rejects timer', 0, transition => { transition.timer = script('return null;'); }, '/attributes/sharedTransitions/0/timer'],
  ['event rejects timer', 3, transition => { transition.timer = script('return null;'); }, '/attributes/sharedTransitions/0/timer']
]) {
  const input = document(trigger);
  input.attributes.sharedTransitions[0].availableIn = ['review'];
  mutate(input.attributes.sharedTransitions[0]);
  check(name, input, false, errorPath);
}

const inlineTransition = document();
inlineTransition.attributes.errorBoundary.onError[0].transition = { key: 'recover', availableIn: ['review'] };
check('boundary transition remains a string reference', inlineTransition, false,
  '/attributes/errorBoundary/onError/0/transition');

// executionType (vnext#1003): optional S/A on flow, shared/state transitions and startTransition.
for (const value of ['S', 'A']) {
  const flow = document(); flow.attributes.executionType = value;
  check(`flow executionType ${value}`, flow, true);
  const shared = document(); shared.attributes.sharedTransitions[0].executionType = value;
  check(`shared transition executionType ${value}`, shared, true);
  const start = document(); start.attributes.startTransition.executionType = value;
  check(`start transition executionType ${value}`, start, true);
}
// Absent is fine (non-breaking) — the base document() carries no executionType anywhere.
check('executionType omitted everywhere', document(), true);
// Only the two upper-case codes S and A are accepted (the old SYNC/ASYNC are no longer valid).
for (const [name, bad] of [['lower-case', 's'], ['old-code-sync', 'SYNC'], ['old-code-async', 'ASYNC'], ['unknown', 'BACKGROUND'], ['wrong-type', true], ['null', null]]) {
  const flow = document(); flow.attributes.executionType = bad;
  check(`flow executionType rejects ${name}`, flow, false, '/attributes/executionType');
  const shared = document(); shared.attributes.sharedTransitions[0].executionType = bad;
  check(`shared executionType rejects ${name}`, shared, false, '/attributes/sharedTransitions/0/executionType');
}

// arrayMerge (vnext-client-sdk-core#58): optional R/M on every transition shape that can write a
// body — state and shared transitions, startTransition, and the three well-known transitions. It is
// deliberately NOT a flow-level setting: the two values are opposite data-retention trade-offs, so
// the choice belongs to the transition whose body is being merged, not to the whole workflow.
const wellKnown = (kind, key) => {
  const input = document();
  input.attributes[kind] = {
    key, target: kind === 'updateData' ? '$self' : 'failed',
    triggerType: 0, versionStrategy: 'Minor', labels: labels(key)
  };
  return input;
};

for (const value of ['R', 'M']) {
  const shared = document(); shared.attributes.sharedTransitions[0].arrayMerge = value;
  check(`shared transition arrayMerge ${value}`, shared, true);

  const state = document();
  state.attributes.states[1].transitions = [{
    key: 'advance', target: 'failed', triggerType: 0, versionStrategy: 'Minor',
    labels: labels('Advance'), arrayMerge: value
  }];
  check(`state transition arrayMerge ${value}`, state, true);

  const start = document(); start.attributes.startTransition.arrayMerge = value;
  check(`start transition arrayMerge ${value}`, start, true);

  for (const [kind, key] of [['cancel', 'cancel'], ['exit', 'exit'], ['updateData', 'update-data']]) {
    const input = wellKnown(kind, key);
    input.attributes[kind].arrayMerge = value;
    check(`${kind} transition arrayMerge ${value}`, input, true);
  }
}

// Absent is the non-breaking default — the base document carries no arrayMerge anywhere.
check('arrayMerge omitted everywhere', document(), true);

// Only the two upper-case codes are accepted. Rejecting the descriptive spellings matters: a value
// that validated but did not resolve would silently keep the replace behaviour the author was trying
// to move away from, and the data loss would look like a runtime bug rather than a typo.
for (const [name, bad] of [
  ['lower-case', 'm'], ['description-merge', 'merge'], ['description-replace', 'REPLACE'],
  ['unknown', 'X'], ['wrong-type', true], ['null', null]
]) {
  const shared = document(); shared.attributes.sharedTransitions[0].arrayMerge = bad;
  check(`shared arrayMerge rejects ${name}`, shared, false, '/attributes/sharedTransitions/0/arrayMerge');

  const start = document(); start.attributes.startTransition.arrayMerge = bad;
  check(`start arrayMerge rejects ${name}`, start, false, '/attributes/startTransition/arrayMerge');

  const updateData = wellKnown('updateData', 'update-data');
  updateData.attributes.updateData.arrayMerge = bad;
  check(`updateData arrayMerge rejects ${name}`, updateData, false, '/attributes/updateData/arrayMerge');
}

// KNOWN GAP, pinned deliberately: arrayMerge is a TRANSITION setting, but the workflow root does
// not set additionalProperties:false, so a flow-level `arrayMerge` validates and then does nothing
// at runtime. Asserting the real behaviour rather than the desired one keeps the gap visible — if
// the root is ever closed, this case flips and says so. Closing it is a separate change: it would
// reject every other stray root property too, which is a breaking validation change for domains.
const flowLevel = document(); flowLevel.attributes.arrayMerge = 'M';
check('flow-level arrayMerge is silently accepted (open root object)', flowLevel, true);

assert.strictEqual(failures.length, 0, failures.join('\n'));
console.log(`${checked} workflow availableIn document cases passed.`);
