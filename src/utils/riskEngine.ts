import type { RiskLevel } from '../types/command';

export interface RiskAssessment {
  level: RiskLevel;

  score: number;

  reasons: string[];

  reversible: boolean;

  destructive: boolean;

  requiresConfirmation: boolean;
}

/**
 * Acciones consideradas especialmente peligrosas.
 */
const destructivePatterns = [
  /\brm\s+(?:-[a-z]*r[a-z]*|--recursive)\b/i,
  /\brm\s+(?:-[a-z]*f[a-z]*|--force)\b/i,

  /\bformat\b/i,
  /\bmkfs\b/i,

  /\bdd\s+if=/i,

  /\bgit\s+reset\s+--hard\b/i,

  /\bgit\s+clean\s+-[a-z]*f/i,

  /\bgit\s+branch\s+-D\b/i,

  /\bdocker\s+system\s+prune\b/i,

  /\bdocker\s+volume\s+prune\b/i,

  /\bdocker\s+volume\s+rm\b/i,

  /\bdocker\s+rm\b/i,
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

  /\bgit\s+push\s+.*--force\b/i,

  /\bgit\s+push\s+-f\b/i,

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

  const hasDestructiveAction = destructivePatterns.some((pattern) =>
    pattern.test(command)
  );

  const hasMediumAction = mediumPatterns.some((pattern) =>
    pattern.test(command)
  );

  const hasWriteAction = writePatterns.some((pattern) =>
    pattern.test(command)
  );

  const hasBulkAction = bulkPatterns.some((pattern) =>
    pattern.test(command)
  );

  const hasElevatedPrivileges = elevatedPrivilegePatterns.some((pattern) =>
    pattern.test(command)
  );

  /*
   * 1. Acción destructiva
   */
  if (hasDestructiveAction) {
    score += 8;

    destructive = true;

    reversible = false;

    reasons.push(
      'El comando puede eliminar, sobrescribir o descartar información.'
    );
  }

  /*
   * 2. Modificación significativa
   */
  if (hasMediumAction) {
    score += 4;

    reasons.push(
      'El comando modifica el estado de procesos, servicios o repositorios.'
    );
  }

  /*
   * 3. Escritura normal
   */
  if (hasWriteAction) {
    score += 2;

    reasons.push(
      'El comando realiza modificaciones locales.'
    );
  }

  /*
   * 4. Operación masiva
   */
  if (hasBulkAction) {
    score += 2;

    reasons.push(
      'La operación puede afectar múltiples elementos.'
    );
  }

  /*
   * 5. Privilegios elevados
   */
  if (hasElevatedPrivileges) {
    score += 4;

    reasons.push(
      'El comando solicita privilegios elevados del sistema.'
    );
  }

  /*
   * Convertimos el puntaje a un nivel comprensible.
   */
let level: RiskLevel = 'read';

/*
 * Una acción destructiva siempre será crítica,
 * independientemente de la puntuación acumulada.
 */
if (hasDestructiveAction) {
  level = 'critical';
}

else if (score >= 8) {
  level = 'critical';
}

else if (score >= 4) {
  level = 'medium';
}

else if (score >= 1) {
  level = 'low';
}

  /*
   * Si no encontramos ninguna modificación,
   * consideramos el comando informativo.
   */
  if (score === 0) {
    reasons.push(
      'El comando parece realizar únicamente una consulta o lectura.'
    );
  }

  return {
    level,

    score,

    reasons,

    reversible,

    destructive,

    requiresConfirmation:
      level === 'medium' || level === 'critical',
  };
}