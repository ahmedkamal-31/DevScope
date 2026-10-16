import React from 'react';
import { LayoutDashboard, Code2, BarChart2, GitCompare, FileText } from 'lucide-react';

const GithubIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
    <path d="M9 18c-4.51 2-5-2-7-2"></path>
  </svg>
);

export type TabType = 'overview' | 'repos' | 'languages' | 'insights' | 'compare' | 'report';

interface Props {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  activeUser: string | null;
}

export const Header: React.FC<Props> = ({ activeTab, setActiveTab, activeUser }) => {
  return (
    <header className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
        <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20">
          <GithubIcon size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            DevScope <span className="text-xs font-normal bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/30">Intelligence</span>
          </h1>
          <p className="text-xs text-textMuted">GitHub Developer & Repository Analytics</p>
        </div>
      </div>

      <nav className="flex flex-wrap bg-surface p-1.5 rounded-xl border border-slate-700 text-xs md:text-sm font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-primary text-white font-semibold' : 'text-textMuted hover:text-white'}`}
        >
          <LayoutDashboard size={16} /> Dashboard
        </button>
        <button
          onClick={() => setActiveTab('repos')}
          disabled={!activeUser}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${activeTab === 'repos' ? 'bg-primary text-white font-semibold' : 'text-textMuted hover:text-white disabled:opacity-40'}`}
        >
          <Code2 size={16} /> Repositories
        </button>
        <button
          onClick={() => setActiveTab('languages')}
          disabled={!activeUser}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${activeTab === 'languages' ? 'bg-primary text-white font-semibold' : 'text-textMuted hover:text-white disabled:opacity-40'}`}
        >
          <BarChart2 size={16} /> Languages
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          disabled={!activeUser}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${activeTab === 'insights' ? 'bg-primary text-white font-semibold' : 'text-textMuted hover:text-white disabled:opacity-40'}`}
        >
          <BarChart2 size={16} /> Insights
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${activeTab === 'compare' ? 'bg-primary text-white font-semibold' : 'text-textMuted hover:text-white'}`}
        >
          <GitCompare size={16} /> Compare
        </button>
        <button
          onClick={() => setActiveTab('report')}
          disabled={!activeUser}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${activeTab === 'report' ? 'bg-primary text-white font-semibold' : 'text-textMuted hover:text-white disabled:opacity-40'}`}
        >
          <FileText size={16} /> Report
        </button>
      </nav>
    </header>
  );
};
