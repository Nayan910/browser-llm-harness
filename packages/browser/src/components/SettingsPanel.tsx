import React, { useState } from 'react';
import { UIPreferences } from '../types.js';

interface SettingsPanelProps {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [prefs, setPrefs] = useState<UIPreferences>({
    theme: 'dark',
    sidebarOpen: true,
    chatFontSize: 'medium',
    showTimestamps: true,
    autoScroll: true,
    agentTreeView: true,
  });

  const updatePref = (key: keyof UIPreferences, value: any) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
  };

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '350px',
    height: '100vh',
    background: '#1f2937',
    borderLeft: '1px solid #374151',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.3)',
  };

  const SettingRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #374151' }}>
      <span style={{ color: '#d1d5db', fontSize: '14px' }}>{label}</span>
      {children}
    </div>
  );

  return (
    <div style={containerStyle}>
      <div style={{ padding: '16px', borderBottom: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: 'white', margin: 0, fontSize: '16px' }}>⚙️ Settings</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '20px' }}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '12px 16px', color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Appearance</div>
        <SettingRow label="Theme">
          <select value={prefs.theme} onChange={e => updatePref('theme', e.target.value as any)}
            style={{ background: '#374151', color: 'white', border: '1px solid #4b5563', borderRadius: '4px', padding: '4px 8px' }}>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="system">System</option>
          </select>
        </SettingRow>
        <SettingRow label="Chat Font Size">
          <select value={prefs.chatFontSize} onChange={e => updatePref('chatFontSize', e.target.value as any)}
            style={{ background: '#374151', color: 'white', border: '1px solid #4b5563', borderRadius: '4px', padding: '4px 8px' }}>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </SettingRow>
        
        <div style={{ padding: '12px 16px', color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '8px' }}>Behavior</div>
        <SettingRow label="Show Timestamps">
          <input type="checkbox" checked={prefs.showTimestamps} onChange={e => updatePref('showTimestamps', e.target.checked)} />
        </SettingRow>
        <SettingRow label="Auto Scroll">
          <input type="checkbox" checked={prefs.autoScroll} onChange={e => updatePref('autoScroll', e.target.checked)} />
        </SettingRow>
        <SettingRow label="Agent Tree View">
          <input type="checkbox" checked={prefs.agentTreeView} onChange={e => updatePref('agentTreeView', e.target.checked)} />
        </SettingRow>

        <div style={{ padding: '12px 16px', color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '8px' }}>Force Tools</div>
        <div style={{ padding: '10px 16px' }}>
          <div style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '12px' }}>Tools that MUST run before/after every response:</div>
          {['Before Answer', 'After Answer', 'Session Start', 'Session End'].map(hook => (
            <div key={hook} style={{ marginBottom: '8px' }}>
              <div style={{ color: '#d1d5db', fontSize: '12px', marginBottom: '4px' }}>{hook}:</div>
              <input
                placeholder="tool-name, tool-name-2"
                style={{
                  width: '100%',
                  background: '#374151',
                  color: 'white',
                  border: '1px solid #4b5563',
                  borderRadius: '4px',
                  padding: '6px 8px',
                  fontSize: '12px',
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '12px 16px', borderTop: '1px solid #374151' }}>
        <button style={{
          width: '100%',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '10px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}>
          Save Settings
        </button>
      </div>
    </div>
  );
}
