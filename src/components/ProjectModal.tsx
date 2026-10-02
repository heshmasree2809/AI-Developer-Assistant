import React, { useState } from 'react';
import { X, FolderGit2, Tag, AlertCircle } from 'lucide-react';
import { Project } from '../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string, tags: string[]) => Promise<void>;
  projectToEdit?: Project | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projectToEdit,
}) => {
  const [name, setName] = useState(projectToEdit?.name || '');
  const [description, setDescription] = useState(projectToEdit?.description || '');
  const [tagsInput, setTagsInput] = useState((projectToEdit?.tags || []).join(', '));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setDescription(projectToEdit.description);
      setTagsInput((projectToEdit.tags || []).join(', '));
    } else {
      setName('');
      setDescription('');
      setTagsInput('');
    }
    setError(null);
  }, [projectToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    setLoading(true);
    setError(null);

    try {
      await onSave(name, description, tags);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {projectToEdit ? 'Edit Project Repository' : 'Create New Project'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Organize codebases and analysis audit history</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Project Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Payment Gateway Microservice"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the service, architecture, and technology stack..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white resize-none font-medium"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
              <span>Tags / Tech Stack</span>
              <span className="text-[10px] text-slate-400 font-normal">Comma-separated</span>
            </label>
            <div className="relative">
              <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Python, FastAPI, Docker, PostgreSQL"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs transition-colors cursor-pointer"
            >
              {loading ? 'Saving...' : projectToEdit ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
