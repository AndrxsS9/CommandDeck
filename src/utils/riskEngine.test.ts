import { describe, it, expect } from 'vitest';
import { assessRisk } from './riskEngine';

describe('Risk Engine', () => {
  it('Lectura: git status', () => {
    const result = assessRisk('git status');
    expect(result.level).toBe('read');
  });

  it('Lectura: docker ps', () => {
    const result = assessRisk('docker ps');
    expect(result.level).toBe('read');
  });

  it('Bajo: git switch -c feature-x', () => {
    const result = assessRisk('git switch -c feature-x');
    expect(result.level).toBe('low');
  });

  it('Bajo: mkdir test', () => {
    const result = assessRisk('mkdir test');
    expect(result.level).toBe('low');
  });

  it('Medio: docker stop ...', () => {
    const result = assessRisk('docker stop my-container');
    expect(result.level).toBe('medium');
  });

  it('Medio: taskkill normal', () => {
    const result = assessRisk('taskkill /IM notepad.exe');
    expect(result.level).toBe('medium');
  });

  it('Crítico: rm -rf', () => {
    const result = assessRisk('cd project && rm -rf build');
    expect(result.level).toBe('critical');
    expect(result.destructive).toBe(true);
  });

  it('Crítico: git reset --hard', () => {
    const result = assessRisk('git reset --hard HEAD');
    expect(result.level).toBe('critical');
  });

  it('Crítico: docker system prune', () => {
    const result = assessRisk('docker system prune -a');
    expect(result.level).toBe('critical');
  });

  it('Crítico: PowerShell Remove-Item -Recurse -Force', () => {
    const result = assessRisk('Remove-Item -Recurse -Force ./build');
    expect(result.level).toBe('critical');
  });

  it('Crítico: CMD del /s /q', () => {
    const result = assessRisk('del /s /q build');
    expect(result.level).toBe('critical');
  });
});
