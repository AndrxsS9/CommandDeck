export type RiskLevel = 'read' | 'low' | 'medium' | 'critical';

export type CommandTool =
  | 'git'
  | 'docker'
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
 * Propuesta generada por el proveedor LLM (Gemini) vía Tauri/Rust.
 */
export interface CommandSuggestion {
  intent: string;
  command: string;
  tool: CommandTool;
  summary: string;
  explanation: string[];

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
  summary: string;
  explanation: string[];

  /** Riesgo sugerido por IA. */
  aiRisk: RiskLevel;

  /** Riesgo calculado localmente por el Risk Engine. */
  localRisk: RiskLevel;

  /** Riesgo definitivo mostrado al usuario. */
  risk: RiskLevel;

  riskReasons: string[];
  reversible: boolean;
  destructive: boolean;
  requiresConfirmation: boolean;
}