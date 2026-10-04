import type {
  CommandResult,
  RiskLevel,
  CommandTool,
  PlatformContext
} from '../types/command';

import { generateLLMSuggestion, getPlatformContext } from './llmCommandService';

import { assessRisk } from '../utils/riskEngine';
import { addHistoryEntry } from './historyService';

/**
 * Jerarquía de riesgo.
 *
 * Nos permite comparar el riesgo sugerido por la IA
 * con el calculado localmente.
 */
const riskPriority: Record<RiskLevel, number> = {
  read: 0,
  low: 1,
  medium: 2,
  critical: 3,
};

/**
 * Devuelve siempre el riesgo MÁS ALTO.
 */
function getHighestRisk(
  aiRisk: RiskLevel,
  localRisk: RiskLevel
): RiskLevel {

  if (
    riskPriority[localRisk] >=
    riskPriority[aiRisk]
  ) {
    return localRisk;
  }

  return aiRisk;
}

/**
 * Este será el servicio central de CommandDeck.
 *
 * La interfaz NO debería llamar directamente
 * ni al simulador ni posteriormente al LLM.
 *
 * App
 *  ↓
 * commandService
 *  ↓
 * generador
 *  ↓
 * Safety Engine
 */
export async function generateCommand(
  intent: string,
  preferredTool: CommandTool | 'all'
): Promise<CommandResult & { platformContext: PlatformContext }> {

  /*
   * Obtenemos el contexto de la plataforma real
   */
  const platformContext = await getPlatformContext();

  /*
   * PASO 1
   *
   * Pedimos una propuesta.
   *
   * Hoy:
   * Gemini
   */
  const suggestion =
    await generateLLMSuggestion(intent, platformContext, preferredTool);

  /*
   * PASO 2
   *
   * CommandDeck analiza independientemente
   * el comando generado.
   */
  const localAssessment =
    assessRisk(suggestion.command);

  /*
   * PASO 3
   *
   * Comparamos:
   *
   * riesgo de IA
   * VS
   * riesgo local.
   *
   * Siempre conservamos el más alto.
   */
  const finalRisk = getHighestRisk(
    suggestion.suggestedRisk,
    localAssessment.level
  );

  /*
   * PASO 4
   *
   * Construimos el objeto definitivo
   * que recibirá la interfaz.
   */
  const finalResult = {
    id: crypto.randomUUID(),

    intent: suggestion.intent,

    command: suggestion.command,

    tool: suggestion.tool,

    summary: suggestion.summary,

    explanation: suggestion.explanation,

    aiRisk: suggestion.suggestedRisk,

    localRisk: localAssessment.level,

    risk: finalRisk,

    riskReasons: localAssessment.reasons,

    reversible:
      localAssessment.reversible,

    destructive:
      localAssessment.destructive,

    requiresConfirmation:
      finalRisk === 'medium' ||
      finalRisk === 'critical',
    
    platformContext,
  };
  
  // Guardar en el historial
  addHistoryEntry({
    intent: finalResult.intent,
    command: finalResult.command,
    tool: finalResult.tool,
    desc: finalResult.summary,
    risk: finalResult.risk,
  });

  return finalResult;
}