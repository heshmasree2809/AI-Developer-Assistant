import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Bug,
  HelpCircle,
  MapPin,
  Wrench,
  Copy,
  Check,
  Code2,
  Wand2,
} from 'lucide-react';
import { BugDetectionResponse, Severity } from '../types';
import { beautifyCode } from '../utils/codeBeautifier';
import { IssueFilterToolbar } from './IssueFilterToolbar';

interface BugResultViewProps {
  data: BugDetectionResponse;
}

const ALL_SEVERITIES: Severity[] = ['Critical', 'High', 'Medium', 'Low'];

export const BugResultView: React.FC<BugResultViewProps> = ({ data }) => {
  const [selectedSeverities, setSelectedSeverities] = useState<Severity[]>(ALL_SEVERITIES);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedFixIndex, setCopiedFixIndex] = useState<number | null>(null);
  const [fixedCodeState, setFixedCodeState] = useState<string>(data.fixedCode || '');
  const [isFormatted, setIsFormatted] = useState(false);

  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case 'Critical':
        return { bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: ShieldAlert };
      case 'High':
        return { bg: 'bg-orange-50 text-orange-700 border-orange-200', icon: AlertTriangle };
      case 'Medium':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertTriangle };
      default:
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: Bug };
    }
  };

  const severityCounts = useMemo(() => {
    const sevMap: Record<Severity, number> = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
      Info: 0,
    };
    (data.bugs || []).forEach((bug) => {
      if (bug.severity && sevMap[bug.severity] !== undefined) {
        sevMap[bug.severity] = (sevMap[bug.severity] || 0) + 1;
      }
    });
    return sevMap;
  }, [data.bugs]);

  const handleToggleSeverity = (severity: Severity) => {
    setSelectedSeverities((prev) => {
      if (prev.includes(severity)) {
        if (prev.length === 1) return ALL_SEVERITIES;
        return prev.filter((s) => s !== severity);
      } else {
        return [...prev, severity];
      }
    });
  };

  const handleSetAllSeverities = () => {
    setSelectedSeverities(ALL_SEVERITIES);
  };

  const handleResetFilters = () => {
    setSelectedSeverities(ALL_SEVERITIES);
    setSearchQuery('');
  };

  const hasActiveFilters = useMemo(() => {
    const isSeverityFiltered = selectedSeverities.length < ALL_SEVERITIES.length;
    const isSearchFiltered = searchQuery.trim().length > 0;
    return isSeverityFiltered || isSearchFiltered;
  }, [selectedSeverities, searchQuery]);

  const filteredBugs = useMemo(() => {
    return (data.bugs || []).filter((bug) => {
      if (!selectedSeverities.includes(bug.severity)) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = bug.title?.toLowerCase().includes(q);
        const matchWrong = bug.whatIsWrong?.toLowerCase().includes(q);
        const matchWhy = bug.whyItHappens?.toLowerCase().includes(q);
        const matchWhere = bug.whereItOccurs?.toLowerCase().includes(q);
        const matchFix = bug.howToFix?.toLowerCase().includes(q);
        const matchLine = bug.line?.toString().includes(q);
        if (!matchTitle && !matchWrong && !matchWhy && !matchWhere && !matchFix && !matchLine) {
          return false;
        }
      }

      return true;
    });
  }, [data.bugs, selectedSeverities, searchQuery]);

  const handleCopyFixedCode = () => {
    if (fixedCodeState) {
      navigator.clipboard.writeText(fixedCodeState);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleBeautifyFixedCode = () => {
    if (!fixedCodeState) return;
    const formatted = beautifyCode(fixedCodeState, 'javascript');
    setFixedCodeState(formatted);
    setIsFormatted(true);
    setTimeout(() => setIsFormatted(false), 2000);
  };

  const handleCopyFix = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedFixIndex(idx);
    setTimeout(() => setCopiedFixIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bug className="w-5 h-5 text-rose-600" />
              <h3 className="text-base font-bold text-slate-900">Bug & Vulnerability Detection</h3>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-2xl">{data.summary}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Bugs</span>
              <span className="text-lg font-bold text-slate-900">{data.totalBugs || (data.bugs?.length ?? 0)}</span>
            </div>
            <div className="bg-rose-50 px-4 py-2 rounded-lg border border-rose-200 text-center">
              <span className="text-[10px] uppercase font-bold text-rose-700 block">Critical</span>
              <span className="text-lg font-bold text-rose-800">{data.criticalCount || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Issue Filter Toolbar */}
      <IssueFilterToolbar
        totalCount={data.bugs?.length || 0}
        filteredCount={filteredBugs.length}
        selectedSeverities={selectedSeverities}
        onToggleSeverity={handleToggleSeverity}
        onSetAllSeverities={handleSetAllSeverities}
        severityCounts={severityCounts}
        selectedCategory="all"
        onSelectCategory={() => {}}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Bugs Detail Cards */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          Detected Defects Breakdown ({filteredBugs.length})
        </h4>

        {filteredBugs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500 shadow-xs space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="font-bold text-slate-800 text-sm">No defects match active filter criteria</p>
            <p className="text-slate-500 max-w-sm mx-auto">
              No bugs or defects match the selected severity levels or search filter.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBugs.map((bug, index) => {
              const badge = getSeverityBadge(bug.severity);
              const Icon = badge.icon;

              return (
                <div key={index} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  {/* Bug Title Bar */}
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bg}`}>
                        <Icon className="w-3 h-3" />
                        {bug.severity}
                      </span>
                      <h5 className="font-bold text-xs text-slate-900">{bug.title}</h5>
                    </div>
                    {bug.line && (
                      <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 font-bold">
                        Line {bug.line}
                      </span>
                    )}
                  </div>

                  {/* 4 Core Pillars: What, Why, Where, How */}
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* What is wrong */}
                    <div className="bg-rose-50/50 p-3 rounded-lg border border-rose-100 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-rose-700 text-[11px] uppercase tracking-wide">
                        <Bug className="w-3 h-3 text-rose-600" /> What is wrong
                      </div>
                      <p className="text-slate-700 font-medium leading-relaxed">{bug.whatIsWrong}</p>
                    </div>

                    {/* Why it happens */}
                    <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-700 text-[11px] uppercase tracking-wide">
                        <HelpCircle className="w-3 h-3 text-amber-600" /> Why it happens
                      </div>
                      <p className="text-slate-700 font-medium leading-relaxed">{bug.whyItHappens}</p>
                    </div>

                    {/* Where it occurs */}
                    <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-blue-700 text-[11px] uppercase tracking-wide">
                        <MapPin className="w-3 h-3 text-blue-600" /> Where it occurs
                      </div>
                      <p className="text-slate-700 font-medium leading-relaxed">{bug.whereItOccurs}</p>
                    </div>

                    {/* How to fix */}
                    <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-700 text-[11px] uppercase tracking-wide">
                        <Wrench className="w-3 h-3 text-emerald-600" /> How to fix it
                      </div>
                      <p className="text-slate-700 font-medium leading-relaxed">{bug.howToFix}</p>
                    </div>
                  </div>

                  {/* Fix snippet */}
                  {bug.codeFix && (
                    <div className="px-4 pb-4">
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Recommended Correction Snippet
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyFix(bug.codeFix!, index)}
                            className="flex items-center gap-1 text-[11px] text-slate-700 hover:text-slate-900 px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs cursor-pointer font-medium"
                          >
                            {copiedFixIndex === index ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Fix</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="font-mono text-xs text-emerald-800 bg-white p-2.5 rounded border border-emerald-200 overflow-x-auto whitespace-pre-wrap font-semibold">
                          {bug.codeFix}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full Corrected Source Code View */}
      {fixedCodeState && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-emerald-600" />
              Complete Bug-Free Source Code
            </h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBeautifyFixedCode}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold text-indigo-700 transition-colors cursor-pointer"
              >
                <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isFormatted ? 'Beautified!' : 'Beautify'}</span>
              </button>
              <button
                type="button"
                onClick={handleCopyFixedCode}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied All</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Complete Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 font-mono text-xs text-slate-800 max-h-96 overflow-auto whitespace-pre-wrap leading-relaxed font-semibold">
            {fixedCodeState}
          </div>
        </div>
      )}
    </div>
  );
};

