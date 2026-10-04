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
});
