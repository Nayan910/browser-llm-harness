import React from 'react';

interface WorkflowEditorProps {
  onOpen: () => void;
}

export function WorkflowEditor({ onOpen }: WorkflowEditorProps) {
  const containerStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#111827',
    borderRadius: '8px',
    border: '1px dashed #374151',
    margin: '12px',
    padding: '40px',
    color: '#6b7280',
  };

  return (
    <div style={containerStyle}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔧</div>
      <h3 style={{ color: '#d1d5db', marginBottom: '8px' }}>n8n-Style Workflow Editor</h3>
      <p style={{ textAlign: 'center', marginBottom: '20px', fontSize: '14px' }}>
        Drag and drop nodes to create agent workflows.<br />
        Connect prompts, tasks, tools, agents, conditions, and loops.
      </p>
      <button
        onClick={onOpen}
        style={{
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 24px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        + New Workflow
      </button>
      <div style={{ marginTop: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {['Prompt', 'Task', 'Tool', 'Agent', 'Condition', 'Loop', 'Branch', 'Webhook'].map(type => (
          <span key={type} style={{
            background: '#1f2937',
            color: '#9ca3af',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            border: '1px solid #374151',
          }}>
            {type}
          </span>
        ))}
      </div>
    </div>
  );
}
