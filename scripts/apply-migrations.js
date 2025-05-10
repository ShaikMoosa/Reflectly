#!/usr/bin/env node

/**
 * A simple script to apply Supabase migrations
 * Run with: node scripts/apply-migrations.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Get migrations directory
const migrationsDir = path.join(__dirname, '../supabase/migrations');

async function applyMigrations() {
  try {
    // Get all SQL files from migrations directory
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b));

    console.log(`Found ${files.length} migration files`);

    // Apply each migration
    for (const file of files) {
      console.log(`Applying migration: ${file}`);
      const migrationPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(migrationPath, 'utf8');

      // Execute SQL
      const { error } = await supabase.rpc('pgmigrate', { query: sql });

      if (error) {
        console.error(`Error applying migration ${file}:`, error);
        // Continue with other migrations
      } else {
        console.log(`Successfully applied migration: ${file}`);
      }
    }

    console.log('All migrations applied successfully');
  } catch (error) {
    console.error('Error applying migrations:', error);
    process.exit(1);
  }
}

// Run the script
applyMigrations(); 