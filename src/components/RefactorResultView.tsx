import React, { useState } from 'react';
import {
  Wrench,
  Zap,
  BookOpen,
  CheckCircle2,
  Copy,
  Check,
  Columns,
  Maximize2,
  Sparkles,
  ArrowRight,
  Wand2,
} from 'lucide-react';
import { RefactorResponse } from '../types';
import { beautifyCode } from '../utils/codeBeautifier';

interface RefactorResultViewProps {
  data: RefactorResponse;
  originalCode: string;
}

export const RefactorResultView: React.FC<RefactorResultViewProps> = ({ data, originalCode }) => {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'refactored-only'>('side-by-side');
  const [copied, setCopied] = useState(false);
  const [improvedCodeState, setImprovedCodeState] = useState<string>(data.improvedCode);
  const [isFormatted, setIsFormatted] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(improvedCodeState);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBeautifyResult = () => {
    const beautified = beautifyCode(improvedCodeState, 'typescript');
    setImprovedCodeState(beautified);
    setIsFormatted(true);
    setTimeout(() => setIsFormatted(false), 2000);
  };

  const getChangeBadge = (type: string) => {
    switch (type) {
      case 'performance':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'readability':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'architecture':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'safety':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">AI Code Refactoring & Optimization</h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleBeautifyResult}
              title="Beautify / Auto-format refactored output"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isFormatted ? 'Beautified!' : 'Beautify Result'}</span>
            </button>

            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('side-by-side')}
                className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'side-by-side'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Side-by-Side</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('refactored-only')}
                className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'refactored-only'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Clean Code Only</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied Refactored Code</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Refactored Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-600 font-medium leading-relaxed">{data.summary}</p>
        {data.explanation && (
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 font-medium">
            <span className="font-bold text-slate-900 block mb-1">Architecture & SOLID Design Rationale:</span>
            {data.explanation}
          </div>
        )}
      </div>

      {/* Code Comparison Workspace */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {viewMode === 'side-by-side' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            {/* Original Column */}
            <div className="flex flex-col">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-rose-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Original Source (Before)
                </span>
                <span className="text-[11px] text-slate-500 font-mono font-medium">
                  {originalCode.split('\n').length} lines
                </span>
              </div>
              <div className="p-4 bg-white font-mono text-xs text-slate-700 overflow-auto max-h-[460px] whitespace-pre-wrap leading-relaxed">
                {originalCode}
              </div>
            </div>

            {/* Refactored Column */}
            <div className="flex flex-col bg-white">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Refactored & Optimized (After)
                </span>
                <span className="text-[11px] text-emerald-700 font-mono font-bold">
                  {improvedCodeState.split('\n').length} lines
                </span>
              </div>
              <div className="p-4 font-mono text-xs text-emerald-900 font-medium overflow-auto max-h-[460px] whitespace-pre-wrap leading-relaxed bg-emerald-50/20">
                {improvedCodeState}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Refactored Clean Source Code
              </span>
            </div>
            <div className="p-4 font-mono text-xs text-emerald-900 font-medium overflow-auto max-h-[500px] whitespace-pre-wrap leading-relaxed bg-emerald-50/20">
              {improvedCodeState}
            </div>
          </div>
        )}
      </div>

      {/* Structural Modifications List */}
      {data.changes && data.changes.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-indigo-600" />
            Applied Refactoring Transformations
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.changes.map((change, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3 text-xs space-y-1.5 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getChangeBadge(change.type)}`}>
                    {change.type}
                  </span>
                </div>
                <p className="text-slate-700 font-medium leading-relaxed">{change.description}</p>
                {change.before && change.after && (
                  <div className="mt-2 pt-2 border-t border-slate-100 space-y-1 font-mono text-[11px]">
                    <div className="bg-rose-50 text-rose-800 p-1.5 rounded border border-rose-200 truncate">
                      - {change.before}
                    </div>
                    <div className="bg-emerald-50 text-emerald-800 p-1.5 rounded border border-emerald-200 truncate">
                      + {change.after}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gains & Best Practices Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Performance Gains */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
          <h5 className="font-bold text-cyan-800 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-600" /> Performance Gains
          </h5>
          <ul className="space-y-1 text-slate-700 font-medium">
            {(data.performanceImprovements || ['Reduced computational overhead', 'Zero redundant memory allocations']).map((item, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-cyan-600 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Readability Gains */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
          <h5 className="font-bold text-emerald-800 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" /> Readability Gains
          </h5>
          <ul className="space-y-1 text-slate-700 font-medium">
            {(data.readabilityImprovements || ['Self-documenting method signatures', 'Reduced cyclomatic complexity']).map((item, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Best Practices */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
          <h5 className="font-bold text-indigo-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> SOLID & Best Practices
          </h5>
          <ul className="space-y-1 text-slate-700 font-medium">
            {(data.bestPractices || ['Single Responsibility Principle (SRP)', 'Immutable transformations']).map((item, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-indigo-600 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
