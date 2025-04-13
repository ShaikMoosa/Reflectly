@echo off
echo Stopping any running servers...
FOR /F "tokens=5" %%T IN ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') DO (
  echo Killing process %%T
  taskkill /F /PID %%T
)
echo Starting development server...
npm run dev 