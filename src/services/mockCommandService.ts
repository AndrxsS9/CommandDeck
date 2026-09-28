import type { CommandResult } from '../types/command';
import { assessRisk } from '../utils/riskEngine';

const normalize = (value: string) => value.toLowerCase().trim();

export async function generateCommand(intent: string): Promise<CommandResult> {
  await new Promise((resolve) => setTimeout(resolve, 450));
  const q = normalize(intent);

  let command = 'git status';
  let tool: CommandResult['tool'] = 'git';
  let summary = 'Muestra el estado actual del repositorio.';
  let explanation = ['git: ejecuta Git.', 'status: muestra cambios, archivos preparados y rama actual.'];

  if (q.includes('detener') && q.includes('contenedor')) {
    command = 'docker stop $(docker ps -q)';
    tool = 'docker';
    summary = 'Detiene todos los contenedores Docker que están ejecutándose.';
    explanation = [
      'docker ps -q: obtiene únicamente los identificadores de los contenedores activos.',
      '$(...): inserta esos identificadores como argumentos.',
      'docker stop: solicita una detención ordenada de cada contenedor.',
    ];
  } else if (q.includes('contenedor') && (q.includes('listar') || q.includes('ver'))) {
    command = 'docker ps';
    tool = 'docker';
    summary = 'Lista los contenedores Docker actualmente activos.';
    explanation = ['docker: cliente de Docker.', 'ps: muestra los contenedores en ejecución.'];
  } else if (q.includes('rama') && (q.includes('ver') || q.includes('listar'))) {
    command = 'git branch';
    tool = 'git';
    summary = 'Lista las ramas locales del repositorio.';
    explanation = ['git: ejecuta Git.', 'branch: lista las ramas locales.'];
  } else if (q.includes('eliminar') && q.includes('rama') && q.includes('fusion')) {
    command = 'git branch --merged | grep -v "\\*" | xargs -n 1 git branch -d';
    tool = 'git';
    summary = 'Elimina ramas locales ya fusionadas, excluyendo la rama actual.';
    explanation = [
      'git branch --merged: lista ramas ya fusionadas.',
      'grep -v "*": excluye la rama actualmente activa.',
      'xargs ... git branch -d: intenta eliminar cada rama de forma segura.',
    ];
  } else if (q.includes('estado') && q.includes('git')) {
    command = 'git status';
  }

  const risk = assessRisk(command);

  return {
    id: crypto.randomUUID(),
    intent,
    command,
    tool,
    summary,
    explanation,
    risk: risk.level,
    riskReasons: risk.reasons,
    reversible: risk.reversible,
  };
}
