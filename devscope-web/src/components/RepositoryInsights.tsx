import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { type RepositoryInsights } from '../api/client';
import { Award, Zap, Clock, Star, GitFork } from 'lucide-react';

interface Props {
  insights: RepositoryInsights;
}

export const RepositoryInsightsView: React.FC<Props> = ({ insights }) => {
  return (
    <div className="space-y-6">
      {/* Top Banner Heuristic Score */}
      <div className="bg-gradient-to-r from-slate-900 via-surface to-slate-900 p-6 rounded-2xl border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-semibold border border-primary/30">
            <Award size={14} /> Internal Analytics Heuristic
          </div>
          <h3 className="text-2xl font-bold">Developer Engagement Score</h3>
          <p className="text-xs text-textMuted max-w-xl leading-relaxed">
            Derived transparently from star impact (50%), fork adoption (30%), and repository update recency (20%). This score provides a relative activity snapshot.
          </p>
        </div>
        <div className="text-center px-8 py-4 bg-slate-900 rounded-2xl border border-slate-700 shrink-0">
          <div className="text-5xl font-extrabold text-primary">{insights.engagementHeuristicScore}</div>
          <div className="text-xs text-textMuted font-medium mt-1">out of 100</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recency Breakdown */}
        <div className="bg-surface p-6 rounded-2xl border border-slate-700 space-y-4">
          <h4 className="text-lg font-bold flex items-center gap-2">
            <Clock className="text-emerald-400" size={20} /> Repository Update Recency
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-textMuted">Updated in last 30 Days</span>
              <span className="font-bold text-emerald-400">{insights.reposUpdatedLast30Days} Repos</span>
            </div>
            <div className="flex justify-between items-center text-sm p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-textMuted">Updated in last 90 Days</span>
              <span className="font-bold text-blue-400">{insights.reposUpdatedLast90Days} Repos</span>
            </div>
            <div className="flex justify-between items-center text-sm p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-textMuted">Updated in last 365 Days</span>
              <span className="font-bold text-amber-400">{insights.reposUpdatedLast365Days} Repos</span>
            </div>
            <div className="flex justify-between items-center text-sm p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-textMuted">Older than 1 Year</span>
              <span className="font-bold text-slate-500">{insights.reposOlderThan1Year} Repos</span>
            </div>
          </div>
        </div>

        {/* Star Distribution Chart */}
        <div className="bg-surface p-6 rounded-2xl border border-slate-700 space-y-4">
          <h4 className="text-lg font-bold flex items-center gap-2">
            <Star className="text-yellow-400" size={20} /> Star Distribution Buckets
          </h4>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={insights.starDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Featured Primary Repo */}
      {insights.primaryRepository && (
        <div className="bg-surface p-6 rounded-2xl border border-slate-700 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-yellow-400">
            <Zap size={16} /> Highest Impact Repository
          </div>
          <div className="flex justify-between items-start">
            <h4 className="text-xl font-bold text-primary">{insights.primaryRepository.name}</h4>
            <div className="flex gap-3 text-xs text-textMuted">
              <span className="flex items-center gap-1 text-yellow-400"><Star size={14}/> {insights.primaryRepository.stars}</span>
              <span className="flex items-center gap-1"><GitFork size={14}/> {insights.primaryRepository.forks}</span>
            </div>
          </div>
          <p className="text-sm text-textMuted">{insights.primaryRepository.description || 'No description provided.'}</p>
        </div>
      )}
    </div>
  );
};
