import type {
  CommandSuggestion,
  LocalizedExplanation,
  LocalizedText,
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

  let summary: LocalizedText = {
    es: 'Muestra el estado actual del repositorio Git.',
    en: 'Shows the current state of the Git repository.',
  };

  let explanation: LocalizedExplanation = {
    es: [
      'git: ejecuta el cliente de Git.',
      'status: muestra la rama actual y el estado de los archivos.',
    ],
    en: [
      'git: runs the Git client.',
      'status: shows the current branch and the state of the files.',
    ],
  };

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

    summary = {
      es: 'Detiene todos los contenedores Docker actualmente activos.',
      en: 'Stops all currently running Docker containers.',
    };

    explanation = {
      es: [
        'docker ps -q: obtiene los identificadores de los contenedores activos.',
        '$(...): utiliza esos identificadores como argumentos.',
        'docker stop: solicita la detención de cada contenedor.',
      ],
      en: [
        'docker ps -q: gets the IDs of the running containers.',
        '$(...): uses those IDs as arguments.',
        'docker stop: requests each container to stop.',
      ],
    };

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

    summary = {
      es: 'Lista los contenedores Docker actualmente activos.',
      en: 'Lists the currently running Docker containers.',
    };

    explanation = {
      es: [
        'docker: ejecuta el cliente de Docker.',
        'ps: muestra los contenedores en ejecución.',
      ],
      en: [
        'docker: runs the Docker client.',
        'ps: shows the running containers.',
      ],
    };

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

    summary = {
      es: 'Lista las ramas locales del repositorio.',
      en: 'Lists the local branches of the repository.',
    };

    explanation = {
      es: [
        'git: ejecuta Git.',
        'branch: muestra las ramas locales.',
      ],
      en: [
        'git: runs Git.',
        'branch: shows the local branches.',
      ],
    };

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

    summary = {
      es: 'Crea una nueva rama y cambia hacia ella.',
      en: 'Creates a new branch and switches to it.',
    };

    explanation = {
      es: [
        'git switch: cambia entre ramas.',
        '-c: indica que debe crear una nueva rama.',
        'nueva-rama: representa el nombre de la nueva rama.',
      ],
      en: [
        'git switch: switches between branches.',
        '-c: indicates that a new branch must be created.',
        'nueva-rama: represents the name of the new branch.',
      ],
    };

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

    summary = {
      es: 'Elimina ramas locales que ya fueron fusionadas.',
      en: 'Deletes local branches that have already been merged.',
    };

    explanation = {
      es: [
        'git branch --merged: obtiene las ramas ya fusionadas.',
        'grep -v "*": excluye la rama actualmente activa.',
        'xargs: procesa cada resultado.',
        'git branch -d: elimina cada rama usando la opción segura de Git.',
      ],
      en: [
        'git branch --merged: gets the already merged branches.',
        'grep -v "*": excludes the currently active branch.',
        'xargs: processes each result.',
        'git branch -d: deletes each branch using the safe Git option.',
      ],
    };

    suggestedRisk = 'medium';
  }

  else if (
    q.includes('estado') &&
    q.includes('git')
  ) {
    command = 'git status';

    tool = 'git';

    summary = {
      es: 'Muestra el estado actual del repositorio Git.',
      en: 'Shows the current state of the Git repository.',
    };

    explanation = {
      es: [
        'git: ejecuta Git.',
        'status: muestra cambios pendientes y la rama actual.',
      ],
      en: [
        'git: runs Git.',
        'status: shows pending changes and the current branch.',
      ],
    };

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