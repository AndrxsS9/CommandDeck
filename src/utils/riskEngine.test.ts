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
});
