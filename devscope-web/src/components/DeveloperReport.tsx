import React, { useEffect, useState } from 'react';
import { getReport, type DeveloperReport } from '../api/client';
import { Printer, Star, GitFork, Users, Code } from 'lucide-react';

interface Props {
  username: string;
}

export const DeveloperReportView: React.FC<Props> = ({ username }) => {
  const [report, setReport] = useState<DeveloperReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    getReport(username)
      .then(res => setReport(res.data))
      .catch(() => setError('Failed to generate report.'))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return <div className="text-center py-12 text-textMuted animate-pulse">Generating developer report...</div>;
  if (error || !report) return <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl text-center">{error}</div>;

  const { profile, stats, topLanguages, topRepositories, insights } = report;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Print Controls */}
      <div className="flex justify-between items-center bg-surface p-4 rounded-2xl border border-slate-700 print:hidden">
        <div>
          <h3 className="font-bold text-white">Developer Executive Summary</h3>
          <p className="text-xs text-textMuted">Shareable report for @{profile.username}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors"
        >
          <Printer size={16} /> Print / Save as PDF
        </button>
      </div>

      {/* Printable Report Section */}
      <div className="bg-surface p-8 rounded-2xl border border-slate-700 space-y-8 text-white print:bg-white print:text-black print:border-none print:shadow-none">
        <div className="flex justify-between items-start border-b border-slate-800 print:border-gray-300 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold">{profile.name || profile.username}</h1>
            <p className="text-textMuted print:text-gray-600 text-sm">@{profile.username}</p>
            {profile.bio && <p className="text-xs text-slate-300 print:text-gray-700 mt-2 max-w-lg">{profile.bio}</p>}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary print:text-blue-600">DevScope Report</div>
            <div className="text-xs text-textMuted print:text-gray-500">{new Date(report.generatedAt).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-slate-900 print:bg-gray-100 rounded-xl">
            <div className="text-xs text-textMuted print:text-gray-600 flex items-center justify-center gap-1"><Star size={12}/> Stars</div>
            <div className="text-2xl font-bold text-yellow-400 print:text-gray-900">{stats.totalStars}</div>
          </div>
          <div className="p-4 bg-slate-900 print:bg-gray-100 rounded-xl">
            <div className="text-xs text-textMuted print:text-gray-600 flex items-center justify-center gap-1"><GitFork size={12}/> Forks</div>
            <div className="text-2xl font-bold">{stats.totalForks}</div>
          </div>
          <div className="p-4 bg-slate-900 print:bg-gray-100 rounded-xl">
            <div className="text-xs text-textMuted print:text-gray-600 flex items-center justify-center gap-1"><Users size={12}/> Followers</div>
            <div className="text-2xl font-bold">{profile.followers}</div>
          </div>
          <div className="p-4 bg-slate-900 print:bg-gray-100 rounded-xl">
            <div className="text-xs text-textMuted print:text-gray-600 flex items-center justify-center gap-1"><Code size={12}/> Repos</div>
            <div className="text-2xl font-bold">{profile.publicRepos}</div>
          </div>
        </div>

        {/* Languages & Activity Score */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-bold text-sm border-b border-slate-800 print:border-gray-300 pb-2">Top Languages</h4>
            {topLanguages.map(l => (
              <div key={l.language} className="flex justify-between text-xs py-1">
                <span>{l.language}</span>
                <span className="font-bold">{l.percentage}%</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-sm border-b border-slate-800 print:border-gray-300 pb-2">Engagement Summary</h4>
            <div className="flex justify-between text-xs py-1">
              <span>Score:</span>
              <span className="font-bold text-primary print:text-blue-600">{insights.engagementHeuristicScore} / 100</span>
            </div>
            <div className="flex justify-between text-xs py-1">
              <span>Updated in 90 Days:</span>
              <span className="font-bold">{insights.reposUpdatedLast90Days} Repos</span>
            </div>
          </div>
        </div>

        {/* Top Repositories */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm border-b border-slate-800 print:border-gray-300 pb-2">Key Repositories</h4>
          {topRepositories.map(repo => (
            <div key={repo.name} className="flex justify-between items-center text-xs p-2 bg-slate-900/50 print:bg-gray-50 rounded-lg">
              <div>
                <span className="font-semibold text-primary print:text-blue-600">{repo.name}</span>
                <span className="text-textMuted print:text-gray-500 ml-2">({repo.language})</span>
              </div>
              <div className="flex gap-3">
                <span>⭐ {repo.stars}</span>
                <span>🍴 {repo.forks}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
