namespace DevScope.Api.Models;

public record DeveloperProfileDto(
    string Username,
    string Name,
    string AvatarUrl,
    string Bio,
    string ProfileUrl,
    string Company,
    string Location,
    string Blog,
    string Email,
    int PublicRepos,
    int Followers,
    int Following,
    DateTime CreatedAt
);

public record RepositoryDto(
    string Name,
    string Description,
    string Url,
    string Language,
    int Stars,
    int Forks,
    int OpenIssues,
    bool IsFork,
    bool IsArchived,
    string License,
    string DefaultBranch,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record LanguageStatDto(
    string Language,
    long Bytes,
    double Percentage,
    int RepositoryCount
);

public record DeveloperStatsDto(
    int TotalStars,
    int TotalForks,
    int DistinctLanguages,
    int OriginalRepos,
    int ForkedRepos,
    int ArchivedRepos,
    RepositoryDto? MostStarredRepo,
    RepositoryDto? MostRecentlyUpdatedRepo,
    string? MostUsedLanguage
);

public record StarDistributionBucket(
    string Range,
    int Count
);

public record RepositoryInsightsDto(
    int TotalReposAnalyzed,
    int ActiveReposCount,
    int ArchivedReposCount,
    int ReposUpdatedLast30Days,
    int ReposUpdatedLast90Days,
    int ReposUpdatedLast365Days,
    int ReposOlderThan1Year,
    double EngagementHeuristicScore, // Score out of 100 based on stars, forks, and recency
    List<StarDistributionBucket> StarDistribution,
    RepositoryDto? PrimaryRepository
);

public record DeveloperComparisonDto(
    DeveloperProfileDto Profile1,
    DeveloperStatsDto Stats1,
    DeveloperProfileDto Profile2,
    DeveloperStatsDto Stats2,
    int StarsDelta, // Stars2 - Stars1
    int FollowersDelta,
    int PublicReposDelta,
    int LanguagesDelta
);

public record DeveloperReportDto(
    DeveloperProfileDto Profile,
    DeveloperStatsDto Stats,
    List<LanguageStatDto> TopLanguages,
    List<RepositoryDto> TopRepositories,
    RepositoryInsightsDto Insights,
    DateTime GeneratedAt
);
