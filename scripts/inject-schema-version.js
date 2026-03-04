#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const PLACEHOLDER = '__SCHEMA_VERSION__';
const ROOT = path.resolve(__dirname, '..');
const PACKAGE_JSON = path.join(ROOT, 'package.json');

function getJsonFiles() {
  const dirs = ['schemas', 'vocabularies'];
  const files = [];
  for (const dir of dirs) {
    const fullPath = path.join(ROOT, dir);
    if (!fs.existsSync(fullPath)) continue;
    for (const name of fs.readdirSync(fullPath)) {
      if (name.endsWith('.json')) files.push(path.join(fullPath, name));
    }
  }
  const workflowPath = path.join(ROOT, 'workflow.json');
  if (fs.existsSync(workflowPath)) files.push(workflowPath);
  return files;
}

function inject() {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  const version = pkg.version;
  if (!version) throw new Error('package.json has no version');
  const files = getJsonFiles();
  let replaced = 0;
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes(PLACEHOLDER)) {
      content = content.split(PLACEHOLDER).join(version);
      fs.writeFileSync(file, content, 'utf8');
      replaced++;
    }
  }
  console.log(`inject-schema-version: replaced ${PLACEHOLDER} with ${version} in ${replaced} file(s)`);
}

function restore() {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  const version = pkg.version;
  if (!version) throw new Error('package.json has no version');
  const files = getJsonFiles();
  const pattern = new RegExp('@' + escapeRegExp(version) + '/', 'g');
  let restored = 0;
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const newContent = content.replace(pattern, '@' + PLACEHOLDER + '/');
    if (newContent !== content) {
      fs.writeFileSync(file, newContent, 'utf8');
      restored++;
    }
  }
  console.log(`inject-schema-version: restored ${PLACEHOLDER} in ${restored} file(s)`);
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const mode = process.argv[2];
if (mode === '--restore') restore();
else if (mode === '--inject' || !mode) inject();
else {
  console.error('Usage: node inject-schema-version.js [--inject|--restore]');
  process.exit(1);
}
