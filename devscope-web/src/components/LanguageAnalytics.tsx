import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { type LanguageStat } from '../api/client';
import { Code2, ArrowRight } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

interface Props {
  languages: LanguageStat[];
  onSelectLanguage?: (lang: string) => void;
}

export const LanguageAnalytics: React.FC<Props> = ({ languages, onSelectLanguage }) => {
  if (!languages || languages.length === 0) {
    return (
      <div className="saas-card p-8 rounded-2xl text-center text-slate-400">
        No language metrics detected across public repositories.
      </div>
    );
  }

  const chartData = languages.map((l) => ({
    name: l.language,
    value: l.percentage,
    bytes: l.bytes,
    repoCount: l.repositoryCount
  }));

  return (
    <div className="saas-card p-6 rounded-2xl space-y-6">
      <div className="flex justify-between items-center border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Code2 className="text-blue-400" size={20} /> Language Intelligence & Byte Metrics
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Calculated directly from GitHub repository source code byte distributions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                formatter={(val: any) => [`${val}%`, 'Usage']}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2.5">
          {languages.slice(0, 7).map((lang, index) => (
            <div 
              key={lang.language} 
              onClick={() => onSelectLanguage && onSelectLanguage(lang.language)}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <div>
                  <div className="font-semibold text-xs text-white group-hover:text-blue-400 transition-colors flex items-center gap-1">
                    {lang.language} <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-[10px] text-slate-400">{lang.repositoryCount} Repositories</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-xs text-blue-400">{lang.percentage}%</div>
                <div className="text-[10px] text-slate-400">{(lang.bytes / 1024).toFixed(1)} KB</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
