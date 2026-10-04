# CommandDeck - Implementación Sprint 02

## 1. Objetivo del sprint
El objetivo de este sprint fue implementar las funcionalidades core faltantes del MVP sin alterar drásticamente la arquitectura existente:
1. Detección real del SO y shell, y enviarlo a Gemini junto con la herramienta.
2. Historial local persistente real en vez de mocks.
3. Ampliación del motor de riesgo (Risk Engine) para comandos de Windows y Docker, y pruebas.
4. HotKey global (`Alt+Space`) para invocar CommandDeck y enfocar el input.
5. Limpieza de documentación, UI obsoleta y corrección de logs.

## 2. Estado inicial
CommandDeck contaba con UI en React/Tauri. El motor de riesgo solo soportaba algunas herramientas Linux/Git. Gemini recibía solo la intención. El historial usaba un mock fijo. El HotKey no estaba funcional y no se detectaba el OS.

## 3. Cambios implementados

### Contexto de plataforma
- **Archivos**: `src-tauri/src/lib.rs`, `src/services/llmCommandService.ts`, `src/services/commandService.ts`, `src/types/command.ts`.
- **Lógica**: Se creó `get_platform_context` en Rust que detecta el SO actual (`windows`, `macos`, `linux`) y aproxima el shell (`powershell`, `cmd`, `zsh`, `bash`).
- **Comportamiento**: `CommandResultCard` ahora muestra dinámicamente el SO/Shell real detectado.

### Gemini
- **Contexto**: El prompt enviado a Gemini fue ampliado para enviar OS, Shell y la herramienta seleccionada (`preferredTool`).
- **Enums**: Se establecieron Enums formales en Rust (`RiskLevel`, `CommandTool`) para validar y des-serializar de forma robusta la respuesta de Gemini.

### Historial
- **Archivos**: `src/services/historyService.ts`, `src/components/RecentCommands.tsx`, `src/services/commandService.ts`.
- **Lógica**: Almacenamiento en `localStorage` con límite de 20 entradas, ignorando duplicados consecutivos.
- **Reutilización**: Al hacer clic en "Reutilizar", se recupera la `intent` original y se asigna al input principal, mejorando la UX.

### Risk Engine
- **Archivos**: `src/utils/riskEngine.ts`, `src/utils/riskEngine.test.ts`.
- **Lógica**: Soporte añadido para PowerShell (`Remove-Item -Recurse -Force`, `Clear-Disk`, etc) y CMD (`del /s /q`, `rmdir /s /q`).
- **Docker**: Reglas destructivas añadidas (`docker system prune`, `docker image prune`, `docker network prune`, etc).
- **Operadores**: Las expresiones regulares evalúan el comando de forma global, detectando patrones destructivos sin importar operadores (`&&`, `|`, `;`).

### HotKey
- **Archivos**: `src-tauri/src/lib.rs`, `src/App.tsx`.
- **Lógica**: Se registró `Alt+Space` en Rust mediante `tauri-plugin-global-shortcut`. Al pulsarlo, desminimiza, trae al frente y enfoca la ventana. También emite el evento `focus-input`.
- **Foco**: En `App.tsx` se escucha el evento para aplicar `focus()` de HTML en el input.

### Documentación
- **Archivos**: `README.md`, varios en `src/`.
- **Cambios**: Se actualizaron textos, diagramas y descripciones para reflejar el estado actual (MVP) eliminando menciones "100% seguro" por "evaluación de riesgo".

## 4. Arquitectura final

```text
Usuario
  ↓
React (UI / Input enfocado vía HotKey)
  ↓
CommandService (Orquestador)
  ↓
PlatformContext (Detección real)
  ↓
LLM Service
  ↓
Tauri / Rust (Enums seguros)
  ↓
Gemini (Prompt enriquecido con OS, shell, tool)
  ↓
Risk Engine (Extendido Win/Docker)
  ↓
UI (CommandResultCard dinámica)
  ↓
Historial local (localStorage)
```

## 5. Archivos creados
- `src/services/historyService.ts`
- `src/utils/riskEngine.test.ts`
- `IMPLEMENTACION_SPRINT_02.md`

## 6. Archivos modificados
- `src-tauri/src/lib.rs`
- `src-tauri/Cargo.toml` (vía `cargo add serde`)
- `src/App.tsx`
- `src/services/commandService.ts`
- `src/services/llmCommandService.ts`
- `src/types/command.ts`
- `src/components/CommandResultCard.tsx`
- `src/components/RecentCommands.tsx`
- `src/utils/riskEngine.ts`
- `README.md`

## 7. Commits realizados (propuestos/historial)
*(Listados vía ramas: `feature/contexto-plataforma`, `feature/historial`, `feature/seguridad-hotkey`)*

## 8. Pruebas realizadas
- Pruebas unitarias en vitest de `riskEngine.ts`: Lecturas bajas/medias/críticas para Git, Docker, Windows PowerShell y CMD. Resultado: PASS.
- Build de Node (`npm run build`): PASS.
- Cargo check / Rust build: PASS.
- `npm run tauri dev`: UI levanta correctamente.

## 9. Funcionalidades que quedaron operativas
- [x] Detección de OS
- [x] Historial persistente local
- [x] Risk Engine avanzado (Windows, Docker)
- [x] HotKey Alt+Space y autofoco de input
- [x] Generación contextual a la plataforma y herramienta

## 10. Funcionalidades pendientes
- Safe Executor real
- Compatibilidad nativa Linux completa y validación cruzada.
- Instalador final.
- Kubernetes.
- Pruebas E2E automatizadas (Playwright).

## 11. Errores encontrados
- Ninguno crítico. Adaptado el build de Tauri para que funcione adecuadamente el global-shortcut y evitar dependencias incompatibles en React.

## 12. Deuda técnica
- Reemplazar localStorage por SQLite en Tauri en próximos sprints.

## 13. Estado estimado del MVP
El MVP se encuentra a un 85% para entrega final. Faltan detalles de QA y un modo "ejecutor seguro" que el usuario requiera.

## 14. Cómo ejecutar el proyecto
```bash
npm install
npm run tauri dev
```
