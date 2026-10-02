import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Award,
  Zap,
  Lock,
  Wrench,
  Filter,
} from 'lucide-react';
import { CodeIssue, ReviewResponse, Severity } from '../types';
import { ScoreBadge } from './ScoreBadge';
import { IssueFilterToolbar } from './IssueFilterToolbar';

interface ReviewResultViewProps {
  data: ReviewResponse;
  sourceCode: string;
}

const ALL_SEVERITIES: Severity[] = ['Critical', 'High', 'Medium', 'Low'];

export const ReviewResultView: React.FC<ReviewResultViewProps> = ({ data }) => {
  const [selectedSeverities, setSelectedSeverities] = useState<Severity[]>(ALL_SEVERITIES);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedIssueIndex, setExpandedIssueIndex] = useState<number | null>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case 'Critical':
        return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: ShieldAlert };
      case 'High':
        return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: AlertTriangle };
      case 'Medium':
        return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Info };
      case 'Low':
      default:
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Info };
    }
  };

  // Compute available categories and counts
  const { categories, categoryCounts, severityCounts } = useMemo(() => {
    const cats = new Set<string>();
    const catMap: Record<string, number> = {};
    const sevMap: Record<Severity, number> = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
      Info: 0,
    };

    (data.issues || []).forEach((issue) => {
      if (issue.category) {
        cats.add(issue.category);
        catMap[issue.category] = (catMap[issue.category] || 0) + 1;
      }
      if (issue.severity && sevMap[issue.severity] !== undefined) {
        sevMap[issue.severity] = (sevMap[issue.severity] || 0) + 1;
      }
    });

    return {
      categories: Array.from(cats).sort(),
      categoryCounts: catMap,
      severityCounts: sevMap,
    };
  }, [data.issues]);

  const handleToggleSeverity = (severity: Severity) => {
    setSelectedSeverities((prev) => {
      if (prev.includes(severity)) {
        // If it's the last one, toggle back to all
        if (prev.length === 1) {
          return ALL_SEVERITIES;
        }
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
    setSelectedCategory('all');
    setSearchQuery('');
  };

  const hasActiveFilters = useMemo(() => {
    const isSeverityFiltered = selectedSeverities.length < ALL_SEVERITIES.length;
    const isCategoryFiltered = selectedCategory !== 'all';
    const isSearchFiltered = searchQuery.trim().length > 0;
    return isSeverityFiltered || isCategoryFiltered || isSearchFiltered;
  }, [selectedSeverities, selectedCategory, searchQuery]);

  const filteredIssues = useMemo(() => {
    return (data.issues || []).filter((issue) => {
      // 1. Severity filter
      if (!selectedSeverities.includes(issue.severity)) {
        return false;
      }

      // 2. Category filter
      if (
        selectedCategory !== 'all' &&
        issue.category?.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }

      // 3. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = issue.title?.toLowerCase().includes(q);
        const matchDesc = issue.description?.toLowerCase().includes(q);
        const matchCat = issue.category?.toLowerCase().includes(q);
        const matchLine = issue.line?.toString().includes(q);
        const matchSuggestion = issue.suggestion?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCat && !matchLine && !matchSuggestion) {
          return false;
        }
      }

      return true;
    });
  }, [data.issues, selectedSeverities, selectedCategory, searchQuery]);

  const handleCopySuggestion = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Overview Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <ScoreBadge score={data.score} size="lg" />
          </div>
          <div className="flex-1 space-y-3 text-left">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                AI Code Quality Review
              </h3>
              <span className="text-xs text-slate-500 font-mono font-medium">
                {data.issues?.length || 0} issues detected
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">{data.summary}</p>

            {/* Metrics Chips */}
            {data.metrics && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold block">Maintainability</span>
                  <span className="font-bold text-slate-800">{data.metrics.maintainabilityIndex}/100</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold block">Security Rating</span>
                  <span className="font-bold text-emerald-700">{data.metrics.securityScore}/100</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold block">Complexity Score</span>
                  <span className="font-bold text-indigo-700">{data.metrics.complexityScore}/100</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold block">Performance</span>
                  <span className="font-bold text-indigo-700">{data.metrics.performanceRating || 'Optimal'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Component */}
      <IssueFilterToolbar
        totalCount={data.issues?.length || 0}
        filteredCount={filteredIssues.length}
        selectedSeverities={selectedSeverities}
        onToggleSeverity={handleToggleSeverity}
        onSetAllSeverities={handleSetAllSeverities}
        severityCounts={severityCounts}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categoryCounts={categoryCounts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Issues Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            Detected Code Issues ({filteredIssues.length})
          </h4>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500 shadow-xs space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-bold text-slate-800 text-sm">No issues match the active filter criteria</p>
            <p className="text-slate-500 max-w-sm mx-auto">
              No code issues found for the selected severity, category, or search query.
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
          <div className="space-y-2.5">
            {filteredIssues.map((issue, idx) => {
              const badge = getSeverityBadge(issue.severity);
              const Icon = badge.icon;
              const isExpanded = expandedIssueIndex === idx;

              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all hover:border-slate-300 shadow-xs"
                >
                  <div
                    onClick={() => setExpandedIssueIndex(isExpanded ? null : idx)}
                    className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                        <Icon className="w-3 h-3" />
                        {issue.severity}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{issue.title}</span>
                          {issue.line && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-indigo-700 font-bold rounded">
                              Line {issue.line}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-600 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            {issue.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3 bg-slate-50/60 text-xs">
                      <div>
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                          Problem Description
                        </span>
                        <p className="text-slate-700 leading-relaxed font-medium">{issue.description}</p>
                      </div>

                      <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
                            <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                            Suggested Fix
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopySuggestion(issue.suggestion, idx)}
                            className="flex items-center gap-1 text-[11px] text-slate-700 hover:text-slate-900 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 cursor-pointer"
                          >
                            {copiedIndex === idx ? (
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
                        <div className="font-mono text-xs text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-200 overflow-x-auto whitespace-pre-wrap">
                          {issue.suggestion}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Strengths & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.strengths && data.strengths.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <h5 className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 mb-2.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Code Strengths
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
              {data.strengths.map((str, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.recommendations && data.recommendations.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <h5 className="text-xs font-bold text-indigo-700 flex items-center gap-1.5 mb-2.5">
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              Architectural Recommendations
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
              {data.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
