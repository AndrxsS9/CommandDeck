# CommandDeck — Asistente IA de Terminal

Aplicación de escritorio construida con Tauri 2, React 19 y Rust, diseñada para convertir intenciones en lenguaje natural a propuestas de comandos de terminal con evaluación local de riesgo, usando Gemini API.

## Arquitectura

```text
Usuario
  ↓
React 19 (UI)
  ↓
CommandService (Orquestador)
  ↓
PlatformContext (Detección heurística de OS/Shell)
  ↓
LLM Service → Tauri / Rust → Gemini API
  ↓
Risk Engine (Evaluación local independiente)
  ↓
Historial local (localStorage)
```

## Características (MVP)

- **Generación con Gemini**: Convierte instrucciones en español a comandos de terminal.
- **Detección de plataforma**: Infiere el sistema operativo y la shell objetivo (heurística, no detección exacta).
- **Motor de riesgo local**: Evalúa independientemente el riesgo de los comandos generados, con soporte para Linux, Windows (PowerShell/CMD) y Docker.
- **Historial local**: Almacenamiento persistente de los últimos comandos generados.
- **Atajo global**: HotKey (Alt+Space, con fallback a Ctrl+Alt+Space) para invocar y enfocar CommandDeck.
- **Selector de herramientas**: Filtra el contexto a Git, Docker o Sistema.
- *Kubernetes: Próximamente.*
- *Ejecución: Actualmente deshabilitada (solo copiar al portapapeles).*

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | React 19, TypeScript, Vite 6 |
| Backend | Rust, Tauri 2 |
| IA | Gemini 3.5 Flash-Lite (Google AI Studio) |
| Seguridad | Motor heurístico local independiente |
| Pruebas | Vitest |

## HotKey Global

CommandDeck registra un atajo global al iniciar:

1. **Alt+Space** (preferido): Se intenta registrar primero.
2. **Ctrl+Alt+Space** (fallback): Se registra automáticamente si Alt+Space está en conflicto con el sistema operativo (frecuente en Windows).

Si ninguno puede registrarse, se imprime un error en la consola de Rust. La app sigue funcionando sin atajo.

## Seguridad

- CommandDeck utiliza una CSP (`Content-Security-Policy`) de producción restrictiva y una `devCsp` específica para desarrollo que permite únicamente Vite local y el endpoint seguro de Supabase Auth.
- En entorno de desarrollo, la integración con Gemini se resuelve mediante la variable de entorno runtime `GEMINI_API_KEY`.
- Para distribuciones académicas / empaquetado del instalador, el binario puede incorporar la clave en tiempo de compilación mediante `COMMANDDECK_BUILD_GEMINI_API_KEY`.
- Ninguna de las dos claves debe versionarse ni exponerse en archivos del repositorio.
- Una clave integrada en un binario desktop debe considerarse distribuida y con fines de evaluación académica, no un secreto de producción.
- Las credenciales nunca se almacenan en el frontend ni en archivos versionados, no se incluyen en la URL ni query strings, y se envían a la API de Gemini exclusivamente mediante el header HTTP `x-goog-api-key` desde el backend de Rust.

## Notas sobre detección de plataforma

La detección de shell es una **heurística** basada en variables de entorno (`PSModulePath` en Windows, sistema operativo en Linux/macOS). No se garantiza que refleje la shell activa exacta del usuario. Los términos correctos son "shell inferida" o "shell objetivo".

## Cómo ejecutar localmente

1. Configura tu variable de entorno:
   ```
   GEMINI_API_KEY=tu_clave_aqui
   ```

2. Instala dependencias:
   ```bash
   npm install
   ```

3. Inicia en modo desarrollo con Tauri:
   ```bash
   npm run tauri dev
   ```

## Pruebas

```bash
npx vitest run
```

## Plataformas

- **Windows x64**: Soportado y validado.
- **Linux x64**: Build mediante GitHub Actions; validación runtime pendiente.
- **macOS Apple Silicon (arm64)**: Build mediante GitHub Actions; validación runtime pendiente.
- **macOS Intel (x64)**: Build mediante GitHub Actions; validación runtime pendiente.
