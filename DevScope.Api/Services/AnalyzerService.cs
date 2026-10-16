using Microsoft.Extensions.Caching.Memory;
using DevScope.Api.Models;

namespace DevScope.Api.Services;

public interface IAnalyzerService
{
    Task<DeveloperProfileDto?> GetProfileAsync(string username, CancellationToken ct = default);
    Task<DeveloperStatsDto> GetDeveloperStatsAsync(string username, CancellationToken ct = default);
    Task<IEnumerable<LanguageStatDto>> GetLanguageStatsAsync(string username, CancellationToken ct = default);
    Task<IEnumerable<RepositoryDto>> GetTopRepositoriesAsync(string username, int limit = 5, string sortBy = "stars", CancellationToken ct = default);
    Task<RepositoryInsightsDto> GetRepositoryInsightsAsync(string username, CancellationToken ct = default);
    Task<DeveloperComparisonDto?> CompareDevelopersAsync(string user1, string user2, CancellationToken ct = default);
    Task<DeveloperReportDto?> GetDeveloperReportAsync(string username, CancellationToken ct = default);
}

public class AnalyzerService : IAnalyzerService
{
    private readonly IGitHubService _gitHubService;
    private readonly IMemoryCache _cache;
    private readonly TimeSpan _cacheTtl = TimeSpan.FromHours(2);

    public AnalyzerService(IGitHubService gitHubService, IMemoryCache cache)
    {
        _gitHubService = gitHubService;
        _cache = cache;
    }

