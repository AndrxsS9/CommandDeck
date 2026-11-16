import { describe, it, expect } from 'vitest';
import { assessRisk } from './riskEngine';

describe('Risk Engine', () => {
  it('detecta comandos de lectura (Git)', () => {
    const result = assessRisk('git status');
    expect(result.level).toBe('read');
    expect(result.destructive).toBe(false);
  });

  it('detecta comandos de bajo riesgo (Git write)', () => {
    const result = assessRisk('git commit -m "update"');
    expect(result.level).toBe('low');
    expect(result.destructive).toBe(false);
  });

  it('detecta comandos de riesgo medio (Docker)', () => {
    const result = assessRisk('docker stop my-container');
    expect(result.level).toBe('medium');
    expect(result.destructive).toBe(false);
    expect(result.requiresConfirmation).toBe(true);
  });

  it('detecta comandos críticos en Linux', () => {
    const result = assessRisk('rm -rf /');
    expect(result.level).toBe('critical');
    expect(result.destructive).toBe(true);
    expect(result.requiresConfirmation).toBe(true);
  });

  // --- Nuevos casos PowerShell ---
  it('detecta comandos críticos en PowerShell (Remove-Item variantes)', () => {
    const result1 = assessRisk('Remove-Item ./build -Force -Recurse');
    expect(result1.level).toBe('critical');

    const result2 = assessRisk('Remove-Item -Recurse ./build -Force');
    expect(result2.level).toBe('critical');
    
    const result3 = assessRisk('Remove-Item -Force ./build');
    expect(result3.level).toBe('critical');
  });

  // --- Nuevos casos CMD ---
  it('detecta comandos críticos en CMD (del/rd variantes)', () => {
    const result1 = assessRisk('del /q /s build');
    expect(result1.level).toBe('critical');

    const result2 = assessRisk('rd /q /s build');
    expect(result2.level).toBe('critical');

    const result3 = assessRisk('taskkill /F /IM notepad.exe');
    expect(result3.level).toBe('critical');
  });

  // --- Nuevos casos Docker ---
  it('detecta comandos críticos en Docker (prune y rm force)', () => {
    const result1 = assessRisk('docker rm --force container');
    expect(result1.level).toBe('critical');

    const result2 = assessRisk('docker container rm -f container');
    expect(result2.level).toBe('critical');

    const result3 = assessRisk('docker image prune');
    expect(result3.level).toBe('critical');
  });

  // --- Casos Compuestos ---
  it('detecta comandos críticos compuestos (&& y ;)', () => {
    const result1 = assessRisk('cd project && rm -rf build');
    expect(result1.level).toBe('critical');

    const result2 = assessRisk('echo test ; Remove-Item ./build -Force -Recurse');
    expect(result2.level).toBe('critical');
  });

  // --- Falsos positivos de Format ---
  it('evita falsos positivos de format en comandos no destructivos', () => {
    expect(assessRisk('git log --format=oneline').level).toBe('read');
    expect(assessRisk('git log --pretty=format:"%h %s"').level).toBe('read');
    expect(assessRisk('docker inspect --format "{{.Id}}" container').level).toBe('read');
  });

  // --- Format Destructivo ---
  it('detecta comandos format destructivos en Windows', () => {
    expect(assessRisk('format C:').level).toBe('critical');
    expect(assessRisk('format D: /FS:NTFS').level).toBe('critical');
  });

  // --- Git Push ---
  it('detecta git push force como critico', () => {
    const res1 = assessRisk('git push --force origin main');
    expect(res1.level).toBe('critical');
    expect(res1.destructive).toBe(true);
    expect(res1.requiresConfirmation).toBe(true);

    const res2 = assessRisk('git push -f origin main');
    expect(res2.level).toBe('critical');
    expect(res2.destructive).toBe(true);
  });

  it('clasifica git push --force-with-lease como minimo medium', () => {
    const res = assessRisk('git push --force-with-lease origin main');
    // Ya que no entra en critical y push está en medium:
    expect(res.level).not.toBe('read');
    expect(res.level).not.toBe('low');
  });

  // --- Eliminación simple ---
  it('detecta eliminación simple en Linux', () => {
    const rm = assessRisk('rm archivo.txt');
    expect(rm.level).toBe('critical');
    expect(rm.destructive).toBe(true);
    expect(rm.requiresConfirmation).toBe(true);
  });

  it('detecta eliminación simple en PowerShell', () => {
    const rmItem = assessRisk('Remove-Item archivo.txt');
    expect(rmItem.level).toBe('critical');
    expect(rmItem.destructive).toBe(true);
  });

  it('detecta eliminación simple en CMD', () => {
    const del = assessRisk('del archivo.txt');
    expect(del.level).toBe('critical');
    expect(del.destructive).toBe(true);

    const rmdir = assessRisk('rmdir carpeta');
    expect(rmdir.level).toBe('critical');

    const rd = assessRisk('rd carpeta');
    expect(rd.level).toBe('critical');
  });

  // --- Kubernetes ---
  it('detecta comandos de lectura en Kubernetes', () => {
    expect(assessRisk('kubectl get pods').level).toBe('read');
    expect(assessRisk('kubectl describe pod api').level).toBe('read');
    expect(assessRisk('kubectl logs api').level).toBe('read');
    expect(assessRisk('kubectl config current-context').level).toBe('read');
  });

  it('detecta comandos de riesgo medio en Kubernetes', () => {
    const apply = assessRisk('kubectl apply -f deployment.yaml');
    expect(apply.level).toBe('medium');
    expect(apply.requiresConfirmation).toBe(true);

    expect(assessRisk('kubectl scale deployment api --replicas=0').level).toBe('medium');
    expect(assessRisk('kubectl rollout restart deployment api').level).toBe('medium');
  });

  it('detecta comandos criticos destructivos en Kubernetes', () => {
    const delPod = assessRisk('kubectl delete pod api');
    expect(delPod.level).toBe('critical');
    expect(delPod.destructive).toBe(true);
    expect(delPod.requiresConfirmation).toBe(true);

    expect(assessRisk('kubectl delete namespace production').level).toBe('critical');
    expect(assessRisk('kubectl replace --force -f deployment.yaml').level).toBe('critical');
  });

  // --- Códigos semánticos de motivo (independientes del idioma) ---
  describe('códigos de motivo', () => {
    it('un comando de lectura produce únicamente read-only', () => {
      const result = assessRisk('git status');
      expect(result.reasons).toEqual(['read-only']);
    });

    it('un comando destructivo produce destructive-operation', () => {
      const result = assessRisk('rm archivo.txt');
      expect(result.reasons).toContain('destructive-operation');
      expect(result.reasons).not.toContain('read-only');
    });

    it('asigna el código correspondiente a cada regla', () => {
      expect(assessRisk('docker restart web').reasons).toEqual(['state-modification']);
      expect(assessRisk('mkdir logs').reasons).toEqual(['local-modification']);
      expect(assessRisk('ls | xargs echo').reasons).toEqual(['bulk-operation']);
      expect(assessRisk('sudo apt update').reasons).toEqual(['elevated-privileges']);
    });

    it('acumula varios códigos en el orden de evaluación', () => {
      const result = assessRisk('docker stop $(docker ps -q)');
      expect(result.reasons).toEqual(['state-modification', 'bulk-operation']);
      expect(result.level).toBe('medium');
    });

    it('nunca emite frases localizadas como motivo', () => {
      const commands = [
        'git status', 'git commit -m "x"', 'docker stop web', 'rm -rf /',
        'sudo rm -rf /var', 'docker stop $(docker ps -q)', 'kubectl apply -f d.yaml',
      ];
      for (const command of commands) {
        for (const reason of assessRisk(command).reasons) {
          expect(reason).toMatch(/^[a-z]+(?:-[a-z]+)*$/);
        }
      }
    });
  });

  // --- Clasificación preservada tras la migración a códigos ---
  it('mantiene la clasificación y puntuación existentes', () => {
    const expected: Array<[string, string, number]> = [
      ['git status', 'read', 0],
      ['git add .', 'low', 2],
      ['git branch -a', 'low', 2],
      ['git push origin main', 'medium', 4],
      ['sudo apt update', 'medium', 4],
      ['docker stop $(docker ps -q)', 'medium', 6],
      ['sudo git push --all', 'critical', 8],
      ['rm -rf /', 'critical', 8],
      ['git reset --hard', 'critical', 8],
    ];
    for (const [command, level, score] of expected) {
      const result = assessRisk(command);
      expect({ command, level: result.level, score: result.score })
        .toEqual({ command, level, score });
    }
  });
});
