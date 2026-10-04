import type { CommandTool } from '../types/command';
import type { ReactNode } from 'react';

interface ToolSelectorProps {
  activeTool: CommandTool | 'all';
  onSelectTool: (tool: CommandTool | 'all') => void;
}

const tools: { id: CommandTool | 'all' | 'kubernetes'; label: string; disabled?: boolean; icon: ReactNode }[] = [
  {
    id: 'all',
    label: 'Auto',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: 'git',
    label: 'Git',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <line x1="6" y1="3" x2="6" y2="15" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path d="M18 9a9 9 0 0 1-9 9" />
      </svg>
    ),
  },
  {
    id: 'docker',
    label: 'Docker',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="2" y="7" width="20" height="13" rx="2" />
        <path d="M17 7V4a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v3" />
      </svg>
    ),
  },
  {
    id: 'kubernetes',
    label: 'K8s',
    disabled: true,
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
      </svg>
    ),
  },
  {
    id: 'system',
    label: 'Sistema',
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <polyline points="7 8 11 12 7 16" />
      </svg>
    ),
  },
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
          {tool.icon}
          <span>{tool.label}</span>
        </button>
      ))}
    </div>
  );
}
