#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const path = require('path');

console.log('=== Deployment Check ===');
console.log('Node version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Memory usage:', process.memoryUsage());

// Check if build directory exists
const buildPath = path.join(__dirname, '..', 'build');
if (fs.existsSync(buildPath)) {
  console.log('✓ Build directory exists');
  const buildFiles = fs.readdirSync(buildPath);
  console.log('Build files:', buildFiles.length);
} else {
  console.log('✗ Build directory does not exist');
}

// Check package.json
const packagePath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packagePath)) {
  console.log('✓ package.json exists');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  console.log(
    'Dependencies:',
    Object.keys(packageJson.dependencies || {}).length,
  );
  console.log(
    'Dev dependencies:',
    Object.keys(packageJson.devDependencies || {}).length,
  );
} else {
  console.log('✗ package.json does not exist');
}

// Check TypeScript config
const tsConfigPath = path.join(__dirname, '..', 'tsconfig.json');
if (fs.existsSync(tsConfigPath)) {
  console.log('✓ tsconfig.json exists');
} else {
  console.log('✗ tsconfig.json does not exist');
}

console.log('=== End Deployment Check ===');
