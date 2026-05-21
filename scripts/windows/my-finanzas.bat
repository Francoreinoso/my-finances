@echo off
REM ============================================================
REM   my-finanzas - launcher para Windows
REM   Llama a start-app.sh dentro de WSL y abre el navegador.
REM   Cerrar esta ventana apaga ambos servers.
REM ============================================================

REM Ruta del proyecto DENTRO de WSL. Editala si moviste el repo.
set "PROJECT_PATH=/home/freinoso/projects/my-finanzas"

title my-finanzas - servers (cerrar para apagar)

REM zsh -ic carga .zshrc (donde vive fnm), asi Node esta disponible.
wsl.exe -- zsh -ic "%PROJECT_PATH%/scripts/start-app.sh --open"
