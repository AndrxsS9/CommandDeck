import type { RiskLevel } from '../types/command';

export interface RiskAssessment {
  level: RiskLevel;
  reasons: string[];
  reversible: boolean;
}

const criticalPatterns = [
  /\brm\s+-rf\b/i,
  /\bformat\b/i,
  /\bmkfs\b/i,
  /\bdd\s+if=/i,
  /\bgit\s+reset\s+--hard\b/i,
  /\bgit\s+clean\s+-[a-z]*f/i,
  /\bdocker\s+(system\s+prune|volume\s+rm|rm)\b/i,
];

const mediumPatterns = [
  /\bsudo\b/i,
  /\bdocker\s+(stop|restart|kill)\b/i,
  /\bgit\s+(branch\s+-D|rebase|push\s+--force)\b/i,
  /\b(kill|taskkill)\b/i,
];

const writePatterns = [
  /\bgit\s+(add|commit|checkout|switch|merge|stash)\b/i,
  /\bdocker\s+(start|run|create)\b/i,
  /\b(mkdir|touch|cp|mv)\b/i,
];

export function assessRisk(command: string): RiskAssessment {
  const reasons: string[] = [];

  if (criticalPatterns.some((p) => p.test(command))) {
    reasons.push('Puede eliminar, sobrescribir o descartar información de forma difícil de revertir.');
    if (/\bsudo\b/i.test(command)) reasons.push('Solicita privilegios elevados.');
    return { level: 'critical', reasons, reversible: false };
  }

  if (mediumPatterns.some((p) => p.test(command))) {
    reasons.push('Modifica el estado de procesos, servicios o repositorios.');
    if (/\bsudo\b/i.test(command)) reasons.push('Solicita privilegios elevados.');
    return { level: 'medium', reasons, reversible: false };
  }

  if (writePatterns.some((p) => p.test(command))) {
    reasons.push('Realiza cambios locales normalmente controlables.');
    return { level: 'low', reasons, reversible: true };
  }

  reasons.push('El comando parece principalmente informativo o de consulta.');
  return { level: 'read', reasons, reversible: true };
}
