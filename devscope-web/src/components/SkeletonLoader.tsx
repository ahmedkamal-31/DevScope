import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-surface p-6 rounded-2xl border border-slate-700 h-40 flex items-center gap-6">
        <div className="w-24 h-24 bg-slate-700 rounded-full"></div>
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          <div className="h-4 bg-slate-700 rounded w-1/4"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface p-6 rounded-2xl border border-slate-700 h-28"></div>
        ))}
      </div>
      <div className="bg-surface p-6 rounded-2xl border border-slate-700 h-64"></div>
    </div>
  );
};
