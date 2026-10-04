use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::{Manager, Emitter};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

#[derive(Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
enum RiskLevel {
    Read,
    Low,
    Medium,
    Critical,
}

#[derive(Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
enum CommandTool {
    Git,
    Docker,
    System,
    Unknown,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CommandSuggestion {
    intent: String,
    command: String,
    tool: CommandTool,
    summary: String,
    explanation: Vec<String>,
    suggested_risk: RiskLevel,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PlatformContext {
    os: String,
    shell: String,
}

const GEMINI_MODEL: &str = "gemini-3.5-flash-lite";

/// Detección heurística de plataforma.
///
/// La shell se infiere a partir de variables de entorno.
/// No es una detección exacta del shell activo del usuario,
/// sino una aproximación razonable para orientar la generación.
#[tauri::command]
fn get_platform_context() -> PlatformContext {
    let os = std::env::consts::OS;
    
    let shell = if os == "windows" {
        // Heurística: si PSModulePath existe, PowerShell está disponible
        if std::env::var("PSModulePath").is_ok() {
            "powershell".to_string()
        } else {
            "cmd".to_string()
        }
    } else if os == "macos" {
        "zsh".to_string()
    } else {
        "bash".to_string()
    };
    
    PlatformContext {
        os: os.to_string(),
        shell,
    }
}

#[tauri::command]
async fn generate_command_with_ai(
    intent: String,
    platform: String,
    shell: String,
    preferred_tool: String,
) -> Result<CommandSuggestion, String> {

    println!("[CommandDeck] Intent recibido: {}", intent);

    let api_key =
        std::env::var("GEMINI_API_KEY")
            .map_err(|_| {
                "No se encontró la variable GEMINI_API_KEY. Asegúrate de configurarla como variable de entorno del sistema.".to_string()
            })?;

    let client = reqwest::Client::new();

    let system_prompt = r#"
Eres el motor de generación de comandos de CommandDeck.

Tu trabajo es convertir instrucciones escritas en español
en comandos de terminal precisos.

CommandDeck está orientado inicialmente a:

- Git
- Docker
- comandos básicos del sistema

Reglas:

1. Genera exactamente un comando principal.
2. No ejecutes ningún comando.
3. No inventes resultados de terminal.
4. Explica brevemente qué hará el comando.
5. Divide las partes relevantes del comando en explicaciones cortas.
6. Clasifica provisionalmente el riesgo como:
   read, low, medium, critical
7. Tu clasificación de riesgo NO es definitiva.
8. Si no puedes determinar un comando razonable, utiliza tool = "unknown".
9. Ten en cuenta el sistema operativo, la shell y la herramienta preferida proporcionada para generar un comando compatible y exacto.

Devuelve únicamente JSON válido.

La estructura debe ser exactamente:

{
  "intent": "texto original",
  "command": "comando",
  "tool": "git | docker | system | unknown",
  "summary": "explicación breve",
  "explanation": [
    "parte 1",
    "parte 2"
  ],
  "suggestedRisk": "read | low | medium | critical"
}
"#;

    let prompt = format!(
        "{}\n\nContexto:\nSistema Operativo: {}\nShell: {}\nHerramienta preferida: {}\n\nPetición del usuario:\n{}",
        system_prompt,
        platform,
        shell,
        preferred_tool,
        intent
    );

    let body = json!({
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],

        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.1
        }
    });

    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
        GEMINI_MODEL,
        api_key
    );

    let max_retries = 4;
    let mut attempt = 1;
    let mut wait_secs = 1;

    let json_response: serde_json::Value = loop {
        match client.post(&url).json(&body).send().await {
            Ok(response) => {
                let status = response.status();

                if status.is_success() {
                    let json = response.json().await.map_err(|e| {
                        format!("No se pudo interpretar la respuesta HTTP de Gemini: {}", e)
                    })?;
                    break Ok(json);
                } else {
                    let status_u16 = status.as_u16();
                    let is_transient = matches!(status_u16, 408 | 429 | 500 | 502 | 503 | 504);

                    if is_transient {
                        if attempt < max_retries {
                            eprintln!("[CommandDeck] Gemini HTTP {}. Reintentando en {}s...", status, wait_secs);
                            tokio::time::sleep(std::time::Duration::from_secs(wait_secs)).await;
                            attempt += 1;
                            wait_secs *= 2;
                            continue;
                        } else {
                            eprintln!("[CommandDeck] Máximo de reintentos alcanzado.");
                            break Err("Gemini no está disponible temporalmente. Intenta nuevamente en unos segundos.".to_string());
                        }
                    } else {
                        let json: serde_json::Value = response.json().await.unwrap_or(serde_json::Value::Null);
                        let error_message = json["error"]["message"]
                            .as_str()
                            .unwrap_or("Sin detalle de error");
                        
                        let err_str = format!("Error de Gemini (HTTP {}): {}", status, error_message);
                        eprintln!("[CommandDeck] {}", err_str);
                        break Err(err_str);
                    }
                }
            }
            Err(e) => {
                if attempt < max_retries {
                    eprintln!("[CommandDeck] Error de conexión: {}. Reintentando en {}s...", e, wait_secs);
                    tokio::time::sleep(std::time::Duration::from_secs(wait_secs)).await;
                    attempt += 1;
                    wait_secs *= 2;
                    continue;
                } else {
                    eprintln!("[CommandDeck] Máximo de reintentos alcanzado. ({})", e);
                    break Err("Gemini no está disponible temporalmente. Intenta nuevamente en unos segundos.".to_string());
                }
            }
        }
    }?;

    let output_text =
        json_response["candidates"]
            .get(0)
            .and_then(|candidate| {
                candidate["content"]["parts"]
                    .get(0)
            })
            .and_then(|part| {
                part["text"].as_str()
            })
            .ok_or_else(|| {
                "Gemini no devolvió contenido válido.".to_string()
            })?;

    let result: CommandSuggestion =
        serde_json::from_str(output_text)
            .map_err(|e| {
                format!(
                    "Gemini respondió, pero el JSON no coincide con CommandDeck: {}\nRespuesta: {}",
                    e,
                    output_text
                )
            })?;

    println!("[CommandDeck] Comando generado: {}", result.command);

    Ok(result)
}

