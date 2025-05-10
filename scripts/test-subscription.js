#!/usr/bin/env node

/**
 * Test runner script for subscription-related tests
 * Run with: node scripts/test-subscription.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Define test patterns
const testPatterns = [
  'app/__tests__/api/subscription/*.test.ts',
  'app/__tests__/utils/repositories/subscription-repository.test.ts',
  'app/__tests__/components/subscription/*.test.tsx'
];

// Check if dependencies are installed
try {
  if (!fs.existsSync(path.join(process.cwd(), 'node_modules', '@testing-library', 'react'))) {
    console.log('Installing testing dependencies...');
    execSync('npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom');
  }
} catch (error) {
  console.error('Failed to check or install dependencies:', error);
  process.exit(1);
}

// Run the tests
console.log('Running subscription tests...');
console.log('='.repeat(50));

try {
  for (const pattern of testPatterns) {
    console.log(`\nRunning tests matching: ${pattern}`);
    console.log('-'.repeat(50));
    
    try {
      execSync(`npx jest ${pattern} --config=jest.config.js --verbose`, { 
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'test' }
      });
    } catch (testError) {
      console.error(`Tests failed for pattern: ${pattern}`);
      // Continue with other test patterns
    }
  }
  
  console.log('\nAll test suites completed.');
} catch (error) {
  console.error('Error running tests:', error);
  process.exit(1);
} 