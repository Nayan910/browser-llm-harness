'use client';
import React, { useState, useCallback } from 'react';

// Define types inline for simplicity
interface AgentStatus {
  id: string;
  name: string;
  type: string;
  status: 'idle' | 'busy' | 'error' | 'thinking';
  messageCount: number;
  folderScope?: string;
  lastActivity?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'agent';
  content: string;
  agentId?: string;
  agentName?: string;
  timestamp: Date;
}

// Mock data
const defaultAgents: AgentStatus[] = [
  { id: 'coordinator', name: 'Central Coordinator', type: 'coordinator', status: 'idle', messageCount: 128, lastActivity: '2m ago' },
  { id: 'personal', name: 'Personal Agent', type: 'personal', status: 'idle', messageCount: 512, lastActivity: '1m ago' },
  { id: 'discovery', name: 'Web Discovery Agent', type: 'discovery', status: 'thinking', messageCount: 89, lastActivity: 'now' },
  { id: 'auto', name: 'Auto Orchestrator', type: 'auto', status: 'busy', messageCount: 256, lastActivity: '30s ago' },
  { id: 'workflow-master', name: 'Workflow Master', type: 'workflow', status: 'idle', messageCount: 45, lastActivity: '5m ago' },
  { id: 'folder-src', name: 'Folder: /src', type: 'folder', status: 'idle', messageCount: 67, folderScope: '/src', lastActivity: '10m ago' },
  { id: 'folder-apps', name: 'Folder: /apps', type: 'folder', status: 'idle', messageCount: 34, folderScope: '/apps', lastActivity: '15m ago' },
];

const statusColors: Record<string, string> = { idle: '#6b7280', busy: '#f59e0b', error: '#ef4444', thinking: '#3b82f6' };

// SVG Icons
const BotIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><path d="M8 16h8"/></svg>);
const CogIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>);
const WorkflowIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>);
const FolderIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>);
const FileIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>);

