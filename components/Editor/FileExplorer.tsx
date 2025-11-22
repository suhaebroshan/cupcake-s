
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { FolderOpen, FileText, ChevronRight, ChevronDown, FileCode, FileJson, FileType } from 'lucide-react';

export const FileExplorer: React.FC = () => {
  const { currentProject, activeFile, setActiveFile } = useStore();
  const [isOpen, setIsOpen] = useState(true);

  if (!currentProject) return null;

  const files = Object.keys(currentProject.files).sort();

  const getFileIcon = (name: string) => {
      if (name.endsWith('.tsx') || name.endsWith('.jsx') || name.endsWith('.js') || name.endsWith('.ts')) 
        return <FileCode size={14} className="text-brand-400" />;
      if (name.endsWith('.css')) return <FileType size={14} className="text-blue-300" />;
      if (name.endsWith('.json')) return <FileJson size={14} className="text-yellow-400" />;
      if (name.endsWith('.html')) return <FileCode size={14} className="text-orange-400" />;
      return <FileText size={14} className="text-gray-400" />;
  };

  return (
    <div className="w-full h-full bg-[#18181b] border-r border-dark-border flex flex-col text-gray-300 font-sans">
        {/* Explorer Header */}
        <div className="h-10 flex items-center px-4 border-b border-dark-border bg-[#202023] flex-shrink-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Explorer</span>
        </div>
        
        {/* Project Root */}
        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
            <div 
                className="flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-white/5 text-sm font-medium select-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <ChevronDown size={14} className="text-gray-500"/> : <ChevronRight size={14} className="text-gray-500"/>}
                <span className="truncate">{currentProject.name}</span>
            </div>
            
            {/* File List */}
            {isOpen && (
                <div className="pl-4 mt-1 space-y-0.5">
                    {files.map((fileName) => (
                        <div 
                            key={fileName} 
                            onClick={() => setActiveFile(fileName)}
                            className={`
                                flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer rounded-l-sm border-l-2 transition-colors select-none
                                ${activeFile === fileName 
                                    ? 'bg-[#2a2d2e] text-white border-brand-500' 
                                    : 'border-transparent text-gray-400 hover:bg-[#2a2d2e] hover:text-gray-200'
                                }
                            `}
                        >
                            {getFileIcon(fileName)}
                            <span className="truncate text-[13px]">{fileName}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};
