import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../store/useStore';
import { Play, Square, Terminal as TerminalIcon, Sparkles, Loader2, Send } from 'lucide-react';
import { AgentStatus } from '../../types';
import { enhancePrompt, generateCode } from '../../services/aiService';

export const Terminal: React.FC = () => {
  const { 
    agentLogs, 
    addLog, 
    agentStatus, 
    setAgentStatus, 
    currentProject,
    updateFile,
    setFiles
  } = useStore();
  
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [agentLogs]);

  const handleRunAgent = async () => {
    if (!input.trim() || agentStatus !== AgentStatus.IDLE) return;

    const prompt = input;
    setInput('');
    
    try {
      // 1. Enhance
      setAgentStatus(AgentStatus.ENHANCING);
      addLog(`Thinking about: "${prompt}"`, 'info');
      addLog('Calling Gemini 2.0 Flash to enhance requirements...', 'thinking');
      
      const enhancedSpec = await enhancePrompt(prompt);
      addLog('Specification created successfully.', 'success');
      addLog(enhancedSpec.substring(0, 100) + '...', 'info');

      // 2. Execute (Qwen)
      setAgentStatus(AgentStatus.CODING);
      addLog('Calling Qwen 2.5 72B to generate code...', 'thinking');
      
      const generatedCode = await generateCode(enhancedSpec, currentProject?.files);
      
      // 3. Update Project
      if (currentProject) {
          // Simple parser for the index.html response
          updateFile('index.html', generatedCode);
          addLog('index.html updated successfully.', 'success');
      }
      
      setAgentStatus(AgentStatus.READY);
      addLog('Agent finished tasks.', 'success');
      
      setTimeout(() => setAgentStatus(AgentStatus.IDLE), 2000);

    } catch (error: any) {
      addLog(`Error: ${error.message}`, 'error');
      setAgentStatus(AgentStatus.IDLE);
    }
  };

  return (
    <div className="h-full flex flex-col bg-dark-bg border-t border-dark-border">
      <div className="h-8 bg-dark-surface border-b border-dark-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <TerminalIcon size={14} className="text-brand-400" />
          <span className="text-xs font-mono text-gray-300">AI AGENT CONSOLE</span>
        </div>
        <div className="flex items-center gap-2">
            {agentStatus !== AgentStatus.IDLE && (
                <span className="flex items-center gap-1 text-xs text-brand-400 animate-pulse">
                    <Loader2 size={12} className="animate-spin" />
                    {agentStatus}
                </span>
            )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
        {agentLogs.length === 0 && (
            <div className="text-gray-600 italic">Waiting for instructions...</div>
        )}
        {agentLogs.map((log) => (
          <div key={log.id} className={`flex gap-2 ${
            log.type === 'error' ? 'text-red-400' : 
            log.type === 'success' ? 'text-green-400' : 
            log.type === 'thinking' ? 'text-yellow-400' : 'text-gray-300'
          }`}>
            <span className="text-gray-600">[{log.timestamp}]</span>
            <span>{log.message}</span>
          </div>
        ))}
      </div>

      <div className="p-3 bg-dark-surface border-t border-dark-border">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunAgent()}
            disabled={agentStatus !== AgentStatus.IDLE}
            placeholder="Describe what you want to build (e.g., 'Make a landing page for a coffee shop')..."
            className="w-full bg-dark-bg border border-dark-border rounded-md py-2 pl-10 pr-12 text-sm text-white focus:outline-none focus:border-brand-500 disabled:opacity-50"
          />
          <div className="absolute left-3 top-2.5">
            <Sparkles size={16} className="text-brand-500" />
          </div>
          <button 
            onClick={handleRunAgent}
            disabled={!input.trim() || agentStatus !== AgentStatus.IDLE}
            className="absolute right-2 top-1.5 p-1 bg-brand-600 rounded hover:bg-brand-700 disabled:opacity-50 text-white transition-colors"
          >
            {agentStatus !== AgentStatus.IDLE ? <Square size={16} fill="currentColor"/> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};