/**
 * Document-level tests for agent-definition.schema.json - the sys-agents component.
 *
 * An agent names a provider profile (never an endpoint or a key), carries instructions, an object
 * output schema and a policy, and may define inline tools: kind 1 runs a sys-tasks component,
 * kind 2 a script, kind 3 exposes the allowed tools of an MCP task. Tool-name uniqueness and the
 * environment ceilings are checked by the runtime at publish, not here.
 */

const path = require('path');
const Ajv = require('ajv');

const schema = require(path.join(__dirname, '../schemas/agent-definition.schema.json'));

const VERSION = '1.0.0';
const DOMAIN = 'core';

const ref = (key, flow = 'sys-tasks') => ({ key, domain: DOMAIN, flow, version: VERSION });
const objectSchema = properties => ({ type: 'object', properties, required: Object.keys(properties) });

const taskTool = (overrides = {}) => ({
  kind: 1,
  name: 'get_customer',
  description: 'Customer by id.',
  parameters: objectSchema({ customerId: { type: 'string' } }),
  binding: { task: ref('get-customer'), mapping: { location: './src/GetCustomerTool.csx', code: 'cmV0dXJuIG51bGw7' } },
  ...overrides
});
const scriptTool = (overrides = {}) => ({
  kind: 2,
  name: 'days_since',
  description: 'Days since an ISO date.',
  parameters: objectSchema({ date: { type: 'string' } }),
  binding: { code: { location: 'dynamicExpresso', encoding: 'NAT', code: '(now - DateTime.Parse(args.date)).TotalDays' } },
  ...overrides
});
const mcpTool = (binding = {}) => ({
  kind: 3,
  binding: { task: ref('crm-mcp'), allow: ['search_customer'], prefix: 'crm_', ...binding }
});

/** A minimal, valid agent document with the given attribute overrides merged in. */
const doc = (attributes = {}) => ({
  key: 'triage-agent',
  version: VERSION,
  domain: DOMAIN,
  flow: 'sys-agents',
  flowVersion: VERSION,
  tags: ['ai-agent'],
  attributes: {
    provider: 'bank-llm',
    instructions: { text: 'You classify customer messages.' },
    output: { schema: objectSchema({ category: { type: 'string' } }) },
    policy: { maxIterations: 6, maxToolCalls: 10, timeoutSeconds: 60 },
    ...attributes
  }
});

/** The same document without one attribute. */
const without = name => {
  const document = doc();
  delete document.attributes[name];
  return document;
};

const cases = [];
const expectValid = (name, document) => cases.push({ name, document, valid: true });
const expectInvalid = (name, document) => cases.push({ name, document, valid: false });

// --- valid ---
expectValid('minimal agent', doc());
expectValid('full agent from the runtime docs', doc({
  runtime: 'maf',
  model: { temperature: 0, maxOutputTokens: 1024, topP: 0.9 },
  tools: [taskTool(), scriptTool(), mcpTool()],
  memory: { mode: 'state', storage: 'local', maxMessages: 40, retentionDays: 30, resetOn: ['agentVersionChange'] },
  policy: {
    maxIterations: 6, maxToolCalls: 10, maxTokens: 30000, timeoutSeconds: 60, toolTimeoutSeconds: 10,
    resultMaxChars: 4000, maxEntries: 3,
    retry: { maxAttempts: 2, backoffMs: 500, on: ['429', '5xx', 'timeout'] },
    onProviderError: 'fallback'
  },
  audit: { transcript: 'summary', persistToolResults: true, redact: ['$.customer.tckn'] }
}));
expectValid('instructions from a packaged file', doc({
  instructions: { location: './src/triage.md', code: 'WW91IGNsYXNzaWZ5Lg==', encoding: 'B64' }
}));
expectValid('instructions as native text', doc({ instructions: { location: './src/triage.md', code: 'You classify.', encoding: 'NAT' } }));
expectValid('tool requiring approval', doc({ tools: [scriptTool({ requiresApproval: true })] }));
expectValid('tool with roles, timeout and result cap', doc({
  tools: [taskTool({ roles: ['core.agent-user'], timeoutSeconds: 5, resultMaxChars: 2000 })]
}));
expectValid('task tool without mapping', doc({ tools: [taskTool({ binding: { task: ref('get-customer') } })] }));
expectValid('script tool with C# handler', doc({
  tools: [scriptTool({ binding: { code: { location: './src/DaysSince.csx', code: 'cmV0dXJuIDE7' } } })]
}));
expectValid('mcp tool without prefix, with discovery cache', doc({ tools: [mcpTool({ prefix: undefined, discoveryCacheMinutes: 5 })] }));
expectValid('memory compaction summarize', doc({ memory: { mode: 'flow', compaction: 'summarize', maxMessages: 20 } }));
expectValid('memory mode key with key', doc({ memory: { mode: 'key', key: '{{ data.customerId }}', storage: 'provider' } }));
expectValid('maxToolCalls 0 disables tools', doc({ policy: { maxToolCalls: 0 } }));
expectValid('empty tools', doc({ tools: [] }));

