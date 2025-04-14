# Improved Next.js development server startup script

# Function to check if a port is in use
function Test-PortInUse {
    param($Port)
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        return ($null -ne $connections) # $connections is not null
    } catch {
        Write-Host "Error checking port $Port - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to get process info by port
function Get-ProcessByPort {
    param($Port)
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($null -ne $connection) { # Connection is not null
            $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
            return $process
        }
    } catch {
        Write-Host "Error finding process for port $Port - $($_.Exception.Message)" -ForegroundColor Red
    }
    return $null
}

Write-Host "===== Next.js Development Server Startup =====" -ForegroundColor Cyan

# Target port to use
$port = 3001

# Check if the port is in use
if (Test-PortInUse -Port $port) {
    $process = Get-ProcessByPort -Port $port
    if ($null -ne $process) { # Process is not null
        Write-Host "Port $port is in use by:" -ForegroundColor Yellow
        Write-Host "  Process Name: $($process.ProcessName)" -ForegroundColor Yellow
        Write-Host "  Process ID: $($process.Id)" -ForegroundColor Yellow
        
        $response = Read-Host "Would you like to terminate this process and free the port? (Y/N)"
        if ($response -eq "Y" -or $response -eq "y") {
            try {
                Stop-Process -Id $process.Id -Force
                Write-Host "Process terminated successfully" -ForegroundColor Green
                # Give it a moment to fully release
                Start-Sleep -Seconds 1
            } catch {
                Write-Host "Failed to terminate the process - $($_.Exception.Message)" -ForegroundColor Red
                Write-Host "Try running this script with administrator privileges or manually stop the process" -ForegroundColor Yellow
                exit 1
            }
        } else {
            # Try an alternative port
            $port = 3006
            Write-Host "Using alternative port: $port" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Port $port is in use, but the owning process could not be identified" -ForegroundColor Yellow
        Write-Host "Trying alternative port: 3006" -ForegroundColor Yellow
        $port = 3006
    }
}

# Basic cleanup before starting
Write-Host "Cleaning up Next.js cache..." -ForegroundColor Cyan

# A less aggressive approach to cleaning the .next directory
# Instead of removing everything, just remove the cache
if (Test-Path .next/cache) {
    try {
        Remove-Item -Path ".next/cache" -Recurse -Force -ErrorAction Stop
        Write-Host ".next/cache directory cleaned successfully" -ForegroundColor Green
    } catch {
        Write-Host "Could not clean .next/cache directory completely - $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Set minimal environment variables needed
$env:NEXT_TELEMETRY_DISABLED = "1"
# Use a more modest memory limit without inspection mode
$env:NODE_OPTIONS = "--max-old-space-size=4096"

Write-Host "Starting Next.js on port $port..." -ForegroundColor Cyan

# Start the development server using npm
try {
    # Start Next.js development server with the specified port
    if ($port -eq 3001) {
        npm run dev
    } else {
        npm run dev -- --port $port
    }
} catch {
    Write-Host "Failed to start the Next.js development server - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} 