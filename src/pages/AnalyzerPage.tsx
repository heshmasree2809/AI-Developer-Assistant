import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Code2,
  Sparkles,
  ShieldAlert,
  Wrench,
  TestTube2,
  FileText,
  HelpCircle,
  Play,
  Download,
  FolderPlus,
  Save,
  RotateCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  Wand2,
} from 'lucide-react';
import {
  AnalysisType,
  Language,
  Project,
  AnalysisRecord,
  ReviewResponse,
  BugDetectionResponse,
  RefactorResponse,
  TestGenerationResponse,
  DocumentationResponse,
  ExplainResponse,
} from '../types';
import { analysisService, projectService } from '../services/api';
import { CodeEditor } from '../components/CodeEditor';
import { ReviewResultView } from '../components/ReviewResultView';
import { BugResultView } from '../components/BugResultView';
import { RefactorResultView } from '../components/RefactorResultView';
import { TestResultView } from '../components/TestResultView';
import { DocResultView } from '../components/DocResultView';
import { ExplainResultView } from '../components/ExplainResultView';
import { SAMPLE_SNIPPETS, CodeSnippetPreset } from '../data/sampleSnippets';
import { beautifyCode } from '../utils/codeBeautifier';
import { debounce } from '../utils/debounce';
import { ExportModal } from '../components/ExportModal';

const DRAFT_STORAGE_KEY = 'codex_analyzer_persisted_draft';

interface SavedDraftState {
  code: string;
  language: Language;
  fileName?: string;
  analysisType?: AnalysisType;
  savedAt: number;
}

interface AnalyzerPageProps {
  initialPreset?: CodeSnippetPreset | null;
  initialType?: AnalysisType;
  selectedProject?: Project | null;
  onAnalysisComplete?: () => void;
}

// Helper to safely load draft from localStorage
function getInitialDraft(): Partial<SavedDraftState> | null {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.code === 'string') {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to retrieve persisted draft from localStorage', e);
  }
  return null;
}