// --- invalid ---
expectInvalid('wrong flow', { ...doc(), flow: 'sys-tasks' });
for (const required of ['provider', 'instructions', 'output', 'policy']) {
  expectInvalid(`missing ${required}`, without(required));
}
expectInvalid('blank provider', doc({ provider: '  ' }));
expectInvalid('endpoint instead of a provider profile', doc({ endpoint: 'https://llm.internal/v1' }));
expectInvalid('unknown runtime', doc({ runtime: 'semantic-kernel' }));
expectInvalid('empty instructions', doc({ instructions: {} }));
expectInvalid('blank instructions text', doc({ instructions: { text: ' ' } }));
expectInvalid('output schema not an object schema', doc({ output: { schema: { type: 'string' } } }));
expectInvalid('output schema without type', doc({ output: { schema: { properties: {} } } }));
expectInvalid('policy maxIterations 0', doc({ policy: { maxIterations: 0 } }));
expectInvalid('policy negative maxToolCalls', doc({ policy: { maxToolCalls: -1 } }));
expectInvalid('policy retry maxAttempts 6', doc({ policy: { retry: { maxAttempts: 6 } } }));
expectInvalid('policy unknown onProviderError', doc({ policy: { onProviderError: 'ignore' } }));
expectInvalid('unknown memory mode', doc({ memory: { mode: 'session' } }));
expectInvalid('unknown memory compaction', doc({ memory: { compaction: 'drop' } }));
expectInvalid('memory mode key without key', doc({ memory: { mode: 'key' } }));
expectInvalid('memory key without mode key', doc({ memory: { mode: 'state', key: '{{ data.id }}' } }));
expectInvalid('memory maxMessages 0', doc({ memory: { maxMessages: 0 } }));
expectInvalid('unknown audit transcript', doc({ audit: { transcript: 'verbose' } }));
expectInvalid('unknown tool kind', doc({ tools: [taskTool({ kind: 4 })] }));
expectInvalid('tool name with a space', doc({ tools: [scriptTool({ name: 'days since' })] }));
expectInvalid('tool name over 64 characters', doc({ tools: [scriptTool({ name: 'a'.repeat(65) })] }));
expectInvalid('task tool without name', doc({ tools: [taskTool({ name: undefined })] }));
expectInvalid('script tool without description', doc({ tools: [scriptTool({ description: undefined })] }));
expectInvalid('script tool with blank description', doc({ tools: [scriptTool({ description: ' ' })] }));
expectInvalid('task tool without parameters', doc({ tools: [taskTool({ parameters: undefined })] }));
expectInvalid('tool parameters not an object schema', doc({ tools: [scriptTool({ parameters: { type: 'array' } })] }));
expectInvalid('task tool without binding.task', doc({ tools: [taskTool({ binding: {} })] }));
expectInvalid('script tool without binding.code', doc({ tools: [scriptTool({ binding: { task: ref('x') } })] }));
expectInvalid('mcp tool without binding.task', doc({ tools: [mcpTool({ task: undefined })] }));
expectInvalid('mcp tool with empty allow', doc({ tools: [mcpTool({ allow: [] })] }));
expectInvalid('mcp tool without allow', doc({ tools: [mcpTool({ allow: undefined })] }));
expectInvalid('mcp tool prefix with a dot', doc({ tools: [mcpTool({ prefix: 'crm.' })] }));
expectInvalid('tool timeoutSeconds 0', doc({ tools: [scriptTool({ timeoutSeconds: 0 })] }));
expectInvalid('unknown tool member', doc({ tools: [scriptTool({ secret: 'x' })] }));
expectInvalid('unknown attribute', doc({ apiKey: 'sk-123' }));

function run() {
  console.log('🔍 Agent (sys-agents) document validation starting...\n');

  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);

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
    console.log(`🎉 All ${cases.length} agent documents behaved as expected!`);
    process.exit(0);
  }
  console.log(`💥 ${failures} of ${cases.length} agent documents misbehaved.`);
  process.exit(1);
}

run();
