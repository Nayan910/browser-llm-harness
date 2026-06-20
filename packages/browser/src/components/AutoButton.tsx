import React, { useState } from 'react';

interface AutoButtonProps {
  onExecute: (prompt: string) => void;
  isRunning: boolean;
}

export function AutoButton({ onExecute, isRunning }: AutoButtonProps) {
  const [prompt, setPrompt] = useState('');

  const handleExecute = () => {
    if (!prompt.trim() || isRunning) return;
    onExecute(prompt.trim());
  };

  const containerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #1e3a5f, #2d1b69)',
    borderRadius: '12px',
    padding: '20px',
    margin: '12px',
    border: '1px solid #4b5563',
  };

  const autoGlow: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  };

  return (
    <div style={containerStyle}>
      <div style={autoGlow}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: isRunning ? '#22c55e' : '#f59e0b',
          boxShadow: isRunning 
            ? '0 0 12px rgba(34,197,94,0.6)' 
            : '0 0 12px rgba(245,158,11,0.4)',
          animation: isRunning ? 'pulse 1s infinite' : 'none',
        }} />
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
          {isRunning ? 'AUTO RUNNING...' : 'AUTO BUTTON'}
        </span>
        {!isRunning && (
          <span style={{ color: '#9ca3af', fontSize: '12px', marginLeft: '8px' }}>
            One prompt → Everything
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleExecute()}
          placeholder={isRunning ? 'Auto-executing...' : 'Describe what you want in one prompt...'}
          disabled={isRunning}
          style={{
            flex: 1,
            background: '#1f2937',
            color: 'white',
            border: '1px solid #4b5563',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            outline: 'none',
            opacity: isRunning ? 0.5 : 1,
          }}
        />
        <button
          onClick={handleExecute}
          disabled={isRunning}
          style={{
            background: isRunning ? '#4b5563' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 28px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            whiteSpace: 'nowrap',
          }}
        >
          {isRunning ? '⏳' : '🚀 AUTO'}
        </button>
      </div>
      {isRunning && (
        <div style={{ marginTop: '12px', color: '#22c55e', fontSize: '13px', fontFamily: 'monospace' }}>
          &gt; Planning... &gt; Executing... &gt; Verifying...
        </div>
      )}
    </div>
  );
}
