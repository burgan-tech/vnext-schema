const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const ajv = new Ajv({ allErrors: true, verbose: true });

// Schema files directory
const schemasDir = path.join(__dirname, '../schemas');

// Test function
function validateSchemas() {
  console.log('🔍 JSON Schema validation starting...\n');
  
  let allValid = true;
  const schemaFiles = fs.readdirSync(schemasDir).filter(file => file.endsWith('.schema.json'));
  
  schemaFiles.forEach(file => {
    const filePath = path.join(schemasDir, file);
    console.log(`📄 ${file} validating...`);
    
    try {
      const schemaContent = fs.readFileSync(filePath, 'utf8');
      const schema = JSON.parse(schemaContent);
      
      // Check if the JSON Schema is valid
      const isValid = ajv.validateSchema(schema);
      
      if (isValid) {
        console.log(`✅ ${file} - Valid`);
      } else {
        console.log(`❌ ${file} - Invalid:`);
        if (ajv.errors) {
          ajv.errors.forEach(error => {
            console.log(`   - ${error.instancePath}: ${error.message}`);
          });
        }
        allValid = false;
      }
    } catch (error) {
      console.log(`❌ ${file} - Parse error: ${error.message}`);
      allValid = false;
    }
    
    console.log('');
  });
  
  if (allValid) {
    console.log('🎉 All schema files are valid!');
    process.exit(0);
  } else {
    console.log('💥 Some schema files have errors.');
    process.exit(1);
  }
}

// Test files directory
if (!fs.existsSync(path.dirname(__filename))) {
  fs.mkdirSync(path.dirname(__filename), { recursive: true });
}

validateSchemas();