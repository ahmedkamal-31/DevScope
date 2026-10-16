import React, { useState } from 'react';
import { Star, GitFork, ExternalLink, Filter, Search } from 'lucide-react';
import { type Repository } from '../api/client';

interface Props {
  repositories: Repository[];
}

export const RepositoryList: React.FC<Props> = ({ repositories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [filterType, setFilterType] = useState<'all' | 'original' | 'forks'>('all');

  const languages = ['All', ...Array.from(new Set(repositories.map(r => r.language).filter(Boolean)))];

  const filtered = repositories.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLang = selectedLanguage === 'All' || repo.language === selectedLanguage;
    const matchesType = filterType === 'all' || (filterType === 'original' && !repo.isFork) || (filterType === 'forks' && repo.isFork);

    return matchesSearch && matchesLang && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface p-4 rounded-xl border border-slate-700">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 text-textMuted" size={18} />
          <input
            type="text"
            placeholder="Search repositories..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1 text-sm text-textMuted">
            <Filter size={16} /> Filter:
          </div>

          <select
            className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg p-2 focus:outline-none"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
          </select>

          <select
            className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg p-2 focus:outline-none"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
          >
            <option value="all">All Types</option>
            <option value="original">Original Only</option>
            <option value="forks">Forks Only</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(repo => (
          <div key={repo.name} className="bg-surface p-5 rounded-xl border border-slate-700 hover:border-slate-500 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <a 
                  href={repo.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-lg font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  {repo.name} <ExternalLink size={14} />
                </a>
                {repo.isFork && <span className="text-xs bg-slate-700 text-textMuted px-2 py-0.5 rounded-full">Fork</span>}
              </div>
              <p className="text-textMuted text-sm line-clamp-2 mb-4 h-10">
                {repo.description || 'No description provided.'}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-textMuted pt-4 border-t border-slate-800">
              <div className="flex items-center gap-4">
                {repo.language && <span className="flex items-center gap-1 text-slate-300">🟢 {repo.language}</span>}
                <span className="flex items-center gap-1"><Star size={14} /> {repo.stars}</span>
                <span className="flex items-center gap-1"><GitFork size={14} /> {repo.forks}</span>
              </div>
              <span>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-textMuted">
          No repositories found matching your current filters.
        </div>
      )}
    </div>
  );
};
