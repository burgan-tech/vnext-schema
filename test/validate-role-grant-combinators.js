/**
 * Document-level tests for the roleGrant allOf / anyOf combinators in workflow queryRoles,
 * transition roles, function roles and the standalone roles vocabulary. (Schema x-roles and the
 * x-masking / x-encryption exemption lists are covered in validate-vocab-keywords.js.)
 */
const assert = require('assert');
const Ajv2019 = require('ajv/dist/2019');
const Ajv = require('ajv');

const workflowSchema = require('../schemas/workflow-definition.schema.json');
const functionSchema = require('../schemas/function-definition.schema.json');
const rolesVocab = require('../vocabularies/roles-vocab.json');

const validWorkflow = new Ajv2019({ strict: false, allErrors: true }).compile(workflowSchema);
const validFunction = new Ajv({ strict: false, allErrors: true }).compile(functionSchema);
const rolesAjv = new Ajv({ strict: false, allErrors: true });
rolesAjv.addSchema(rolesVocab);
const validVocab = rolesAjv.getSchema(`${rolesVocab.$id}#/definitions/roleGrant`);

const labels = label => [{ language: 'en', label }];
const workflow = ({ queryRoles, transitionRoles } = {}) => {
  const transition = { key: 'go', target: 'done', triggerType: 0, versionStrategy: 'Minor', labels: labels('Go') };
  if (transitionRoles) transition.roles = transitionRoles;
  const attributes = {
    type: 'F', labels: labels('Flow'),
    startTransition: { key: 'start', target: 'work', triggerType: 0, versionStrategy: 'Minor', labels: labels('Start') },
    states: [
      { key: 'work', stateType: 1, versionStrategy: 'Minor', labels: labels('Work'), transitions: [transition] },
      { key: 'done', stateType: 3, versionStrategy: 'Minor', labels: labels('Done') }
    ]
  };
  if (queryRoles) attributes.queryRoles = queryRoles;
  return { key: 'flow', domain: 'test', flow: 'sys-flows', flowVersion: '1.0.0', version: '1.0.0', tags: [], attributes };
};
const fn = roles => ({
  key: 'my-fn', version: '1.0.0', domain: 'test', flow: 'sys-functions', flowVersion: '1.0.0', tags: ['function'],
  attributes: {
    scope: 'D',
    task: {
      order: 1, task: { key: 't', domain: 'test', flow: 'sys-tasks', version: '1.0.0' },
      mapping: { location: './t.csx', code: 'cmV0dXJuIHt9Ow==', encoding: 'B64' }
    },
    roles
  }
});

const surfaces = {
  'workflow queryRoles': { build: grants => workflow({ queryRoles: grants }), validate: validWorkflow },
  'workflow transition roles': { build: grants => workflow({ transitionRoles: grants }), validate: validWorkflow },
  'function roles': { build: grants => fn(grants), validate: validFunction },
  'roles-vocab roleGrant': { build: grants => grants, validate: grants => grants.every(g => validVocab(g)) }
};

const allOf = (...roles) => ({ allOf: roles.map(role => ({ role })), grant: 'allow' });
const anyOf = (...roles) => ({ anyOf: roles.map(role => ({ role })), grant: 'allow' });

const valid = [
  ['customer allOf', [allOf('customer-role', '$InstanceStarter')]],
  ['two corporate allOf', [allOf('a.corporate-maker', 'a.region'), allOf('b.corporate-checker', 'b.region')]],
  ['anyOf starter / behalf-of starter', [anyOf('$InstanceStarter', '$InstanceBehalfOfStarter')]],
  ['plain role+grant', [{ role: 'morph-idm.maker', grant: 'allow' }]],
  ['combinator deny', [{ anyOf: [{ role: 'a' }], grant: 'deny' }]],
  ['mixed plain and combinator', [{ role: 'a', grant: 'allow' }, allOf('b', 'c')]]
];
const invalid = [
  ['role + allOf', [{ role: 'a', allOf: [{ role: 'b' }], grant: 'allow' }]],
  ['allOf + anyOf', [{ allOf: [{ role: 'a' }], anyOf: [{ role: 'b' }], grant: 'allow' }]],
  ['empty allOf', [{ allOf: [], grant: 'allow' }]],
  ['empty anyOf', [{ anyOf: [], grant: 'allow' }]],
  ['child with grant', [{ allOf: [{ role: 'a', grant: 'allow' }], grant: 'allow' }]],
  ['child with nested allOf', [{ allOf: [{ allOf: [{ role: 'a' }] }], grant: 'allow' }]],
  ['child without role', [{ anyOf: [{}], grant: 'allow' }]],
  ['grant alone', [{ grant: 'allow' }]],
  ['combinator without grant', [{ allOf: [{ role: 'a' }] }]]
];

let checked = 0;
const failures = [];
for (const [surface, { build, validate }] of Object.entries(surfaces)) {
  const run = grants => validate(build(grants));
  for (const [name, grants] of valid) {
    checked++;
    // The vocabulary check is per grant, the document checks wrap the whole array.
    if (!run(grants)) failures.push(`${surface}: should accept ${name}`);
  }
  for (const [name, grants] of invalid) {
    checked++;
    if (run(grants)) failures.push(`${surface}: should reject ${name}`);
  }
}

assert.strictEqual(failures.length, 0, failures.join('\n'));
console.log(`${checked} role-grant combinator document cases passed.`);
