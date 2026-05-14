@echo off
title Express Mebel ERP - Start
echo ==========================================
echo    Express Mebel ERP - Tizim Ishga Tushmoqda
echo ==========================================
echo.
echo 1. Eski jarayonlar tozalanmoqda...
taskkill /f /im node.exe >nul 2>&1
echo.
echo 2. Tizim ishga tushirilmoqda...
echo.
echo DIQQAT: Ushbu oynani yopmang! 
echo Tizim ishlashi uchun ushbu qora oyna ochiq turishi shart.
echo.
echo Brauzer avtomatik ochilmoqda...
echo.
cd /d "%~dp0"
start http://localhost:5173/login
npm run dev
pause
