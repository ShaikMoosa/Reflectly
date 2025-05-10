@echo off
echo Starting Next.js with SWC disabled...
set NEXT_DISABLE_SWC=1
set NODE_OPTIONS=--max-old-space-size=4096
cd %~dp0
node node_modules\next\dist\bin\next dev 