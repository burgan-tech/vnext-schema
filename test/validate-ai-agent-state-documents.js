/**
 * Document-level tests for workflow-definition.schema.json - AI Agent state (stateType 6) and the
 * optional transition `description`.
 *
 * An AiAgent state must carry an `agent` block (agent reference, prompt, output path, decision with
 * a fallback); no other state type may. `description` is accepted on every transition shape,
 * including the closed start/cancel/exit/updateData shapes and shared transitions. Candidate
 * counts, reserved exits and hints keys are the runtime's checks and are not asserted here.
 */

const Ajv2019 = require('ajv/dist/2019');

const schema = require('../schemas/workflow-definition.schema.json');

const VERSION = '1.0.0';
const labels = label => [{ language: 'en', label }];
const agentRef = key => ({ key, domain: 'core', flow: 'sys-agents', version: VERSION });
const auto = (key, target, extra = {}) => ({
  key, target, triggerType: 1, versionStrategy: 'Minor', labels: labels(key), ...extra
});

const binding = (overrides = {}) => ({
  agent: agentRef('triage-agent'),
  prompt: { template: '<message>{{ data.message }}</message>' },
  output: { path: '$.triage' },
  decision: { mode: 'model', fallback: 'classify-failed' },
  ...overrides
});

/** A flow with one AiAgent state; `state` and `attributes` overrides are merged in. */
const doc = ({ state = {}, attributes = {} } = {}) => ({
  key: 'ai-agent-flow', domain: 'core', flow: 'sys-flows', flowVersion: VERSION, version: VERSION, tags: ['ai-agent'],
  attributes: {
    type: 'F', labels: labels('AI agent flow'),
    startTransition: { key: 'start', target: 'classifying', triggerType: 0, versionStrategy: 'Minor', labels: labels('Start') },
    states: [
      {
        key: 'classifying', stateType: 6, subType: 5, versionStrategy: 'Minor', labels: labels('Classifying'),
        agent: binding(),
        transitions: [
          auto('is-question', 'done', { description: 'The customer asks for information.' }),
          auto('is-fraud', 'done'),
          auto('classify-failed', 'done')
        ],
        ...state
      },
      { key: 'done', stateType: 3, subType: 1, versionStrategy: 'Minor', labels: labels('Done') }
    ],
    ...attributes
  }
});

/** The default document with one binding member replaced (or removed with undefined). */
const withBinding = overrides => doc({ state: { agent: binding(overrides) } });

const cases = [];
const expectValid = (name, document) => cases.push({ name, document, valid: true });
const expectInvalid = (name, document) => cases.push({ name, document, valid: false });

// --- valid: the agent block ---
expectValid('minimal AiAgent state', doc());
expectValid('sub type None', doc({ state: { subType: 0 } }));
expectValid('sub type omitted', doc({ state: { subType: undefined } }));
expectValid('full Faz 1 agent block', withBinding({
  memory: { mode: 'flow', maxMessages: 20, retentionDays: 1 },
  tools: { exclude: ['days_since'] },
  decision: {
    mode: 'model', fallback: 'classify-failed', onExhausted: 'too-many',
    hints: { 'is-fraud': 'The customer reports fraud.' }, exclude: [], hintsMapping: null, mapping: null
  },
  policy: { timeoutSeconds: 30, maxEntries: 2 }
}));
expectValid('prompt as a C# mapping', withBinding({ prompt: { location: './src/Prompt.csx', code: 'cmV0dXJuICIiOw==' } }));
expectValid('prompt seed messages and data context', withBinding({
  prompt: {
    template: '<message>{{ data.message }}</message>',
    messages: [
      { role: 'system', content: 'Answer in JSON.' },
      { role: 'user', content: 'Example: my card is lost' },
      { role: 'assistant', content: '{"category":"question"}' }
    ],
    context: { customer: 'data.customer', amount: 'body.amount', instanceKey: 'instance.key' }
  }
}));
expectValid('rules decision', withBinding({ decision: { mode: 'rules', fallback: 'classify-failed' } }));
expectValid('script decision with mapping', withBinding({
  decision: { mode: 'script', fallback: 'classify-failed', mapping: { location: './src/Decide.csx', code: 'cmV0dXJuIG51bGw7' } }
}));
expectValid('approval exit', withBinding({ decision: { fallback: 'classify-failed', onApprovalRequest: 'is-fraud' } }));
for (const mode of ['sequential', 'concurrent', 'handoff']) {
  expectValid(`team mode ${mode}`, withBinding({
    mode,
    agents: [
      { name: 'cards', agent: agentRef('cards-agent'), description: 'Card issues.' },
      { name: 'loans', agent: agentRef('loans-agent') }
    ]
  }));
}
expectValid('explicit single mode', withBinding({ mode: 'single' }));
expectValid('memory compaction on the state', withBinding({ memory: { compaction: 'summarize' } }));
expectValid('memory key on the state without mode (component sets it)', withBinding({ memory: { key: '{{ data.id }}' } }));
expectValid('agent: null on a non-agent state', doc({
  attributes: {
    states: [
      { key: 'classifying', stateType: 2, versionStrategy: 'Minor', labels: labels('Classifying'), agent: null, transitions: [auto('go', 'done')] },
      { key: 'done', stateType: 3, versionStrategy: 'Minor', labels: labels('Done') }
    ]
  }
}));

