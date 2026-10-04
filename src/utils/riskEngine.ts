import type { RiskLevel } from '../types/command';

export interface RiskAssessment {
  level: RiskLevel;
  score: number;
  reasons: string[];
  reversible: boolean;
  destructive: boolean;
  requiresConfirmation: boolean;
}

const destructivePatterns = [
  // Linux
  /\brm\s+(?:-[a-z]*r[a-z]*|--recursive)\b/i,
  /\brm\s+(?:-[a-z]*f[a-z]*|--force)\b/i,

  // Windows PowerShell
  /\bRemove-Item\b.*-Recurse\b.*-Force\b/i,
  /\bRemove-Item\b.*-Force\b.*-Recurse\b/i,
  /\bRemove-Item\b.*-Force\b/i,
  /\bStop-Process\b.*-Force\b/i,
  /\bFormat-Volume\b/i,
  /\bClear-Disk\b/i,
  /\bRemove-Partition\b/i,

  // Windows CMD
  /\bdel\b.*\s+\/s\b.*\s+\/q\b/i,
  /\bdel\b.*\s+\/q\b.*\s+\/s\b/i,
  /\brmdir\b.*\s+\/s\b.*\s+\/q\b/i,
  /\brmdir\b.*\s+\/q\b.*\s+\/s\b/i,
  /\brd\b.*\s+\/s\b.*\s+\/q\b/i,
  /\brd\b.*\s+\/q\b.*\s+\/s\b/i,
  /\btaskkill\b.*\s+\/F\b/i,

  // Filesystem general
  /\bformat\s+[a-z]:/i,
  /\bmkfs\b/i,
  /\bdd\s+if=/i,

  // Git
  /\bgit\s+reset\s+--hard\b/i,
  /\bgit\s+clean\s+-[a-z]*f/i,
  /\bgit\s+branch\s+-D\b/i,
  /\bgit\s+push\b.*\s+(?:-f|--force)(?:\s|$)/i,

  // Docker ampliado
  /\bdocker\s+system\s+prune\b/i,
  /\bdocker\s+volume\s+prune\b/i,
  /\bdocker\s+container\s+prune\b/i,
  /\bdocker\s+image\s+prune\b/i,
  /\bdocker\s+network\s+prune\b/i,
  /\bdocker\s+(?:container\s+)?rm\b.*\s+(?:-f|--force)\b/i,
  /\bdocker\s+(?:volume\s+)?rm\b/i,
];

/**
 * Acciones que modifican significativamente
 * procesos, servicios o repositorios.
 */
const mediumPatterns = [
  /\bdocker\s+stop\b/i,
  /\bdocker\s+restart\b/i,
  /\bdocker\s+kill\b/i,

  /\bgit\s+rebase\b/i,
  /\bgit\s+branch\s+-d\b/i,
  /\bgit\s+push\b/i,

  /\bkill\b/i,
  /\btaskkill\b/i,
];

/**
 * Acciones que escriben o modifican información,
 * pero normalmente son controlables.
 */
const writePatterns = [
  /\bgit\s+add\b/i,
  /\bgit\s+commit\b/i,
  /\bgit\s+checkout\b/i,
  /\bgit\s+switch\b/i,
  /\bgit\s+merge\b/i,
  /\bgit\s+stash\b/i,

  /\bdocker\s+start\b/i,
  /\bdocker\s+run\b/i,
  /\bdocker\s+create\b/i,

  /\bmkdir\b/i,
  /\btouch\b/i,
  /\bcp\b/i,
  /\bmv\b/i,
];

/**
 * Detecta indicadores de acciones masivas.
 */
const bulkPatterns = [
  /\$\(/i,
  /\bxargs\b/i,
  /\b--all\b/i,
  /\s-a\b/i,
  /\s--force\b/i,
  /\s-f\b/i,
];

/**
 * Detecta solicitudes de privilegios elevados.
 */
const elevatedPrivilegePatterns = [
  /\bsudo\b/i,
  /\brunas\b/i,
  /\bStart-Process\b.*-Verb\s+RunAs/i,
];

export function assessRisk(command: string): RiskAssessment {
  let score = 0;
  const reasons: string[] = [];
  let destructive = false;
  let reversible = true;

  const hasDestructiveAction = destructivePatterns.some((pattern) => pattern.test(command));
  const hasMediumAction = mediumPatterns.some((pattern) => pattern.test(command));
  const hasWriteAction = writePatterns.some((pattern) => pattern.test(command));
  const hasBulkAction = bulkPatterns.some((pattern) => pattern.test(command));
  const hasElevatedPrivileges = elevatedPrivilegePatterns.some((pattern) => pattern.test(command));

  if (hasDestructiveAction) {
    score += 8;
    destructive = true;
    reversible = false;
    reasons.push('El comando puede eliminar, sobrescribir o descartar información.');
  }

  if (hasMediumAction) {
    score += 4;
    reasons.push('El comando modifica el estado de procesos, servicios o repositorios.');
  }

  if (hasWriteAction) {
    score += 2;
    reasons.push('El comando realiza modificaciones locales.');
  }

  if (hasBulkAction) {
    score += 2;
    reasons.push('La operación puede afectar múltiples elementos.');
  }

  if (hasElevatedPrivileges) {
    score += 4;
    reasons.push('El comando solicita privilegios elevados del sistema.');
  }

  let level: RiskLevel = 'read';

  if (hasDestructiveAction || score >= 8) {
    level = 'critical';
  } else if (score >= 4) {
    level = 'medium';
  } else if (score >= 1) {
    level = 'low';
  }

  if (score === 0) {
    reasons.push('El comando parece realizar únicamente una consulta o lectura.');
  }

  return {
    level,
    score,
    reasons,
    reversible,
    destructive,
    requiresConfirmation: level === 'medium' || level === 'critical',
  };
}