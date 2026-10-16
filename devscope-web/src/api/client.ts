import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor: Attach saved user OAuth Token automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('github_oauth_token');
  if (token) {
    config.headers['X-GitHub-Token'] = token;
  }
  return config;
});

export interface Profile {
  username: string;
  name: string;
  avatarUrl: string;
  bio: string;
  profileUrl: string;
  company: string;
  location: string;
  blog: string;
  email: string;
  publicRepos: number;
  followers: number;
  following: number;
  createdAt: string;
}

export interface Repository {
  name: string;
  description: string;
  url: string;
  language: string;
  stars: number;
  forks: number;
  openIssues: number;
  isFork: boolean;
  isArchived: boolean;
  license: string;
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
}

export interface LanguageStat {
  language: string;
  bytes: number;
  percentage: number;
  repositoryCount: number;
}

export interface Stats {
  totalStars: number;
  totalForks: number;
  distinctLanguages: number;
  originalRepos: number;
  forkedRepos: number;
  archivedRepos: number;
  mostStarredRepo: Repository | null;
  mostRecentlyUpdatedRepo: Repository | null;
  mostUsedLanguage: string | null;
}

export interface StarDistributionBucket {
  range: string;
  count: number;
}

export interface RepositoryInsights {
  totalReposAnalyzed: number;
  activeReposCount: number;
  archivedReposCount: number;
  reposUpdatedLast30Days: number;
  reposUpdatedLast90Days: number;
  reposUpdatedLast365Days: number;
  reposOlderThan1Year: number;
  engagementHeuristicScore: number;
  starDistribution: StarDistributionBucket[];
  primaryRepository: Repository | null;
}

export interface DeveloperComparison {
  profile1: Profile;
  stats1: Stats;
  profile2: Profile;
  stats2: Stats;
  starsDelta: number;
  followersDelta: number;
  publicReposDelta: number;
  languagesDelta: number;
}

export interface DeveloperReport {
  profile: Profile;
  stats: Stats;
  topLanguages: LanguageStat[];
  topRepositories: Repository[];
  insights: RepositoryInsights;
  generatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  userProfile: Profile;
}

export const getProfile = (username: string) => apiClient.get<Profile>(`/analyzer/${username}`);
export const getStats = (username: string) => apiClient.get<Stats>(`/analyzer/${username}/stats`);
export const getRepositories = (username: string, page = 1, pageSize = 100, sortBy = 'stars') => 
  apiClient.get<Repository[]>(`/analyzer/${username}/repositories`, { params: { page, pageSize, sortBy } });
export const getLanguages = (username: string) => apiClient.get<LanguageStat[]>(`/analyzer/${username}/languages`);
export const getTopRepositories = (username: string, limit = 5, sortBy = 'stars') => 
  apiClient.get<Repository[]>(`/analyzer/${username}/top-repositories`, { params: { limit, sortBy } });
export const getInsights = (username: string) => apiClient.get<RepositoryInsights>(`/analyzer/${username}/insights`);
export const getComparison = (user1: string, user2: string) => apiClient.get<DeveloperComparison>(`/analyzer/compare`, { params: { user1, user2 } });
export const getReport = (username: string) => apiClient.get<DeveloperReport>(`/analyzer/${username}/report`);

// Auth API Calls
export const getGitHubLoginUrl = () => apiClient.get<{ url: string }>('/auth/login-url');
export const handleOAuthCallback = (code: string) => apiClient.post<AuthResponse>('/auth/callback', { code });
