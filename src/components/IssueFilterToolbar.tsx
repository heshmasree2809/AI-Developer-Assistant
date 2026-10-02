import React from 'react';
import {
  Filter,
  ShieldAlert,
  AlertTriangle,
  Info,
  Tag,
  Search,
  RotateCcw,
  Check,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { Severity } from '../types';

export interface IssueFilterToolbarProps {
  totalCount: number;
  filteredCount: number;
  
  // Severity filter props
  selectedSeverities: Severity[];
  onToggleSeverity: (severity: Severity) => void;
  onSetAllSeverities: () => void;
  severityCounts: Record<Severity, number>;
  
  // Category filter props (optional for views without categories)
  categories?: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categoryCounts?: Record<string, number>;
  
  // Search filter
  searchQuery: string;
  onSearchChange: (query: string) => void;
  
  // Reset
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

const SEVERITY_CONFIG: Record<
  Severity,
  {
    label: string;
    icon: React.FC<{ className?: string }>;
    activeClass: string;
    inactiveClass: string;
    badgeBg: string;
  }
> = {
  Critical: {
    label: 'Critical',
    icon: ShieldAlert,
    activeClass: 'bg-rose-600 text-white border-rose-600 shadow-xs',
    inactiveClass: 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50',
    badgeBg: 'bg-rose-700 text-white',
  },
  High: {
    label: 'High',
    icon: AlertTriangle,
    activeClass: 'bg-orange-600 text-white border-orange-600 shadow-xs',
    inactiveClass: 'bg-white text-orange-700 border-orange-200 hover:bg-orange-50',
    badgeBg: 'bg-orange-700 text-white',
  },
  Medium: {
    label: 'Medium',
    icon: AlertTriangle,
    activeClass: 'bg-amber-600 text-white border-amber-600 shadow-xs',
    inactiveClass: 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50',
    badgeBg: 'bg-amber-700 text-white',
  },
  Low: {
    label: 'Low',
    icon: Info,
    activeClass: 'bg-blue-600 text-white border-blue-600 shadow-xs',
    inactiveClass: 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50',
    badgeBg: 'bg-blue-700 text-white',
  },
  Info: {
    label: 'Info',
    icon: Info,
    activeClass: 'bg-slate-600 text-white border-slate-600 shadow-xs',
    inactiveClass: 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50',
    badgeBg: 'bg-slate-700 text-white',
  },
};

const ALL_SEVERITIES: Severity[] = ['Critical', 'High', 'Medium', 'Low'];

export const IssueFilterToolbar: React.FC<IssueFilterToolbarProps> = ({
  totalCount,
  filteredCount,
  selectedSeverities,
  onToggleSeverity,
  onSetAllSeverities,
  severityCounts,
  categories = [],
  selectedCategory,
  onSelectCategory,
  categoryCounts = {},
  searchQuery,
  onSearchChange,
  onResetFilters,
  hasActiveFilters,
}) => {
  const isAllSeveritiesSelected =
    ALL_SEVERITIES.every((s) => selectedSeverities.includes(s)) ||
    selectedSeverities.length === 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3.5">
      {/* Header & Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block">Filter Issues</span>
            <span className="text-[11px] text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-900">{filteredCount}</span> of{' '}
              <span className="font-bold text-slate-900">{totalCount}</span> issues
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <div className="relative min-w-[160px] sm:min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search issues by keyword..."
              className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Section: Severity & Category */}
      <div className="space-y-3">
        {/* Severity Toggles */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3 text-indigo-600" />
              Severity Visibility
            </span>
            <div className="flex items-center gap-2 text-[10px]">
              <button
                type="button"
                onClick={onSetAllSeverities}
                className={`font-bold transition-colors cursor-pointer ${
                  isAllSeveritiesSelected
                    ? 'text-indigo-600 underline'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Show All
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {ALL_SEVERITIES.map((sev) => {
              const cfg = SEVERITY_CONFIG[sev];
              const Icon = cfg.icon;
              const isSelected = selectedSeverities.includes(sev);
              const count = severityCounts[sev] || 0;

              return (
                <button
                  key={sev}
                  type="button"
                  onClick={() => onToggleSeverity(sev)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer select-none ${
                    isSelected ? cfg.activeClass : cfg.inactiveClass
                  } ${count === 0 ? 'opacity-50' : ''}`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{cfg.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isSelected
                        ? 'bg-black/20 text-white'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {count}
                  </span>
                  {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Toggles (if categories are available) */}
        {categories.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-indigo-600" />
                Category Filter
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => onSelectCategory('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                All Categories ({totalCount})
              </button>

              {categories.map((cat) => {
                const count = categoryCounts[cat] || 0;
                const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => onSelectCategory(cat)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        isSelected
                          ? 'bg-black/20 text-white'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
