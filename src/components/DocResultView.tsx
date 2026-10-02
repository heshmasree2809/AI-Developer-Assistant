import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Code,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Download,
} from 'lucide-react';
import { DocumentationResponse } from '../types';
import { ExportModal } from './ExportModal';

interface DocResultViewProps {
  data: DocumentationResponse;
  sourceCode?: string;
  language?: string;
  fileName?: string;
  projectName?: string;
}

export const DocResultView: React.FC<DocResultViewProps> = ({
  data,
  sourceCode = '',
  language = 'typescript',
  fileName = 'documentation.md',
  projectName = 'Default Project',
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'formatted' | 'markdown'>('formatted');
  const [isExportOpen, setIsExportOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.markdownDoc);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">{data.title || 'Technical Documentation'}</h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('formatted')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'formatted'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Structured UI
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('markdown')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'markdown'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Raw Markdown
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Doc (DOC/PPT/PDF)</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied Markdown</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-600 font-medium leading-relaxed">{data.overview}</p>
      </div>

      {activeTab === 'formatted' ? (
        <div className="space-y-6">
          {/* Functions & Methods Signatures */}
          {data.functions && data.functions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-600" />
                Functions & Public Interfaces
              </h4>
              <div className="space-y-3">
                {data.functions.map((fn, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 text-xs shadow-xs">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-indigo-700">{fn.name}</span>
                        <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-medium">
                          Function
                        </span>
                      </div>
                      {fn.returns && (
                        <span className="font-mono text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                          Returns: {fn.returns.type}
                        </span>
                      )}
                    </div>

                    <p className="text-slate-700 font-medium">{fn.description}</p>

                    {/* Parameters Table */}
                    {fn.params && fn.params.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          Parameters
                        </span>
                        <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold">
                              <tr>
                                <th className="py-1.5 px-3">Name</th>
                                <th className="py-1.5 px-3">Type</th>
                                <th className="py-1.5 px-3">Description</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                              {fn.params.map((param, pidx) => (
                                <tr key={pidx} className="text-slate-700 bg-white">
                                  <td className="py-2 px-3 text-indigo-700 font-bold">{param.name}</td>
                                  <td className="py-2 px-3 text-amber-700 font-semibold">{param.type}</td>
                                  <td className="py-2 px-3 font-sans text-xs text-slate-600 font-medium">{param.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Example Usage */}
                    {fn.exampleUsage && (
                      <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                          Example Call
                        </span>
                        <pre className="font-mono text-[11px] text-emerald-800 font-semibold overflow-x-auto whitespace-pre-wrap">
                          {fn.exampleUsage}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* API Endpoints if present */}
          {data.apiEndpoints && data.apiEndpoints.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-emerald-600" />
                REST / API Endpoints
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.apiEndpoints.map((ep, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3 text-xs space-y-1 shadow-xs">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-bold text-[10px]">
                        {ep.method}
                      </span>
                      <span className="text-slate-900 font-bold">{ep.path}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] pt-1 font-medium">{ep.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Edge Cases */}
          {data.edgeCases && data.edgeCases.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 text-xs shadow-xs">
              <h4 className="font-bold text-amber-800 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Documented Edge Cases & Constraints
              </h4>
              <ul className="space-y-1.5 text-slate-700 font-medium">
                {data.edgeCases.map((ec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{ec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        /* Raw Markdown View */
        <div className="bg-white rounded-xl border border-slate-200 p-4 font-mono text-xs text-slate-800 overflow-auto max-h-[500px] whitespace-pre-wrap leading-relaxed shadow-xs">
          {data.markdownDoc}
        </div>
      )}

      {/* Export & Format Options Dialog */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        analysisType="documentation"
        data={data}
        code={sourceCode}
        language={language}
        fileName={fileName}
        projectName={projectName}
      />
    </div>
  );
};
