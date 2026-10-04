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
 * Permite comparar el riesgo sugerido por la IA
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
  return riskPriority[localRisk] >= riskPriority[aiRisk]
    ? localRisk
    : aiRisk;
}

/**
 * Orquestador central de CommandDeck.
 *
 * La interfaz llama únicamente a esta función.
 *
 * Flujo:
 *   App → commandService → Gemini (vía Tauri) → Risk Engine → UI
 */
export async function generateCommand(
  intent: string,
  preferredTool: CommandTool | 'all'
): Promise<CommandResult & { platformContext: PlatformContext }> {

  const platformContext = await getPlatformContext();

  // Paso 1: Generación con Gemini
  const suggestion =
    await generateLLMSuggestion(intent, platformContext, preferredTool);

  // Paso 2: Evaluación independiente de riesgo
  const localAssessment =
    assessRisk(suggestion.command);

  // Paso 3: Tomar el riesgo más alto entre IA y local
  const finalRisk = getHighestRisk(
    suggestion.suggestedRisk,
    localAssessment.level
  );

  let finalReasons = [...localAssessment.reasons];

  if (riskPriority[suggestion.suggestedRisk] > riskPriority[localAssessment.level]) {
    finalReasons.push(`La IA sugirió un nivel de riesgo superior (${suggestion.suggestedRisk}) al detectado por el análisis local.`);
  }

  if (finalRisk === 'medium' || finalRisk === 'critical') {
    finalReasons = finalReasons.filter(
      reason => reason !== 'El comando parece realizar únicamente una consulta o lectura.'
    );
  }

  // Paso 4: Resultado final
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
    riskReasons: finalReasons,
    reversible: localAssessment.reversible,
    destructive: localAssessment.destructive,
    requiresConfirmation:
      finalRisk === 'medium' ||
      finalRisk === 'critical',
    platformContext,
  };
  
  // Guardar en historial (aislado: no debe afectar al resultado)
  addHistoryEntry({
    intent: finalResult.intent,
    command: finalResult.command,
    tool: finalResult.tool,
    desc: finalResult.summary,
    risk: finalResult.risk,
  });

  return finalResult;
}