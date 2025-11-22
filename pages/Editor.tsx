
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Layout } from '../components/Layout';
import { CodeEditor } from '../components/Editor/CodeEditor';
import { PreviewFrame } from '../components/Editor/PreviewFrame';
import { AIChat } from '../components/Editor/AIChat';
import { FileExplorer } from '../components/Editor/FileExplorer';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { Rocket, Share2, Code, Eye, GripVertical, GripHorizontal } from 'lucide-react';
import JSZip from 'jszip';
import { File as ProjectFile } from '../types';
import { useNavigate } from 'react-router-dom';

export const EditorPage: React.FC = () => {
  const { currentProject, user, activeFile, setActiveFile } = useStore();
  const [deploying, setDeploying] = useState(false);
  const navigate = useNavigate();

  // Layout State
  const [explorerWidth, setExplorerWidth] = useState(260);
  const [chatHeight, setChatHeight] = useState(320);
  const [codeWidth, setCodeWidth] = useState(500);
  const [showCode, setShowCode] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Refs for resizing
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentProject) {
      navigate('/dashboard');
    }
  }, [currentProject, navigate]);

  useEffect(() => {
    if (!activeFile && currentProject?.files) {
        const files = Object.keys(currentProject.files);
        if (files.length > 0) {
            const preferred = ['App.tsx', 'App.js', 'index.tsx', 'index.js', 'main.tsx'].find(f => files.includes(f));
            setActiveFile(preferred || files[0]);
        }
    }
  }, [activeFile, currentProject]);

  // Resizing Logic
  const startResizing = useCallback((type: 'explorer' | 'chat' | 'code') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startExplorerWidth = explorerWidth;
    const startChatHeight = chatHeight;
    const startCodeWidth = codeWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
        if (type === 'explorer') {
            const newWidth = Math.max(150, Math.min(600, startExplorerWidth + (moveEvent.clientX - startX)));
            setExplorerWidth(newWidth);
        } else if (type === 'chat') {
            const newHeight = Math.max(100, Math.min(800, startChatHeight - (moveEvent.clientY - startY)));
            setChatHeight(newHeight);
        } else if (type === 'code') {
            const newWidth = Math.max(200, Math.min(1200, startCodeWidth + (moveEvent.clientX - startX)));
            setCodeWidth(newWidth);
        }
    };

    const onMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [explorerWidth, chatHeight, codeWidth]);


  if (!currentProject) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full bg-dark-bg">
          <div className="flex flex-col items-center gap-3">
             <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-500 border-t-transparent"></div>
             <p className="text-gray-500 text-sm font-medium">Loading workspace...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const handleDownload = () => {
    const zip = new JSZip();
    const files = Object.values(currentProject.files) as ProjectFile[];
    files.forEach(file => {
      zip.file(file.name, file.content);
    });
    zip.generateAsync({ type: "blob" }).then(content => {
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentProject.name.replace(/\s+/g, '-')}.zip`;
      a.click();
    });
  };

  const handleDeploy = () => {
    if (user?.plan === 'free') {
      alert("Please upgrade to Plus to deploy custom domains!");
      return;
    }
    setDeploying(true);
    setTimeout(() => {
      setDeploying(false);
      alert(`Deployed successfully to https://${currentProject.name.toLowerCase().replace(/\s/g,'-')}.cupcakes.app`);
    }, 2000);
  };

  return (
    <Layout>
      <div 
        ref={containerRef}
        className={`flex h-full bg-[#09090b] overflow-hidden font-sans ${isResizing ? 'select-none cursor-col-resize' : ''}`}
      >
        
        {/* 1. Left: Explorer (Resizable) */}
        <div style={{ width: explorerWidth }} className="flex-shrink-0 flex flex-col min-w-[150px]">
           <FileExplorer />
        </div>
        
        {/* Explorer Resizer */}
        <div 
            className="w-1 bg-dark-border hover:bg-brand-500 cursor-col-resize flex items-center justify-center transition-colors group z-20"
            onMouseDown={startResizing('explorer')}
        >
            <div className="h-8 w-0.5 bg-transparent group-hover:bg-white/50 rounded-full" />
        </div>

        {/* 2. Main Content (Right of Explorer) */}
        <div className="flex-1 flex flex-col min-w-0">
            
            {/* Header */}
            <div className="h-12 border-b border-dark-border flex items-center justify-between px-4 bg-[#18181b] shrink-0 z-10">
              <div className="flex items-center gap-3 min-w-[200px]">
                <h1 className="text-sm font-bold text-white">{currentProject.name}</h1>
                <span className="text-gray-600 text-xs">/</span>
                <span className="text-xs text-gray-500 font-mono truncate max-w-[150px]">{currentProject.id.slice(0,8)}</span>
              </div>

              {/* Central Toggle: Code / Preview */}
              <div className="absolute left-1/2 -translate-x-1/2 flex bg-[#27272a] rounded-lg p-1 gap-1">
                 <button 
                    onClick={() => setShowCode(false)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition-all ${!showCode ? 'bg-brand-600 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                 >
                    <Eye size={14} /> Preview Only
                 </button>
                 <button 
                    onClick={() => setShowCode(true)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition-all ${showCode ? 'bg-brand-600 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                 >
                    <Code size={14} /> Code & Preview
                 </button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-7 text-gray-400 hover:text-white px-2" onClick={handleDownload} title="Export">
                  <Share2 size={14} />
                </Button>
                <Button size="sm" onClick={handleDeploy} loading={deploying} className="bg-white text-black hover:bg-gray-200 border-none h-7 text-xs font-semibold px-3">
                  <Rocket size={12} className="mr-2" /> Deploy
                </Button>
              </div>
            </div>

            {/* Workspace: Code & Preview Split */}
            <div className="flex-1 flex min-h-0 relative">
                
                {/* Code Pane (Conditional) */}
                {showCode && (
                    <>
                        <div style={{ width: codeWidth }} className="flex-shrink-0 flex flex-col min-w-[200px] bg-[#1e1e1e]">
                            <CodeEditor />
                        </div>
                        
                        {/* Code Resizer */}
                        <div 
                            className="w-1 bg-dark-border hover:bg-brand-500 cursor-col-resize flex items-center justify-center transition-colors group z-20"
                            onMouseDown={startResizing('code')}
                        >
                             <div className="h-8 w-0.5 bg-transparent group-hover:bg-white/50 rounded-full" />
                        </div>
                    </>
                )}

                {/* Preview Pane (Always Flex-1) */}
                <div className="flex-1 flex flex-col min-w-0 bg-white">
                    <PreviewFrame />
                </div>
            </div>

            {/* Bottom Panel Resizer */}
            <div 
                className="h-1 bg-dark-border hover:bg-brand-500 cursor-row-resize flex justify-center items-center transition-colors group z-20"
                onMouseDown={startResizing('chat')}
            >
                 <div className="w-8 h-0.5 bg-transparent group-hover:bg-white/50 rounded-full" />
            </div>

            {/* Bottom Panel: AI Agent (Resizable) */}
            <div style={{ height: chatHeight }} className="flex-shrink-0 flex flex-col min-h-[100px] bg-[#18181b]">
                <AIChat />
            </div>
        </div>
      </div>
    </Layout>
  );
};
