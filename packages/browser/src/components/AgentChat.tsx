import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AgentStatus } from '../types.js';

interface AgentChatProps {
  messages: ChatMessage[];
  agents: AgentStatus[];
  onSend: (content: string, to?: string) => void;
  selectedAgent: AgentStatus | null;
}

export function AgentChat({ messages, agents, onSend, selectedAgent }: AgentChatProps) {
  const [input, setInput] = useState('');
  const [targetAgent, setTargetAgent] = useState('personal');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim(), targetAgent);
    setInput('');
  };

  const getMessageStyle = (msg: ChatMessage): React.CSSProperties => ({
    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
    background: msg.role === 'user' ? '#3b82f6' : msg.role === 'system' ? '#6b7280' : '#374151',
    color: 'white',
    padding: '8px 16px',
    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
    maxWidth: '80%',
    marginBottom: '8px',
    fontSize: '14px',
  });

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    borderRight: '1px solid #374151',
  };

  const headerStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderBottom: '1px solid #374151',
    background: '#1f2937',
    fontWeight: 'bold',
    fontSize: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span>Agent Chat</span>
        <select
          value={targetAgent}
          onChange={e => setTargetAgent(e.target.value)}
          style={{
            background: '#374151',
            color: 'white',
            border: '1px solid #4b5563',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '12px',
          }}
        >
          {agents.map(a => (
            <option key={a.id} value={a.id}>
              {a.name} ({a.status})
            </option>
          ))}
        </select>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#6b7280', marginTop: '40px' }}>
            <p style={{ fontSize: '18px', marginBottom: '8px' }}>🤖 Browser LLM Harness</p>
            <p style={{ fontSize: '14px' }}>Send a message to start. Select an agent from the dropdown.</p>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} style={getMessageStyle(msg)}>
            {msg.role !== 'user' && msg.agentName && (
              <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '2px' }}>{msg.agentName}</div>
            )}
            <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
            <div style={{ fontSize: '10px', opacity: 0.5, marginTop: '4px', textAlign: 'right' }}>
              {msg.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ padding: '12px', borderTop: '1px solid #374151' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={selectedAgent ? Message ... : 'Type a message...'}
            style={{
              flex: 1,
              background: '#374151',
              color: 'white',
              border: '1px solid #4b5563',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <button
            onClick={handleSend}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
