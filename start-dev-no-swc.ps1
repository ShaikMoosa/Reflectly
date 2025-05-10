Write-Host "Starting Next.js with SWC disabled and using JavaScript compiler..."
$env:NEXT_DISABLE_SWC=1
$env:NODE_OPTIONS="--max-old-space-size=4096 --no-warnings"
$env:NEXT_TELEMETRY_DISABLED=1
node node_modules\next\dist\bin\next dev 