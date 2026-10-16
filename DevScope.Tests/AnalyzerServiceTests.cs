using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using DevScope.Api.Models;
using DevScope.Api.Services;
using Microsoft.Extensions.Caching.Memory;
using Moq;
using Xunit;

namespace DevScope.Tests;

public class AnalyzerServiceTests
{
    private readonly Mock<IGitHubService> _mockGitHubService;
    private readonly IMemoryCache _cache;
    private readonly AnalyzerService _analyzerService;

    public AnalyzerServiceTests()
    {
        _mockGitHubService = new Mock<IGitHubService>();
        _cache = new MemoryCache(new MemoryCacheOptions());
        _analyzerService = new AnalyzerService(_mockGitHubService.Object, _cache);
    }

    [Fact]
    public async Task GetDeveloperStatsAsync_CalculatesTotalStarsAndForksCorrectly()
    {
        // Arrange
        var repos = new List<RepositoryDto>
        {
            new("repo1", "desc1", "url1", "C#", 10, 5, 0, false, false, "MIT", "main", DateTime.UtcNow, DateTime.UtcNow),
            new("repo2", "desc2", "url2", "TypeScript", 20, 15, 0, false, false, "MIT", "main", DateTime.UtcNow, DateTime.UtcNow),
            new("repo3", "desc3", "url3", "C#", 5, 2, 0, true, true, "MIT", "main", DateTime.UtcNow, DateTime.UtcNow)
        };

        _mockGitHubService
            .Setup(s => s.GetRepositoriesAsync("testuser", 1, 100, "stars", It.IsAny<CancellationToken>()))
            .ReturnsAsync(repos);

        // Act
        var stats = await _analyzerService.GetDeveloperStatsAsync("testuser", CancellationToken.None);

        // Assert
        Assert.Equal(35, stats.TotalStars);
        Assert.Equal(22, stats.TotalForks);
        Assert.Equal(2, stats.DistinctLanguages);
        Assert.Equal(2, stats.OriginalRepos);
        Assert.Equal(1, stats.ForkedRepos);
        Assert.Equal(1, stats.ArchivedRepos);
        Assert.Equal("C#", stats.MostUsedLanguage);
        Assert.Equal("repo2", stats.MostStarredRepo?.Name);
    }

    [Fact]
    public async Task GetRepositoryInsightsAsync_CalculatesHeuristicAndBucketsCorrectly()
    {
        // Arrange
        var repos = new List<RepositoryDto>
        {
            new("repo1", "desc1", "url1", "C#", 60, 10, 0, false, false, "MIT", "main", DateTime.UtcNow, DateTime.UtcNow.AddDays(-10)),
            new("repo2", "desc2", "url2", "TypeScript", 5, 1, 0, false, true, "MIT", "main", DateTime.UtcNow, DateTime.UtcNow.AddDays(-100))
        };

        _mockGitHubService
            .Setup(s => s.GetRepositoriesAsync("insightuser", 1, 100, "updated", It.IsAny<CancellationToken>()))
            .ReturnsAsync(repos);

        // Act
        var insights = await _analyzerService.GetRepositoryInsightsAsync("insightuser", CancellationToken.None);

        // Assert
        Assert.Equal(2, insights.TotalReposAnalyzed);
        Assert.Equal(1, insights.ActiveReposCount);
        Assert.Equal(1, insights.ArchivedReposCount);
        Assert.Equal(1, insights.ReposUpdatedLast30Days);
        Assert.True(insights.EngagementHeuristicScore > 0);
    }
}
