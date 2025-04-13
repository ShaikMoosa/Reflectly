# Simple starter script for Reflectly
Write-Host "Starting Reflectly development server..." -ForegroundColor Cyan

# Set environment variables
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:NODE_OPTIONS = "--max-old-space-size=4096"

# Start development server directly with npm
npm run dev -- --port=3010 