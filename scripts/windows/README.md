# Launcher de my-finanzas para Windows

Esta carpeta contiene los scripts que arrancan la aplicación desde Windows
sin tener que abrir WSL manualmente.

## Archivos

| Archivo | Para qué |
|---------|----------|
| `my-finanzas.bat` | Launcher simple. Abre una ventana de cmd con los servers, cerrarla apaga todo. |
| `my-finanzas.ps1` | Launcher PowerShell. Arranca los servers minimizados y abre el browser. Si ya están corriendo, solo abre el browser. |

## Decidir cuál usar

- **Si querés simplicidad:** usá el `.bat`. Es inmediato.
- **Si querés UX más limpia (sin ventana visible mientras usás la app):** usá el `.ps1`.

Ambos:
1. Llaman a `wsl.exe`
2. Adentro de WSL, ejecutan `zsh -ic` (para que fnm cargue Node)
3. Corren `start-app.sh`
4. Abren `http://localhost:5174` en el browser default

## Cómo crear el shortcut en el escritorio

### Opción A: shortcut al `.bat` (más fácil)

1. Abrí el explorador de archivos.
2. Pegá esta dirección en la barra:
   ```
   \\wsl.localhost\Ubuntu\home\freinoso\projects\my-finanzas\scripts\windows
   ```
   (Reemplazá `Ubuntu` por el nombre de tu distro de WSL si es otra.
    Lo ves con `wsl -l -v` en Powershell.)
3. Click derecho sobre `my-finanzas.bat` → **Crear acceso directo**.
4. Movelo al escritorio.
5. (Opcional) Click derecho sobre el shortcut → **Propiedades** → pestaña
   **Acceso directo** → **Ejecutar: minimizado**.
6. (Opcional) Cambiá el ícono: **Propiedades** → **Cambiar icono**.

Ahora doble click → arranca todo + abre el browser.

### Opción B: shortcut al `.ps1` (más prolijo, sin ventana visible)

1. Click derecho en el escritorio → **Nuevo** → **Acceso directo**.
2. En "ubicación", pegá esto **EXACTO** (todo en una línea):
   ```
   powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "\\wsl.localhost\Ubuntu\home\freinoso\projects\my-finanzas\scripts\windows\my-finanzas.ps1"
   ```
3. Nombre del shortcut: `my-finanzas`.
4. Finalizar.
5. (Opcional) Cambiá el ícono.

Doble click → no ves ventana, pero el browser se abre con la app cuando los
servers están listos (~2-5 segundos).

### ¿Cómo apago los servers después?

- **`.bat`**: cerrá la ventana de cmd que se abrió.
- **`.ps1`**: abrí PowerShell y corré `Get-Process wsl | Stop-Process`,
  o reiniciá WSL con `wsl --shutdown`.

## Troubleshooting

**No abre el browser / queda colgado:**
- Verificá que las dependencias estén instaladas. Desde WSL:
  ```bash
  cd ~/projects/my-finanzas
  cd backend && pnpm install
  cd ../frontend && pnpm install
  ```

**`Permission denied` al ejecutar el `.sh`:**
- Desde WSL: `chmod +x ~/projects/my-finanzas/scripts/start-app.sh`

**El `.ps1` no corre por la política de ejecución:**
- Asegurate de invocar con `-ExecutionPolicy Bypass` (ya está en las
  instrucciones de arriba). NO cambies la política global del sistema.

**El proyecto está en otra ruta:**
- Editá `PROJECT_PATH` en `my-finanzas.bat` o `$ProjectPath` en `my-finanzas.ps1`.
