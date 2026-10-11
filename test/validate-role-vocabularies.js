/**
 * The ROLE vocabularies (vnext-schema#153): a schema is written in one role — RECORD (a flow's master) or
 * INPUT (a transition / function-input body) — and may carry the shared base keywords, the view hints
 * and its own role's keywords, nothing else. Compiles each role's `schema` definition through the
 * vocabularies' own $ids and checks documents that must be accepted and refused, nested placements
 * included (a misplaced keyword deep in `properties` / `items` is still misplaced).
 */
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const dir = path.join(__dirname, '../vocabularies');
const ajv = new Ajv({ allErrors: true, strict: false });
const docs = {};
for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.json'))) {
  docs[f] = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  ajv.addSchema(docs[f]);
}

const prop = (extra) => ({ type: 'string', ...extra });
const obj = (properties, extra = {}) => ({ type: 'object', properties, ...extra });

const cases = {
  'record-vocab.json': {
    valid: [
      obj({
        tckn: prop({ 'x-labels': { tr: 'TCKN', en: 'ID' }, 'x-encryption': { type: 'hash' } }),
        iban: prop({ 'x-masking': { operator: 'mask' }, 'x-helpText': { en: 'shown masked' } }),
        city: prop({ 'x-lov': { source: 'urn:vnext:fn:sample:cities', valueField: '$.data[*].code', displayField: '$.data[*].name' }, 'x-filterOperators': ['eq', 'in'], 'x-sortable': true, 'x-order': 1 }),
        createdAt: prop({ format: 'date-time', 'x-indexed': true, 'x-displayFormat': 'dd.MM.yyyy' }),
        displayName: prop({ readOnly: true, 'x-computed': { evaluatedBy: 'client', fallback: { join: { fields: ['firstName', 'lastName'] } } } }),
        otp: prop({ 'x-persistance': 'transient' }),
        address: obj({ line: prop({ 'x-roles': [{ role: '$InstanceStarter', grant: 'allow' }] }) }),
        tags: { type: 'array', items: prop({ 'x-enum': { a: { en: 'A' } } }) },
        // Shared with the input role: the runtime validates the merged record with the same validator, and a
        // record view hides fields by the data (the IDM's client-master: secret only for a confidential client).
        secret: prop({ 'x-conditional': { showIf: { field: 'clientType', operator: 'equals', value: 'confidential' } }, 'x-validation': { rule: 'r' }, 'x-errorMessages': { required: { en: 'x' } } })
      }, { 'x-context-target': { 'env.selected': { context: { boundary: 'device', key: 'env.selected' } } } }),
      true
    ],
    invalid: [
      obj({ a: prop({ 'x-context-source': { const: 1 } }) }),
      obj({ a: prop({ 'x-encrypt': { key: 'urn:k', algorithm: 'RSA-OAEP-256' } }) }),
      obj({ a: obj({ b: prop({ 'x-encrypt': { key: 'urn:k', algorithm: 'RSA-OAEP-256' } }) }) }),
      obj({ a: { type: 'array', items: prop({ 'x-context-source': { const: 1 } }) } }),
      obj({ a: prop({ 'x-foo': 1 }) }),
      obj({ a: prop({ 'x-persistance': 'maybe' }) }),
      obj({ a: prop({ 'x-filterOperators': ['ge'] }) }),
      obj({ a: prop({ 'x-computed': { evaluatedBy: 'browser' } }) })
    ]
  },
  'input-vocab.json': {
    valid: [
      obj({
        password: prop({ format: 'password', 'x-encrypt': { into: 'passwordEnc', key: 'urn:client:context:read:device:memory:device.hpke.publicKey', algorithm: 'HPKE-P256-SHA256-AES128GCM', nonce: '$instance.deviceRegisterFacts.nonce', envelope: 'publicKey' } }),
        deviceId: prop({ 'x-context-source': { context: { boundary: 'device', key: 'device.id' } } }),
        district: prop({ 'x-lov': { source: 'urn:vnext:fn:sample:districts', valueField: '$.data[*].code', displayField: '$.data[*].name', filter: [{ param: 'cityCode', value: '$form.city', required: true }] }, 'x-conditional': { showIf: { field: 'city', operator: 'isNotEmpty' } } }),
        iban: prop({ 'x-validation': { rule: 'urn:vnext:fn:sample:iban-check' }, 'x-errorMessages': { pattern: { tr: 'Geçersiz', en: 'Invalid' } }, 'x-placeholder': { en: 'TR..' }, 'x-group': 'account' }),
        rows: { type: 'array', items: obj({ code: prop({ 'x-labels': { en: 'Code' }, 'x-uiHint': 'readonly' }) }) }
      }),
      true
    ],
    invalid: [
      obj({ a: prop({ 'x-roles': [{ role: 'r', grant: 'allow' }] }) }),
      obj({ a: prop({ 'x-encryption': { type: 'encrypt' } }) }),
      obj({ a: prop({ 'x-filterOperators': ['eq'] }) }),
      obj({ a: prop({ 'x-sortable': true }) }),
      obj({ a: prop({ 'x-persistance': 'transient' }) }),
      obj({ a: { type: 'array', items: prop({ 'x-masking': { operator: 'mask' } }) } }),
      obj({}, { 'x-context-target': { k: { context: { boundary: 'device', key: 'k' } } } }),
      obj({ a: prop({ 'x-encrypt': { key: 'urn:k' } }) }),
      obj({ a: prop({ 'x-encrypt': { key: 'urn:k', algorithm: 'AES' } }) }),
      obj({ a: prop({ 'x-bar': true }) })
    ]
  }
};

let failed = 0;
for (const [file, { valid, invalid }] of Object.entries(cases)) {
  const id = docs[file].$id;
  const validate = ajv.getSchema(`${id}#/definitions/schema`);
  if (!validate) {
    console.log(`❌ ${file}: #/definitions/schema not found`);
    failed++;
    continue;
  }
  valid.forEach((doc, i) => {
    if (!validate(doc)) {
      console.log(`❌ ${file} should accept valid[${i}]: ${ajv.errorsText(validate.errors)}`);
      failed++;
    }
  });
  invalid.forEach((doc, i) => {
    if (validate(doc)) {
      console.log(`❌ ${file} should refuse invalid[${i}] ${JSON.stringify(doc).slice(0, 120)}`);
      failed++;
    }
  });
  // The published keyword list and the gate must be the same list.
  const defs = docs[file].definitions;
  const gate = defs.property.anyOf[1].propertyNames.then.enum;
  if (JSON.stringify([...gate].sort()) !== JSON.stringify([...defs.allowedKeywords.const].sort())) {
    console.log(`❌ ${file}: allowedKeywords and the propertyNames gate disagree`);
    failed++;
  }
  console.log(`✅ ${file}: ${valid.length} accepted, ${invalid.length} refused as expected`);
}

if (failed > 0) {
  console.log(`\n❌ ${failed} role vocabulary check(s) failed`);
  process.exit(1);
}
console.log('\n🎉 Role vocabularies accept their own keywords and refuse the other role\'s');
