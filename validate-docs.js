#!/usr/bin/env node

/**
 * Documentation Validation Script
 * Checks that JavaScript files have proper JSDoc documentation
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_PATTERNS = {
  fileComment: /^\/\*\*[\s\S]*?\*\//m,
  functionDoc: /@(param|returns|throws)/,
  asyncDoc: /@async/,
  typeAnnotation: /@type|@param.*\{.*\}/
};

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const results = {
    file: filePath,
    hasFileComment: REQUIRED_PATTERNS.fileComment.test(content),
    hasFunctionDocs: REQUIRED_PATTERNS.functionDoc.test(content),
    hasAsyncDocs: content.includes('async') ? REQUIRED_PATTERNS.asyncDoc.test(content) : true,
    hasTypes: REQUIRED_PATTERNS.typeAnnotation.test(content),
    lineCount: content.split('\n').length
  };
  
  return results;
}

function findJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      findJsFiles(filePath, fileList);
    } else if (file.endsWith('.js') && !file.endsWith('.test.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Main validation
const srcFiles = findJsFiles('src');
console.log('\n=== Documentation Validation Report ===\n');

let total = 0;
let documented = 0;

srcFiles.forEach(file => {
  const results = checkFile(file);
  total++;
  
  const isDocumented = results.hasFileComment && results.hasFunctionDocs && results.hasTypes;
  if (isDocumented) documented++;
  
  const status = isDocumented ? '✅' : '⚠️';
  console.log(`${status} ${file}`);
  
  if (!isDocumented) {
    if (!results.hasFileComment) console.log('   - Missing file-level comment');
    if (!results.hasFunctionDocs) console.log('   - Missing function documentation');
    if (!results.hasTypes) console.log('   - Missing type annotations');
  }
});

console.log(`\n=== Summary ===`);
console.log(`Total files: ${total}`);
console.log(`Documented: ${documented} (${Math.round(documented/total*100)}%)`);
console.log(`Missing docs: ${total - documented}`);

if (documented === total) {
  console.log('\n✅ All files are properly documented!');
  process.exit(0);
} else {
  console.log('\n⚠️ Some files need better documentation');
  process.exit(0); // Don't fail, just warn
}
