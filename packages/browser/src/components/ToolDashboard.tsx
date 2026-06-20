import React from 'react';

interface ToolInfo {
  name: string;
  type: string;
  description: string;
  category: string;
  status: 'available' | 'running' | 'error';
}

interface ToolDashboardProps {
  tools: ToolInfo[];
  onRunTool: (name: string) => void;
}

export function ToolDashboard({ tools, onRunTool }: ToolDashboardProps) {
  const containerStyle: React.CSSProperties = {
    background: '#1f2937',
    borderRadius: '8px',
    border: '1px solid #374151',
    overflow: 'hidden',
  };

  const headerStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderBottom: '1px solid #374151',
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#d1d5db',
    background: '#111827',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const typeColors: Record<string, string> = {
    mcp: '#8b5cf6',
    cli: '#3b82f6',
    plugin: '#22c55e',
    hook: '#f59e0b',
    skill: '#ec4899',
    lsp: '#06b6d4',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span>🔧 Tool Registry</span>
        <span style={{ fontSize: '11px', color: '#6b7280' }}>{tools.length} tools</span>
      </div>
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {tools.map(tool => (
          <div
            key={tool.name}
            style={{
              padding: '8px 12px',
              borderBottom: '1px solid #374151',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  background: typeColors[tool.type] || '#6b7280',
                  color: 'white',
                  padding: '1px 6px',
                  borderRadius: '8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}>
                  {tool.type.toUpperCase()}
                </span>
                <span style={{ color: '#d1d5db', fontSize: '13px', fontWeight: 'bold' }}>{tool.name}</span>
                <span style={{ fontSize: '10px', color: '#6b7280' }}>{tool.category}</span>
              </div>
              <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: '2px', marginLeft: '4px' }}>
                {tool.description}
              </div>
            </div>
            <button
              onClick={() => onRunTool(tool.name)}
              style={{
                background: tool.status === 'error' ? '#ef4444' : '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 10px',
                cursor: 'pointer',
                fontSize: '11px',
                whiteSpace: 'nowrap',
              }}
            >
              {tool.status === 'running' ? '⏳' : tool.status === 'error' ? '⚠️' : '▶'}
            </button>
          </div>
        ))}
        {tools.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
            No tools registered. The Web Discovery Agent will find them.
          </div>
        )}
      </div>
    </div>
  );
}
