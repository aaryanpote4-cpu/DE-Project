@echo off
echo ========================================================
echo Pushing DSA Logistics Optimizer to GitHub...
echo Repository: https://github.com/aaryanpote4-cpu/DE-Project
echo ========================================================
echo.

git push -u origin main --force

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo [SUCCESS] Your project is now live on GitHub!
    echo https://github.com/aaryanpote4-cpu/DE-Project
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo [ERROR] Push failed. Check details above.
    echo ========================================================
)

echo.
pause
