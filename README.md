# CommandDeck

Aplicación de escritorio en desarrollo que transforma una intención escrita en español en una propuesta de comando, explica su efecto y estima su nivel de riesgo.

## Estado

- Interfaz funcional con React y TypeScript.
- Generación simulada de comandos para Git y Docker.
- Clasificación inicial de riesgo y copia al portapapeles.
- La ejecución de comandos está deshabilitada intencionalmente; la aplicación no ejecuta las propuestas.

## Tecnologías

- Tauri 2 y Rust
- React 19 y TypeScript
- Vite

## Requisitos

- Node.js LTS y npm.
- Rust estable y Cargo.
- En Windows: Microsoft C++ Build Tools con la carga **Desarrollo para escritorio con C++** y Windows SDK. VS Code por sí solo no incluye el enlazador `link.exe` que necesita Rust.
- Dependencias del sistema de Tauri para tu plataforma. Consulta la [guía oficial de prerrequisitos de Tauri](https://v2.tauri.app/start/prerequisites/).

## Desarrollo

Instala las dependencias de JavaScript:

```bash
npm ci
```

Para ejecutar solo la interfaz en el navegador:

```bash
npm run dev
```

Para ejecutar la aplicación de escritorio:

```bash
npm run tauri dev
```

## Comprobaciones y compilación

```bash
npm run build
npm run tauri build
```

## Estructura

- `src/`: interfaz, servicios y lógica de riesgo.
- `src-tauri/`: aplicación nativa y configuración de Tauri.

## Próximos pasos

- Conectar un proveedor LLM mediante un backend seguro.
- Validar comandos y definir políticas por herramienta.
- Implementar ejecución con lista permitida y confirmación explícita.
- Completar el atajo global y el historial local.

## Licencia

Pendiente de definir. Añade una licencia antes de publicar el proyecto si quieres otorgar permisos de uso, modificación y distribución.
