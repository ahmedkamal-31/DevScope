import React from 'react';
import { LayoutDashboard, FolderGit2, Code2, LineChart, GitCompare, FileCode2, Bookmark, Sparkles, X } from 'lucide-react';

export type TabType = 'overview' | 'repos' | 'languages' | 'insights' | 'compare' | 'report';

interface Props {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  activeUser: string | null;
  favorites: string[];
  onSelectFavorite: (username: string) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  activeUser,
  favorites,
  onSelectFavorite,
  isOpenMobile,
  setIsOpenMobile
}) => {
  const navItems = [
    { id: 'overview' as TabType, label: 'Overview', icon: LayoutDashboard, requiresUser: false },
    { id: 'repos' as TabType, label: 'Repositories', icon: FolderGit2, requiresUser: true },
    { id: 'languages' as TabType, label: 'Language Analytics', icon: Code2, requiresUser: true },
    { id: 'insights' as TabType, label: 'Engagement Insights', icon: LineChart, requiresUser: true },
    { id: 'compare' as TabType, label: 'Developer Compare', icon: GitCompare, requiresUser: false },
    { id: 'report' as TabType, label: 'Executive Report', icon: FileCode2, requiresUser: true }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 bottom-0 w-64 bg-[#0d1322] border-r border-slate-800/80 z-50 flex flex-col justify-between transition-transform duration-300
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-5 space-y-6">
          {/* Logo Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-black text-xl tracking-wider">
                D
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  DevScope <Sparkles size={14} className="text-blue-400" />
                </h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Developer Intelligence</p>
              </div>
            </div>
            <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setIsOpenMobile(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5 pt-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Platform Modules</div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const disabled = item.requiresUser && !activeUser;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  disabled={disabled}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpenMobile(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all relative
                    ${isActive 
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}
                    ${disabled ? 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-slate-500' : 'cursor-pointer'}
                  `}
                >
                  <Icon size={18} className={isActive ? 'text-blue-400' : 'text-slate-400'} />
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <span className="absolute right-2.5 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Favorites List */}
          {favorites.length > 0 && (
            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 flex items-center gap-1.5">
                <Bookmark size={12} className="text-amber-400" /> Favorite Scope
              </div>
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                {favorites.map((user) => (
                  <button
                    key={user}
                    onClick={() => {
                      onSelectFavorite(user);
                      setIsOpenMobile(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors text-left"
                  >
                    <span className="truncate">@{user}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Saved</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Brand Info */}
        <div className="p-4 border-t border-slate-800/80 bg-[#0a0f1b] text-[11px] text-slate-400 flex items-center justify-between">
          <span>DevScope v1.2</span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live REST API
          </span>
        </div>
      </aside>
    </>
  );
};
