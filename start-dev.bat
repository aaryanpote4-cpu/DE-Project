@echo off
TITLE Delivery & Logistics Optimizer (Dev Mode)
color 0A

echo ==============================================================================
echo       LAUNCHING IN DUAL DEV MODE (Vite Dev Server + Node.js Backend)
echo ==============================================================================
echo.

cd /d "%~dp0"

echo [*] Starting Backend Server in background...
start "Backend API Server" cmd /k "cd backend && npm run dev"

timeout /t 2 /nobreak >nul

echo [*] Starting Vite Frontend Server...
cd frontend
call npm run dev
