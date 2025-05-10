@echo off
echo Starting clean Next.js setup...

echo Removing .next directory if it exists...
if exist .next (
  rmdir /s /q .next
)

echo Setting environment variables...
set NEXT_TELEMETRY_DISABLED=1

echo Starting Next.js development server...
cd /d "%~dp0"
next dev --port 3008 