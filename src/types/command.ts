export type RiskLevel = 'read' | 'low' | 'medium' | 'critical';

/**
 * Códigos semánticos y estables que explican el riesgo calculado
 * por el Risk Engine local. Son independientes del idioma: la capa
 * de presentación los traduce con el sistema i18n.
 */
export type RiskReasonCode =
  | 'destructive-operation'
  | 'state-modification'
  | 'local-modification'
  | 'bulk-operation'
  | 'elevated-privileges'
  | 'read-only';

/**
 * Motivo de riesgo mostrado en la interfaz.
 *
 * - Un código del Risk Engine local.
 * - O la indicación de que la IA sugirió un riesgo superior
 *   al calculado localmente (con el nivel sugerido).
 */
export type RiskReason =
  | { code: RiskReasonCode }
  | { code: 'ai-higher-risk'; level: RiskLevel };

export type CommandTool =
  | 'git'
  | 'docker'
  | 'kubernetes'
  | 'system'
  | 'unknown';

export type OperatingSystem = 'windows' | 'linux' | 'macos' | 'unknown';

export type ShellType =
  | 'powershell'
  | 'cmd'
  | 'bash'
  | 'zsh'
  | 'unknown';

export interface PlatformContext {
  os: OperatingSystem;
  shell: ShellType;
}

/**
 * Texto de presentación generado en ambos idiomas de la interfaz.
 * La UI elige `es` o `en` al renderizar, sin volver a llamar a Gemini.
 */
export interface LocalizedText {
  es: string;
  en: string;
}

/**
 * Desglose de parámetros generado en ambos idiomas de la interfaz.
 * Los tokens reales del comando no se traducen.
 */
export interface LocalizedExplanation {
  es: string[];
  en: string[];
}

/**
 * Propuesta generada por el proveedor LLM (Gemini) vía Tauri/Rust.
 */
export interface CommandSuggestion {
  intent: string;
  command: string;
  tool: CommandTool;
  summary: LocalizedText;
  explanation: LocalizedExplanation;

  /**
   * Riesgo sugerido por el LLM.
   *
   * CommandDeck NO confía únicamente en este valor;
   * el Risk Engine realiza una evaluación independiente.
   */
  suggestedRisk: RiskLevel;
}

/**
 * Resultado final que recibe la interfaz.
 *
 * Incluye tanto lo generado como la evaluación
 * independiente realizada por CommandDeck.
 */
export interface CommandResult {
  id: string;
  intent: string;
  command: string;
  tool: CommandTool;
  summary: LocalizedText;
  explanation: LocalizedExplanation;

  /** Riesgo sugerido por IA. */
  aiRisk: RiskLevel;

  /** Riesgo calculado localmente por el Risk Engine. */
  localRisk: RiskLevel;

  /** Riesgo definitivo mostrado al usuario. */
  risk: RiskLevel;

  riskReasons: RiskReason[];
  reversible: boolean;
  destructive: boolean;
  requiresConfirmation: boolean;
}