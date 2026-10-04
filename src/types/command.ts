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
 * Respuesta propuesta por el generador.
 *
 * Hoy la genera nuestro simulador.
 * Más adelante la generará el LLM.
 */
export interface CommandSuggestion {
  intent: string;
  command: string;
  tool: CommandTool;
  summary: string;
  explanation: string[];

  /**
   * Riesgo sugerido por el generador.
   *
   * Importante:
   * CommandDeck NO confiará únicamente en este valor.
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

  /**
   * Riesgo sugerido por IA/simulador.
   */
  aiRisk: RiskLevel;

  /**
   * Riesgo calculado localmente.
   */
  localRisk: RiskLevel;

  /**
   * Riesgo definitivo mostrado al usuario.
   */
  risk: RiskLevel;

  riskReasons: string[];

  reversible: boolean;

  destructive: boolean;

  requiresConfirmation: boolean;
}