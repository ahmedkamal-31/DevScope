import React, { useState } from 'react';
import { Star, GitFork, ExternalLink, Filter, Search, ChevronLeft, ChevronRight, Archive, ShieldAlert } from 'lucide-react';
import { type Repository } from '../api/client';

interface Props {
  repositories: Repository[];
  initialLanguageFilter?: string;
}

export const RepositoryExplorer: React.FC<Props> = ({ repositories, initialLanguageFilter = 'All' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLanguageFilter);
  const [filterType, setFilterType] = useState<'all' | 'original' | 'forks'>('all');
  const [archiveFilter, setArchiveFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'stars' | 'forks' | 'updated' | 'name'>('stars');
  
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const languages = ['All', ...Array.from(new Set(repositories.map(r => r.language).filter(Boolean)))];

  const filtered = repositories
    .filter(repo => {
      const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesLang = selectedLanguage === 'All' || repo.language === selectedLanguage;
      const matchesType = filterType === 'all' || (filterType === 'original' && !repo.isFork) || (filterType === 'forks' && repo.isFork);
      const matchesArchive = archiveFilter === 'all' || (archiveFilter === 'active' && !repo.isArchived) || (archiveFilter === 'archived' && repo.isArchived);

      return matchesSearch && matchesLang && matchesType && matchesArchive;
    })
    .sort((a, b) => {
      if (sortBy === 'stars') return b.stars - a.stars;
      if (sortBy === 'forks') return b.forks - a.forks;
      if (sortBy === 'updated') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      return a.name.localeCompare(b.name);
    });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedRepos = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="saas-card p-4 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Filter repositories..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto text-xs">
            <div className="flex items-center gap-1 text-slate-400 font-medium">
              <Filter size={14} /> Filters:
            </div>

            <select
              className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-2 focus:outline-none"
              value={selectedLanguage}
              onChange={(e) => { setSelectedLanguage(e.target.value); setCurrentPage(1); }}
            >
              {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
            </select>

            <select
              className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-2 focus:outline-none"
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value as any); setCurrentPage(1); }}
            >
              <option value="all">All Types</option>
              <option value="original">Originals</option>
              <option value="forks">Forks</option>
            </select>

            <select
              className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-2 focus:outline-none"
              value={archiveFilter}
              onChange={(e) => { setArchiveFilter(e.target.value as any); setCurrentPage(1); }}
            >
              <option value="all">Active & Archived</option>
              <option value="active">Active Only</option>
              <option value="archived">Archived Only</option>
            </select>

            <select
              className="bg-slate-900 border border-slate-800 text-blue-400 font-semibold rounded-lg p-2 focus:outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="stars">Sort: Stars</option>
              <option value="forks">Sort: Forks</option>
              <option value="updated">Sort: Last Updated</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginatedRepos.map(repo => (
          <div key={repo.name} className="saas-card saas-card-hover p-5 rounded-2xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-start mb-2 gap-2">
                <a 
                  href={repo.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-base font-bold text-blue-400 hover:underline flex items-center gap-1.5 truncate"
                >
                  {repo.name} <ExternalLink size={12} />
                </a>
                <div className="flex gap-1.5 shrink-0">
                  {repo.isFork && <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">Fork</span>}
                  {repo.isArchived && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1"><Archive size={10}/> Archived</span>}
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 h-8">
                {repo.description || 'No description provided for this repository.'}
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-800/80 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-3">
                  {repo.language && <span className="text-slate-200 font-medium flex items-center gap-1">🟢 {repo.language}</span>}
                  <span className="flex items-center gap-1 text-amber-400 font-semibold"><Star size={13} /> {repo.stars}</span>
                  <span className="flex items-center gap-1"><GitFork size={13} /> {repo.forks}</span>
                  {repo.openIssues > 0 && <span className="flex items-center gap-1 text-red-400"><ShieldAlert size={13} /> {repo.openIssues}</span>}
                </div>
                <span className="text-[10px] text-slate-400">{repo.license !== 'None' ? repo.license : ''}</span>
              </div>
              <div className="text-[10px] text-slate-400 flex justify-between">
                <span>Created: {new Date(repo.createdAt).toLocaleDateString()}</span>
                <span>Updated: {new Date(repo.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="saas-card p-12 rounded-2xl text-center text-slate-400 space-y-2">
          <p className="text-base font-semibold text-white">No repositories match your selected filters.</p>
          <p className="text-xs">Adjust search query or dropdown filter constraints.</p>
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between saas-card p-3.5 rounded-xl text-xs">
          <span className="text-slate-400">
            Page <span className="font-semibold text-white">{currentPage}</span> of <span className="font-semibold text-white">{totalPages}</span> ({filtered.length} Repos)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition-colors text-white cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition-colors text-white cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
