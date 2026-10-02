import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Plus,
  Edit2,
  Trash2,
  FileCode2,
  Tag,
  ArrowRight,
  ExternalLink,
  PlusCircle,
  Calendar,
  FolderOpen,
} from 'lucide-react';
import { Project, ProjectFile } from '../types';
import { projectService } from '../services/api';
import { ProjectModal } from '../components/ProjectModal';

interface ProjectsPageProps {
  onSelectProjectForAnalysis: (project: Project, file?: ProjectFile) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  onSelectProjectForAnalysis,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // File adding state
  const [activeProjectIdForFile, setActiveProjectIdForFile] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [newFileLang, setNewFileLang] = useState('python');
  const [newFileContent, setNewFileContent] = useState('');

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleSaveProject = async (name: string, description: string, tags: string[]) => {
    if (editingProject) {
      await projectService.updateProject(editingProject.id, { name, description, tags });
    } else {
      await projectService.createProject({ name, description, tags });
    }
    loadProjects();
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete project "${name}"?`)) {
      try {
        await projectService.deleteProject(id);
        loadProjects();
      } catch (err) {
        console.error('Failed to delete project:', err);
      }
    }
  };

  const handleAddFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProjectIdForFile || !newFileName.trim()) return;

    try {
      await projectService.addFile(activeProjectIdForFile, {
        name: newFileName,
        language: newFileLang as any,
        content: newFileContent,
      });
      setActiveProjectIdForFile(null);
      setNewFileName('');
      setNewFileContent('');
      loadProjects();
    } catch (err) {
      console.error('Failed to add file:', err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-indigo-600" />
            Project Repositories & Snippet Workspace
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Organize codebases, track audit iterations, and manage multi-file components.
          </p>
        </div>

        <button
          id="btn-create-project"
          onClick={() => {
            setEditingProject(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500 font-medium">Loading project repositories...</div>
      ) : projects.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <FolderOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-sm text-slate-900">No Projects Created Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
            Create a project repository to save code snippets, group related microservice files, and track quality scores.
          </p>
          <button
            onClick={() => {
              setEditingProject(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between"
            >
              {/* Project Card Header */}
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center flex-shrink-0">
                      <FolderGit2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{project.name}</h3>
                      <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        Created {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingProject(project);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit project"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id, project.name)}
                      className="p-1.5 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">{project.description}</p>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-mono font-bold flex items-center gap-1"
                      >
                        <Tag className="w-2.5 h-2.5 text-indigo-600" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Project Files Section */}
              <div className="bg-slate-50 border-t border-slate-100 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <FileCode2 className="w-3.5 h-3.5 text-indigo-600" />
                    Project Files ({project.files?.length || 0})
                  </span>
                  <button
                    onClick={() => setActiveProjectIdForFile(project.id)}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>Add File</span>
                  </button>
                </div>

                {/* Add File Sub-form inline if triggered */}
                {activeProjectIdForFile === project.id && (
                  <form onSubmit={handleAddFile} className="bg-white p-3 rounded-lg border border-slate-200 space-y-2 text-xs shadow-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="file_name.py"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-indigo-600"
                      />
                      <select
                        value={newFileLang}
                        onChange={(e) => setNewFileLang(e.target.value)}
                        className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 text-xs font-medium focus:outline-none focus:border-indigo-600"
                      >
                        <option value="python">Python</option>
                        <option value="typescript">TypeScript</option>
                        <option value="javascript">JavaScript</option>
                        <option value="go">Go</option>
                        <option value="java">Java</option>
                      </select>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="// Source code content..."
                      value={newFileContent}
                      onChange={(e) => setNewFileContent(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-mono text-xs text-slate-900 resize-none focus:bg-white focus:outline-none focus:border-indigo-600"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveProjectIdForFile(null)}
                        className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 text-[11px] font-bold hover:bg-slate-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 rounded bg-indigo-600 text-white font-bold text-[11px] hover:bg-indigo-700 cursor-pointer"
                      >
                        Save File
                      </button>
                    </div>
                  </form>
                )}

                {(!project.files || project.files.length === 0) ? (
                  <p className="text-[11px] text-slate-400 italic">
                    No files stored yet. Use Code Studio or click "Add File".
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {project.files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 text-xs transition-colors group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileCode2 className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                          <span className="font-mono text-slate-800 font-semibold truncate">{file.name}</span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-slate-100 text-slate-700 border border-slate-200 rounded font-bold">
                            {file.language}
                          </span>
                        </div>

                        <button
                          onClick={() => onSelectProjectForAnalysis(project, file)}
                          className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-indigo-200"
                        >
                          <span>Open in Studio</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProject}
        projectToEdit={editingProject}
      />
    </div>
  );
};
