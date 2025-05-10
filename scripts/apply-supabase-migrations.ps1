# Apply Supabase Migrations Script
# This script applies all migrations in the supabase/migrations directory to your Supabase project

# Load environment variables from .env file
$envPath = ".env.local"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            $key = $matches[1]
            $value = $matches[2]
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    Write-Host "Loaded environment variables from $envPath"
} else {
    Write-Host "No .env.local file found. Make sure you have the required environment variables set."
}

# Validate required environment variables
$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$supabaseKey = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "Error: Missing required environment variables." -ForegroundColor Red
    Write-Host "Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set." -ForegroundColor Red
    exit 1
}

# Get all migration files
$migrationsDir = Join-Path $PSScriptRoot "..\supabase\migrations"
$migrationFiles = Get-ChildItem -Path $migrationsDir -Filter "*.sql" | Sort-Object Name

if ($migrationFiles.Count -eq 0) {
    Write-Host "No migration files found in $migrationsDir" -ForegroundColor Yellow
    exit 0
}

Write-Host "Found $($migrationFiles.Count) migration files" -ForegroundColor Green

# Install required Node.js package
npm install @supabase/supabase-js

# Run the Node.js script to apply migrations
Write-Host "Applying migrations..." -ForegroundColor Cyan
node $PSScriptRoot\apply-migrations.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "All migrations applied successfully!" -ForegroundColor Green
} else {
    Write-Host "Error applying migrations." -ForegroundColor Red
    exit 1
} 