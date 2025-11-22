
import { create } from 'zustand';
import { Project, File, User, AgentLog, AgentStatus, ChatMessage, AgentTask } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/db';
import { generatePlan, executeStep } from '../services/aiService';

interface AppState {
  user: User | null;
  projects: Project[];
  currentProject: Project | null;
  activeFile: string | null;
  
  // AI State
  agentStatus: AgentStatus;
  agentLogs: AgentLog[];
  agentPlan: AgentTask[];
  agentStartTime: number | null;
  
  // Actions
  init: () => Promise<void>;
  login: (name: string, email: string, avatar?: string) => Promise<void>;
  logout: () => void;
  updateUser: (name: string) => Promise<void>;
  createProject: (name: string, description: string) => Promise<string>;
  selectProject: (id: string) => Promise<void>;
  setActiveFile: (fileName: string | null) => void;
  updateFile: (fileName: string, content: string) => void;
  deleteFile: (fileName: string) => void;
  
  addLog: (message: string, type: AgentLog['type']) => void;
  addChatMessage: (role: 'user' | 'ai' | 'system', content: string) => void;
  updateProjectChat: (messages: ChatMessage[]) => void;
  
  setAgentStatus: (status: AgentStatus) => void;
  setAgentPlan: (tasks: AgentTask[]) => void;
  updateTaskStatus: (id: string, status: AgentTask['status']) => void;
  updateTaskStream: (id: string, contentChunk: string) => void; // New
  skipTask: (id: string) => void;
  stopAgent: () => void;
  runAgent: (prompt: string) => Promise<void>;
  
