@echo off
title Sistema de Calificaciones Tributarias
echo =======================================================
echo Iniciando el Servidor del Sistema...
echo =======================================================

cd /d "%~dp0backend"

:: Instala las dependencias en modo silencioso si faltan
if not exist "node_modules\" (
    echo [INFO] Instalando dependencias por primera vez...
    npm install
)

echo [INFO] Levantando el servidor local...
node server.js

pause
