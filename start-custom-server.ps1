Write-Host "Starting custom Next.js server with SWC disabled..."
$env:NEXT_DISABLE_SWC=1
$env:NODE_OPTIONS="--max-old-space-size=4096 --no-warnings"
$env:NEXT_TELEMETRY_DISABLED=1
node server.js 