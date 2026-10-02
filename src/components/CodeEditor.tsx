import React, { useRef, useState, useEffect } from 'react';
import {
  Code,
  Copy,
  Check,
  Trash2,
  FileCode2,
  Sparkles,
  Wand2,
  Settings2,
  Sliders,
  CheckCheck,
  HardDrive,
  RotateCcw,
} from 'lucide-react';
import { Language } from '../types';
import { SAMPLE_SNIPPETS, CodeSnippetPreset } from '../data/sampleSnippets';
import { beautifyCode, BeautifyOptions } from '../utils/codeBeautifier';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  fileName?: string;
  onFileNameChange?: (name: string) => void;
  onLoadPreset?: (preset: CodeSnippetPreset) => void;
  disabled?: boolean;
  autoFormatEnabled?: boolean;
  onToggleAutoFormat?: (enabled: boolean) => void;
  saveStatus?: 'idle' | 'saving' | 'saved';
  lastSaved?: number | null;
  onResetDraft?: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  language,
  onLanguageChange,
  fileName,
  onFileNameChange,
  onLoadPreset,
  disabled = false,
  autoFormatEnabled = true,
  onToggleAutoFormat,
  saveStatus = 'saved',
  lastSaved,
  onResetDraft,
}) => {
  const [copied, setCopied] = useState(false);
  const [justFormatted, setJustFormatted] = useState(false);
  const [indentSize, setIndentSize] = useState<number>(language === 'python' ? 4 : 2);
  const [braceStyle, setBraceStyle] = useState<'collapse' | 'expand'>('collapse');
  const [showSettings, setShowSettings] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update default indent size when switching to/from python
  useEffect(() => {
    if (language === 'python') {
      setIndentSize(4);
    } else {
      setIndentSize(2);
    }
  }, [language]);

  const languages: { id: Language; label: string; ext: string }[] = [
    { id: 'python', label: 'Python', ext: '.py' },
    { id: 'typescript', label: 'TypeScript', ext: '.ts' },
    { id: 'javascript', label: 'JavaScript', ext: '.js' },
    { id: 'java', label: 'Java', ext: '.java' },
    { id: 'csharp', label: 'C# (.NET)', ext: '.cs' },
    { id: 'go', label: 'Go', ext: '.go' },
    { id: 'rust', label: 'Rust', ext: '.rs' },
    { id: 'cpp', label: 'C++', ext: '.cpp' },
    { id: 'php', label: 'PHP', ext: '.php' },
    { id: 'sql', label: 'PostgreSQL / SQL', ext: '.sql' },
    { id: 'ruby', label: 'Ruby', ext: '.rb' },
  ];

  const lineCount = Math.max(1, code.split('\n').length);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const handleBeautify = () => {
    if (!code.trim()) return;
    const options: BeautifyOptions = {
      indentSize,
      braceStyle,
      preserveNewlines: true,
      maxPreserveNewlines: 2,
    };
    const formatted = beautifyCode(code, language, options);
    onChange(formatted);
    setJustFormatted(true);
    setTimeout(() => setJustFormatted(false), 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    onChange('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Keyboard shortcut listener for formatting: Ctrl+Shift+F or Alt+Shift+F or Cmd+Shift+F
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey || e.altKey) && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
      e.preventDefault();
      handleBeautify();
      return;
    }

    // Tab key indentation support
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = ' '.repeat(indentSize);

      const newCode = code.substring(0, start) + spaces + code.substring(end);
      onChange(newCode);

      // Restore cursor position after state update
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + indentSize;
      }, 0);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Editor Control Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          {/* File Name Tag */}
          <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-md border border-slate-300 text-slate-700 shadow-2xs">
            <FileCode2 className="w-3.5 h-3.5 text-indigo-600" />
            {onFileNameChange ? (
              <input
                type="text"
                value={fileName || `main${languages.find((l) => l.id === language)?.ext || '.py'}`}
                onChange={(e) => onFileNameChange(e.target.value)}
                placeholder="filename.ext"
                className="bg-transparent text-xs font-mono text-slate-800 focus:outline-none w-32 font-semibold"
              />
            ) : (
              <span className="font-mono text-slate-800 font-semibold">
                {fileName || `main${languages.find((l) => l.id === language)?.ext || '.py'}`}
              </span>
            )}
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Language:</span>
            <select
              id="select-language"
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              disabled={disabled}
              className="bg-white text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
            >
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.label} ({lang.ext})
                </option>
              ))}
            </select>
          </div>

          {/* Sample Snippets Preset Dropdown */}
          <div className="relative group">
            <button
              id="btn-sample-snippets"
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>Load Sample</span>
            </button>
            <div className="hidden group-hover:block group-focus-within:block absolute top-full left-0 mt-1 w-72 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Choose Practice Code Sample
              </div>
              {SAMPLE_SNIPPETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    if (onLoadPreset) onLoadPreset(preset);
                    else {
                      onChange(preset.code);
                      onLanguageChange(preset.language);
                    }
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 text-slate-800 flex flex-col transition-colors border-b border-slate-100 last:border-0 cursor-pointer"
                >
                  <span className="font-bold text-indigo-700">{preset.name}</span>
                  <span className="text-[11px] text-slate-500 line-clamp-1">{preset.description}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase font-mono px-1 py-0.2 bg-slate-100 rounded text-indigo-700 font-bold">
                      {preset.language}
                    </span>
                    <span className="text-[10px] text-slate-500 capitalize">
                      Ideal for: {preset.recommendedType}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Controls & Beautifier Toolbar */}
        <div className="flex items-center gap-2">
          {/* Beautify Button */}
          <button
            id="btn-beautify-code"
            type="button"
            onClick={handleBeautify}
            disabled={disabled || !code.trim()}
            title="Beautify / Format Code (Ctrl+Shift+F)"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border transition-all cursor-pointer ${
              justFormatted
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs'
                : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700'
            }`}
          >
            {justFormatted ? (
              <>
                <CheckCheck className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>Beautified!</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Beautify</span>
              </>
            )}
          </button>

          {/* Formatter Settings Dropdown Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              title="Formatter Settings"
              className="p-1.5 rounded bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>

            {showSettings && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-30 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-600" /> Beautifier Settings
                  </span>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-slate-400 hover:text-slate-700 text-xs font-bold px-1"
                  >
                    ✕
                  </button>
                </div>

                {/* Indent Size */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-600 font-medium block">Indentation Size:</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[2, 4].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setIndentSize(size)}
                        className={`py-1 px-2 rounded text-xs font-semibold border ${
                          indentSize === size
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {size} Spaces
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brace Style for C-family / JS */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-600 font-medium block">Brace Alignment:</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['collapse', 'expand'] as const).map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setBraceStyle(style)}
                        className={`py-1 px-2 rounded text-xs font-semibold capitalize border ${
                          braceStyle === style
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto Format Toggle */}
                {onToggleAutoFormat && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-700 font-medium">Auto-format on submit:</span>
                    <button
                      type="button"
                      onClick={() => onToggleAutoFormat(!autoFormatEnabled)}
                      className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${
                        autoFormatEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
                      }`}
                    >
                      <span className="bg-white w-3 h-3 rounded-full shadow-xs"></span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
            {lineCount} lines • {code.length} chars
          </span>

          {/* LocalStorage Debounced Auto-save Status Indicator */}
          <div
            id="editor-autosave-indicator"
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-white border border-slate-200 text-[10px] select-none shadow-2xs"
            title="Debounced auto-save active: changes are automatically persisted to localStorage across browser refreshes"
          >
            {saveStatus === 'saving' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-amber-700 font-bold hidden sm:inline">Saving...</span>
              </>
            ) : (
              <>
                <HardDrive className="w-3 h-3 text-emerald-600" />
                <span className="text-slate-600 font-medium hidden sm:inline">Auto-saved</span>
              </>
            )}
          </div>

          <button
            id="btn-copy-code"
            type="button"
            onClick={handleCopy}
            title="Copy source code"
            className="p-1.5 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            id="btn-clear-code"
            type="button"
            onClick={handleClear}
            title="Clear editor"
            className="p-1.5 rounded bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors shadow-2xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Body with Line Numbers */}
      <div className="relative flex-1 flex overflow-hidden font-mono text-xs">
        {/* Line Numbers Column */}
        <div className="w-12 py-3 bg-slate-50 select-none text-right pr-3 text-slate-400 border-r border-slate-200 font-mono text-[11px] overflow-hidden">
          {lineNumbers.map((num) => (
            <div key={num} className="leading-6 h-6">
              {num}
            </div>
          ))}
        </div>

        {/* Text Area Input */}
        <div className="relative flex-1 h-full bg-white overflow-auto">
          <textarea
            ref={textareaRef}
            id="source-code-input"
            value={code}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`// Paste your ${language} source code here or click "Load Sample" to begin...\n// Press Ctrl+Shift+F to Beautify / Auto-format\n// Example:\n// def process_transaction(user_id, amount):\n//     ...`}
            disabled={disabled}
            spellCheck={false}
            className="w-full h-full min-h-[360px] p-3 bg-transparent text-slate-800 font-mono text-xs leading-6 resize-none focus:outline-none placeholder:text-slate-400 selection:bg-indigo-100 selection:text-indigo-900"
          />
        </div>
      </div>
    </div>
  );
};
