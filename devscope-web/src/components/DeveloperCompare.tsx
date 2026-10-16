import React, { useState } from 'react';
import { getComparison, type DeveloperComparison } from '../api/client';
import { Star, GitFork, Users, Code, ArrowUpRight, ArrowDownRight, GitCompare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const DeveloperCompare: React.FC = () => {
  const [user1, setUser1] = useState('');
  const [user2, setUser2] = useState('');
  const [data, setData] = useState<DeveloperComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user1.trim() || !user2.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await getComparison(user1, user2);
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.status === 404 ? 'One or both GitHub usernames could not be found.' : 'Failed to compare developers.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const chartData = data ? [
    { metric: 'Stars', [data.profile1.username]: data.stats1.totalStars, [data.profile2.username]: data.stats2.totalStars },
    { metric: 'Forks', [data.profile1.username]: data.stats1.totalForks, [data.profile2.username]: data.stats2.totalForks },
    { metric: 'Followers', [data.profile1.username]: data.profile1.followers, [data.profile2.username]: data.profile2.followers },
    { metric: 'Public Repos', [data.profile1.username]: data.profile1.publicRepos, [data.profile2.username]: data.profile2.publicRepos }
  ] : [];

  return (
    <div className="space-y-8">
      <form onSubmit={handleCompare} className="bg-surface p-6 rounded-2xl border border-slate-700 space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <GitCompare className="text-primary" size={22} /> Compare Two Developers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="First Username (e.g. torvalds)"
            className="bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-white focus:outline-none focus:border-primary text-sm"
            value={user1}
            onChange={(e) => setUser1(e.target.value)}
          />
          <input
            type="text"
            placeholder="Second Username (e.g. gaearon)"
            className="bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-white focus:outline-none focus:border-primary text-sm"
            value={user2}
            onChange={(e) => setUser2(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary hover:bg-blue-600 font-bold py-3.5 rounded-xl transition-colors text-white text-sm"
        >
          Run Side-by-Side Comparison
        </button>
      </form>

      {loading && <div className="text-center py-12 text-textMuted animate-pulse">Fetching comparison metrics...</div>}
      {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl text-center">{error}</div>}

      {data && !loading && (
        <div className="space-y-8">
          {/* Side by Side Profile Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { profile: data.profile1, stats: data.stats1 },
              { profile: data.profile2, stats: data.stats2 }
            ].map(({ profile, stats }) => (
              <div key={profile.username} className="bg-surface p-6 rounded-2xl border border-slate-700 space-y-6">
                <div className="text-center">
                  <img src={profile.avatarUrl} alt={profile.username} className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-primary" />
                  <h4 className="text-xl font-bold">{profile.name || profile.username}</h4>
                  <p className="text-textMuted text-xs">@{profile.username}</p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-textMuted flex items-center gap-2"><Star size={16}/> Total Stars</span>
                    <span className="font-bold text-yellow-400">{stats.totalStars}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-textMuted flex items-center gap-2"><GitFork size={16}/> Total Forks</span>
                    <span className="font-bold">{stats.totalForks}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-textMuted flex items-center gap-2"><Users size={16}/> Followers</span>
                    <span className="font-bold">{profile.followers}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-textMuted flex items-center gap-2"><Code size={16}/> Public Repositories</span>
                    <span className="font-bold">{profile.publicRepos}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Metric Differences Banner */}
          <div className="bg-surface p-6 rounded-2xl border border-slate-700">
            <h4 className="text-lg font-bold mb-4">Metric Deltas ({data.profile2.username} vs {data.profile1.username})</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-xs text-textMuted mb-1">Stars Delta</div>
                <div className={`text-xl font-bold flex items-center justify-center gap-1 ${data.starsDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {data.starsDelta >= 0 ? <ArrowUpRight size={18}/> : <ArrowDownRight size={18}/>}
                  {data.starsDelta >= 0 ? `+${data.starsDelta}` : data.starsDelta}
                </div>
              </div>
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-xs text-textMuted mb-1">Followers Delta</div>
                <div className={`text-xl font-bold flex items-center justify-center gap-1 ${data.followersDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {data.followersDelta >= 0 ? <ArrowUpRight size={18}/> : <ArrowDownRight size={18}/>}
                  {data.followersDelta >= 0 ? `+${data.followersDelta}` : data.followersDelta}
                </div>
              </div>
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-xs text-textMuted mb-1">Repos Delta</div>
                <div className={`text-xl font-bold flex items-center justify-center gap-1 ${data.publicReposDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {data.publicReposDelta >= 0 ? <ArrowUpRight size={18}/> : <ArrowDownRight size={18}/>}
                  {data.publicReposDelta >= 0 ? `+${data.publicReposDelta}` : data.publicReposDelta}
                </div>
              </div>
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-xs text-textMuted mb-1">Languages Delta</div>
                <div className={`text-xl font-bold flex items-center justify-center gap-1 ${data.languagesDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {data.languagesDelta >= 0 ? <ArrowUpRight size={18}/> : <ArrowDownRight size={18}/>}
                  {data.languagesDelta >= 0 ? `+${data.languagesDelta}` : data.languagesDelta}
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Bar Chart */}
          <div className="bg-surface p-6 rounded-2xl border border-slate-700 space-y-4">
            <h4 className="text-lg font-bold">Visual Metric Comparison</h4>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="metric" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Legend />
                  <Bar dataKey={data.profile1.username} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={data.profile2.username} fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
