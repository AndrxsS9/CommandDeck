use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CommandSuggestion {
    intent: String,
    command: String,
    tool: String,
    summary: String,
    explanation: Vec<String>,
    suggested_risk: String,
}

const GEMINI_MODEL: &str = "gemini-3.5-flash-lite";

#[tauri::command]
async fn generate_command_with_ai(
    intent: String,
) -> Result<CommandSuggestion, String> {

    println!("LLAMANDO A GEMINI — intent recibido: {}", intent);
    println!("Modelo utilizado: {}", GEMINI_MODEL);

    /*
     * Recuperamos la clave de Gemini
     * desde Windows.
     */
    let api_key =
        std::env::var("GEMINI_API_KEY")
            .map_err(|_| {
                "No se encontró la variable GEMINI_API_KEY. Asegúrate de configurarla como variable de entorno del sistema.".to_string()
            })?;

    println!("GEMINI_API_KEY encontrada (longitud: {})", api_key.len());

    let client = reqwest::Client::new();

    /*
     * System Prompt de CommandDeck.
     */
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

read
low
medium
critical

7. Tu clasificación de riesgo NO es definitiva.
CommandDeck utiliza un motor de seguridad independiente.

8. Si no puedes determinar un comando razonable,
utiliza tool = "unknown".

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

    /*
     * Combinamos instrucciones del sistema
     * con la petición del usuario.
     */
    let prompt = format!(
        "{}\n\nPetición del usuario:\n{}",
        system_prompt,
        intent
    );

    /*
     * Pedimos JSON como respuesta.
     */
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

    /*
     * Gemini generateContent.
     *
     * Usamos un modelo Flash-Lite para mantener
     * baja latencia y consumo reducido.
     */
    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
        GEMINI_MODEL,
        api_key
    );

    let max_retries = 4;
    let mut attempt = 1;
    let mut wait_secs = 1;

    let json_response: serde_json::Value = loop {
        println!("Intento {} de {}", attempt, max_retries);
        println!("ENVIANDO REQUEST A GEMINI...");

        match client.post(&url).json(&body).send().await {
            Ok(response) => {
                let status = response.status();
                println!("Gemini respondió HTTP {}", status);

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
                            println!("Reintentando en {} segundos...", wait_secs);
                            tokio::time::sleep(std::time::Duration::from_secs(wait_secs)).await;
                            attempt += 1;
                            wait_secs *= 2;
                            continue;
                        } else {
                            println!("ERROR GEMINI DEFINITIVO: Máximo de reintentos alcanzado.");
                            break Err("Gemini no está disponible temporalmente. Intenta nuevamente en unos segundos.".to_string());
                        }
                    } else {
                        // Error no transitorio (400, 401, 403, 404, etc.)
                        let json: serde_json::Value = response.json().await.unwrap_or(serde_json::Value::Null);
                        let error_message = json["error"]["message"]
                            .as_str()
                            .unwrap_or("Sin detalle de error");
                        
                        let err_str = format!("Error de Gemini (HTTP {}): {}", status, error_message);
                        println!("ERROR GEMINI DEFINITIVO: {}", err_str);
                        break Err(err_str);
                    }
                }
            }
            Err(e) => {
                if attempt < max_retries {
                    println!("Error de conexión: {}. Reintentando en {} segundos...", e, wait_secs);
                    tokio::time::sleep(std::time::Duration::from_secs(wait_secs)).await;
                    attempt += 1;
                    wait_secs *= 2;
                    continue;
                } else {
                    println!("ERROR GEMINI DEFINITIVO: Máximo de reintentos alcanzado. ({})", e);
                    break Err("Gemini no está disponible temporalmente. Intenta nuevamente en unos segundos.".to_string());
                }
            }
        }
    }?;

    /*
     * Gemini devuelve normalmente:
     *
     * candidates[0]
     *   .content
     *   .parts[0]
     *   .text
     */
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
                format!(
                    "Gemini no devolvió contenido válido. Respuesta completa: {}",
                    json_response
                )
            })?;

    println!("RESPUESTA DE GEMINI RECIBIDA: {}", output_text);

    /*
     * Convertimos el JSON generado por Gemini
     * a nuestra estructura Rust.
     */
    let result: CommandSuggestion =
        serde_json::from_str(output_text)
            .map_err(|e| {
                format!(
                    "Gemini respondió, pero el JSON no coincide con CommandDeck: {}\nRespuesta: {}",
                    e,
                    output_text
                )
            })?;

    println!("COMANDO GENERADO: {}", result.command);

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
                .build()
        )

        .invoke_handler(
            tauri::generate_handler![
                generate_command_with_ai
            ]
        )

        .run(
            tauri::generate_context!()
        )

        .expect(
            "error while running tauri application"
        );
}