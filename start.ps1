# Check if we need to navigate to the reflectly directory
if (-not ($PWD.Path -match "\\reflectly$")) {
    Write-Host "Navigating to reflectly directory..." -ForegroundColor Cyan
    Set-Location ./reflectly
}
else {
    Write-Host "Already in reflectly directory" -ForegroundColor Cyan
}

# Kill any existing Next.js processes that might be holding ports
Write-Host "Checking for processes using Next.js ports..." -ForegroundColor Cyan
$portsToCheck = 3000..3010
foreach ($port in $portsToCheck) {
    $processesUsingPort = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    foreach ($processId in $processesUsingPort) {
        try {
            $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "Stopping process $($process.ProcessName) (ID: $processId) using port $port" -ForegroundColor Yellow
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            }
        }
        catch {
            Write-Host "Could not stop process $processId" -ForegroundColor Red
        }
    }
}

# Delete the .next directory properly with admin privileges if needed
if (Test-Path .next) {
    try {
        # Try to remove just the problematic trace file first
        if (Test-Path .next/trace) {
            Remove-Item -Path ".next/trace" -Force -ErrorAction SilentlyContinue
        }
        
        # Then try to remove the entire directory
        Remove-Item -Path ".next" -Recurse -Force -ErrorAction Stop
        Write-Host "Successfully removed .next directory" -ForegroundColor Green
    }
    catch {
        Write-Host "Warning: Could not completely remove .next directory due to permissions" -ForegroundColor Yellow
        Write-Host "Attempting to bypass permission issues..." -ForegroundColor Yellow
        
        # Try using the takeown command for Windows to take ownership of troublesome files
        if ($PSVersionTable.Platform -ne 'Unix') {
            try {
                Start-Process -FilePath "takeown" -ArgumentList "/f .next /r /d y" -Wait -NoNewWindow
                Start-Process -FilePath "icacls" -ArgumentList ".next /grant:r *S-1-1-0:F /t" -Wait -NoNewWindow
                Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
                Write-Host "Permission issues handled" -ForegroundColor Green
            }
            catch {
                Write-Host "Could not resolve permission issues. Try running as administrator." -ForegroundColor Red
            }
        }
    }
}

# Start the development server
Write-Host "Starting Next.js development server..." -ForegroundColor Cyan
npm run dev 