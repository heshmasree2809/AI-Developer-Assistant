import React, { useState } from 'react';
import {
  TestTube2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Terminal,
  ShieldCheck,
  Zap,
  Wand2,
} from 'lucide-react';
import { TestGenerationResponse } from '../types';
import { beautifyCode } from '../utils/codeBeautifier';

interface TestResultViewProps {
  data: TestGenerationResponse;
}

export const TestResultView: React.FC<TestResultViewProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [testCodeState, setTestCodeState] = useState<string>(data.testCode);
  const [isFormatted, setIsFormatted] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(testCodeState);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBeautifyTests = () => {
    const lang = data.framework?.toLowerCase().includes('pytest') ? 'python' : 'typescript';
    const formatted = beautifyCode(testCodeState, lang);
    setTestCodeState(formatted);
    setIsFormatted(true);
    setTimeout(() => setIsFormatted(false), 2000);
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(data.instructions);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const getTestCaseBadge = (type: string) => {
    switch (type) {
      case 'happy_path':
        return { label: 'Happy Path', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'edge_case':
        return { label: 'Edge Case', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'error_case':
        return { label: 'Error Throw', bg: 'bg-rose-50 text-rose-800 border-rose-200' };
      case 'mock_fixture':
        return { label: 'Mock Fixture', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      default:
        return { label: 'Unit Test', bg: 'bg-cyan-50 text-cyan-800 border-cyan-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TestTube2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">Automated Unit Test Suite</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {data.framework}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-2xl">{data.summary}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Test Cases</span>
              <span className="text-lg font-bold text-emerald-700">{data.testCases?.length || 4}</span>
            </div>
            {data.coverageEstimate && (
              <div className="bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Est. Coverage</span>
                <span className="text-xs font-bold text-emerald-800 font-mono mt-1 block">{data.coverageEstimate}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generated Test Code Display */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-700 font-bold">
            <Terminal className="w-4 h-4 text-indigo-600" />
            <span>Runnable Test File ({data.framework})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBeautifyTests}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold text-indigo-700 transition-colors cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isFormatted ? 'Beautified!' : 'Beautify'}</span>
            </button>
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied Test Suite</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Test File</span>
                </>
              )}
            </button>
          </div>
        </div>
        <pre className="p-4 font-mono text-xs text-slate-800 overflow-auto max-h-[460px] whitespace-pre-wrap leading-relaxed font-semibold bg-white">
          {testCodeState}
        </pre>
      </div>

      {/* Test Cases Breakdown Checklist */}
      {data.testCases && data.testCases.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Covered Test Scenarios & Assertions
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.testCases.map((tc, idx) => {
              const badge = getTestCaseBadge(tc.type);
              return (
                <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3.5 text-xs flex items-start gap-3 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 truncate">{tc.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-slate-600 font-medium leading-relaxed">{tc.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Execution Instructions */}
      {data.instructions && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-900 block">Execution Instructions:</span>
              <span className="font-mono text-slate-600 font-semibold text-[11px]">{data.instructions}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyCommand}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold transition-colors flex-shrink-0 cursor-pointer"
          >
            {copiedCmd ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>Copy Command</span>
          </button>
        </div>
      )}
    </div>
  );
};
