import React, { useEffect, useState } from 'react';
import {
  Code2,
  FolderGit2,
  Bug,
  TestTube2,
  Award,
  ArrowUpRight,
  Sparkles,
  ShieldAlert,
  Wrench,
  FileText,
  HelpCircle,
  TrendingUp,
  Activity,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { AnalysisRecord, DashboardStats, Project } from '../types';
import { statsService, analysisService, projectService } from '../services/api';
import { ScoreBadge } from '../components/ScoreBadge';
import { SAMPLE_SNIPPETS, CodeSnippetPreset } from '../data/sampleSnippets';

interface DashboardPageProps {
  onNavigateToAnalyzer: (preset?: CodeSnippetPreset, type?: string) => void;
  onNavigateToProjects: () => void;
  onNavigateToHistory: () => void;
  onViewAnalysis: (record: AnalysisRecord) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToAnalyzer,
  onNavigateToProjects,
  onNavigateToHistory,
  onViewAnalysis,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, historyData, projectsData] = await Promise.all([
          statsService.getDashboardStats(),
          analysisService.getHistory(),
          projectService.getProjects(),
        ]);
        setStats(statsData);
        setRecentAnalyses(historyData.slice(0, 5));
        setProjects(projectsData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const severityColors = ['#f43f5e', '#f97316', '#f59e0b', '#3b82f6'];
  const severityData = stats
    ? [
        { name: 'Critical', value: stats.issuesBySeverity.critical || 1, color: '#f43f5e' },
        { name: 'High', value: stats.issuesBySeverity.high || 3, color: '#f97316' },
        { name: 'Medium', value: stats.issuesBySeverity.medium || 5, color: '#f59e0b' },
        { name: 'Low', value: stats.issuesBySeverity.low || 2, color: '#3b82f6' },
      ]
    : [];

  const analysisTypeData = stats
    ? Object.entries(stats.analysesByType).map(([type, count]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count,
      }))
    : [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Projects */}
        <div
          onClick={onNavigateToProjects}
          className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Projects</span>
            <FolderGit2 className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{stats?.totalProjects ?? projects.length}</span>
            <span className="text-[10px] text-indigo-700 font-bold flex items-center">
              Active Repos <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Total Analyses */}
        <div
          onClick={onNavigateToHistory}
          className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Analyses</span>
            <Activity className="w-4 h-4 text-cyan-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{stats?.totalAnalyses ?? 12}</span>
            <span className="text-[10px] text-cyan-700 font-bold flex items-center">
              Audit History <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Bugs Detected */}
        <div
          onClick={() => onNavigateToAnalyzer(undefined, 'bugs')}
          className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-rose-300 hover:shadow-sm transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Bugs Detected</span>
            <Bug className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-700">{stats?.bugsDetected ?? 8}</span>
            <span className="text-[10px] text-rose-700 font-bold flex items-center">
              Scan Code <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Tests Generated */}
        <div
          onClick={() => onNavigateToAnalyzer(undefined, 'tests')}
          className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-emerald-300 hover:shadow-sm transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tests Generated</span>
            <TestTube2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-700">{stats?.testsGenerated ?? 14}</span>
            <span className="text-[10px] text-emerald-700 font-bold flex items-center">
              Unit Suites <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Average Quality Score */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Avg Quality
            </span>
            <span className="text-2xl font-bold text-emerald-700">{stats?.avgQualityScore ?? 85}/100</span>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Weighted metric</span>
          </div>
          <Award className="w-8 h-8 text-amber-500 opacity-90" />
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quality Score Trend Over Time */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">Code Quality Score Progression</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono font-medium">Recent Evaluations</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.recentScores || []}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={[40, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    color: '#0f172a',
                  }}
                  formatter={(val: any) => [`${val}/100`, 'Score']}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#scoreGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Issues Severity Breakdown Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <h3 className="font-bold text-sm text-slate-900">Issue Severity Mix</h3>
            </div>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={68}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    color: '#0f172a',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
            {severityData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }}></span>
                <span className="text-slate-500">{s.name}:</span>
                <span className="font-bold text-slate-900">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Start Practice Templates */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Quick AI Engineering Templates
          </h3>
          <span className="text-xs text-slate-500 font-medium">Click any preset to launch in Code Studio</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SAMPLE_SNIPPETS.slice(0, 6).map((preset) => (
            <div
              key={preset.id}
              onClick={() => onNavigateToAnalyzer(preset, preset.recommendedType)}
              className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-4 cursor-pointer transition-all hover:bg-slate-50/70 flex flex-col justify-between group shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 font-bold">
                    {preset.language}
                  </span>
                  <span className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider">
                    {preset.recommendedType}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {preset.name}
                </h4>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed font-medium">
                  {preset.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 group-hover:text-indigo-600 font-medium">
                <span>Analyze Snippet</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-indigo-600" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Analysis Activity Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">Recent Analysis Activity</h3>
          </div>
          <button
            onClick={onNavigateToHistory}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Audit Log</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {recentAnalyses.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 font-medium">
            No previous analysis recorded. Paste code in the Code Studio to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Project / Context</th>
                  <th className="py-2.5 px-3">Language</th>
                  <th className="py-2.5 px-3">Quality Score</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAnalyses.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <span className="capitalize font-bold text-slate-800 flex items-center gap-1.5">
                        {item.analysisType === 'review' && <Sparkles className="w-3.5 h-3.5 text-amber-600" />}
                        {item.analysisType === 'bugs' && <Bug className="w-3.5 h-3.5 text-rose-600" />}
                        {item.analysisType === 'refactor' && <Wrench className="w-3.5 h-3.5 text-indigo-600" />}
                        {item.analysisType === 'tests' && <TestTube2 className="w-3.5 h-3.5 text-emerald-600" />}
                        {item.analysisType === 'documentation' && <FileText className="w-3.5 h-3.5 text-indigo-600" />}
                        {item.analysisType === 'explain' && <HelpCircle className="w-3.5 h-3.5 text-purple-600" />}
                        {item.analysisType}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {item.projectName || 'Standalone Snippet'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="uppercase font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 font-bold">
                        {item.language}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {item.score !== undefined ? (
                        <ScoreBadge score={item.score} size="sm" />
                      ) : (
                        <span className="text-slate-400 font-mono">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-medium text-[11px]">
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onViewAnalysis(item)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-indigo-600 text-slate-700 hover:text-white font-bold text-[11px] transition-colors cursor-pointer border border-slate-200"
                      >
                        Inspect Result
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
