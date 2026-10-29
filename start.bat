@echo off
TITLE Delivery & Logistics Optimizer Launcher
color 0B

echo ==============================================================================
echo           DELIVERY ^& LOGISTICS OPTIMIZER - ENTERPRISE PLATFORM
echo ==============================================================================
echo.

cd /d "%~dp0"

:: 1. Check frontend build
if not exist "frontend\dist\index.html" (
    echo [*] Frontend production build not detected. Building frontend assets...
    cd frontend
    call npm run build
    cd ..
    echo [✓] Frontend build completed.
    echo.
)

:: 2. Launch the browser
echo [*] Opening application in your default browser...
start http://localhost:3000

:: 3. Start unified Node.js backend server
echo [*] Starting unified full-stack server (Node.js API + React Frontend)...
echo.
cd backend
node server.js
pause
