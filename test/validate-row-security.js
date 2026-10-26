/**
 * Document-level tests for workflow attributes.rowSecurity (vnext#1107): role-keyed row rules,
 * deny by default (no `default` member). The filter body is structural only here; the runtime
 * publish check is authoritative for operators.
 */
const assert = require('assert');
const Ajv2019 = require('ajv/dist/2019');

const workflowSchema = require('../schemas/workflow-definition.schema.json');

const ajv = new Ajv2019({ strict: false, allErrors: true });
ajv.addSchema(workflowSchema);
const valid = ajv.compile(workflowSchema);
const validParam = ajv.compile({ $ref: `${workflowSchema.$id}#/definitions/rowSecurityParam` });

const labels = label => [{ language: 'en', label }];
const wf = rowSecurity => {
  const attributes = {
    type: 'F', labels: labels('Flow'),
    startTransition: { key: 'start', target: 'work', triggerType: 0, versionStrategy: 'Minor', labels: labels('Start') },
    states: [
      { key: 'work', stateType: 1, versionStrategy: 'Minor', labels: labels('Work'), transitions: [
        { key: 'go', target: 'done', triggerType: 0, versionStrategy: 'Minor', labels: labels('Go') }] },
      { key: 'done', stateType: 3, versionStrategy: 'Minor', labels: labels('Done') }
    ]
  };
  if (rowSecurity !== undefined) attributes.rowSecurity = rowSecurity;
  return { key: 'flow', domain: 'test', flow: 'sys-flows', flowVersion: '1.0.0', version: '1.0.0', tags: [], attributes };
};

assert.equal(valid(wf({ rules: [{ roles: ['branch-staff'], filter: { attributes: { branchCode: { eq: '$.context.Headers.x-branch-code' } } } }] })), true);
assert.equal(valid(wf({ rules: [{ roles: ['region-manager'], filter: { attributes: { branchCode: { in: { $param: '$.context.Headers.x-branches', split: ',' } } } } }] })), true);
assert.equal(valid(wf({ rules: [{ roles: ['hq-auditor'] }, { roles: ['$InstanceStarter'] }] })), true);
assert.equal(valid(wf({ default: 'allow', rules: [{ roles: ['hq-auditor'] }] })), false); // no default member
assert.equal(valid(wf({ rules: [] })), false);
assert.equal(valid(wf({})), false);
assert.equal(valid(wf({ rules: [{ roles: [] }] })), false);
assert.equal(valid(wf({ rules: [{ roles: ['a'], extra: 1 }] })), false);
assert.equal(validParam({ $param: 'x-branches' }), false);
assert.equal(validParam({ $param: '$.context.Headers.x-branches', split: ',' }), true);
assert.equal(valid(wf(undefined)), true);

console.log('row security document tests passed');
