export type RiskLevel = 'read' | 'low' | 'medium' | 'critical';

export interface CommandResult {
  id: string;
  intent: string;
  command: string;
  tool: 'git' | 'docker' | 'system' | 'unknown';
  summary: string;
  explanation: string[];
  risk: RiskLevel;
  riskReasons: string[];
  reversible: boolean;
}
