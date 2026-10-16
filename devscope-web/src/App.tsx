import { useState, useEffect, useRef } from 'react';
import { Users, Star, GitFork, MapPin, Building, Bookmark, BookmarkCheck, ExternalLink, Calendar, Code2 } from 'lucide-react';
import { getProfile, getStats, getRepositories, getLanguages, getInsights, getGitHubLoginUrl, handleOAuthCallback, type Profile, type Stats, type Repository, type LanguageStat, type RepositoryInsights } from './api/client';
import { Sidebar, type TabType } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { LanguageAnalytics } from './components/LanguageAnalytics';
import { RepositoryExplorer } from './components/RepositoryExplorer';
import { RepositoryInsightsView } from './components/RepositoryInsights';
import { DeveloperCompare } from './components/DeveloperCompare';
import { DeveloperReportView } from './components/DeveloperReport';
import { SkeletonLoader } from './components/SkeletonLoader';

export default function App() {
  const [tab, setTab] = useState<TabType>('overview');
  const [username, setUsername] = useState('');
  const [searchedUser, setSearchedUser] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [languages, setLanguages] = useState<LanguageStat[]>([]);
  const [insights, setInsights] = useState<RepositoryInsights | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [repoLangFilter, setRepoLangFilter] = useState<string>('All');
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const [authUser, setAuthUser] = useState<Profile | null>(null);
  const authProcessedRef = useRef(false);

  useEffect(() => {
    try {
      const savedFavs = JSON.parse(localStorage.getItem('fav_users') || '[]');
      const savedRecent = JSON.parse(localStorage.getItem('recent_searches') || '[]');
      const savedAuthUser = JSON.parse(localStorage.getItem('github_auth_user') || 'null');
      setFavorites(savedFavs);
      setRecentSearches(savedRecent);
      if (savedAuthUser) setAuthUser(savedAuthUser);
    } catch {
      setFavorites([]);
      setRecentSearches([]);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && !authProcessedRef.current) {
      authProcessedRef.current = true;
      setLoading(true);
      window.history.replaceState({}, document.title, window.location.pathname);

      handleOAuthCallback(code)
        .then((res) => {
          const { accessToken, userProfile } = res.data;
          localStorage.setItem('github_oauth_token', accessToken);
          localStorage.setItem('github_auth_user', JSON.stringify(userProfile));
          setAuthUser(userProfile);
          executeSearch(userProfile.username);
        })
        .catch(() => setError('GitHub OAuth login failed.'))
        .finally(() => setLoading(false));
    }
  }, []);

  const handleGitHubLogin = async () => {
    try {
      const res = await getGitHubLoginUrl();
      window.location.href = res.data.url;
    } catch {
      setError('Could not initiate GitHub login.');
    }
  };

  const handleGitHubLogout = () => {
    localStorage.removeItem('github_oauth_token');
    localStorage.removeItem('github_auth_user');
    setAuthUser(null);
  };

  const toggleFavorite = (user: string) => {
    let updated = [...favorites];
    if (updated.includes(user)) {
      updated = updated.filter(u => u !== user);
    } else {
      updated.push(user);
    }
    setFavorites(updated);
    localStorage.setItem('fav_users', JSON.stringify(updated));
  };

  const executeSearch = async (targetUser: string) => {
    if (!targetUser.trim()) return;

    setLoading(true);
    setError('');

    try {
      const [pRes, sRes, rRes, lRes, iRes] = await Promise.all([
        getProfile(targetUser),
        getStats(targetUser),
        getRepositories(targetUser, 1, 100),
        getLanguages(targetUser),
        getInsights(targetUser)
      ]);

      setProfile(pRes.data);
      setStats(sRes.data);
      setRepos(rRes.data);
      setLanguages(lRes.data);
      setInsights(iRes.data);
      setSearchedUser(targetUser);

      const recent = JSON.parse(localStorage.getItem('recent_searches') || '[]');
      if (!recent.includes(targetUser)) {
        const nextRecent = [targetUser, ...recent].slice(0, 5);
        setRecentSearches(nextRecent);
        localStorage.setItem('recent_searches', JSON.stringify(nextRecent));
      }
    } catch (err: any) {
      setError(err.response?.status === 404 ? 'GitHub developer profile not found.' : 'Failed to fetch developer scope from GitHub API.');
      setProfile(null);
      setStats(null);
      setRepos([]);
      setLanguages([]);
      setInsights(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(username);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex">
      <Sidebar
        activeTab={tab}
        setActiveTab={setTab}
        activeUser={searchedUser}
        favorites={favorites}
        onSelectFavorite={(user) => { setUsername(user); executeSearch(user); }}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Topbar
          username={username}
          setUsername={setUsername}
          onSearchSubmit={handleSearchSubmit}
          activeUser={searchedUser}
          onOpenMobileNav={() => setIsOpenMobile(true)}
          authUser={authUser}
          onGitHubLogin={handleGitHubLogin}
          onGitHubLogout={handleGitHubLogout}
        />

        <main className="p-4 lg:p-8 space-y-8 flex-1">
          {tab === 'compare' && <DeveloperCompare />}

          {tab !== 'compare' && (
            <>
              {recentSearches.length > 0 && !profile && !loading && (
                <div className="max-w-4xl mx-auto saas-card p-6 rounded-2xl text-center space-y-3">
                  <h3 className="text-base font-bold text-white">Analyze GitHub Developers</h3>
                  <p className="text-xs text-slate-400">Search any public GitHub username in the search bar above to fetch metrics.</p>
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400 flex-wrap pt-2">
                    <span>Recent Searches:</span>
                    {recentSearches.map(user => (
                      <button
                        key={user}
                        onClick={() => { setUsername(user); executeSearch(user); }}
                        className="bg-slate-900 hover:bg-slate-800 px-3 py-1 rounded-full text-slate-300 border border-slate-700/80 transition-colors cursor-pointer"
                      >
                        @{user}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {loading && <SkeletonLoader />}
              {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-center font-medium text-xs">{error}</div>}

              {profile && stats && !loading && (
                <>
                  {tab === 'overview' && (
                    <div className="space-y-8">
                      <div className="saas-card p-6 md:p-8 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        <div className="col-span-1 text-center border-b md:border-b-0 md:border-r border-slate-800/80 pb-6 md:pb-0 md:pr-6">
                          <img src={profile.avatarUrl} alt={profile.username} className="w-24 h-24 rounded-full mx-auto mb-3 border-2 border-blue-500/30 shadow-lg" />
                          <div className="flex items-center justify-center gap-2">
                            <h2 className="text-xl font-bold text-white">{profile.name || profile.username}</h2>
                            <button onClick={() => toggleFavorite(profile.username)} className="text-amber-400 hover:scale-110 transition-transform cursor-pointer">
                              {favorites.includes(profile.username) ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                            </button>
                          </div>
                          <p className="text-slate-400 text-xs mb-4">@{profile.username}</p>
                          <a 
                            href={profile.profileUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-xs px-3.5 py-1.5 rounded-xl border border-slate-700 transition-colors text-white font-medium"
                          >
                            GitHub Profile <ExternalLink size={12} />
                          </a>
                        </div>

                        <div className="col-span-2 space-y-4">
                          {profile.bio && <p className="text-slate-300 text-xs leading-relaxed">{profile.bio}</p>}
                          <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
                            {profile.company && <div className="flex items-center gap-2"><Building size={14}/> {profile.company}</div>}
                            {profile.location && <div className="flex items-center gap-2"><MapPin size={14}/> {profile.location}</div>}
                            <div className="flex items-center gap-2"><Users size={14}/> {profile.followers} followers · {profile.following} following</div>
                            <div className="flex items-center gap-2"><Calendar size={14}/> Joined {new Date(profile.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="saas-card p-5 rounded-2xl text-center space-y-1">
                          <div className="text-slate-400 text-xs flex items-center justify-center gap-1"><Star size={14}/> Total Stars</div>
                          <div className="text-2xl font-extrabold text-amber-400">{stats.totalStars}</div>
                        </div>
                        <div className="saas-card p-5 rounded-2xl text-center space-y-1">
                          <div className="text-slate-400 text-xs flex items-center justify-center gap-1"><GitFork size={14}/> Total Forks</div>
                          <div className="text-2xl font-extrabold text-slate-100">{stats.totalForks}</div>
                        </div>
                        <div className="saas-card p-5 rounded-2xl text-center space-y-1">
                          <div className="text-slate-400 text-xs">Original Repos</div>
                          <div className="text-2xl font-extrabold text-slate-100">{stats.originalRepos} <span className="text-xs font-normal text-slate-400">/ {profile.publicRepos}</span></div>
                        </div>
                        <div className="saas-card p-5 rounded-2xl text-center space-y-1">
                          <div className="text-slate-400 text-xs flex items-center justify-center gap-1"><Code2 size={14}/> Languages</div>
                          <div className="text-2xl font-extrabold text-blue-400">{stats.distinctLanguages}</div>
                        </div>
                      </div>

                      <LanguageAnalytics 
                        languages={languages} 
                        onSelectLanguage={(lang) => { setRepoLangFilter(lang); setTab('repos'); }} 
                      />
                    </div>
                  )}

                  {tab === 'repos' && <RepositoryExplorer repositories={repos} initialLanguageFilter={repoLangFilter} />}
                  {tab === 'languages' && <LanguageAnalytics languages={languages} onSelectLanguage={(lang) => { setRepoLangFilter(lang); setTab('repos'); }} />}
                  {tab === 'insights' && insights && <RepositoryInsightsView insights={insights} />}
                  {tab === 'report' && searchedUser && <DeveloperReportView username={searchedUser} />}
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
