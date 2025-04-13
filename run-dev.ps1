# Improved Reflectly starter script with DEBUG mode
Write-Host "Starting Reflectly development server in DEBUG mode..." -ForegroundColor Cyan

# Set environment variables
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:NODE_OPTIONS = "--max-old-space-size=4096"
$env:NODE_ENV = "development"
$env:DEBUG = "*"  # Enable all debug logs

# First, kill any existing processes on port 3000
Write-Host "Checking for processes using port 3000..." -ForegroundColor Yellow
$portInUse = netstat -ano | findstr :3000
if ($portInUse) {
    $processPid = ($portInUse -split ' ')[-1]
    Write-Host "Killing process with PID $processPid using port 3000..." -ForegroundColor Yellow
    taskkill /F /PID $processPid
}

# Clean .next directory
Write-Host "Cleaning .next directory..." -ForegroundColor Yellow
if (Test-Path .next) {
    Remove-Item -Path .next -Recurse -Force -ErrorAction SilentlyContinue
}

# Show a helpful message to the user
Write-Host "The application will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C once to stop the server when finished" -ForegroundColor Yellow
Write-Host ""

# Run Next.js in debug mode
Write-Host "Starting Next.js with debugging enabled..." -ForegroundColor Green
npx --no-install next dev --port 3000 