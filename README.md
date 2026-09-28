# CommandDeck v0.1

MVP de escritorio: intención en español → comando → explicación → clasificación de riesgo.

## Stack
- Tauri 2
- React + TypeScript
- Vite
- Rust en la capa nativa

## Estado de esta entrega
- UI funcional
- Motor de riesgo local inicial
- Generador simulado para Git/Docker
- Copiado al portapapeles
- Ejecución deliberadamente bloqueada hasta implementar el executor seguro
- Estructura preparada para global shortcut

## Requisitos locales
Instala Node.js y Rust. Para Tauri en Windows/Linux también debes instalar las dependencias del sistema indicadas en la documentación oficial de Tauri.

## Ejecutar
```bash
npm install
npm run tauri dev
```

## Próximos pasos
1. Conectar proveedor LLM mediante backend Rust o backend remoto seguro.
2. Exigir salida JSON estructurada.
3. Añadir validador de comandos y políticas por herramienta.
4. Implementar executor con allowlist y confirmaciones.
5. Registrar atajo global y mostrar/ocultar ventana flotante.
6. Guardar historial local.