export const AnalyzerPage: React.FC<AnalyzerPageProps> = ({
  initialPreset,
  initialType = 'review',
  selectedProject,
  onAnalysisComplete,
}) => {
  const initialDraft = useMemo(() => getInitialDraft(), []);

  const [code, setCode] = useState<string>(() => {
    if (initialPreset?.code) return initialPreset.code;
    if (initialDraft && initialDraft.code !== undefined) return initialDraft.code;
    return SAMPLE_SNIPPETS[0].code;
  });

  const [language, setLanguage] = useState<Language>(() => {
    if (initialPreset?.language) return initialPreset.language;
    if (initialDraft && initialDraft.language) return initialDraft.language;
    return SAMPLE_SNIPPETS[0].language;
  });

  const [fileName, setFileName] = useState<string>(() => {
    if (initialDraft && initialDraft.fileName) return initialDraft.fileName;
    return 'order_service.py';
  });

  const [analysisType, setAnalysisType] = useState<AnalysisType>(() => {
    if (initialPreset?.recommendedType) return initialPreset.recommendedType;
    if (initialDraft && initialDraft.analysisType) return initialDraft.analysisType;
    return initialType;
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('saved');
  const [lastSaved, setLastSaved] = useState<number | null>(initialDraft?.savedAt || Date.now());

  const [projects, setProjects] = useState<Project[]>([]);
  const [linkedProjectId, setLinkedProjectId] = useState<string>(
    selectedProject?.id || ''
  );
  const [focusArea, setFocusArea] = useState<string>('General Quality & Security');
  const [testFramework, setTestFramework] = useState<string>('pytest');
  const [autoFormatEnabled, setAutoFormatEnabled] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [currentRecord, setCurrentRecord] = useState<AnalysisRecord | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Debounced auto-save function to persist user code and state in localStorage
  const debouncedSaveDraft = useMemo(
    () =>
      debounce(
        (
          currentCode: string,
          currentLang: Language,
          currentFile: string,
          currentType: AnalysisType
        ) => {
          try {
            const draftData: SavedDraftState = {
              code: currentCode,
              language: currentLang,
              fileName: currentFile,
              analysisType: currentType,
              savedAt: Date.now(),
            };
            localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
            setSaveStatus('saved');
            setLastSaved(Date.now());
          } catch (err) {
            console.error('Error persisting code draft to localStorage:', err);
          }
        },
        500 // 500ms debounce
      ),
    []
  );

  // Trigger debounced save whenever code, language, fileName, or analysisType changes
  useEffect(() => {
    setSaveStatus('saving');
    debouncedSaveDraft(code, language, fileName, analysisType);

    return () => {
      debouncedSaveDraft.cancel();
    };
  }, [code, language, fileName, analysisType, debouncedSaveDraft]);

  useEffect(() => {
    async function loadProjects() {
      try {
        const pList = await projectService.getProjects();
        setProjects(pList);
      } catch (e) {
        console.error('Failed to load projects:', e);
      }
    }
    loadProjects();
  }, []);

  useEffect(() => {
    if (initialPreset) {
      const initialCode = autoFormatEnabled
        ? beautifyCode(initialPreset.code, initialPreset.language)
        : initialPreset.code;
      setCode(initialCode);
      setLanguage(initialPreset.language);
      setAnalysisType(initialPreset.recommendedType);
      setFileName(`sample_${initialPreset.language}.code`);
      setAnalysisResult(null);
    }
  }, [initialPreset]);

  const analysisModes: { id: AnalysisType; label: string; icon: any; color: string; desc: string }[] = [
    {
      id: 'review',
      label: 'Code Review',
      icon: Sparkles,
      color: 'text-amber-400',
      desc: 'Quality scoring, maintainability, and code issue detection',
    },
    {
      id: 'bugs',
      label: 'Bug Detection',
      icon: ShieldAlert,
      color: 'text-rose-400',
      desc: 'Deep logic flaw, race condition, & memory leak scanning',
    },
    {
      id: 'refactor',
      label: 'Refactoring',
      icon: Wrench,
      color: 'text-cyan-400',
      desc: 'SOLID architecture, performance & clean code optimization',
    },
    {
      id: 'tests',
      label: 'Unit Tests',
      icon: TestTube2,
      color: 'text-emerald-400',
      desc: 'Automated test suites with happy-path & edge-case mocks',
    },
    {
      id: 'documentation',
      label: 'Documentation',
      icon: FileText,
      color: 'text-indigo-400',
      desc: 'Technical specs, parameter schemas, and Markdown docs',
    },
    {
      id: 'explain',
      label: 'Explain Code',
      icon: HelpCircle,
      color: 'text-purple-400',
      desc: 'Algorithmic timeline, Big-O Time & Space complexity',
    },
  ];

  const handleRunAnalysis = async () => {
    if (!code.trim()) {
      setError('Please provide or paste source code before running analysis.');
      return;
    }

    // Automatically beautify code snippet before sending if enabled
    let codeToSend = code;
    if (autoFormatEnabled) {
      try {
        const beautified = beautifyCode(code, language);
        if (beautified && beautified.trim()) {
          codeToSend = beautified;
          setCode(beautified);
        }
      } catch (err) {
        console.warn('Auto-formatting error before analyze:', err);
      }
    }

    setError(null);
    setLoading(true);
    setAnalysisResult(null);

    const steps = [
      'Beautifying syntax & parsing AST...',
      'Synthesizing structural context...',
      'Executing Gemini Flash AI engine...',
      'Validating structured JSON schemas...',
    ];

    let stepIndex = 0;
    setLoadingStep(steps[0]);
    const stepInterval = setInterval(() => {
      stepIndex = (stepIndex + 1) % steps.length;
      setLoadingStep(steps[stepIndex]);
    }, 1200);

    try {
      const response = await analysisService.analyzeCode({
        code: codeToSend,
        language,
        analysisType,
        projectId: linkedProjectId || undefined,
        options: {
          focusArea,
          framework: testFramework,
        },
      });

      clearInterval(stepInterval);
      setAnalysisResult(response.result);
      setCurrentRecord(response);

      // Trigger celebratory confetti if quality score is 90+
      if (analysisType === 'review' && response.score && response.score >= 90) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      }

      if (onAnalysisComplete) {
        onAnalysisComplete();
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error('Analysis error:', err);
      setError(
        err.response?.data?.error ||
          err.message ||
          'Failed to perform AI analysis. Please verify your connection or Gemini API key.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = () => {
    if (!analysisResult) return;
    const blob = new Blob([JSON.stringify(analysisResult, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis_${analysisType}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToProject = async () => {
    if (!linkedProjectId) {
      setError('Please select a target Project to save this file snippet.');
      return;
    }

    try {
      await projectService.addFile(linkedProjectId, {
        name: fileName || `snippet_${Date.now()}.${language}`,
        language,
        content: code,
      });
      alert('Source file saved to project repository successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save file snippet to project.');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Analysis Mode Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {analysisModes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = analysisType === mode.id;

          return (
            <button
              key={mode.id}
              id={`tab-mode-${mode.id}`}
              onClick={() => {
                setAnalysisType(mode.id);
                setAnalysisResult(null);
                setError(null);
              }}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-50 border-indigo-500 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <Icon className={`w-4 h-4 ${mode.color}`} />
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                )}
              </div>
              <span className={`font-bold text-xs ${isSelected ? 'text-indigo-950' : 'text-slate-700'}`}>
                {mode.label}
              </span>
              <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 font-medium">
                {mode.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Code Editor & Execution Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col">
          {/* Quick Options Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
            {/* Project Association */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Project:</span>
              <select
                id="select-project-link"
                value={linkedProjectId}
                onChange={(e) => setLinkedProjectId(e.target.value)}
                className="bg-slate-50 text-slate-800 px-2 py-1 rounded border border-slate-200 focus:outline-none focus:border-indigo-500 text-xs font-medium"
              >
                <option value="">(Standalone Snippet)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Auto-format Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                <Wand2 className="w-3 h-3 text-indigo-600" />
                Auto-format:
              </span>
              <button
                type="button"
                id="toggle-auto-format"
                onClick={() => setAutoFormatEnabled(!autoFormatEnabled)}
                title="Automatically beautify code before sending for AI analysis"
                className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                  autoFormatEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <span className="bg-white w-3 h-3 rounded-full shadow-xs"></span>
              </button>
            </div>

            {/* Test Framework option if in tests mode */}
            {analysisType === 'tests' && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Framework:</span>
                <select
                  value={testFramework}
                  onChange={(e) => setTestFramework(e.target.value)}
                  className="bg-slate-50 text-slate-800 px-2 py-1 rounded border border-slate-200 text-xs font-medium"
                >
                  <option value="pytest">pytest</option>
                  <option value="unittest">unittest</option>
                  <option value="jest">Jest</option>
                  <option value="vitest">Vitest</option>
                  <option value="junit">JUnit 5</option>
                  <option value="gotest">testing (Go)</option>
                </select>
              </div>
            )}
          </div>

          {/* Code Editor */}
          <div className="flex-1 min-h-[460px]">
            <CodeEditor
              code={code}
              onChange={setCode}
              language={language}
              onLanguageChange={setLanguage}
              fileName={fileName}
              onFileNameChange={setFileName}
              autoFormatEnabled={autoFormatEnabled}
              onToggleAutoFormat={setAutoFormatEnabled}
              saveStatus={saveStatus}
              lastSaved={lastSaved}
              onResetDraft={() => {
                const defaultSample = SAMPLE_SNIPPETS[0];
                setCode(defaultSample.code);
                setLanguage(defaultSample.language);
                setFileName('order_service.py');
                setAnalysisType(defaultSample.recommendedType);
                setAnalysisResult(null);
                try {
                  localStorage.removeItem(DRAFT_STORAGE_KEY);
                } catch (e) {}
              }}
              onLoadPreset={(preset) => {
                const formattedCode = autoFormatEnabled
                  ? beautifyCode(preset.code, preset.language)
                  : preset.code;
                setCode(formattedCode);
                setLanguage(preset.language);
                setAnalysisType(preset.recommendedType);
                setFileName(`sample_${preset.language}.code`);
                setAnalysisResult(null);
              }}
              disabled={loading}
            />
          </div>

          {/* Actions & Analyze Trigger Button */}
          <div className="flex items-center gap-3">
            <button
              id="btn-run-analysis"
              onClick={handleRunAnalysis}
              disabled={loading || !code.trim()}
              className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Processing with Gemini...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span className="capitalize">Run {analysisType} Analysis</span>
                </>
              )}
            </button>

            {linkedProjectId && (
              <button
                id="btn-save-to-project"
                type="button"
                onClick={handleSaveToProject}
                title="Save source file to project"
                className="p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Save className="w-4 h-4 text-indigo-600" />
              </button>
            )}
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Column: AI Analysis Result Display (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col">
          {loading ? (
            <div className="flex-1 bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[460px] shadow-xs">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                <Sparkles className="w-6 h-6 text-indigo-600 absolute animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900">Executing Deep Code Intelligence</h4>
                <p className="text-xs text-indigo-600 font-mono font-bold animate-pulse">{loadingStep}</p>
              </div>
              <p className="text-[11px] text-slate-500 max-w-sm">
                Parsing AST, analyzing control flow, evaluating memory safety, and calculating quality benchmarks.
              </p>
            </div>
          ) : analysisResult ? (
            <div className="space-y-4">
              {/* Result Control Bar */}
              <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs shadow-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-800 capitalize">
                    {analysisType} Analysis Completed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id="btn-download-document-report"
                    onClick={() => setIsExportModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-2xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Report (DOC/PPT/PDF)</span>
                  </button>
                  <button
                    onClick={handleRunAnalysis}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer border border-slate-200"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Re-evaluate</span>
                  </button>
                </div>
              </div>

              {/* Dynamic View rendering based on Analysis Type */}
              {analysisType === 'review' && (
                <ReviewResultView data={analysisResult as ReviewResponse} sourceCode={code} />
              )}
              {analysisType === 'bugs' && (
                <BugResultView data={analysisResult as BugDetectionResponse} />
              )}
              {analysisType === 'refactor' && (
                <RefactorResultView data={analysisResult as RefactorResponse} originalCode={code} />
              )}
              {analysisType === 'tests' && (
                <TestResultView data={analysisResult as TestGenerationResponse} />
              )}
              {analysisType === 'documentation' && (
                <DocResultView data={analysisResult as DocumentationResponse} />
              )}
              {analysisType === 'explain' && (
                <ExplainResultView data={analysisResult as ExplainResponse} />
              )}
            </div>
          ) : (
            /* Empty State Prompt */
            <div className="flex-1 bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[460px] shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Code2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900">Ready for Code Analysis</h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  Paste your source code in the editor or select a sample preset, then click{' '}
                  <span className="text-indigo-600 font-bold">Run Analysis</span> to generate AI insights.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-left text-xs max-w-md w-full pt-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800 block">✨ Built-in Code Beautifier</span>
                  <span className="text-[11px] text-slate-500">Auto-formats code snippets with PEP-8 and standard AST formatting rules.</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800 block">🛡️ Zero Hallucinations</span>
                  <span className="text-[11px] text-slate-500">Strict JSON schema validation with syntax guards.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Structured Document Export & Format Modal */}
      {analysisResult && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          analysisType={analysisType}
          data={analysisResult}
          code={code}
          language={language}
          fileName={fileName}
          projectName={
            projects.find((p) => p.id === linkedProjectId)?.name || 'Default Workspace'
          }
        />
      )}
    </div>
  );
};
