@echo off
title Rodape de Letras - Servidor (SIMULACAO)
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0servidor.ps1" -Simular
pause
