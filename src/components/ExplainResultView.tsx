import React from 'react';
import {
  HelpCircle,
  Clock,
  HardDrive,
  Cpu,
  Layers,
  AlertTriangle,
  CheckCircle2,
  ListOrdered,
  Sparkles,
} from 'lucide-react';
import { ExplainResponse } from '../types';

interface ExplainResultViewProps {
  data: ExplainResponse;
}

export const ExplainResultView: React.FC<ExplainResultViewProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">Algorithmic & Architectural Walkthrough</h3>
        </div>

        <p className="text-xs text-slate-600 font-medium leading-relaxed">{data.summary}</p>

        {/* Big-O Complexity Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Time Complexity</span>
              <span className="font-mono font-bold text-sm text-indigo-700">{data.timeComplexity || 'O(N)'}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center justify-center flex-shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Space Complexity (Auxiliary Memory)</span>
              <span className="font-mono font-bold text-sm text-cyan-800">{data.spaceComplexity || 'O(1)'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Chronological Execution Flow */}
      {data.stepByStep && data.stepByStep.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-indigo-600" />
            Chronological Execution Pipeline
          </h4>
          <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
            {data.stepByStep.map((step, idx) => (
              <div key={idx} className="relative flex items-start gap-4 pl-1">
                <div className="w-7 h-7 rounded-full bg-white border-2 border-indigo-600 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0 z-10 shadow-xs">
                  {step.step || idx + 1}
                </div>
                <div className="flex-1 bg-white border border-slate-200 rounded-xl p-3.5 text-xs space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">{step.title}</span>
                    {step.relevantLines && (
                      <span className="font-mono text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 font-bold">
                        {step.relevantLines}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 font-medium leading-relaxed">{step.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Architectural Concepts & Patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {data.keyConcepts && data.keyConcepts.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
            <h5 className="font-bold text-purple-800 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-600" /> Core CS Concepts
            </h5>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {data.keyConcepts.map((concept, i) => (
                <span key={i} className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-800 border border-purple-200 font-bold">
                  {concept}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.architecturePatterns && data.architecturePatterns.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
            <h5 className="font-bold text-cyan-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-600" /> Design Patterns
            </h5>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {data.architecturePatterns.map((pat, i) => (
                <span key={i} className="px-2.5 py-1 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold">
                  {pat}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Potential Bottlenecks */}
      {data.potentialBottlenecks && data.potentialBottlenecks.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 text-xs shadow-xs">
          <h5 className="font-bold text-amber-800 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Potential Scaling & Concurrency Bottlenecks
          </h5>
          <ul className="space-y-1.5 text-slate-700 font-medium">
            {data.potentialBottlenecks.map((bn, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>{bn}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
