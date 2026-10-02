import React, { useState } from 'react';
import {
  FileText,
  Presentation,
  Printer,
  FileCode2,
  Globe,
  Database,
  Download,
  X,
  Check,
  Sparkles,
  Sliders,
  CheckCircle2,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { AnalysisType } from '../types';
import {
  ExportFormat,
  DocumentExportOptions,
  buildStructuredReport,
  exportToWordDoc,
  exportToPowerPoint,
  exportToPDF,
  exportToMarkdown,
  exportToHTML,
  exportToJSON,
} from '../utils/documentExporter';

export interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisType: AnalysisType;
  data: any;
  code?: string;
  language?: string;
  fileName?: string;
  projectName?: string;
  authorName?: string;
}

interface FormatOption {
  id: ExportFormat;
  name: string;
  ext: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  tag: string;
  badgeClass: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: 'doc',
    name: 'Word Document',
    ext: '.doc / .docx',
    description: 'Executive structured report with tables, scorecard, and styled callouts for Microsoft Word & Google Docs.',
    icon: FileText,
    tag: 'Popular',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'ppt',
    name: 'PowerPoint Presentation',
    ext: '.ppt / .pptx',
    description: 'Formatted multi-slide deck with title cover, scorecard metrics, defect cards, and action items for presentations.',
    icon: Presentation,
    tag: 'Slides Deck',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: 'pdf',
    name: 'PDF / Printable Report',
    ext: '.pdf',
    description: 'High-resolution, paginated executive PDF with print styles and clean page-break formatting.',
    icon: Printer,
    tag: 'Print Ready',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  {
    id: 'md',
    name: 'Markdown Document',
    ext: '.md',
    description: 'GitHub-flavored markdown with ASCII tables, code fences, and audit checklist.',
    icon: FileCode2,
    tag: 'Dev Docs',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    id: 'html',
    name: 'Executive HTML Report',
    ext: '.html',
    description: 'Self-contained standalone webpage with embedded modern styling viewable offline in any browser.',
    icon: Globe,
    tag: 'Standalone',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'json',
    name: 'Structured JSON Payload',
    ext: '.json',
    description: 'Machine-readable raw audit payload and parsed telemetry for CI/CD integration.',
    icon: Database,
    tag: 'Raw Data',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
];

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  analysisType,
  data,
  code = '',
  language = 'code',
  fileName = 'source_file',
  projectName = 'Default Project',
  authorName = 'Engineering Team',
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('doc');
  const [customTitle, setCustomTitle] = useState('');
  const [author, setAuthor] = useState(authorName);
  const [includeMetrics, setIncludeMetrics] = useState(true);
  const [includeCode, setIncludeCode] = useState(true);
  const [includeActionPlan, setIncludeActionPlan] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setIsExporting(true);

    const exportOptions: DocumentExportOptions = {
      analysisType,
      data,
      code,
      language,
      fileName,
      projectName,
      authorName: author,
      customTitle: customTitle.trim() || undefined,
      includeMetrics,
      includeCode,
      includeActionPlan,
    };

    const structuredReport = buildStructuredReport(exportOptions);

    try {
      switch (selectedFormat) {
        case 'doc':
          exportToWordDoc(structuredReport);
          break;
        case 'ppt':
          exportToPowerPoint(structuredReport);
          break;
        case 'pdf':
          exportToPDF(structuredReport);
          break;
        case 'md':
          exportToMarkdown(structuredReport);
          break;
        case 'html':
          exportToHTML(structuredReport);
          break;
        case 'json':
          exportToJSON(structuredReport);
          break;
      }

      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        setIsExporting(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Export failed:', err);
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Export & Download Structured Document
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Choose format (Word, PowerPoint, PDF, Markdown) and frame report layout
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs">
          {/* 1. Format Selection Grid */}
          <div className="space-y-2.5">
            <label className="font-bold text-slate-800 text-xs uppercase tracking-wider block flex items-center justify-between">
              <span>Select Document Format</span>
              <span className="text-[11px] font-normal text-slate-500">6 formats supported</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {FORMAT_OPTIONS.map((fmt) => {
                const Icon = fmt.icon;
                const isSelected = selectedFormat === fmt.id;

                return (
                  <div
                    key={fmt.id}
                    onClick={() => setSelectedFormat(fmt.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-600 shadow-xs ring-1 ring-indigo-600'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-slate-900 text-xs truncate">
                          {fmt.name}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${fmt.badgeClass}`}
                        >
                          {fmt.ext}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug font-medium">
                        {fmt.description}
                      </p>
                    </div>

                    <div className="mt-1 flex-shrink-0">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Document Framing & Structure Preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                Structured Framing & Section Architecture
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Standard Executive Layout
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[10px] flex items-center justify-center font-bold">
                    1
                  </span>
                  Executive Header
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-tight">
                  Metadata table, Audit ID, Project context, and Overall Quality Benchmark.
                </p>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[10px] flex items-center justify-center font-bold">
                    2
                  </span>
                  Findings & Specs
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-tight">
                  Defect cards, severity flags, function signatures, and code solutions.
                </p>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[10px] flex items-center justify-center font-bold">
                    3
                  </span>
                  Actionable Plan
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-tight">
                  Prioritized implementation checklist, best practices, and conclusions.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Document Customization Settings */}
          <div className="space-y-3">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
              Document Metadata & Customization
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Custom Title (Optional)</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder={`e.g., Q3 Security Audit: ${fileName}`}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reviewer / Author</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g., Principal Architect / Lead Reviewer"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
                />
              </div>
            </div>

            {/* Section Toggles */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeMetrics}
                  onChange={(e) => setIncludeMetrics(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span className="font-bold text-slate-700 text-xs">Include Quality Scorecard</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeCode}
                  onChange={(e) => setIncludeCode(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span className="font-bold text-slate-700 text-xs">Include Full Code / Patches</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeActionPlan}
                  onChange={(e) => setIncludeActionPlan(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span className="font-bold text-slate-700 text-xs">Include Action Plan</span>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Ready for export in {FORMAT_OPTIONS.find((f) => f.id === selectedFormat)?.ext} format</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer text-xs"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {exportSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Downloaded!</span>
                </>
              ) : isExporting ? (
                <>
                  <Download className="w-4 h-4 animate-bounce" />
                  <span>Generating Document...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download {FORMAT_OPTIONS.find((f) => f.id === selectedFormat)?.name}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
