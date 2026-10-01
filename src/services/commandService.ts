import type {
  CommandResult,
  RiskLevel,
} from '../types/command';

import { generateMockSuggestion } from './mockCommandService';

import { assessRisk } from '../utils/riskEngine';

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
  intent: string
): Promise<CommandResult> {

  /*
   * PASO 1
   *
   * Pedimos una propuesta.
   *
   * Hoy:
   * Mock
   *
   * Después:
   * LLM
   */
  const suggestion =
    await generateMockSuggestion(intent);

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

  const riskReasons = [...localAssessment.reasons];

  if (suggestion.suggestedRisk !== localAssessment.level &&
      riskPriority[suggestion.suggestedRisk] > riskPriority[localAssessment.level]) {
    riskReasons.push(
      'El generador ha marcado un riesgo superior al análisis local.'
    );
  }

  /*
   * PASO 4
   *
   * Construimos el objeto definitivo
   * que recibirá la interfaz.
   */
  return {
    id: crypto.randomUUID(),

    intent: suggestion.intent,

    command: suggestion.command,

    tool: suggestion.tool,

    summary: suggestion.summary,

    explanation: suggestion.explanation,

    aiRisk: suggestion.suggestedRisk,

    localRisk: localAssessment.level,

    risk: finalRisk,

    riskReasons,

    reversible:
      localAssessment.reversible,

    destructive:
      localAssessment.destructive,

    requiresConfirmation:
      finalRisk === 'medium' ||
      finalRisk === 'critical',
  };
}