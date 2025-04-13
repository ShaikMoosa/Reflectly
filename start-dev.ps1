# Kill any existing Next.js processes
Write-Host "Cleaning up existing processes..." -ForegroundColor Cyan
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*next*" } | ForEach-Object { 
    try {
        $_ | Stop-Process -Force
        Write-Host "Killed process with ID $($_.Id)" -ForegroundColor Green
    } catch {
        Write-Host "Could not kill process with ID $($_.Id): $_" -ForegroundColor Red
    }
}

# Check if port 3001 is already in use
$portInUse = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "Warning: Port 3001 is already in use by process ID: $($portInUse.OwningProcess)" -ForegroundColor Yellow
    $processName = (Get-Process -Id $portInUse.OwningProcess -ErrorAction SilentlyContinue).ProcessName
    Write-Host "Process name: $processName" -ForegroundColor Yellow
    
    $response = Read-Host "Would you like to kill this process? (Y/N)"
    if ($response -eq "Y" -or $response -eq "y") {
        try {
            Stop-Process -Id $portInUse.OwningProcess -Force
            Write-Host "Process killed successfully" -ForegroundColor Green
        } catch {
            Write-Host "Failed to kill process: $_" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Port 3001 is still in use. Please free up the port before continuing." -ForegroundColor Red
        exit 1
    }
}

# Clean up the .next directory
Write-Host "Cleaning up .next directory..." -ForegroundColor Cyan
if (Test-Path .next) {
    try {
        Remove-Item -Path ".next" -Recurse -Force -ErrorAction Stop
        Write-Host ".next directory removed successfully" -ForegroundColor Green
    } catch {
        Write-Host "Could not remove .next directory completely: $_" -ForegroundColor Yellow
    }
}

# Set enhanced environment variables for debugging
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:NODE_OPTIONS = "--max-old-space-size=4096 --inspect"
$env:NEXT_DEBUG = "true"
$env:DEBUG = "*"

Write-Host "Starting Next.js on port 3001 with enhanced debugging..." -ForegroundColor Cyan
Write-Host "You can connect to the Node inspector at chrome://inspect" -ForegroundColor Yellow

# Start the development server directly using npm run
$startNextProcess = Start-Process -PassThru -FilePath "npm" -ArgumentList "run dev -- --port 3001"

Write-Host "Started Next.js with process ID: $($startNextProcess.Id)" -ForegroundColor Green
Write-Host "Look for any errors in the console output above" -ForegroundColor Cyan

# Open the browser after a short delay
Write-Host "Opening browser in 5 seconds..." -ForegroundColor Cyan
Start-Sleep -Seconds 5
Start-Process "http://localhost:3001"

Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow 