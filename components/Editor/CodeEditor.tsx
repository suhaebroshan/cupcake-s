
import React from 'react';
import Editor from '@monaco-editor/react';
import { useStore } from '../../store/useStore';
import { FileCode } from 'lucide-react';

export const CodeEditor: React.FC = () => {
  const { currentProject, activeFile, updateFile } = useStore();
  
  if (!currentProject) return <div className="h-full flex items-center justify-center text-gray-500">No project selected</div>;

  const file = activeFile ? currentProject.files[activeFile] : null;

  if (!file) {
    return (
        <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2 bg-[#1e1e1e]">
            <FileCode size={32} className="opacity-50" />
            <p className="text-sm">Select a file from the explorer to view its code</p>
        </div>
    );
  }

  const handleChange = (value: string | undefined) => {
    if (value !== undefined && activeFile) {
      updateFile(activeFile, value);
    }
  };

  const getLanguage = (filename: string) => {
    if (filename.endsWith('.html')) return 'html';
    if (filename.endsWith('.css')) return 'css';
    if (filename.endsWith('.js')) return 'javascript';
    if (filename.endsWith('.json')) return 'json';
    if (filename.endsWith('.tsx') || filename.endsWith('.ts')) return 'typescript';
    return 'plaintext';
  };

  return (
    <div className="h-full w-full bg-[#1e1e1e]">
      <Editor
        height="100%"
        defaultLanguage={getLanguage(file.name)}
        language={getLanguage(file.name)}
        path={file.name} // Important for Monaco to switch models properly
        value={file.content}
        onChange={handleChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: 'JetBrains Mono, monospace',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
          padding: { top: 16 },
          scrollbar: {
             verticalScrollbarSize: 10,
             horizontalScrollbarSize: 10
          }
        }}
      />
    </div>
  );
};
