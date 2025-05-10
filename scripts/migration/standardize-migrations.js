#!/usr/bin/env node

/**
 * This script standardizes migration files by:
 * 1. Renaming files with placeholder timestamps (YYYYMMDDHHMMSS_) to use proper timestamps
 * 2. Ensuring all migration files follow the proper naming convention
 */

const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.resolve(process.cwd(), 'supabase/migrations');

// Get current timestamp for migrations
const getCurrentTimestamp = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

// Check if file has a placeholder timestamp
const hasPlaceholderTimestamp = (filename) => {
  return filename.startsWith('YYYYMMDDHHMMSS_');
};

const standardizeMigrations = () => {
  // Check if migrations directory exists
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error(`Migrations directory not found: ${MIGRATIONS_DIR}`);
    process.exit(1);
  }
  
  const files = fs.readdirSync(MIGRATIONS_DIR);
  const migrationFiles = files.filter(file => file.endsWith('.sql'));
  
  let renamedCount = 0;
  
  for (const file of migrationFiles) {
    if (hasPlaceholderTimestamp(file)) {
      const newTimestamp = getCurrentTimestamp();
      const newName = file.replace('YYYYMMDDHHMMSS_', `${newTimestamp}_`);
      
      const oldPath = path.join(MIGRATIONS_DIR, file);
      const newPath = path.join(MIGRATIONS_DIR, newName);
      
      try {
        fs.renameSync(oldPath, newPath);
        console.log(`Renamed: ${file} -> ${newName}`);
        renamedCount++;
        
        // Add a small delay to ensure unique timestamps
        const waitTill = new Date(new Date().getTime() + 1000);
        while (waitTill > new Date()) {}
      } catch (error) {
        console.error(`Error renaming ${file}: ${error.message}`);
      }
    }
  }
  
  console.log(`\nStandardization complete. Renamed ${renamedCount} files.`);
};

standardizeMigrations(); 