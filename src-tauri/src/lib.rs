use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::{Emitter, Manager};
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
    Kubernetes,
    System,
    Unknown,
}

/// Texto de presentación generado en ambos idiomas de la interfaz.
#[derive(Debug, Serialize, Deserialize, PartialEq)]
struct LocalizedText {
    es: String,
    en: String,
}

/// Desglose de parámetros generado en ambos idiomas de la interfaz.
#[derive(Debug, Serialize, Deserialize, PartialEq)]
struct LocalizedExplanation {
    es: Vec<String>,
    en: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CommandSuggestion {
    intent: String,
    command: String,
    tool: CommandTool,
    summary: LocalizedText,
    explanation: LocalizedExplanation,
    suggested_risk: RiskLevel,
}

/// Interpreta el JSON devuelto por Gemini y valida que los textos
/// de presentación existan en ambos idiomas.
///
/// La intención se reemplaza por la petición original del usuario:
/// nunca se usa una versión traducida o reescrita por el modelo.
fn parse_suggestion(output_text: &str, original_intent: &str) -> Result<CommandSuggestion, String> {
    let mut suggestion: CommandSuggestion = serde_json::from_str(output_text)
        .map_err(|e| format!("JSON inválido: {}", e))?;

    if suggestion.summary.es.trim().is_empty() || suggestion.summary.en.trim().is_empty() {
        return Err("summary debe incluir texto en es y en".to_string());
    }

    suggestion.intent = original_intent.to_string();

    Ok(suggestion)
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

fn get_gemini_api_key() -> Result<String, String> {
    if let Ok(value) = std::env::var("GEMINI_API_KEY") {
        let value = value.trim();

        if !value.is_empty() {
            return Ok(value.to_string());
        }
    }

    if let Some(value) = option_env!("COMMANDDECK_BUILD_GEMINI_API_KEY") {
        let value = value.trim();

        if !value.is_empty() {
            return Ok(value.to_string());
        }
    }

    Err("Gemini no está configurado correctamente.".to_string())
}

#[tauri::command]
async fn generate_command_with_ai(
    intent: String,
    platform: String,
    shell: String,
    preferred_tool: String,
    language: String,
) -> Result<CommandSuggestion, String> {
    let api_key = get_gemini_api_key()?;

    let client = reqwest::Client::new();
    let system_prompt = r#"
Eres el motor de generación de comandos de CommandDeck.

Tu trabajo es convertir instrucciones en comandos de terminal precisos.

CommandDeck está orientado inicialmente a:

- Git
- Docker
- Kubernetes
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
9. Ten en cuenta el sistema operativo y la shell para generar un comando compatible y exacto.
10. Si preferredTool = "auto", determina la herramienta adecuada entre git, docker, kubernetes o system según la intención. De lo contrario, úsala como preferencia explícita.
11. Si preferredTool = "kubernetes" o la intención lo requiere, prioriza comandos `kubectl` (e.g. `kubectl get pods`). No ejecutes nada, solo sugiere el comando adecuado.

Reglas de idioma (obligatorias):

12. Devuelve SIEMPRE `summary` en dos idiomas: `summary.es` (español) y `summary.en` (inglés).
13. Devuelve SIEMPRE `explanation` en dos idiomas: `explanation.es` (lista en español) y `explanation.en` (lista en inglés).
14. Ambos idiomas deben expresar exactamente el mismo significado. `explanation.es` y `explanation.en` deben tener los mismos elementos, en el mismo orden.
15. Los tokens reales del comando (por ejemplo `git`, `branch`, `kubectl`, `get`, flags, rutas, nombres de recursos) NUNCA se traducen: aparecen idénticos en ambos idiomas.
16. El campo `command` es único y jamás se traduce.
17. `intent` debe conservar exactamente la petición original del usuario, sin traducirla ni reformularla.
18. El idioma en que está escrita la petición NO decide el idioma de `summary` ni de `explanation`: ambos idiomas se generan siempre.

Devuelve únicamente JSON válido, sin texto adicional ni bloques de código.

La estructura debe ser exactamente:

{
  "intent": "petición original sin modificar",
  "command": "comando",
  "tool": "git | docker | kubernetes | system | unknown",
  "summary": {
    "es": "explicación breve en español",
    "en": "brief explanation in English"
  },
  "explanation": {
    "es": [
      "token → explicación en español"
    ],
    "en": [
      "token → explanation in English"
    ]
  },
  "suggestedRisk": "read | low | medium | critical"
}

Ejemplo:

{
  "intent": "List Kubernetes pods",
  "command": "kubectl get pods",
  "tool": "kubernetes",
  "summary": {
    "es": "Lista todos los pods del namespace actual de Kubernetes.",
    "en": "Lists all pods in the current Kubernetes namespace."
  },
  "explanation": {
    "es": [
      "kubectl → Herramienta de línea de comandos de Kubernetes.",
      "get → Subcomando para obtener recursos.",
      "pods → Tipo de recurso que se mostrará."
    ],
    "en": [
      "kubectl → The Kubernetes command-line tool.",
      "get → Subcommand used to retrieve resources.",
      "pods → The resource type to display."
    ]
  },
  "suggestedRisk": "read"
}
"#;

    // El idioma activo de la interfaz ya no condiciona la generación:
    // Gemini devuelve siempre ES y EN y la UI elige al renderizar.
    // El parámetro se conserva para no romper el contrato IPC existente.
    let _ = language;

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
        "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent",
        GEMINI_MODEL
    );

    let max_retries = 4;
    let mut attempt = 1;
    let mut wait_secs = 1;

    let json_response: serde_json::Value = loop {
        match client
            .post(&url)
            .header("x-goog-api-key", &api_key)
            .json(&body)
            .send()
            .await
        {
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
                            eprintln!(
                                "[CommandDeck] Gemini HTTP {}. Reintentando en {}s...",
                                status, wait_secs
                            );
                            tokio::time::sleep(std::time::Duration::from_secs(wait_secs)).await;
                            attempt += 1;
                            wait_secs *= 2;
                            continue;
                        } else {
                            eprintln!("[CommandDeck] Máximo de reintentos alcanzado.");
                            break Err("Gemini no está disponible temporalmente. Intenta nuevamente en unos segundos.".to_string());
                        }
                    } else {
                        let json: serde_json::Value =
                            response.json().await.unwrap_or(serde_json::Value::Null);
                        let error_message = json["error"]["message"]
                            .as_str()
                            .unwrap_or("Sin detalle de error");

                        let err_str =
                            format!("Error de Gemini (HTTP {}): {}", status, error_message);
                        eprintln!("[CommandDeck] {}", err_str);
                        break Err(err_str);
                    }
                }
            }
            Err(e) => {
                if attempt < max_retries {
                    eprintln!(
                        "[CommandDeck] Error de conexión: {}. Reintentando en {}s...",
                        e, wait_secs
                    );
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

    let output_text = json_response["candidates"]
        .get(0)
        .and_then(|candidate| candidate["content"]["parts"].get(0))
        .and_then(|part| part["text"].as_str())
        .ok_or_else(|| "Gemini no devolvió contenido válido.".to_string())?;

    let result = parse_suggestion(output_text, &intent).map_err(|e| {
        eprintln!("[CommandDeck] Respuesta JSON de Gemini inválida: {}", e);

        "Gemini respondió con un formato no válido. Intenta nuevamente.".to_string()
    })?;

    Ok(result)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
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

#[cfg(test)]
mod tests {
    use super::*;

    const BILINGUAL_RESPONSE: &str = r#"{
        "intent": "List Kubernetes pods",
        "command": "kubectl get pods",
        "tool": "kubernetes",
        "summary": {
            "es": "Lista todos los pods del namespace actual de Kubernetes.",
            "en": "Lists all pods in the current Kubernetes namespace."
        },
        "explanation": {
            "es": ["kubectl → Herramienta de línea de comandos de Kubernetes.", "get → Subcomando para obtener recursos."],
            "en": ["kubectl → The Kubernetes command-line tool.", "get → Subcommand used to retrieve resources."]
        },
        "suggestedRisk": "read"
    }"#;

    #[test]
    fn parsea_summary_y_explanation_bilingues() {
        let s = parse_suggestion(BILINGUAL_RESPONSE, "List Kubernetes pods").unwrap();
        assert_eq!(s.command, "kubectl get pods");
        assert_eq!(s.tool, CommandTool::Kubernetes);
        assert_eq!(s.suggested_risk, RiskLevel::Read);
        assert_eq!(s.summary.es, "Lista todos los pods del namespace actual de Kubernetes.");
        assert_eq!(s.summary.en, "Lists all pods in the current Kubernetes namespace.");
        assert_eq!(s.explanation.es.len(), 2);
        assert_eq!(s.explanation.en.len(), 2);
        assert!(s.explanation.en[0].starts_with("kubectl"));
    }

    #[test]
    fn conserva_la_intencion_original_aunque_gemini_la_traduzca() {
        let s = parse_suggestion(BILINGUAL_RESPONSE, "listar pods de kubernetes").unwrap();
        assert_eq!(s.intent, "listar pods de kubernetes");
        assert_eq!(s.command, "kubectl get pods");
    }

    #[test]
    fn rechaza_el_formato_monolingue_anterior() {
        let legacy = r#"{
            "intent": "estado",
            "command": "git status",
            "tool": "git",
            "summary": "Muestra el estado.",
            "explanation": ["git → Git."],
            "suggestedRisk": "read"
        }"#;
        assert!(parse_suggestion(legacy, "estado").is_err());
    }

    #[test]
    fn rechaza_summary_vacio_en_algun_idioma() {
        let missing_en = BILINGUAL_RESPONSE.replace(
            "Lists all pods in the current Kubernetes namespace.",
            "  ",
        );
        assert!(parse_suggestion(&missing_en, "pods").is_err());
    }

    #[test]
    fn serializa_en_camel_case_para_el_frontend() {
        let s = parse_suggestion(BILINGUAL_RESPONSE, "pods").unwrap();
        let value = serde_json::to_value(&s).unwrap();
        assert_eq!(value["suggestedRisk"], "read");
        assert_eq!(value["summary"]["en"], "Lists all pods in the current Kubernetes namespace.");
        assert!(value["explanation"]["es"].is_array());
    }
}
