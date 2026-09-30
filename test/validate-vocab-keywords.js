/**
 * Compiles field-exposure vocabulary keywords (x-roles, x-masking, x-encryption) and checks
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

const cases = {
  'x-roles': {
    valid: [
      [{ role: 'morph-idm.maker', grant: 'allow' }],
      [{ role: '$user.$.context.Instance.Data.ownerId', grant: 'deny' }]
    ],
    invalid: [
      [],
      [{ role: '', grant: 'allow' }],
      [{ role: 'r', grant: 'maybe' }],
      [{ role: 'r', grant: 'allow', extra: true }]
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
      { type: 'encrypt', roles: [allow('morph-idm.auditor')], purpose: 'PII-Identification', redactInLogs: true, retentionDays: 2555 }
    ],
    invalid: [
      {}, { type: 'aes' }, { type: 'none', keyRef: 'k' },
      // removed in favour of 'encrypt' (never enforced by any runtime)
      { type: 'persisted' }, { type: 'transport' },
      { type: 'hash', params: { salt: '0123456789abcdef' } },
      { type: 'hash', params: { algorithm: 'md5' } },
      { type: 'encrypt', params: { algorithm: 'sha256' } },
      { type: 'encrypt', params: { key: 'AAAA' } },
      { type: 'encrypt', roles: [deny('teller')] },
      // hashed on write, irreversible: nobody can be exempted
      { type: 'hash', roles: [allow('teller')] },
      { type: 'hash', roles: [] },
      { type: 'none', purpose: '' },
      { type: 'none', redactInLogs: 'yes' },
      { type: 'none', retentionDays: 0 }
    ]
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
