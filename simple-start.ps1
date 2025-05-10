# Simple starter script for Reflectly
Write-Host "Starting Next.js with multiple SWC workarounds..."

# Set environment variables to disable SWC
$env:NEXT_DISABLE_SWC=1
$env:NODE_OPTIONS="--max-old-space-size=4096 --no-warnings"
$env:NEXT_TELEMETRY_DISABLED=1
$env:NEXT_WEBPACK=true
$env:NEXT_FORCE_TRANSPILE=true

# Remove problematic SWC modules if they exist
$swcPath = "node_modules/@next/swc-win32-x64-msvc"
if (Test-Path $swcPath) {
    Write-Host "Removing problematic SWC module..."
    Remove-Item -Recurse -Force $swcPath -ErrorAction SilentlyContinue
}

# Try to run with node directly
Write-Host "Starting Next.js development server..."
try {
    node node_modules\next\dist\bin\next dev
} 
catch {
    Write-Host "Failed to start Next.js with the standard method, trying custom server..."
    # If that fails, try the custom server
    if (Test-Path "server.js") {
        node server.js
    } else {
        Write-Host "Could not start Next.js using any method. Please check your Next.js installation."
    }
} 