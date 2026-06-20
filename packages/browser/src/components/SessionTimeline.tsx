import React from 'react';

interface TimelineEvent {
  id: string;
  time: Date;
  type: 'agent-action' | 'file-change' | 'tool-call' | 'session-start' | 'session-end';
  description: string;
  agentName?: string;
}

interface SessionTimelineProps {
  events: TimelineEvent[];
}

export function SessionTimeline({ events }: SessionTimelineProps) {
  const typeIcons: Record<string, string> = {
    'agent-action': '🤖',
    'file-change': '📄',
    'tool-call': '🔧',
    'session-start': '▶️',
    'session-end': '⏹️',
  };

  const containerStyle: React.CSSProperties = {
    background: '#1f2937',
    borderRadius: '8px',
    border: '1px solid #374151',
    overflow: 'hidden',
  };

  return (
    <div style={containerStyle}>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #374151', fontSize: '13px', fontWeight: 'bold', color: '#d1d5db', background: '#111827' }}>
        📋 Session Timeline
      </div>
      <div style={{ maxHeight: '250px', overflowY: 'auto', padding: '8px 0' }}>
        {events.map((event, i) => (
          <div key={event.id} style={{ display: 'flex', padding: '4px 12px', alignItems: 'flex-start' }}>
            <div style={{ width: '24px', textAlign: 'center', marginRight: '8px' }}>{typeIcons[event.type] || '•'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#d1d5db', fontSize: '13px' }}>{event.description}</div>
              <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '1px' }}>
                {event.time.toLocaleTimeString()}
                {event.agentName &&  · }
              </div>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
            No events yet. Activity will appear here.
          </div>
        )}
      </div>
    </div>
  );
}
