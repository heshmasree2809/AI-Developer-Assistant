import React from 'react';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, size = 'md', showLabel = true }) => {
  const getGrade = (s: number) => {
    if (s >= 90) return { grade: 'A+', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', stroke: '#059669' };
    if (s >= 80) return { grade: 'A', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', stroke: '#16a34a' };
    if (s >= 70) return { grade: 'B', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', stroke: '#d97706' };
    if (s >= 60) return { grade: 'C', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', stroke: '#ea580c' };
    return { grade: 'F', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', stroke: '#e11d48' };
  };

  const info = getGrade(score);

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${info.bg} ${info.border} ${info.color}`}>
        <span>{score}/100</span>
        <span className="opacity-75 font-semibold">({info.grade})</span>
      </span>
    );
  }

  const dimensions = size === 'lg' ? { w: 100, strokeWidth: 8, radius: 42, fontSize: 'text-2xl' } : { w: 72, strokeWidth: 6, radius: 30, fontSize: 'text-lg' };
  const circumference = 2 * Math.PI * dimensions.radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: dimensions.w, height: dimensions.w }}>
        <svg className="transform -rotate-90" width={dimensions.w} height={dimensions.w}>
          <circle
            cx={dimensions.w / 2}
            cy={dimensions.w / 2}
            r={dimensions.radius}
            stroke="currentColor"
            strokeWidth={dimensions.strokeWidth}
            className="text-slate-200"
            fill="transparent"
          />
          <circle
            cx={dimensions.w / 2}
            cy={dimensions.w / 2}
            r={dimensions.radius}
            stroke={info.stroke}
            strokeWidth={dimensions.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`font-bold ${dimensions.fontSize} ${info.color}`}>{score}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{info.grade}</span>
        </div>
      </div>
      {showLabel && (
        <span className="mt-1 text-xs font-semibold text-slate-600">Quality Score</span>
      )}
    </div>
  );
};
