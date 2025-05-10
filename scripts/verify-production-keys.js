#!/usr/bin/env node

/**
 * This script checks if production keys are being used in a production environment.
 * Run this before deploying to production to avoid using development keys.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
let envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// Also check .env.local
envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const isDevelopmentKey = (key) => {
  if (!key) return false;
  
  // Clerk development keys usually start with these prefixes
  const devPrefixes = ['test_', 'pk_test_', 'sk_test_'];
  return devPrefixes.some(prefix => key.startsWith(prefix));
};

const checkKeys = () => {
  const issues = [];
  
  // Check Clerk keys
  const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  
  if (isDevelopmentKey(clerkPubKey)) {
    issues.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is a development key');
  }
  
  if (isDevelopmentKey(clerkSecretKey)) {
    issues.push('CLERK_SECRET_KEY is a development key');
  }
  
  // Check Supabase keys if available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl && supabaseUrl.includes('supabase.co') && supabaseUrl.includes('.supabase.co')) {
    if (!supabaseUrl.includes('https://')) {
      issues.push('NEXT_PUBLIC_SUPABASE_URL should use HTTPS in production');
    }
  }
  
  return issues;
};

const issues = checkKeys();

if (issues.length > 0) {
  console.error('\x1b[31m%s\x1b[0m', '⚠️ Production Environment Check Failed ⚠️');
  console.error('\x1b[31m%s\x1b[0m', 'The following issues were found:');
  issues.forEach(issue => {
    console.error('\x1b[31m%s\x1b[0m', ` - ${issue}`);
  });
  console.error('\x1b[31m%s\x1b[0m', '\nPlease update your environment variables to use production keys.');
  process.exit(1);
} else {
  console.log('\x1b[32m%s\x1b[0m', '✅ Production Environment Check Passed');
  console.log('\x1b[32m%s\x1b[0m', 'All checked environment variables appear to be production keys.');
  process.exit(0);
} 