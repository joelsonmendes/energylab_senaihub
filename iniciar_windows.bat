@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo EnergyLab PRO - Servidor web local
where py >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  start "" "http://localhost:8080"
  py -m http.server 8080
) else (
  echo Python nao foi encontrado. Abra a versao HTML standalone do pacote para utilizar sem servidor.
  pause
)
