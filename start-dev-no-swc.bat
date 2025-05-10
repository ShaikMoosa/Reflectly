@echo off
set NEXT_DISABLE_SWC=1
set NODE_OPTIONS=--max-old-space-size=4096
echo Starting Next.js with SWC disabled...
node node_modules\next\dist\bin\next dev 