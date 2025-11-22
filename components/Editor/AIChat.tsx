
import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../store/useStore';
import { Sparkles, Bot, Loader2, CheckCircle2, Circle, AlertCircle, ArrowRight, History, MessageSquare } from 'lucide-react';
import { AgentStatus } from '../../types';
import { enhancePrompt } from '../../services/aiService';

export const AIChat: React.FC = () => {
  const { 
    currentProject,
    agentStatus, 
    agentPlan,
    agentLogs,
    runAgent
  } = useStore();
  
  const [input, setInput] = useState('');
  const [enhancing, setEnhancing] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'logs'>('chat');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentProject?.chatHistory, agentStatus, agentPlan, agentLogs, activeTab]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  };

  const handleEnhance = async () => {
      if (!input.trim()) return;
      setEnhancing(true);
      try {
          const improved = await enhancePrompt(input);
          setInput(improved);
      } finally {
          setEnhancing(false);
      }
  };

  const handleSubmit = async () => {
    if (!input.trim() || agentStatus !== AgentStatus.IDLE) return;
    const prompt = input;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await runAgent(prompt);
  };

  if (!currentProject) return null;

  const activeTask = agentPlan.find(t => t.status === 'active');

  return (
    <div className="h-full flex flex-col bg-[#18181b] font-sans border-t border-dark-border shadow-inner">
      
      {/* Bottom Panel Header */}
      <div className="h-9 border-b border-dark-border flex items-center px-4 shrink-0 bg-[#202023] justify-between">
         <div className="flex items-center gap-2">
             <span className="font-bold text-white text-xs tracking-wide uppercase text-gray-400">AI Agent Console</span>
         </div>
         <div className="flex gap-4 h-full items-end">
            <button 
                onClick={() => setActiveTab('chat')}
                className={`text-xs font-medium pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'chat' ? 'text-brand-400 border-brand-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
            >
                <MessageSquare size={12} />
                Chat & Plan
            </button>
            <button 
                onClick={() => setActiveTab('logs')}
                className={`text-xs font-medium pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'logs' ? 'text-brand-400 border-brand-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
            >
                <History size={12} />
                System Logs
            </button>
         </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex min-h-0">
        
        {activeTab === 'chat' ? (
            <div className="flex-1 flex">
                {/* Chat Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
                     {currentProject.chatHistory.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <Bot size={24} className="mb-2 opacity-50" />
                            <p className="text-sm">How can I help you build today?</p>
                        </div>
                     )}
                     {currentProject.chatHistory.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                             <div className={`max-w-3xl rounded-lg px-4 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                                 msg.role === 'user' 
                                 ? 'bg-[#27272a] text-white border border-dark-border' 
                                 : 'bg-transparent text-gray-300 pl-0'
                             }`}>
                                 {msg.role === 'ai' && <span className="text-brand-400 font-bold mr-2">AI:</span>}
                                 {msg.content}
                             </div>
                        </div>
                     ))}
                     
                     {/* Thinking Indicator */}
                     {agentStatus !== AgentStatus.IDLE && activeTask && (
                         <div className="flex items-center gap-3 text-sm text-gray-400 italic pl-0 animate-pulse">
                             <Bot size={14} className="text-brand-400" />
                             <span>{activeTask.streamContent ? "Writing code..." : "Thinking..."}</span>
                         </div>
                     )}
                </div>

                {/* Plan Sidebar */}
                {agentPlan.length > 0 && (
                    <div className="w-72 border-l border-dark-border bg-[#1e1e1e] overflow-y-auto p-3 shrink-0 custom-scrollbar">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 tracking-wider">Execution Plan</h3>
                        <div className="space-y-1">
                            {agentPlan.map((task) => (
                                <div key={task.id} className="flex items-start gap-2 p-2 rounded hover:bg-white/5">
                                    <div className="mt-0.5">
                                        {task.status === 'completed' ? <CheckCircle2 size={13} className="text-green-500"/> :
                                         task.status === 'active' ? <Loader2 size={13} className="text-brand-400 animate-spin"/> :
                                         task.status === 'failed' ? <AlertCircle size={13} className="text-red-500"/> :
                                         <Circle size={13} className="text-gray-600"/>}
                                    </div>
                                    <span className={`text-xs ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                                        {task.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-xs custom-scrollbar">
                {agentLogs.map((log) => (
                    <div key={log.id} className="flex gap-3 border-b border-white/5 py-1">
                        <span className="text-gray-600 w-16 shrink-0">{log.timestamp}</span>
                        <span className={`break-all ${
                            log.type === 'error' ? 'text-red-400' : 
                            log.type === 'success' ? 'text-green-400' : 
                            log.type === 'thinking' ? 'text-yellow-500' : 'text-gray-300'
                        }`}>
                            {log.message}
                        </span>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#202023] border-t border-dark-border shrink-0">
        <div className="max-w-4xl mx-auto relative">
            <div className="bg-[#18181b] rounded-lg border border-[#27272a] flex items-end pr-2 shadow-sm focus-within:border-brand-500/50 transition-colors">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInput}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }}}
                    disabled={agentStatus !== AgentStatus.IDLE}
                    placeholder={agentStatus === AgentStatus.IDLE ? "Describe a feature to add..." : "Agent is busy..."}
                    className="w-full bg-transparent border-none py-2.5 pl-3 text-sm text-gray-200 placeholder-gray-500 focus:ring-0 resize-none max-h-32"
                    rows={1}
                />
                <div className="flex pb-2 gap-1">
                     <button 
                        onClick={handleEnhance}
                        disabled={!input.trim() || enhancing}
                        className={`p-1.5 rounded hover:bg-white/10 transition-colors ${input.trim() ? 'text-brand-400' : 'text-gray-600'}`}
                        title="Enhance Prompt with AI"
                     >
                        {enhancing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                     </button>
                     <button 
                        onClick={handleSubmit}
                        disabled={!input.trim() || agentStatus !== AgentStatus.IDLE}
                        className={`p-1.5 rounded transition-colors ${input.trim() && agentStatus === AgentStatus.IDLE ? 'bg-brand-600 text-white hover:bg-brand-500' : 'bg-white/5 text-gray-500'}`}
                     >
                        <ArrowRight size={16} />
                     </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
