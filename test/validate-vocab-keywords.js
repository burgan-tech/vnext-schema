/**
 * Compiles vocabulary keywords (x-roles, x-masking, x-encryption, x-storage, x-filterOperators, x-lov,
 * condition, x-errorMessages, x-order) and checks
 * positive/negative fixtures against them.
 *
 * validate-schemas.js only meta-validates vocabulary files (ajv.validateSchema); it never compiles a
 * definition, so a broken $ref or a keyword that accepts everything would pass. This test compiles each
 * definition through the vocabulary's own $id so local #/definitions/... references resolve.
 */
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const vocab = JSON.parse(fs.readFileSync(path.join(__dirname, '../vocabularies/view-vocab.json'), 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: false });
ajv.addSchema(vocab);

const allow = (role) => ({ role, grant: 'allow' });
const deny = (role) => ({ role, grant: 'deny' });
const allOfGrant = (...roles) => ({ allOf: roles.map((role) => ({ role })), grant: 'allow' });
const anyOfGrant = (...roles) => ({ anyOf: roles.map((role) => ({ role })), grant: 'allow' });

const cases = {
  'x-roles': {
    valid: [
      [{ role: 'morph-idm.maker', grant: 'allow' }],
      [{ role: '$user.$.context.Instance.Data.ownerId', grant: 'deny' }],
      // role-grant combinators (allOf / anyOf)
      [allOfGrant('customer-role', '$InstanceStarter')],
      [allOfGrant('a.corporate-maker', 'a.corporate-region'), allOfGrant('b.corporate-checker', 'b.corporate-region')],
      [anyOfGrant('$InstanceStarter', '$InstanceBehalfOfStarter')],
      [allOfGrant('r1'), { role: 'plain', grant: 'deny' }]
    ],
    invalid: [
      [],
      [{ role: '', grant: 'allow' }],
      [{ role: 'r', grant: 'maybe' }],
      [{ role: 'r', grant: 'allow', extra: true }],
      // combinators: exactly one of role / allOf / anyOf, children are { role } only, depth 1
      [{ role: 'r', allOf: [{ role: 'a' }], grant: 'allow' }],
      [{ allOf: [{ role: 'a' }], anyOf: [{ role: 'b' }], grant: 'allow' }],
      [{ allOf: [], grant: 'allow' }],
      [{ anyOf: [], grant: 'allow' }],
      [{ allOf: [{ role: 'a', grant: 'allow' }], grant: 'allow' }],
      [{ allOf: [{ allOf: [{ role: 'a' }] }], grant: 'allow' }],
      [{ allOf: [{ role: '' }], grant: 'allow' }],
      [{ allOf: [{ role: 'a' }] }],
      [{ grant: 'allow' }],
      [{ allOf: [{ role: 'a' }], grant: 'maybe' }]
    ]
  },
  'x-masking': {
    valid: [
      { operator: 'mask' },
      { operator: 'mask', params: { keepFirst: 2, keepLast: 4, maskingChar: '#' } },
      { operator: 'mask', roles: [allow('morph-idm.auditor'), allow('$InstanceStarter')] },
      { operator: 'replace', params: { value: '[gizli]' } }
    ],
    invalid: [
      {},
      { operator: 'redact' },
      { operator: 'hash' },
      { operator: 'mask', params: { keepFirst: -1 } },
      { operator: 'mask', params: { maskingChar: '**' } },
      { operator: 'mask', params: { value: 'x' } },
      { operator: 'mask', params: { salt: 's3cr3t' } },
      { operator: 'replace' },
      { operator: 'replace', params: {} },
      { operator: 'replace', params: { value: '' } },
      { operator: 'replace', params: { value: 'x', keepLast: 2 } },
      { operator: 'mask', roles: [] },
      // exemption lists take no combinators
      { operator: 'mask', roles: [allOfGrant('a', 'b')] },
      { operator: 'mask', roles: [anyOfGrant('a', 'b')] },
      { operator: 'mask', roles: [{ allOf: [{ role: 'a' }], role: 'b', grant: 'allow' }] },
      { operator: 'mask', roles: [{ grant: 'allow' }] },
      { operator: 'mask', roles: [deny('teller')] },
      { operator: 'mask', unknown: 1 }
    ]
  },
  'x-encryption': {
    valid: [
      { type: 'none' },
      { type: 'hash' },
      { type: 'hash', params: { algorithm: 'sha512' }, purpose: 'PII-Identification' },
      { type: 'encrypt' },
      { type: 'encrypt', roles: [allow('morph-idm.auditor')], purpose: 'PII-Identification', redactInLogs: true, retentionDays: 2555 },
      // source: runtime (the default) — at rest
      { source: 'runtime', type: 'encrypt' },
      // source: client — in transit, client → backend (the former x-encrypt)
      { source: 'client', key: 'urn:client:context:read:device:memory:device.hpke.publicKey', algorithm: 'HPKE-P256-SHA256-AES128GCM' },
      { source: 'client', key: '$instance.keys.public', algorithm: 'RSA-OAEP-256', into: 'passwordEnc', encoding: 'base64url', nonce: '$instance.facts.nonce', envelope: 'publicKey', purpose: 'Credential' }
    ],
    invalid: [
      {}, { type: 'aes' }, { type: 'none', keyRef: 'k' },
      { source: 'device', type: 'encrypt' },
      // runtime: client members are not accepted, and type is required
      { source: 'runtime', key: 'urn:k', algorithm: 'RSA-OAEP-256' },
      { type: 'encrypt', algorithm: 'RSA-OAEP-256' },
      // client: key and algorithm are required, at-rest members are not accepted
      { source: 'client' },
      { source: 'client', key: 'urn:k' },
      { source: 'client', algorithm: 'RSA-OAEP-256' },
      { source: 'client', key: 'urn:k', algorithm: 'AES-256-GCM' },
      { source: 'client', key: '', algorithm: 'RSA-OAEP-256' },
      { source: 'client', key: 'urn:k', algorithm: 'RSA-OAEP-256', type: 'encrypt' },
      { source: 'client', key: 'urn:k', algorithm: 'RSA-OAEP-256', roles: [allow('a')] },
      { source: 'client', key: 'urn:k', algorithm: 'RSA-OAEP-256', retentionDays: 30 },
      { source: 'client', key: 'urn:k', algorithm: 'RSA-OAEP-256', envelope: 'jwe' },
      // removed in favour of 'encrypt' (never enforced by any runtime)
      { type: 'persisted' }, { type: 'transport' },
      { type: 'hash', params: { salt: '0123456789abcdef' } },
      { type: 'hash', params: { algorithm: 'md5' } },
      { type: 'encrypt', params: { algorithm: 'sha256' } },
      { type: 'encrypt', params: { key: 'AAAA' } },
      { type: 'encrypt', roles: [deny('teller')] },
      { type: 'encrypt', roles: [allOfGrant('a', 'b')] },
      { type: 'encrypt', roles: [anyOfGrant('a', 'b')] },
      { type: 'encrypt', roles: [{ grant: 'allow' }] },
      // hashed on write, irreversible: nobody can be exempted
      { type: 'hash', roles: [allow('teller')] },
      { type: 'hash', roles: [] },
      { type: 'none', purpose: '' },
      { type: 'none', redactInLogs: 'yes' },
      { type: 'none', retentionDays: 0 }
    ]
  },
  'x-storage': {
    valid: [
      { binding: 'vnext-blob-local' }
    ],
    invalid: [
      'file',
      {},
      { binding: '' },
      { binding: 5 },
      { binding: 'vnext-blob-local', extra: true }
    ]
  },
  // The names the runtime matches a DECLARATION against (SchemaFilterContext maps ne→neq, ge→gte, le→lte,
  // like/match→contains before the check), so the query tokens themselves must be refused here.
  'x-filterOperators': {
    valid: [
      ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'],
      ['contains', 'startsWith', 'endsWith', 'in', 'nin', 'isNull', 'includes'],
      []
    ],
    invalid: [
      ['ne'], ['ge'], ['le'], ['like'], ['match'],
      ['eq', 'eq'],
      ['regex']
    ]
  },
  'x-lov': {
    valid: [
      { source: 'urn:vnext:fn:sample:cities', valueField: '$.data[*].code', displayField: '$.data[*].name' },
      { source: 'urn:vnext:fn:sample:cities', valueField: '$.data[*].code', displayField: '$.data[*].name', imageField: '$.data[*].image' },
      { source: 'urn:vnext:flow:instances:{{$form.targetDomain}}:environment', valueField: '$.data[*].key', displayField: '$.data[*].key' },
      { source: 'urn:vnext:fn:sample:districts', valueField: '$.data[*].code', displayField: '$.data[*].name', filter: [{ param: 'cityCode', value: '$form.city', required: true }] },
      { source: 'urn:vnext:fn:sample:records', valueField: '$.data[*].key', displayField: '$.data[*].key', filter: [{ param: 'status:in', value: ['A', 'B'] }] },
      { items: '$instance.levels', valueField: 'key', displayField: 'label' },
      { items: '$instance.tags', valueField: '', displayField: '' }
    ],
    invalid: [
      { valueField: 'key', displayField: 'label' },
      { source: 'urn:x', items: '$instance.levels', valueField: 'key', displayField: 'label' },
      { source: 'urn:x', valueField: '', displayField: '$.data[*].name' },
      { source: 'urn:x', valueField: '$.data[*].code' },
      { items: '', valueField: 'key', displayField: 'label' },
      { source: 'urn:x', valueField: '$.a', displayField: '$.b', filter: [{ param: 'p', value: [] }] },
      { source: 'urn:x', valueField: '$.a', displayField: '$.b', filter: [{ param: 'p', value: 5 }] },
      { source: 'urn:x', valueField: '$.a', displayField: '$.b', unknown: true }
    ]
  },
  condition: {
    valid: [
      { field: 'age', operator: 'greaterThanOrEquals', value: 18 },
      { field: 'age', operator: 'lessThanOrEquals', value: 65 },
      { field: 'iban', operator: 'startsWith', value: 'TR' },
      { field: 'mail', operator: 'endsWith', value: '.com' },
      { anyOf: [{ field: 'a', operator: 'equals', value: 1 }, { not: { field: 'b', operator: 'isEmpty' } }] }
    ],
    invalid: [
      { field: 'age', operator: 'gte', value: 18 },
      { field: 'age' },
      { field: 'age', operator: 'equals', extra: 1 }
    ]
  },
  'x-errorMessages': {
    valid: [
      { minItems: { tr: 'En az bir seçim yapın', en: 'Pick at least one' } },
      { maxItems: { en: 'Too many' }, required: { en: 'Required' } },
      { exclusiveMinimum: { tr: 'Tutar sıfırdan büyük olmalı', en: 'Must be above zero' }, multipleOf: { en: 'Step' } }
    ],
    invalid: [
      {},
      { minItem: { en: 'typo' } }
    ]
  },
  'x-order': {
    valid: [1, 2.5, 0, -1],
    invalid: ['1', null, true]
  }
};

let failed = 0;
for (const [keyword, { valid, invalid }] of Object.entries(cases)) {
  const validate = ajv.getSchema(`${vocab.$id}#/definitions/${keyword}`);
  if (!validate) {
    console.log(`❌ ${keyword}: definition not found`);
    failed++;
    continue;
  }
  valid.forEach((doc) => {
    if (!validate(doc)) {
      console.log(`❌ ${keyword} should accept ${JSON.stringify(doc)}: ${ajv.errorsText(validate.errors)}`);
      failed++;
    }
  });
  invalid.forEach((doc) => {
    if (validate(doc)) {
      console.log(`❌ ${keyword} should reject ${JSON.stringify(doc)}`);
      failed++;
    }
  });
  console.log(`✅ ${keyword}: ${valid.length} accepted, ${invalid.length} rejected as expected`);
}

if (failed > 0) {
  console.log(`\n❌ ${failed} vocabulary keyword check(s) failed`);
  process.exit(1);
}
console.log('\n🎉 Vocabulary keyword definitions compile and behave as specified');
