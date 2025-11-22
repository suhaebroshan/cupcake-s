import React, { useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { Plus, Folder, Clock, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { projects, createProject, selectProject, deleteProject, init } = useStore();
  const navigate = useNavigate();

  // Load data from Mock DB on mount
  useEffect(() => {
      init();
  }, []);

  const handleCreate = async () => {
    const id = await createProject(`Project ${projects.length + 1}`, "A new AI-generated application");
    setTimeout(() => {
        navigate('/editor');
    }, 50);
  };

  const handleOpen = async (id: string) => {
    await selectProject(id);
    navigate('/editor');
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(id);
    }
  };

  return (
    <Layout>
      <div className="h-full overflow-y-auto">
        <div className="p-8 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-gray-400">Manage your AI-generated applications.</p>
            </div>
            <Button onClick={handleCreate} className="gap-2">
              <Plus size={18} /> New Project
            </Button>
          </div>

          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 bg-dark-surface border border-dashed border-dark-border rounded-xl">
              <div className="w-16 h-16 bg-brand-900/20 rounded-full flex items-center justify-center mb-4">
                <Folder size={32} className="text-brand-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No projects yet</h3>
              <p className="text-gray-400 mb-6 text-center max-w-md">
                Start your first AI engineering project. Describe what you want, and Cupcake-S will build it.
              </p>
              <Button onClick={handleCreate} className="gap-2">
                Create First Project <ArrowRight size={16} />
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {projects.map((project) => (
                <div 
                  key={project.id} 
                  onClick={() => handleOpen(project.id)}
                  className="bg-dark-surface border border-dark-border rounded-xl p-6 hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-900/10 transition-all group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-brand-900/20 rounded-lg text-brand-400 group-hover:scale-110 transition-transform">
                      <Folder size={20} />
                    </div>
                    {project.status === 'deployed' && (
                      <span className="px-2 py-1 text-xs bg-green-900/30 text-green-400 rounded-full border border-green-500/30">
                        Live
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">{project.name}</h3>
                  <p className="text-sm text-gray-400 mb-6 line-clamp-2">{project.description || "No description"}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 border-t border-dark-border pt-4">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{new Date(project.lastModified).toLocaleDateString()}</span>
                    </div>
                    <button 
                      onClick={(e) => handleDelete(e, project.id)}
                      className="p-1.5 hover:bg-red-900/20 text-gray-500 hover:text-red-400 rounded transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              
              <div 
                onClick={handleCreate}
                className="border-2 border-dashed border-dark-border rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-brand-500/50 hover:text-brand-400 hover:bg-dark-surface/50 cursor-pointer transition-all min-h-[200px]"
              >
                <Plus size={32} className="mb-2 opacity-50" />
                <span className="font-medium">Create New Project</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};