// --- valid: transition description on every shape ---
const describe = text => ({ description: text });
expectValid('description on start, cancel, exit, updateData and shared transitions', doc({
  attributes: {
    startTransition: { key: 'start', target: 'classifying', triggerType: 0, versionStrategy: 'Minor', labels: labels('Start'), ...describe('Starts it.') },
    cancel: { key: 'cancel', target: 'done', triggerType: 0, versionStrategy: 'Minor', labels: labels('Cancel'), ...describe('Cancels it.') },
    exit: { key: 'exit', target: 'done', triggerType: 0, versionStrategy: 'Minor', labels: labels('Exit'), ...describe('Exits it.') },
    updateData: { key: 'update-data', target: '$self', triggerType: 0, versionStrategy: 'Minor', labels: labels('Update'), ...describe('Updates data.') },
    sharedTransitions: [
      { key: 'escalate', target: 'done', triggerType: 0, versionStrategy: 'Minor', labels: labels('Escalate'), availableIn: ['classifying'], ...describe('Escalates.') }
    ]
  }
}));

// --- invalid ---
expectInvalid('AiAgent state without agent block', doc({ state: { agent: undefined } }));
expectInvalid('AiAgent state with agent: null', doc({ state: { agent: null } }));
expectInvalid('agent block on an Intermediate state', doc({ state: { stateType: 2 } }));
expectInvalid('AiAgent state with sub type Human', doc({ state: { subType: 6 } }));
expectInvalid('AiAgent state with a subFlow', doc({
  state: { subFlow: { type: 'S', process: { key: 'child', domain: 'core', flow: 'sys-flows', version: VERSION } } }
}));
for (const required of ['agent', 'prompt', 'output', 'decision']) {
  expectInvalid(`agent block without ${required}`, withBinding({ [required]: undefined }));
}
expectInvalid('decision without fallback', withBinding({ decision: { mode: 'model' } }));
expectInvalid('blank fallback', withBinding({ decision: { fallback: ' ' } }));
expectInvalid('unknown decision mode', withBinding({ decision: { mode: 'llm', fallback: 'classify-failed' } }));
expectInvalid('script decision without mapping', withBinding({ decision: { mode: 'script', fallback: 'classify-failed' } }));
expectInvalid('empty prompt', withBinding({ prompt: {} }));
expectInvalid('blank prompt template', withBinding({ prompt: { template: '  ' } }));
expectInvalid('seed message with unknown role', withBinding({
  prompt: { template: 'x', messages: [{ role: 'tool', content: 'x' }] }
}));
expectInvalid('seed message without content', withBinding({ prompt: { template: 'x', messages: [{ role: 'user' }] } }));
expectInvalid('context path outside data/body/instance', withBinding({ prompt: { template: 'x', context: { customer: 'headers.user' } } }));
expectInvalid('context name with a dot', withBinding({ prompt: { template: 'x', context: { 'customer.name': 'data.customer' } } }));
expectInvalid('output path not starting with $.', withBinding({ output: { path: 'triage' } }));
expectInvalid('team mode without agents', withBinding({ mode: 'handoff' }));
expectInvalid('team mode with empty agents', withBinding({ mode: 'concurrent', agents: [] }));
expectInvalid('agents without a team mode', withBinding({ agents: [{ name: 'cards', agent: agentRef('cards-agent') }] }));
expectInvalid('unknown team mode', withBinding({ mode: 'parallel', agents: [{ name: 'cards', agent: agentRef('cards-agent') }] }));
expectInvalid('participant name with a space', withBinding({ mode: 'sequential', agents: [{ name: 'card team', agent: agentRef('cards-agent') }] }));
expectInvalid('participant without agent', withBinding({ mode: 'sequential', agents: [{ name: 'cards' }] }));
expectInvalid('unknown memory compaction', withBinding({ memory: { compaction: 'drop' } }));
expectInvalid('policy maxEntries 0', withBinding({ policy: { maxEntries: 0 } }));
expectInvalid('unknown agent block member', withBinding({ provider: 'bank-llm' }));
expectInvalid('stateType 7', doc({ state: { stateType: 7 } }));
expectInvalid('description not a string', doc({
  attributes: { startTransition: { key: 'start', target: 'classifying', triggerType: 0, versionStrategy: 'Minor', labels: labels('Start'), description: 42 } }
}));

function run() {
  console.log('🔍 AI Agent state document validation starting...\n');

  const validate = new Ajv2019({ strict: false, allErrors: true }).compile(schema);

  let failures = 0;
  for (const { name, document, valid } of cases) {
    if (validate(JSON.parse(JSON.stringify(document))) === valid) {
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
    console.log(`🎉 All ${cases.length} AI Agent state documents behaved as expected!`);
    process.exit(0);
  }
  console.log(`💥 ${failures} of ${cases.length} AI Agent state documents misbehaved.`);
  process.exit(1);
}

run();