    public async Task<DeveloperProfileDto?> GetProfileAsync(string username, CancellationToken ct = default)
    {
        string cacheKey = $"profile_{username.ToLower()}";
        return await _cache.GetOrCreateAsync(cacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = _cacheTtl;
            return await _gitHubService.GetProfileAsync(username, ct);
        });
    }

    public async Task<DeveloperStatsDto> GetDeveloperStatsAsync(string username, CancellationToken ct = default)
    {
        string cacheKey = $"stats_{username.ToLower()}";
        return await _cache.GetOrCreateAsync(cacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = _cacheTtl;
            var repos = (await _gitHubService.GetRepositoriesAsync(username, 1, 100, "stars", ct)).ToList();

            var languages = repos.Where(r => !string.IsNullOrEmpty(r.Language)).Select(r => r.Language).Distinct();
            var mostStarred = repos.OrderByDescending(r => r.Stars).FirstOrDefault();
            var mostRecent = repos.OrderByDescending(r => r.UpdatedAt).FirstOrDefault();
            var topLanguage = repos.GroupBy(r => r.Language)
                                   .Where(g => !string.IsNullOrEmpty(g.Key))
                                   .OrderByDescending(g => g.Count())
                                   .FirstOrDefault()?.Key;

            return new DeveloperStatsDto(
                TotalStars: repos.Sum(r => r.Stars),
                TotalForks: repos.Sum(r => r.Forks),
                DistinctLanguages: languages.Count(),
                OriginalRepos: repos.Count(r => !r.IsFork),
                ForkedRepos: repos.Count(r => r.IsFork),
                ArchivedRepos: repos.Count(r => r.IsArchived),
                MostStarredRepo: mostStarred,
                MostRecentlyUpdatedRepo: mostRecent,
                MostUsedLanguage: topLanguage
            );
        }) ?? new DeveloperStatsDto(0, 0, 0, 0, 0, 0, null, null, null);
    }

    public async Task<IEnumerable<LanguageStatDto>> GetLanguageStatsAsync(string username, CancellationToken ct = default)
    {
        string cacheKey = $"lang_stats_{username.ToLower()}";
        return await _cache.GetOrCreateAsync<IEnumerable<LanguageStatDto>>(cacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(12);
            var repos = (await _gitHubService.GetRepositoriesAsync(username, 1, 100, "stars", ct))
                        .Where(r => !r.IsFork)
                        .Take(5) // تحسين أداء: جلب لغات أحدث وأكبر 5 مستودعات فقط لمنع استهلاك الـ Rate Limit
                        .ToList();

            var languageBytes = new Dictionary<string, long>();
            var languageRepoCounts = new Dictionary<string, int>();

            foreach (var repo in repos)
            {
                var repoLangs = await _gitHubService.GetRepositoryLanguagesAsync(username, repo.Name, ct);
                foreach (var kvp in repoLangs)
                {
                    if (languageBytes.ContainsKey(kvp.Key))
                    {
                        languageBytes[kvp.Key] += kvp.Value;
                        languageRepoCounts[kvp.Key] += 1;
                    }
                    else
                    {
                        languageBytes[kvp.Key] = kvp.Value;
                        languageRepoCounts[kvp.Key] = 1;
                    }
                }
            }

            var totalBytes = languageBytes.Values.Sum();
            if (totalBytes == 0) return Array.Empty<LanguageStatDto>();

            return languageBytes.Select(kvp => new LanguageStatDto(
                Language: kvp.Key,
                Bytes: kvp.Value,
                Percentage: Math.Round((double)kvp.Value / totalBytes * 100, 2),
                RepositoryCount: languageRepoCounts[kvp.Key]
            )).OrderByDescending(l => l.Bytes).ToList();
        }) ?? Array.Empty<LanguageStatDto>();
    }

    public async Task<IEnumerable<RepositoryDto>> GetTopRepositoriesAsync(string username, int limit = 5, string sortBy = "stars", CancellationToken ct = default)
    {
        limit = Math.Clamp(limit, 1, 50);
        var repos = await _gitHubService.GetRepositoriesAsync(username, 1, limit, sortBy, ct);
        return repos.Take(limit);
    }

    public async Task<RepositoryInsightsDto> GetRepositoryInsightsAsync(string username, CancellationToken ct = default)
    {
        string cacheKey = $"insights_{username.ToLower()}";
        return await _cache.GetOrCreateAsync(cacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = _cacheTtl;
            var repos = (await _gitHubService.GetRepositoriesAsync(username, 1, 100, "updated", ct)).ToList();

            if (!repos.Any())
            {
                return new RepositoryInsightsDto(0, 0, 0, 0, 0, 0, 0, 0, new List<StarDistributionBucket>(), null);
            }

            var now = DateTime.UtcNow;
            int activeCount = repos.Count(r => !r.IsArchived);
            int archivedCount = repos.Count(r => r.IsArchived);
            int updated30 = repos.Count(r => (now - r.UpdatedAt).TotalDays <= 30);
            int updated90 = repos.Count(r => (now - r.UpdatedAt).TotalDays <= 90);
            int updated365 = repos.Count(r => (now - r.UpdatedAt).TotalDays <= 365);
            int olderThanYear = repos.Count(r => (now - r.UpdatedAt).TotalDays > 365);

            double totalStars = repos.Sum(r => r.Stars);
            double totalForks = repos.Sum(r => r.Forks);
            double starScore = Math.Min(50, totalStars * 1.5);
            double forkScore = Math.Min(30, totalForks * 2.0);
            double recencyScore = Math.Min(20, updated90 * 4.0);
            double totalScore = Math.Round(Math.Min(100, starScore + forkScore + recencyScore), 1);

            var starBuckets = new List<StarDistributionBucket>
            {
                new("0 Stars", repos.Count(r => r.Stars == 0)),
                new("1-10 Stars", repos.Count(r => r.Stars >= 1 && r.Stars <= 10)),
                new("11-50 Stars", repos.Count(r => r.Stars >= 11 && r.Stars <= 50)),
                new("50+ Stars", repos.Count(r => r.Stars > 50))
            };

            var primaryRepo = repos.OrderByDescending(r => r.Stars).FirstOrDefault();

            return new RepositoryInsightsDto(
                TotalReposAnalyzed: repos.Count,
                ActiveReposCount: activeCount,
                ArchivedReposCount: archivedCount,
                ReposUpdatedLast30Days: updated30,
                ReposUpdatedLast90Days: updated90,
                ReposUpdatedLast365Days: updated365,
                ReposOlderThan1Year: olderThanYear,
                EngagementHeuristicScore: totalScore,
                StarDistribution: starBuckets,
                PrimaryRepository: primaryRepo
            );
        }) ?? new RepositoryInsightsDto(0, 0, 0, 0, 0, 0, 0, 0, new List<StarDistributionBucket>(), null);
    }

    public async Task<DeveloperComparisonDto?> CompareDevelopersAsync(string user1, string user2, CancellationToken ct = default)
    {
        var p1Task = GetProfileAsync(user1, ct);
        var s1Task = GetDeveloperStatsAsync(user1, ct);
        var p2Task = GetProfileAsync(user2, ct);
        var s2Task = GetDeveloperStatsAsync(user2, ct);

        await Task.WhenAll(p1Task, s1Task, p2Task, s2Task);

        var p1 = await p1Task;
        var p2 = await p2Task;

        if (p1 == null || p2 == null) return null;

        var s1 = await s1Task;
        var s2 = await s2Task;

        return new DeveloperComparisonDto(
            Profile1: p1,
            Stats1: s1,
            Profile2: p2,
            Stats2: s2,
            StarsDelta: s2.TotalStars - s1.TotalStars,
            FollowersDelta: p2.Followers - p1.Followers,
            PublicReposDelta: p2.PublicRepos - p1.PublicRepos,
            LanguagesDelta: s2.DistinctLanguages - s1.DistinctLanguages
        );
    }

    public async Task<DeveloperReportDto?> GetDeveloperReportAsync(string username, CancellationToken ct = default)
    {
        var profile = await GetProfileAsync(username, ct);
        if (profile == null) return null;

        var stats = await GetDeveloperStatsAsync(username, ct);
        var langs = (await GetLanguageStatsAsync(username, ct)).Take(5).ToList();
        var topRepos = (await GetTopRepositoriesAsync(username, 5, "stars", ct)).ToList();
        var insights = await GetRepositoryInsightsAsync(username, ct);

        return new DeveloperReportDto(
            Profile: profile,
            Stats: stats,
            TopLanguages: langs,
            TopRepositories: topRepos,
            Insights: insights,
            GeneratedAt: DateTime.UtcNow
        );
    }
}