#[cfg_attr(
    mobile,
    tauri::mobile_entry_point
)]
pub fn run() {

    tauri::Builder::default()
        .plugin(
            tauri_plugin_clipboard_manager::init()
        )
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, _shortcut, event| {
                    if event.state() == ShortcutState::Pressed {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            if let Ok(true) = window.is_minimized() {
                                let _ = window.unminimize();
                            }
                            let _ = window.set_focus();
                            let _ = window.emit("focus-input", ());
                        }
                    }
                })
                .build()
        )
        .setup(|app| {
            #[cfg(desktop)]
            {
                let gs = app.global_shortcut();

                // Intentar registrar Alt+Space primero
                let primary = Shortcut::new(
                    Some(tauri_plugin_global_shortcut::Modifiers::ALT),
                    tauri_plugin_global_shortcut::Code::Space,
                );

                match gs.register(primary) {
                    Ok(_) => println!("[CommandDeck] HotKey registrado: Alt+Space"),
                    Err(e) => {
                        eprintln!("[CommandDeck] Alt+Space no disponible ({}). Intentando Ctrl+Alt+Space...", e);

                        // Fallback: Ctrl+Alt+Space
                        let fallback = Shortcut::new(
                            Some(
                                tauri_plugin_global_shortcut::Modifiers::CONTROL
                                    | tauri_plugin_global_shortcut::Modifiers::ALT,
                            ),
                            tauri_plugin_global_shortcut::Code::Space,
                        );

                        match gs.register(fallback) {
                            Ok(_) => println!("[CommandDeck] HotKey registrado (fallback): Ctrl+Alt+Space"),
                            Err(e2) => eprintln!("[CommandDeck] No se pudo registrar ningún HotKey: {}", e2),
                        }
                    }
                }
            }
            Ok(())
        })
        .invoke_handler(
            tauri::generate_handler![
                generate_command_with_ai,
                get_platform_context
            ]
        )
        .run(
            tauri::generate_context!()
        )
        .expect(
            "error while running tauri application"
        );
}