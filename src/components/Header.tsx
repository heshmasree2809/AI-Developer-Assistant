import React, { useEffect, useState } from 'react';
import {
  Code2,
  Cpu,
  PlusCircle,
  Folder,
  CheckCircle2,
  AlertTriangle,
  User as UserIcon,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { statsService } from '../services/api';
import { Project } from '../types';

interface HeaderProps {
  currentTab: string;
  onNewAnalysisClick: () => void;
  selectedProject?: Project | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNewAnalysisClick,
  selectedProject,
}) => {
  const { user, openAuthModal, loginAsDemo } = useAuth();
  const [serverHealthy, setServerHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await statsService.getHealth();
        setServerHealthy(res.status === 'healthy');
      } catch {
        setServerHealthy(false);
      }
    }
    checkHealth();
  }, []);

  const getTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Engineering Dashboard & Metrics';
      case 'analyzer':
        return 'Code Studio & AI Analysis Engine';
      case 'projects':
        return 'Project Repositories & Snippets';
      case 'history':
        return 'Analysis Audit Logs & History';
      case 'settings':
        return 'Architecture, Docker & API Config';
      default:
        return 'AI Developer Assistant';
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>{getTitle()}</span>
            {selectedProject && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Folder className="w-3 h-3 text-indigo-600" />
                {selectedProject.name}
              </span>
            )}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* LLM / Server Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700">
          <Cpu className="w-3.5 h-3.5 text-indigo-600" />
          <span className="font-mono text-[11px] font-semibold text-slate-800">Gemini 3.7 Flash</span>
          {serverHealthy === true && (
            <span className="flex items-center gap-1 text-emerald-600 text-[11px] font-bold pl-1.5 border-l border-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5" /> Online
            </span>
          )}
          {serverHealthy === false && (
            <span className="flex items-center gap-1 text-amber-600 text-[11px] font-bold pl-1.5 border-l border-slate-300">
              <AlertTriangle className="w-3.5 h-3.5" /> Fallback Mode
            </span>
          )}
        </div>

        {/* Quick Action Button */}
        <button
          id="btn-header-new-analysis"
          onClick={onNewAnalysisClick}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>New Analysis</span>
        </button>

        {/* User Account / Sign In Pill */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 text-xs font-bold" title={user.email}>
              {user.name.slice(0, 2).toUpperCase()}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <button
              id="btn-header-signin"
              onClick={() => openAuthModal('login')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-2.5 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
            >
              Sign In
            </button>
            <button
              id="btn-header-demo"
              onClick={loginAsDemo}
              className="hidden md:flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 px-2.5 py-1.5 rounded-md transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Demo User</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
