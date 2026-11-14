/**
 * Document-level tests for task-definition.schema.json - MCP task (type 24).
 *
 * An MCP task calls one operation of a remote MCP server over streamable HTTP. The task never
 * carries a credential: auth and every header value are { secretRef } objects, so a plain-text
 * header value is rejected. The endpoint host allow-list (Mcp:AllowedHosts) is checked by the
 * runtime, not here.
 */

const path = require('path');
const Ajv = require('ajv');

const schema = require(path.join(__dirname, '../schemas/task-definition.schema.json'));

const VERSION = '1.0.0';

/** A minimal, valid MCP task document with the given config. */
const doc = (config = { endpoint: 'https://crm-mcp.internal/mcp', tool: 'search_customer' }) => ({
  key: 'crm-mcp',
  version: VERSION,
  domain: 'test-domain',
  flow: 'sys-tasks',
  flowVersion: VERSION,
  tags: ['mcp'],
  attributes: { type: '24', config }
});

const endpoint = 'https://crm-mcp.internal/mcp';

const cases = [];
const expectValid = (name, document) => cases.push({ name, document, valid: true });
const expectInvalid = (name, document) => cases.push({ name, document, valid: false });

expectValid('endpoint + tool', doc());
expectValid('full callTool config', doc({
  transport: 'http',
  endpoint,
  auth: { header: 'Authorization', scheme: 'Bearer', secretRef: 'vault/workflow-secret/CRM_MCP_TOKEN' },
  headers: { 'X-Tenant': { secretRef: 'CRM_TENANT' } },
  operation: 'callTool',
  tool: 'search_customer',
  arguments: { q: 'x' },
  timeoutSeconds: 20
}));
expectValid('auth with secretRef only (header defaults to Authorization)', doc({ endpoint, auth: { secretRef: 'CRM_TOKEN' } }));
expectValid('listTools without a tool', doc({ endpoint, operation: 'listTools' }));
expectValid('listResources', doc({ endpoint, operation: 'listResources' }));
expectValid('listPrompts', doc({ endpoint, operation: 'listPrompts' }));
expectValid('readResource with uri', doc({ endpoint, operation: 'readResource', uri: 'crm://customers/42' }));
expectValid('getPrompt with prompt', doc({ endpoint, operation: 'getPrompt', prompt: 'summarize' }));
expectValid('plain http endpoint', doc({ endpoint: 'http://localhost:5100/mcp' }));
expectValid('timeout at the 120 s limit', doc({ endpoint, timeoutSeconds: 120 }));

expectInvalid('missing endpoint', doc({ tool: 'search_customer' }));
expectInvalid('relative endpoint', doc({ endpoint: '/mcp' }));
expectInvalid('stdio transport', doc({ endpoint, transport: 'stdio' }));
expectInvalid('unknown operation', doc({ endpoint, operation: 'callTools' }));
expectInvalid('readResource without uri', doc({ endpoint, operation: 'readResource' }));
expectInvalid('getPrompt without prompt', doc({ endpoint, operation: 'getPrompt' }));
expectInvalid('plain-text header value', doc({ endpoint, headers: { 'X-Tenant': 'acme' } }));
expectInvalid('header object without secretRef', doc({ endpoint, headers: { 'X-Tenant': { value: 'acme' } } }));
expectInvalid('empty header secretRef', doc({ endpoint, headers: { 'X-Tenant': { secretRef: '' } } }));
expectInvalid('auth without secretRef', doc({ endpoint, auth: { header: 'Authorization', scheme: 'Bearer' } }));
expectInvalid('inline auth token', doc({ endpoint, auth: { secretRef: 'X', token: 'abc' } }));
expectInvalid('timeout 0', doc({ endpoint, timeoutSeconds: 0 }));
expectInvalid('timeout over 120', doc({ endpoint, timeoutSeconds: 121 }));
expectInvalid('arguments not an object', doc({ endpoint, arguments: 'q=x' }));
expectInvalid('unknown config member', doc({ endpoint, url: endpoint }));
expectInvalid('missing config', { ...doc(), attributes: { type: '24' } });

function run() {
  console.log('🔍 MCP task document validation starting...\n');

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
    console.log(`🎉 All ${cases.length} MCP task documents behaved as expected!`);
    process.exit(0);
  }
  console.log(`💥 ${failures} of ${cases.length} MCP task documents misbehaved.`);
  process.exit(1);
}

run();
