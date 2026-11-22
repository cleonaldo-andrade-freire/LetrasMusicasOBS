@echo off
title Rodape de Letras - Servidor
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0servidor.ps1" %*
pause
