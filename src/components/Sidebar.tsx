import React from 'react';
import {
  Code2,
  LayoutDashboard,
  FolderGit2,
  History,
  Settings,
  Sparkles,
  ShieldAlert,
  Wrench,
  TestTube2,
  FileText,
  HelpCircle,
  ChevronRight,
  User as UserIcon,
  LogOut,
  LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavigationTab = 'dashboard' | 'analyzer' | 'projects' | 'history' | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onSelectAnalysisType?: (type: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, onSelectAnalysisType }) => {
  const { user, logout, openAuthModal, loginAsDemo } = useAuth();

  const navItems = [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyzer' as NavigationTab, label: 'Code Studio', icon: Code2, badge: 'AI' },
    { id: 'projects' as NavigationTab, label: 'Projects', icon: FolderGit2 },
    { id: 'history' as NavigationTab, label: 'History & Logs', icon: History },
    { id: 'settings' as NavigationTab, label: 'System & Config', icon: Settings },
  ];

  const analysisShortcuts = [
    { id: 'review', label: 'Code Review', icon: Sparkles, color: 'text-amber-600' },
    { id: 'bugs', label: 'Bug Detection', icon: ShieldAlert, color: 'text-rose-600' },
    { id: 'refactor', label: 'Refactoring', icon: Wrench, color: 'text-cyan-600' },
    { id: 'tests', label: 'Unit Tests', icon: TestTube2, color: 'text-emerald-600' },
    { id: 'documentation', label: 'Documentation', icon: FileText, color: 'text-indigo-600' },
    { id: 'explain', label: 'Code Explanation', icon: HelpCircle, color: 'text-purple-600' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-screen select-none shadow-sm">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center shadow-md shadow-indigo-600/20 text-white">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-base leading-tight tracking-tight">AI Dev Assistant</h1>
            <p className="text-[11px] text-indigo-600 font-semibold tracking-wide">Review & Test Platform</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Navigation</p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick AI Analyzers */}
        <div>
          <div className="px-3 flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">AI Capabilities</p>
            <span className="text-[10px] text-slate-400 font-mono">v2.4</span>
          </div>
          <div className="space-y-1">
            {analysisShortcuts.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={`quick-ai-${item.id}`}
                  onClick={() => {
                    onTabChange('analyzer');
                    if (onSelectAnalysisType) {
                      onSelectAnalysisType(item.id);
                    }
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-3.5 h-3.5 ${item.color} group-hover:scale-110 transition-transform`} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Live LLM Engine Status Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-slate-800">Gemini 3.7 Flash</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Full-stack server-side engine active. Structured JSON output verification enabled.
          </p>
        </div>
      </div>

      {/* User / Authentication Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        {user ? (
          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              id="btn-logout"
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              id="btn-open-login"
              onClick={() => openAuthModal('login')}
              className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
            <button
              id="btn-quick-demo-login"
              onClick={loginAsDemo}
              className="w-full py-1.5 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-300 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <UserIcon className="w-3 h-3 text-indigo-600" />
              <span>1-Click Demo Login</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
