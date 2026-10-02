import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Code2,
  Download,
  Calendar,
  Sparkles,
  ShieldAlert,
  Wrench,
  TestTube2,
  FileText,
  HelpCircle,
  X,
  RotateCw,
} from 'lucide-react';
import { AnalysisRecord, AnalysisType } from '../types';
import { analysisService } from '../services/api';
import { ScoreBadge } from '../components/ScoreBadge';
import { ReviewResultView } from '../components/ReviewResultView';
import { BugResultView } from '../components/BugResultView';
import { RefactorResultView } from '../components/RefactorResultView';
import { TestResultView } from '../components/TestResultView';
import { DocResultView } from '../components/DocResultView';
import { ExplainResultView } from '../components/ExplainResultView';
import { ExportModal } from '../components/ExportModal';

interface HistoryPageProps {
  onLoadInStudio: (record: AnalysisRecord) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onLoadInStudio }) => {
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [activeRecord, setActiveRecord] = useState<AnalysisRecord | null>(null);
  const [exportRecord, setExportRecord] = useState<AnalysisRecord | null>(null);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await analysisService.getHistory();
      setRecords(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this analysis record from audit history?')) {
      try {
        await analysisService.deleteHistoryItem(id);
        if (activeRecord?.id === id) setActiveRecord(null);
        loadHistory();
      } catch (err) {
        console.error('Failed to delete history record:', err);
      }
    }
  };

  const filteredRecords = records.filter((r) => {
    if (selectedType !== 'all' && r.analysisType !== selectedType) return false;
    if (selectedLanguage !== 'all' && r.language !== selectedLanguage) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchProject = r.projectName?.toLowerCase().includes(q);
      const matchCode = r.code.toLowerCase().includes(q);
      const matchType = r.analysisType.toLowerCase().includes(q);
      if (!matchProject && !matchCode && !matchType) return false;
    }
    return true;
  });

  const getIconForType = (type: AnalysisType) => {
    switch (type) {
      case 'review':
        return <Sparkles className="w-3.5 h-3.5 text-amber-600" />;
      case 'bugs':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />;
      case 'refactor':
        return <Wrench className="w-3.5 h-3.5 text-indigo-600" />;
      case 'tests':
        return <TestTube2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'documentation':
        return <FileText className="w-3.5 h-3.5 text-indigo-600" />;
      case 'explain':
        return <HelpCircle className="w-3.5 h-3.5 text-purple-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            Analysis Audit Logs & History
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Full compliance audit trail of previous AI code reviews, bug fixes, and unit test suites.
          </p>
        </div>

        <button
          onClick={loadHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs by keyword, project, or code..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white text-xs font-medium"
          />
        </div>

        {/* Type & Language Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-50 text-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-600 font-medium cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="review">Code Review</option>
              <option value="bugs">Bug Detection</option>
              <option value="refactor">Refactoring</option>
              <option value="tests">Unit Tests</option>
              <option value="documentation">Documentation</option>
              <option value="explain">Explanation</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold">Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-slate-50 text-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-600 font-medium cursor-pointer"
            >
              <option value="all">All Languages</option>
              <option value="python">Python</option>
              <option value="typescript">TypeScript</option>
              <option value="javascript">JavaScript</option>
              <option value="go">Go</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500 font-medium">Loading audit history...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 font-medium">
            No analysis records match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Analysis Type</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Quality Score</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      activeRecord?.id === record.id ? 'bg-indigo-50/50' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 capitalize flex items-center gap-2">
                        {getIconForType(record.analysisType)}
                        {record.analysisType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {record.projectName || (
                        <span className="text-slate-400 italic">Standalone Snippet</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="uppercase font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 font-bold">
                        {record.language}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {record.score !== undefined ? (
                        <ScoreBadge score={record.score} size="sm" />
                      ) : (
                        <span className="text-slate-400 font-mono">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-medium text-[11px]">
                      {new Date(record.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setActiveRecord(record)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-indigo-600 text-slate-700 hover:text-white font-bold text-[11px] transition-colors cursor-pointer border border-slate-200"
                        >
                          View Results
                        </button>
                        <button
                          onClick={() => setExportRecord(record)}
                          title="Download report (Word/PPT/PDF/Markdown)"
                          className="p-1.5 rounded text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onLoadInStudio(record)}
                          title="Open code in Code Studio"
                          className="p-1.5 rounded text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          title="Delete from audit history"
                          className="p-1.5 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Modal/Drawer */}
      {activeRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
                  {getIconForType(activeRecord.analysisType)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 capitalize">
                    {activeRecord.analysisType} Audit Result
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {activeRecord.projectName || 'Standalone'} • {activeRecord.language} • {new Date(activeRecord.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExportRecord(activeRecord)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Doc (DOC/PPT)</span>
                </button>
                <button
                  onClick={() => {
                    onLoadInStudio(activeRecord);
                    setActiveRecord(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Open in Studio</span>
                </button>
                <button
                  onClick={() => setActiveRecord(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
              {/* Render Structured Result */}
              {activeRecord.analysisType === 'review' && (
                <ReviewResultView data={activeRecord.result} sourceCode={activeRecord.code} />
              )}
              {activeRecord.analysisType === 'bugs' && (
                <BugResultView data={activeRecord.result} />
              )}
              {activeRecord.analysisType === 'refactor' && (
                <RefactorResultView data={activeRecord.result} originalCode={activeRecord.code} />
              )}
              {activeRecord.analysisType === 'tests' && (
                <TestResultView data={activeRecord.result} />
              )}
              {activeRecord.analysisType === 'documentation' && (
                <DocResultView data={activeRecord.result} />
              )}
              {activeRecord.analysisType === 'explain' && (
                <ExplainResultView data={activeRecord.result} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Export Format Dialog */}
      {exportRecord && (
        <ExportModal
          isOpen={!!exportRecord}
          onClose={() => setExportRecord(null)}
          analysisType={exportRecord.analysisType}
          data={exportRecord.result || exportRecord.aiResponse}
          code={exportRecord.sourceCode || exportRecord.code}
          language={exportRecord.language}
          fileName={exportRecord.projectName ? `${exportRecord.projectName}_audit` : 'source_file'}
          projectName={exportRecord.projectName || 'Standalone Workspace'}
        />
      )}
    </div>
  );
};
