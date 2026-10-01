/**
 * Document-level tests for task-definition.schema.json - CacheAside task (type 18).
 *
 * validate-schemas.js only checks that each schema is itself valid JSON Schema. This file validates
 * real CacheAside task documents: `key` is a static string or a ScriptCode object, `sourceMapping`
 * takes the full ScriptCode shape (NAT / B64 / REF, scripts), and the removed `keyExpression` is
 * rejected because the type-18 config is closed.
 */

const path = require('path');
const Ajv = require('ajv');

const schema = require(path.join(__dirname, '../schemas/task-definition.schema.json'));

const DOMAIN = 'test-domain';
const VERSION = '1.0.0';

const mappingRef = (key = 'my-mapping') => ({ key, domain: DOMAIN, flow: 'sys-mappings', version: VERSION });

/** A minimal, valid CacheAside document with the given config overrides merged in. */
const doc = (config = {}) => ({
  key: 'ca',
  version: VERSION,
  domain: DOMAIN,
  flow: 'sys-tasks',
  flowVersion: VERSION,
  tags: ['cacheaside'],
  attributes: {
    type: '18',
    config: {
      sourceTask: { key: 'src', domain: DOMAIN, version: VERSION },
      ...config
    }
  }
});

const cases = [];

const expectValid = (name, document) => cases.push({ name, document, valid: true });
const expectInvalid = (name, document) => cases.push({ name, document, valid: false });

expectValid('minimal CacheAside (no key: the mapping InputHandler may set it)', doc());
expectValid('key: static string', doc({ key: 'users:42' }));

expectValid('key object: dynamicExpresso NAT', doc({
  key: { location: 'dynamicExpresso', code: '"users:" + Data.id', encoding: 'NAT' }
}));
expectValid('key object: dynamicExpresso B64', doc({
  key: { location: 'dynamicExpresso', code: 'ImtleSI=', encoding: 'B64' }
}));
expectValid('key object: C# B64', doc({
  key: { location: './key.csx', code: 'cmV0dXJuIG51bGw7', encoding: 'B64' }
}));
expectValid('key object: REF', doc({
  key: { location: './key.csx', encoding: 'REF', code: mappingRef('key-mapping') }
}));

expectValid('sourceMapping: NAT', doc({
  sourceMapping: { location: './m.csx', code: 'return null;', encoding: 'NAT' }
}));
expectValid('sourceMapping: B64', doc({
  sourceMapping: { location: './m.csx', code: 'cmV0dXJuIG51bGw7', encoding: 'B64' }
}));
expectValid('sourceMapping: REF', doc({
  sourceMapping: { location: './m.csx', encoding: 'REF', code: mappingRef('src-mapping') }
}));
expectValid('sourceMapping: scripts.helpers', doc({
  sourceMapping: {
    location: './m.csx',
    code: 'cmV0dXJuIG51bGw7',
    encoding: 'B64',
    scripts: { helpers: [mappingRef('helper')], allowedAssemblies: ['System.Text.Json'] }
  }
}));

expectInvalid('keyExpression is removed (closed config)', doc({
  keyExpression: { location: 'dynamicExpresso', code: '"k"', encoding: 'NAT' }
}));
expectInvalid('key: number', doc({ key: 42 }));
expectInvalid('key object: REF with a string code', doc({
  key: { location: './key.csx', encoding: 'REF', code: 'not-a-ref' }
}));
expectInvalid('sourceMapping: REF with a string code', doc({
  sourceMapping: { location: './m.csx', encoding: 'REF', code: 'not-a-ref' }
}));

const missingSource = doc();
delete missingSource.attributes.config.sourceTask;
expectInvalid('missing sourceTask', missingSource);

function run() {
  console.log('🔍 Task document validation starting...\n');

  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);

  let failures = 0;

  for (const { name, document, valid } of cases) {
    const actual = validate(document);

    if (actual === valid) {
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
    console.log(`🎉 All ${cases.length} task documents behaved as expected!`);
    process.exit(0);
  }

  console.log(`💥 ${failures} of ${cases.length} task document cases failed.`);
  process.exit(1);
}

run();
