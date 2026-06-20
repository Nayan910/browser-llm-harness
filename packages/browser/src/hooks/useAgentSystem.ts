import { useState, useCallback, useEffect } from 'react';
import { AgentStatus, ChatMessage } from '../types.js';

export interface AgentSystemState {
  agents: AgentStatus[];
  messages: ChatMessage[];
  activeSession: string | null;
  isConnected: boolean;
  sendMessage: (content: string, to?: string) => void;
  selectAgent: (id: string) => void;
  selectedAgent: AgentStatus | null;
  clearMessages: () => void;
}

export function useAgentSystem(): AgentSystemState {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentStatus | null>(null);

  useEffect(() => {
    // Initialize with default agents
    setAgents([
      { id: 'coordinator', name: 'Central Coordinator', type: 'coordinator', status: 'idle', messageCount: 0 },
      { id: 'personal', name: 'Personal Agent', type: 'personal', status: 'idle', messageCount: 0 },
      { id: 'discovery', name: 'Web Discovery Agent', type: 'discovery', status: 'idle', messageCount: 0 },
      { id: 'auto', name: 'Auto Orchestrator', type: 'auto', status: 'idle', messageCount: 0 },
      { id: 'workflow-master', name: 'Workflow Master Agent', type: 'workflow', status: 'idle', messageCount: 0 },
    ]);
    setActiveSession(session-);
    setIsConnected(true);
  }, []);

  const sendMessage = useCallback((content: string, to?: string) => {
    const newMsg: ChatMessage = {
      id: msg--,
      role: 'user',
      content,
      agentId: to || 'personal',
      agentName: to ? agents.find(a => a.id === to)?.name : 'Personal Agent',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMsg]);
    
    // In real implementation, this dispatches to the agent runtime
    setTimeout(() => {
      const response: ChatMessage = {
        id: msg--,
        role: 'agent',
        content: [] Processing: "...",
        agentId: newMsg.agentId,
        agentName: newMsg.agentName,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, response]);
    }, 500);
  }, [agents]);

  const selectAgent = useCallback((id: string) => {
    const agent = agents.find(a => a.id === id) || null;
    setSelectedAgent(agent);
  }, [agents]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    agents,
    messages,
    activeSession,
    isConnected,
    sendMessage,
    selectAgent,
    selectedAgent,
    clearMessages,
  };
}
