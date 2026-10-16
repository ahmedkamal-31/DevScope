import React from 'react';
import { Search, Menu, LogOut, ShieldCheck } from 'lucide-react';
import { type Profile } from '../api/client';

const GithubIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
    <path d="M9 18c-4.51 2-5-2-7-2"></path>
  </svg>
);

interface Props {
  username: string;
  setUsername: (val: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  activeUser: string | null;
  onOpenMobileNav: () => void;
  authUser: Profile | null;
  onGitHubLogin: () => void;
  onGitHubLogout: () => void;
}

export const Topbar: React.FC<Props> = ({
  username,
  setUsername,
  onSearchSubmit,
  activeUser,
  onOpenMobileNav,
  authUser,
  onGitHubLogin,
  onGitHubLogout
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
        <button 
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          <Menu size={20} />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span>Active Context:</span>
          {activeUser ? (
            <span className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-lg border border-blue-500/20 font-semibold">
              <GithubIcon size={12} /> @{activeUser}
            </span>
          ) : (
            <span className="text-slate-400 italic">No account selected</span>
          )}
        </div>

        {/* OAuth Authentication Status Pill */}
        {authUser ? (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs text-emerald-400 font-semibold">
            <ShieldCheck size={14} />
            <span className="hidden sm:inline">@{authUser.username} (5k req/hr)</span>
            <button onClick={onGitHubLogout} className="text-slate-400 hover:text-red-400 ml-1 cursor-pointer" title="Sign Out">
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={onGitHubLogin}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <GithubIcon size={14} /> Sign in with GitHub
          </button>
        )}
      </div>

      {/* Global Quick Search Input */}
      <form onSubmit={onSearchSubmit} className="relative w-full max-w-md">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search GitHub developer (e.g. torvalds, gaearon)..."
            className="w-full bg-[#0f172a] border border-slate-700/80 rounded-xl py-2 pl-10 pr-24 text-xs md:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all shadow-inner"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 py-1 rounded-lg text-xs transition-colors shadow-sm cursor-pointer"
          >
            Analyze
          </button>
        </div>
      </form>
    </header>
  );
};