  togglePlan: () => void;
  deleteProject: (id: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  projects: [],
  currentProject: null,
  activeFile: null,
  
  agentStatus: AgentStatus.IDLE,
  agentLogs: [],
  agentPlan: [],
  agentStartTime: null,
  
  init: async () => {
    const userJson = localStorage.getItem('cupcake_session');
    if (userJson) {
        const user = JSON.parse(userJson);
        const projects = await db.getProjects(user.id);
        set({ user, projects });
    }
  },

  login: async (name, email, avatar) => {
    const existingUser = await db.getUser(email);
    let user = existingUser;
    
    if (!user) {
        user = await db.createUser({
            id: uuidv4(),
            name,
            email,
            plan: 'free',
            avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff`
        });
    }
    
    localStorage.setItem('cupcake_session', JSON.stringify(user));
    const projects = await db.getProjects(user!.id);
    set({ user, projects });
  },

  logout: () => {
      localStorage.removeItem('cupcake_session');
      set({ user: null, currentProject: null, projects: [], activeFile: null });
  },

  updateUser: async (name) => {
    const { user } = get();
    if (!user) return;
    const updated = { ...user, name, avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff` };
    await db.updateUser(updated);
    localStorage.setItem('cupcake_session', JSON.stringify(updated));
    set({ user: updated });
  },

  createProject: async (name, description) => {
    const { user, projects } = get();
    if (!user) throw new Error("Not authenticated");

    const id = uuidv4();
    const newProject: Project = {
      id,
      name,
      description,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      status: 'idle',
      files: {}, 
      chatHistory: [{
        id: uuidv4(),
        role: 'ai',
        content: `Ready to build "${name}". What's the first step?`,
        timestamp: new Date().toISOString()
      }]
    };

    await db.createProject(newProject);
    set({ 
      projects: [newProject, ...projects],
      currentProject: newProject,
      activeFile: null,
      agentLogs: [],
      agentPlan: []
    });

    return id;
  },

  selectProject: async (id) => {
    const project = await db.getProjectById(id);
    if (project) {
      set({ 
        currentProject: project, 
        activeFile: null, 
      });
      if (get().currentProject?.id !== id) {
          set({
              agentLogs: [],
              agentPlan: [],
              agentStatus: AgentStatus.IDLE,
              agentStartTime: null
          });
      }
    }
  },

  deleteProject: async (id) => {
    await db.deleteProject(id);
    set((state) => ({
      projects: state.projects.filter(p => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject
    }));
  },

  setActiveFile: (fileName) => {
    set({ activeFile: fileName });
  },

  updateFile: (fileName, content) => {
    set((state) => {
      if (!state.currentProject) return state;
      
      const file: File = state.currentProject.files[fileName] || { 
          name: fileName, 
          language: fileName.split('.').pop() || 'txt', 
          content: '' 
      };

      const updatedFiles = {
        ...state.currentProject.files,
        [fileName]: { ...file, content }
      };
      
      const updatedProject = { ...state.currentProject, files: updatedFiles, lastModified: new Date().toISOString() };
      db.updateProject(updatedProject);
      
      return {
        currentProject: updatedProject,
        projects: state.projects.map(p => p.id === updatedProject.id ? updatedProject : p)
      };
    });
  },

  deleteFile: (fileName) => {
      set((state) => {
          if (!state.currentProject) return state;
          const updatedFiles = { ...state.currentProject.files };
          delete updatedFiles[fileName];

          const updatedProject = { ...state.currentProject, files: updatedFiles, lastModified: new Date().toISOString() };
          db.updateProject(updatedProject);

          return {
              currentProject: updatedProject,
              projects: state.projects.map(p => p.id === updatedProject.id ? updatedProject : p),
              activeFile: state.activeFile === fileName ? null : state.activeFile
          }
      })
  },

  addLog: (message, type) => {
    const newLog: AgentLog = {
      id: uuidv4(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    set((state) => ({ agentLogs: [...state.agentLogs, newLog] }));
  },

  addChatMessage: (role, content) => {
    const msg: ChatMessage = {
      id: uuidv4(),
      role,
      content,
      timestamp: new Date().toISOString()
    };
    set((state) => {
        if (!state.currentProject) return state;
        const updatedChat = [...state.currentProject.chatHistory, msg];
        const updatedProject = { ...state.currentProject, chatHistory: updatedChat };
        db.updateProject(updatedProject);
        return {
             currentProject: updatedProject,
             projects: state.projects.map(p => p.id === updatedProject.id ? updatedProject : p)
        }
    });
  },

  updateProjectChat: (messages) => {
      set((state) => {
          if (!state.currentProject) return state;
          const updatedProject = { ...state.currentProject, chatHistory: messages };
          db.updateProject(updatedProject);
          return { currentProject: updatedProject };
      })
  },

  setAgentStatus: (status) => {
    set({ 
      agentStatus: status,
      agentStartTime: status !== AgentStatus.IDLE ? (get().agentStartTime || Date.now()) : null
    });
  },
  
  setAgentPlan: (tasks) => set({ agentPlan: tasks }),
  
  updateTaskStatus: (id, status) => {
      set((state) => ({
          agentPlan: state.agentPlan.map(t => t.id === id ? { ...t, status } : t)
      }))
  },

  updateTaskStream: (id, contentChunk) => {
      set((state) => ({
          agentPlan: state.agentPlan.map(t => 
              t.id === id 
              ? { ...t, streamContent: (t.streamContent || "") + contentChunk } 
              : t
          )
      }))
  },

  skipTask: (id) => {
      set((state) => ({
          agentPlan: state.agentPlan.map(t => t.id === id ? { ...t, status: 'skipped' } : t)
      }));
      const task = get().agentPlan.find(t => t.id === id);
      if(task) get().addLog(`Skipped: ${task.title}`, 'warning');
  },

  stopAgent: () => {
      set({ agentStatus: AgentStatus.IDLE, agentStartTime: null });
      set((state) => ({
          agentPlan: state.agentPlan.map(t => t.status === 'active' ? { ...t, status: 'failed' } : t)
      }));
      get().addChatMessage('system', 'Agent execution stopped by user.');
  },

  runAgent: async (prompt: string) => {
    const { addLog, setAgentStatus, setAgentPlan, updateTaskStatus, updateTaskStream, updateFile, deleteFile, addChatMessage } = get();
    
    if (!prompt.trim()) return;
    
    addChatMessage('user', prompt);
    setAgentStatus(AgentStatus.PLANNING);
    addChatMessage('ai', "I'm on it! Analyzing your request...");

    try {
      // Phase 1: Planning
      addLog("Drafting execution plan...", 'thinking');
      
      const tasks = await generatePlan(prompt);
      setAgentPlan(tasks);
      addLog(`Plan locked: ${tasks.length} steps.`, 'success');
      addChatMessage('ai', `I've created a ${tasks.length}-step plan. Starting execution now.`);

      // Phase 2: Execution Loop
      setAgentStatus(AgentStatus.CODING);
      
      for (const task of tasks) {
          if (get().agentStatus !== AgentStatus.CODING) {
              addLog('Aborting remaining tasks.', 'warning');
              break;
          }

          const currentTask = get().agentPlan.find(t => t.id === task.id);
          if (currentTask?.status === 'skipped') continue;

          updateTaskStatus(task.id, 'active');
          addLog(`Building: ${task.title}`, 'info');
          
          const currentFiles = get().currentProject?.files || {};
          
          try {
              // Stream chunks to the UI
              const actions = await executeStep(
                  task.title, 
                  currentFiles, 
                  prompt,
                  (chunk) => updateTaskStream(task.id, chunk)
              );
              
              if (actions.length > 0) {
                  actions.forEach(action => {
                      if (action.action === 'create' || action.action === 'update') {
                          if (action.content) updateFile(action.path, action.content);
                      } else if (action.action === 'delete') {
                          deleteFile(action.path);
                      }
                  });
                  addLog(`Deployed: ${task.title}`, 'success');
                  updateTaskStatus(task.id, 'completed');
                  addChatMessage('ai', `Completed: ${task.title}`);
              } else {
                   addLog(`No changes for: ${task.title}`, 'info');
                   updateTaskStatus(task.id, 'completed');
              }
          } catch (e: any) {
              addLog(`Failed: ${task.title}. Error: ${e.message}`, 'error');
              updateTaskStatus(task.id, 'failed');
          }
      }

      if (get().agentStatus === AgentStatus.CODING) {
        addChatMessage('ai', "Build complete! I've updated the files. Check the preview.");
        setAgentStatus(AgentStatus.READY);
        setTimeout(() => setAgentStatus(AgentStatus.IDLE), 2000);
      }

    } catch (error: any) {
      addChatMessage('ai', `System Error: ${error.message}`);
      setAgentStatus(AgentStatus.IDLE);
    }
  },

  togglePlan: () => {
    set((state) => {
        if(!state.user) return state;
        const newPlan = state.user.plan === 'free' ? 'plus' : 'free';
        const updatedUser = { ...state.user, plan: newPlan };
        db.updateUser(updatedUser);
        return { user: updatedUser };
    })
  }
}));
