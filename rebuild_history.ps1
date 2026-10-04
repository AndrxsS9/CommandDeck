git checkout main
git reset --mixed ab40e0b

# Rama 1: Contexto
git checkout -b feature/01-contexto-plataforma
git add src/types/command.ts src/services/llmCommandService.ts src/components/CommandResultCard.tsx src-tauri/Cargo.toml src-tauri/Cargo.lock
git commit -m "feat: detectar sistema operativo y enviar contexto a Gemini"
git push origin feature/01-contexto-plataforma -f

# Rama 2: Historial (basada en la 1)
git checkout -b feature/02-historial
git add src/services/historyService.ts src/components/RecentCommands.tsx
git commit -m "feat: implementar historial persistente local"
git push origin feature/02-historial -f

# Rama 3: Seguridad y Hotkey (basada en la 2)
git checkout -b feature/03-seguridad-hotkey
git add src/utils/riskEngine.ts src/utils/riskEngine.test.ts src/App.tsx src-tauri/src/lib.rs src/services/commandService.ts README.md IMPLEMENTACION_SPRINT_02.md
git add .
git commit -m "feat: ampliar motor de riesgo y registrar hotkey global"
git push origin feature/03-seguridad-hotkey -f

# Restaurar main a como estaba antes del error y forzar el push
git checkout main
git reset --hard ab40e0b
git push origin main --force
