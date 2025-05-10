#!/usr/bin/env node

/**
 * Test coverage script for subscription-related code
 * Run with: node scripts/subscription-coverage.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Define coverage patterns
const coveragePatterns = [
  'app/api/subscription/**/*.ts',
  'app/components/subscription/**/*.tsx',
  'app/utils/repositories/subscription-repository.ts',
  'app/utils/repositories/subscription-admin-repository.ts'
];

// Define test patterns
const testPatterns = [
  'app/__tests__/api/subscription',
  'app/__tests__/components/subscription',
  'app/__tests__/utils/repositories/subscription-repository.test.ts'
];

// Check if dependencies are installed
try {
  if (!fs.existsSync(path.join(process.cwd(), 'node_modules', 'istanbul-reports'))) {
    console.log('Installing coverage dependencies...');
    execSync('npm install --save-dev istanbul-reports istanbul-lib-coverage nyc');
  }
} catch (error) {
  console.error('Failed to check or install dependencies:', error);
  process.exit(1);
}

// Run the coverage tests
console.log('Running subscription coverage analysis...');
console.log('='.repeat(50));

try {
  // Create coverage command with all patterns
  const sourcePatterns = coveragePatterns.map(pattern => `--include="${pattern}"`).join(' ');
  const testGlobs = testPatterns.map(pattern => `"${pattern}"`).join(' ');
  
  const command = `npx nyc --reporter=text --reporter=html --reporter=lcov --exclude-after-remap false ${sourcePatterns} npx jest ${testGlobs} --config=jest.config.js`;
  
  console.log(`Executing coverage command:\n${command}\n`);
  
  execSync(command, { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'test' }
  });
  
  console.log('\nCoverage analysis completed.');
  console.log('HTML report generated at ./coverage/index.html');
} catch (error) {
  console.error('Error running coverage analysis:', error);
  process.exit(1);
} 