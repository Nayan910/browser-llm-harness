import React from 'react';

interface FileItem {
  name: string;
  type: 'file' | 'directory';
  children?: FileItem[];
  agent?: string;
  lastModified?: Date;
}

interface FileExplorerProps {
  files: FileItem[];
  onFileSelect: (path: string) => void;
}

export function FileExplorer({ files, onFileSelect }: FileExplorerProps) {
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
  };

  const FileIcon = ({ type }: { type: string }) => (
    <span style={{ marginRight: '6px' }}>{type === 'directory' ? '📁' : '📄'}</span>
  );

  const renderFile = (file: FileItem, depth: number = 0): React.ReactNode => {
    if (file.type === 'directory') {
      return (
        <div key={file.name}>
          <div style={{ padding: '4px 12px', paddingLeft: ${12 + depth * 16}px, cursor: 'pointer', fontSize: '13px', color: '#d1d5db' }}>
            <FileIcon type="directory" />{file.name}
          </div>
          {file.children?.map(child => renderFile(child, depth + 1))}
        </div>
      );
    }
    return (
      <div
        key={file.name}
        onClick={() => onFileSelect(file.name)}
        style={{
          padding: '4px 12px',
          paddingLeft: ${12 + depth * 16}px,
          cursor: 'pointer',
          fontSize: '13px',
          color: '#9ca3af',
          display: 'flex',
          justifyContent: 'space-between',
          transition: 'background 0.1s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#374151')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <span>
          <FileIcon type="file" />{file.name}
        </span>
        {file.agent && (
          <span style={{ fontSize: '10px', color: '#6b7280', background: '#111827', padding: '1px 6px', borderRadius: '8px' }}>
            {file.agent}
          </span>
        )}
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>📂 Files & Agent Map</div>
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {files.map(file => renderFile(file))}
        {files.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
            No files tracked yet. Start a session to track file changes.
          </div>
        )}
      </div>
    </div>
  );
}