// Sidebar Component
const Sidebar = ({ agents, selectedAgent, onSelectAgent, activeTab, onTabChange }: any) => {
  const tabStyle = (tab: string) => ({
    padding: '10px 16px',
    cursor: 'pointer',
    color: activeTab === tab ? '#60a5fa' : '#9ca3af',
    borderLeft: activeTab === tab ? '3px solid #3b82f6' : '3px solid transparent',
    background: activeTab === tab ? '#1e293b' : 'transparent',
    fontSize: '13px',
    fontWeight: activeTab === tab ? 'bold' : 'normal',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.15s',
  } as React.CSSProperties);

  return (
    <div style={{ width: '280px', background: '#0f172a', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ color: 'white', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BotIcon /> Browser LLM
        </div>
        <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '4px' }}>v0.1.0-alpha · Agent Platform</div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #1e293b' }}>
        <div onClick={() => onTabChange('agents')} style={tabStyle('agents')}><BotIcon /> Agents</div>
        <div onClick={() => onTabChange('workflows')} style={tabStyle('workflows')}><WorkflowIcon /> Workflows</div>
        <div onClick={() => onTabChange('tools')} style={tabStyle('tools')}><CogIcon /> Tools</div>
        <div onClick={() => onTabChange('files')} style={tabStyle('files')}><FolderIcon /> Files</div>
      </div>

      {/* Agent list */}
      {activeTab === 'agents' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {agents.map((agent: AgentStatus) => (
            <div
              key={agent.id}
              onClick={() => onSelectAgent(agent)}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                background: selectedAgent?.id === agent.id ? '#1e293b' : 'transparent',
                borderLeft: selectedAgent?.id === agent.id ? '3px solid #3b82f6' : '3px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColors[agent.status], boxShadow: agent.status === 'thinking' ? `0 0 6px ${statusColors[agent.status]}` : 'none' }} />
                  <span style={{ color: 'white', fontSize: '13px', fontWeight: 'bold' }}>{agent.name}</span>
                </div>
                <span style={{ color: '#6b7280', fontSize: '10px' }}>{agent.messageCount}</span>
              </div>
              <div style={{ marginLeft: '16px', marginTop: '2px' }}>
                <span style={{ color: '#6b7280', fontSize: '11px' }}>{agent.type}</span>
                {agent.folderScope && <span style={{ color: '#6b7280', fontSize: '11px', marginLeft: '8px' }}>{agent.folderScope}</span>}
                <span style={{ color: '#4b5563', fontSize: '10px', marginLeft: '8px' }}>{agent.lastActivity}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer status */}
      {activeTab === 'agents' && (
        <div style={{ padding: '10px 16px', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', color: '#6b7280', fontSize: '11px' }}>
          <span>{agents.length} agents</span>
          <span>System: Online</span>
        </div>
      )}
    </div>
  );
};

// Chat Component
const ChatPanel = ({ messages, agents, onSend, selectedAgent }: any) => {
  const [input, setInput] = useState('');
  const [targetAgent, setTargetAgent] = useState('personal');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim(), targetAgent);
    setInput('');
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      {/* Header */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: '15px' }}>Agent Chat</span>
          <div style={{ width: '1px', height: '20px', background: '#1e293b' }} />
          <select
            value={targetAgent}
            onChange={e => setTargetAgent(e.target.value)}
            style={{ background: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', outline: 'none' }}
          >
            {agents.map((a: AgentStatus) => (
              <option key={a.id} value={a.id}>{a.name} ({a.status})</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {selectedAgent && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '12px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColors[selectedAgent.status] }} />
              {selectedAgent.status}
            </div>
          )}
          <button style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#9ca3af', padding: '4px 12px', cursor: 'pointer', fontSize: '12px' }}>+ New Chat</button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '60px', color: '#475569' }}>
            <BotIcon />
            <p style={{ fontSize: '18px', color: '#6b7280', marginTop: '12px' }}>Browser LLM Harness</p>
            <p style={{ fontSize: '13px', marginTop: '6px' }}>Select an agent and send a message to start.</p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '20px' }}>
              {['What can you do?', 'List all agents', 'Run auto mode', 'Show tools'].map(cmd => (
                <div key={cmd} onClick={() => onSend(cmd, targetAgent)}
                  style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '6px 14px', color: '#9ca3af', fontSize: '12px', cursor: 'pointer' }}>
                  {cmd}
                </div>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg: ChatMessage) => (
          <div key={msg.id} className="fade-in" style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '4px' }}>
            <div style={{
              background: msg.role === 'user' ? '#2563eb' : msg.role === 'system' ? '#374151' : '#1e293b',
              color: 'white',
              padding: '10px 18px',
              borderRadius: msg.role === 'user' ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
              maxWidth: '70%',
              border: msg.role === 'agent' ? '1px solid #334155' : 'none',
            }}>
              {msg.role !== 'user' && msg.agentName && (
                <div style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 'bold', marginBottom: '4px' }}>{msg.agentName}</div>
              )}
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.5' }}>{msg.content}</div>
              <div style={{ fontSize: '10px', color: msg.role === 'user' ? '#93c5fd' : '#6b7280', marginTop: '4px', textAlign: 'right' }}>{msg.timestamp.toLocaleTimeString()}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid #1e293b', background: '#0f172a' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={selectedAgent ? `Message ${selectedAgent.name}...` : 'Type a message...'}
            style={{ flex: 1, background: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', outline: 'none' }}
          />
          <button onClick={handleSend} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 24px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

// Auto Button Component
const AutoButton = ({ onExecute, isRunning }: any) => {
  const [prompt, setPrompt] = useState('');

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e3a5f 0%, #312e81 100%)',
      borderRadius: '12px',
      padding: '16px',
      border: '1px solid #334155',
      marginBottom: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <div style={{
          width: '10px', height: '10px', borderRadius: '50%',
          background: isRunning ? '#22c55e' : '#f59e0b',
          boxShadow: isRunning ? '0 0 12px rgba(34,197,94,0.6)' : '0 0 12px rgba(245,158,11,0.4)',
          animation: isRunning ? 'pulse 1s infinite' : 'none',
        }} />
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>{isRunning ? 'AUTO EXECUTING...' : 'AUTO BUTTON'}</span>
        {!isRunning && <span style={{ color: '#9ca3af', fontSize: '11px' }}>One prompt → Everything</span>}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !isRunning && prompt.trim() && onExecute(prompt.trim())}
          placeholder="Describe what you want..."
          disabled={isRunning}
          style={{ flex: 1, background: '#0f172a', color: 'white', border: '1px solid #334155', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', outline: 'none', opacity: isRunning ? 0.5 : 1 }}
        />
        <button
          onClick={() => prompt.trim() && onExecute(prompt.trim())}
          disabled={isRunning}
          style={{ background: isRunning ? '#374151' : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', cursor: isRunning ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '13px', whiteSpace: 'nowrap' }}
        >
          {isRunning ? '⏳ Running...' : '🚀 AUTO'}
        </button>
      </div>
      {isRunning && (
        <div style={{ marginTop: '8px', color: '#22c55e', fontSize: '12px', fontFamily: 'monospace' }}>
          &gt; Planning... &gt; Executing step 1/5... &gt; Verifying...
        </div>
      )}
    </div>
  );
};

// Main Page
export default function Home() {
  const [agents] = useState<AgentStatus[]>(defaultAgents);
  const [selectedAgent, setSelectedAgent] = useState<AgentStatus | null>(null);
  const [activeTab, setActiveTab] = useState('agents');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'system', content: '🚀 Browser LLM Harness v0.1.0 initialized. 8 agents ready, 128 tools available.', timestamp: new Date() },
    { id: 'welcome2', role: 'assistant', content: 'Welcome to the Browser LLM Harness! I\'m your Personal Agent. You can talk to me, or select any specialized agent from the sidebar. Try the Auto Button for fully autonomous task execution.', agentId: 'personal', agentName: 'Personal Agent', timestamp: new Date() },
  ]);
  const [autoRunning, setAutoRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleSend = useCallback((content: string, to?: string) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      agentId: to,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMsg]);

    // Simulate agent response
    setTimeout(() => {
      const agent = agents.find(a => a.id === (to || 'personal'));
      const response: ChatMessage = {
        id: `resp-${Date.now()}`,
        role: 'agent',
        content: `[${agent?.name || 'Agent'}] Received: "${content.slice(0, 80)}${content.length > 80 ? '...' : ''}"\n\nThis is a simulated response. The full agent runtime will provide real responses when connected to LLM providers.`,
        agentId: agent?.id || 'personal',
        agentName: agent?.name || 'Agent',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, response]);
    }, 600);
  }, [agents]);

  const handleAuto = useCallback((prompt: string) => {
    setAutoRunning(true);
    setMessages(prev => [...prev, { id: `auto-${Date.now()}`, role: 'system', content: `🚀 AUTO MODE STARTED\nPrompt: "${prompt}"`, timestamp: new Date() }]);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `auto-done-${Date.now()}`,
        role: 'agent',
        content: `✅ AUTO MODE COMPLETE\n\nTask: "${prompt}"\n\nExecution Plan:\n1. ✓ Analyzed request\n2. ✓ Searched for context\n3. ✓ Designed solution\n4. ✓ Implemented\n5. ✓ Verified\n\nAll steps completed successfully.`,
        agentId: 'auto',
        agentName: 'Auto Orchestrator',
        timestamp: new Date(),
      }]);
      setAutoRunning(false);
    }, 2000);
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Sidebar */}
      <Sidebar agents={agents} selectedAgent={selectedAgent} onSelectAgent={setSelectedAgent} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {activeTab === 'agents' && (
          <div style={{ display: 'flex', flex: 1 }}>
            {/* Chat */}
            <ChatPanel messages={messages} agents={agents} onSend={handleSend} selectedAgent={selectedAgent} />
            
            {/* Right Panel */}
            <div style={{ width: '320px', background: '#0f172a', borderLeft: '1px solid #1e293b', padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <AutoButton onExecute={handleAuto} isRunning={autoRunning} />

              {/* Agent Details */}
              {selectedAgent && (
                <div style={{ background: '#1e293b', borderRadius: '8px', padding: '12px', border: '1px solid #334155' }}>
                  <div style={{ color: '#60a5fa', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>{selectedAgent.name}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px' }}>
                    <div style={{ color: '#6b7280' }}>Type:</div><div style={{ color: '#d1d5db' }}>{selectedAgent.type}</div>
                    <div style={{ color: '#6b7280' }}>Status:</div><div style={{ color: '#d1d5db' }}>{selectedAgent.status}</div>
                    <div style={{ color: '#6b7280' }}>Messages:</div><div style={{ color: '#d1d5db' }}>{selectedAgent.messageCount}</div>
                    <div style={{ color: '#6b7280' }}>Last Active:</div><div style={{ color: '#d1d5db' }}>{selectedAgent.lastActivity}</div>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div style={{ background: '#1e293b', borderRadius: '8px', padding: '12px', border: '1px solid #334155' }}>
                <div style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>SESSION STATS</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px' }}>
                  <div style={{ color: '#6b7280' }}>Messages:</div><div style={{ color: '#d1d5db' }}>{messages.length}</div>
                  <div style={{ color: '#6b7280' }}>Agents Active:</div><div style={{ color: '#d1d5db' }}>{agents.filter(a => a.status !== 'idle').length}/{agents.length}</div>
                  <div style={{ color: '#6b7280' }}>Tools:</div><div style={{ color: '#d1d5db' }}>128</div>
                  <div style={{ color: '#6b7280' }}>Session:</div><div style={{ color: '#d1d5db' }}>active</div>
                </div>
              </div>

              {/* Settings button */}
              <button onClick={() => setShowSettings(!showSettings)} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#9ca3af', cursor: 'pointer', fontSize: '12px' }}>
                ⚙️ Settings
              </button>
            </div>
          </div>
        )}

        {activeTab === 'workflows' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', flexDirection: 'column', gap: '16px' }}>
            <WorkflowIcon />
            <h2 style={{ color: '#d1d5db' }}>Workflow Editor</h2>
            <p style={{ textAlign: 'center', maxWidth: '400px', fontSize: '14px' }}>
              Drag and drop workflow nodes to create automated agent pipelines.
              Connect prompts, tasks, tools, agents, conditions, and loops.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {['Prompt', 'Task', 'Tool', 'Agent', 'Condition', 'Loop', 'Branch', 'Webhook'].map(type => (
                <div key={type} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '6px 14px', color: '#9ca3af', fontSize: '12px', cursor: 'grab' }}>{type}</div>
              ))}
            </div>
            <div style={{ marginTop: '12px', display: 'flex', gap: '16px' }}>
              <div style={{ background: '#1e293b', borderRadius: '8px', padding: '16px', width: '200px', border: '1px solid #334155' }}>
                <div style={{ color: '#22c55e', fontSize: '13px', fontWeight: 'bold' }}>Code Review Pipeline</div>
                <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '4px' }}>5 nodes · Manual, Webhook</div>
              </div>
              <div style={{ background: '#1e293b', borderRadius: '8px', padding: '16px', width: '200px', border: '1px solid #334155' }}>
                <div style={{ color: '#f59e0b', fontSize: '13px', fontWeight: 'bold' }}>Auto Deploy</div>
                <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '4px' }}>8 nodes · Git Event</div>
              </div>
              <div style={{ background: '#1e293b', borderRadius: '8px', padding: '16px', width: '200px', border: '1px solid #334155' }}>
                <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: 'bold' }}>Daily Research</div>
                <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '4px' }}>3 nodes · Scheduled (disabled)</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
            <h2 style={{ color: 'white', marginBottom: '16px', fontSize: '18px' }}>🔧 Tool Registry</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {[
                { name: 'github-create-repo', type: 'MCP', desc: 'Create GitHub repositories', cat: 'git' },
                { name: 'web-search', type: 'CLI', desc: 'Search the web', cat: 'utility' },
                { name: 'file-read', type: 'CLI', desc: 'Read file contents', cat: 'filesystem' },
                { name: 'file-write', type: 'CLI', desc: 'Write file contents', cat: 'filesystem' },
                { name: 'git-commit', type: 'CLI', desc: 'Create git commits', cat: 'git' },
                { name: 'auto-plan', type: 'SKILL', desc: 'Auto plan and execute tasks', cat: 'agent' },
                { name: 'memory-save', type: 'HOOK', desc: 'Save to cross-session memory', cat: 'memory' },
                { name: 'session-load', type: 'HOOK', desc: 'Load previous session context', cat: 'memory' },
                { name: 'workflow-run', type: 'PLUGIN', desc: 'Execute a workflow', cat: 'workflow' },
                { name: 'mcp-filesystem', type: 'MCP', desc: 'File system MCP server', cat: 'mcp' },
                { name: 'mcp-github', type: 'MCP', desc: 'GitHub MCP integration', cat: 'mcp' },
                { name: 'agent-discover', type: 'SKILL', desc: 'Web discovery for new tools', cat: 'agent' },
              ].map(tool => {
                const colors: Record<string, string> = { MCP: '#8b5cf6', CLI: '#3b82f6', PLUGIN: '#22c55e', HOOK: '#f59e0b', SKILL: '#ec4899', LSP: '#06b6d4' };
                return (
                  <div key={tool.name} style={{ background: '#1e293b', borderRadius: '8px', padding: '12px', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ color: 'white', fontWeight: 'bold', fontSize: '13px' }}>{tool.name}</span>
                      <span style={{ background: colors[tool.type] || '#6b7280', color: 'white', padding: '1px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}>{tool.type}</span>
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '12px' }}>{tool.desc}</div>
                    <div style={{ color: '#6b7280', fontSize: '10px', marginTop: '4px' }}>{tool.cat}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
            <h2 style={{ color: 'white', marginBottom: '16px', fontSize: '18px' }}>📂 Files & Agent Map</h2>
            <div style={{ background: '#1e293b', borderRadius: '8px', border: '1px solid #334155', overflow: 'hidden' }}>
              {[
                { name: 'packages/', type: 'dir' },
                { name: '  core/', type: 'dir', indent: 1 },
                { name: '    src/types.ts', type: 'file', agent: 'coordinator', indent: 2 },
                { name: '    src/agent-runtime.ts', type: 'file', agent: 'coordinator', indent: 2 },
                { name: '    src/folder-agent.ts', type: 'file', agent: 'coordinator', indent: 2 },
                { name: '    package.json', type: 'file', agent: 'auto', indent: 2 },
                { name: '  browser/', type: 'dir', indent: 1 },
                { name: '    src/components/AgentChat.tsx', type: 'file', agent: 'folder-src', indent: 2 },
                { name: '    src/hooks/useAgentSystem.ts', type: 'file', agent: 'folder-src', indent: 2 },
                { name: '  tools/', type: 'dir', indent: 1 },
                { name: '    src/tool-registry.ts', type: 'file', agent: 'discovery', indent: 2 },
                { name: '    src/web-discovery.ts', type: 'file', agent: 'discovery', indent: 2 },
                { name: '  workflows/', type: 'dir', indent: 1 },
                { name: '    src/workflow-engine.ts', type: 'file', agent: 'workflow-master', indent: 2 },
                { name: '    src/master-agent.ts', type: 'file', agent: 'workflow-master', indent: 2 },
                { name: '  memory/', type: 'dir', indent: 1 },
                { name: '    src/session-store.ts', type: 'file', agent: 'personal', indent: 2 },
                { name: '  cli/', type: 'dir', indent: 1 },
                { name: '    bin/bllm.js', type: 'file', agent: 'auto', indent: 2 },
                { name: 'apps/web/src/app/page.tsx', type: 'file', agent: 'folder-apps', indent: 0 },
                { name: 'SPEC.md', type: 'file', agent: 'coordinator', indent: 0 },
              ].map((item, i) => (
                <div key={i} style={{ padding: '5px 12px', paddingLeft: `${12 + (item.indent || 0) * 20}px`, display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #1e293b' }}>
                  {item.type === 'dir' ? <FolderIcon /> : <FileIcon />}
                  <span style={{ color: item.type === 'dir' ? '#60a5fa' : '#d1d5db', fontSize: '13px' }}>{item.name}</span>
                  {(item as any).agent && (
                    <span style={{ marginLeft: 'auto', background: '#0f172a', color: '#6b7280', padding: '1px 8px', borderRadius: '8px', fontSize: '10px' }}>{(item as any).agent}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Settings Overlay */}
      {showSettings && (
        <div style={{ position: 'fixed', top: 0, right: 0, width: '350px', height: '100vh', background: '#1e293b', borderLeft: '1px solid #334155', zIndex: 100, boxShadow: '-4px 0 20px rgba(0,0,0,0.3)', padding: '20px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: 'white', fontSize: '16px' }}>⚙️ Settings</h3>
            <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '20px' }}>✕</button>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>LLM Provider</div>
            <select style={{ width: '100%', background: '#0f172a', color: 'white', border: '1px solid #334155', borderRadius: '6px', padding: '8px 12px', fontSize: '13px' }}>
              <option>Ollama (Local)</option>
              <option>OpenAI</option>
              <option>Anthropic</option>
              <option>OpenRouter</option>
            </select>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Force Tools</div>
            {['Before Answer', 'After Answer', 'Session Start', 'Session End'].map(hook => (
              <div key={hook} style={{ marginBottom: '10px' }}>
                <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }}>{hook}</div>
                <input placeholder="tool-name, other-tool" style={{ width: '100%', background: '#0f172a', color: 'white', border: '1px solid #334155', borderRadius: '4px', padding: '6px 10px', fontSize: '12px' }} />
              </div>
            ))}
          </div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Session Memory</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af', fontSize: '13px' }}>
              <span>Remember previous sessions</span>
              <input type="checkbox" defaultChecked={true} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af', fontSize: '13px', marginTop: '8px' }}>
              <span>Auto git push</span>
              <input type="checkbox" />
            </div>
          </div>
          <button style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer', fontWeight: 'bold', marginTop: '20px' }}>
            Save Settings
          </button>
        </div>
      )}
    </div>
  );
}
