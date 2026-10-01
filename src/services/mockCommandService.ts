import type {
  CommandSuggestion,
  RiskLevel,
} from '../types/command';

const normalize = (value: string) =>
  value
    .toLowerCase()
    .trim();

/**
 * Este servicio SIMULA temporalmente un LLM.
 *
 * Su trabajo es únicamente:
 *
 * intención
 *      ↓
 * comando
 *
 * NO toma la decisión definitiva de seguridad.
 */
export async function generateMockSuggestion(
  intent: string
): Promise<CommandSuggestion> {

  /*
   * Simulamos una pequeña demora de red.
   */
  await new Promise((resolve) =>
    setTimeout(resolve, 450)
  );

  const q = normalize(intent);

  let command = 'git status';

  let tool: CommandSuggestion['tool'] = 'git';

  let summary =
  'Muestra el estado actual del repositorio Git.';

  let explanation = [
  'git: ejecuta el cliente de Git.',
  'status: muestra la rama actual y el estado de los archivos.',
  ];

  let suggestedRisk: RiskLevel = 'read';

  /*
   * DOCKER
   */

  if (
    q.includes('detener') &&
    q.includes('contenedor')
  ) {
    command = 'docker stop $(docker ps -q)';

    tool = 'docker';

    summary =
      'Detiene todos los contenedores Docker actualmente activos.';

    explanation = [
      'docker ps -q: obtiene los identificadores de los contenedores activos.',
      '$(...): utiliza esos identificadores como argumentos.',
      'docker stop: solicita la detención de cada contenedor.',
    ];

    suggestedRisk = 'medium';
  }

  else if (
    q.includes('contenedor') &&
    (
      q.includes('listar') ||
      q.includes('ver') ||
      q.includes('mostrar')
    )
  ) {
    command = 'docker ps';

    tool = 'docker';

    summary =
      'Lista los contenedores Docker actualmente activos.';

    explanation = [
      'docker: ejecuta el cliente de Docker.',
      'ps: muestra los contenedores en ejecución.',
    ];

    suggestedRisk = 'read';
  }

  /*
   * GIT
   */

  else if (
    q.includes('rama') &&
    (
      q.includes('listar') ||
      q.includes('ver') ||
      q.includes('mostrar')
    )
  ) {
    command = 'git branch';

    tool = 'git';

    summary =
      'Lista las ramas locales del repositorio.';

    explanation = [
      'git: ejecuta Git.',
      'branch: muestra las ramas locales.',
    ];

    suggestedRisk = 'read';
  }

  else if (
    q.includes('crear') &&
    q.includes('rama')
  ) {
    /*
     * Ejemplo sencillo.
     * Más adelante la IA podrá extraer dinámicamente
     * el nombre de la rama.
     */

    command = 'git switch -c nueva-rama';

    tool = 'git';

    summary =
      'Crea una nueva rama y cambia hacia ella.';

    explanation = [
      'git switch: cambia entre ramas.',
      '-c: indica que debe crear una nueva rama.',
      'nueva-rama: representa el nombre de la nueva rama.',
    ];

    suggestedRisk = 'low';
  }

  else if (
    q.includes('eliminar') &&
    q.includes('rama') &&
    (
      q.includes('fusion') ||
      q.includes('fusionada')
    )
  ) {
    command =
      'git branch --merged | grep -v "\\*" | xargs -n 1 git branch -d';

    tool = 'git';

    summary =
      'Elimina ramas locales que ya fueron fusionadas.';

    explanation = [
      'git branch --merged: obtiene las ramas ya fusionadas.',
      'grep -v "*": excluye la rama actualmente activa.',
      'xargs: procesa cada resultado.',
      'git branch -d: elimina cada rama usando la opción segura de Git.',
    ];

    suggestedRisk = 'medium';
  }

  else if (
    q.includes('estado') &&
    q.includes('git')
  ) {
    command = 'git status';

    tool = 'git';

    summary =
      'Muestra el estado actual del repositorio Git.';

    explanation = [
      'git: ejecuta Git.',
      'status: muestra cambios pendientes y la rama actual.',
    ];

    suggestedRisk = 'read';
  }

  return {
    intent,

    command,

    tool,

    summary,

    explanation,

    suggestedRisk,
  };
}