# CommandDeck - Asistente IA de Terminal

Aplicación de escritorio construida con Tauri, React y Rust, diseñada para convertir intenciones en lenguaje natural a comandos seguros de terminal usando Gemini API.

## Arquitectura Actual

```text
Usuario
  ↓
React (UI)
  ↓
CommandService (Orquestador)
  ↓
PlatformContext (Detección de OS/Shell)
  ↓
LLM Service (Cliente Gemini)
  ↓
Tauri / Rust (Backend nativo)
  ↓
Gemini API (Generación)
  ↓
Risk Engine (Validación local de seguridad)
  ↓
Historial local
```

## Características (MVP - Sprint 02)

- **Generación impulsada por Gemini**: Convierte comandos en español a scripts de terminal.
- **Detección de Plataforma Real**: Detecta automáticamente el sistema operativo y el shell subyacente para proporcionar el contexto correcto.
- **Motor de Riesgo Mejorado**: Evalúa localmente la seguridad de los comandos generados, con soporte extendido para Windows (PowerShell/CMD) y Docker, y pruebas unitarias.
- **Historial Local**: Almacenamiento persistente de los últimos comandos generados.
- **Atajo Global**: Integración de HotKey (Alt+Space) para acceder rápidamente al asistente.
- **Selector de Herramientas**: Filtra explícitamente el contexto a herramientas soportadas (Git, Docker, Sistema).
- *Kubernetes: Próximamente*.
- *Ejecución: Actualmente deshabilitada (sólo copiar al portapapeles).*

## Stack Tecnológico

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Rust, Tauri 2
- **Seguridad**: Motor heurístico local independiente
- **IA**: Gemini 3.5 Flash-Lite (Google AI Studio)

## Cómo ejecutar localmente

1. Configura tu variable de entorno:
   `GEMINI_API_KEY=tu_clave_aqui`

2. Instala dependencias:
   `npm install`

3. Inicia en modo desarrollo con Tauri:
   `npm run tauri dev`

## Pruebas

Para ejecutar las pruebas del motor de riesgos:
`npx vitest run`
