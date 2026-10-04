import type { CommandTool } from '../types/command';
import { ToolIcon, type ToolIconName } from './ToolIcon';

interface ToolSelectorProps {
  activeTool: CommandTool | 'all';
  onSelectTool: (tool: CommandTool | 'all') => void;
}

const tools: { id: CommandTool | 'all'; label: string; disabled?: boolean; icon: ToolIconName }[] = [
  { id: 'all', label: 'Auto', icon: 'auto' },
  { id: 'git', label: 'Git', icon: 'git' },
  { id: 'docker', label: 'Docker', icon: 'docker' },
  { id: 'kubernetes', label: 'K8s', icon: 'kubernetes' },
  { id: 'system', label: 'Sistema', icon: 'system' },
];

export function ToolSelector({ activeTool, onSelectTool }: ToolSelectorProps) {
  return (
    <div className="tool-selector">
      {tools.map((tool) => (
        <button
          key={tool.id}
          className={`tool-selector__btn ${
            activeTool === tool.id ? 'tool-selector__btn--active' : ''
          } ${tool.disabled ? 'tool-selector__btn--disabled' : ''}`}
          onClick={() => !tool.disabled && onSelectTool(tool.id as CommandTool | 'all')}
          disabled={tool.disabled}
          title={tool.disabled ? 'Próximamente' : tool.label}
        >
          <ToolIcon name={tool.icon} />
          <span>{tool.label}</span>
        </button>
      ))}
    </div>
  );
}
