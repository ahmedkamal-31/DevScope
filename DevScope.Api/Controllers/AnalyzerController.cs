using Microsoft.AspNetCore.Mvc;
using DevScope.Api.Services;
using DevScope.Api.Models;

namespace DevScope.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalyzerController : ControllerBase
{
    private readonly IAnalyzerService _analyzerService;
    private readonly IGitHubService _gitHubService;

    public AnalyzerController(IAnalyzerService analyzerService, IGitHubService gitHubService)
    {
        _analyzerService = analyzerService;
        _gitHubService = gitHubService;
    }

    [HttpGet("{username}")]
    public async Task<ActionResult<DeveloperProfileDto>> GetProfile(string username, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(username))
            return BadRequest(new ProblemDetails { Title = "Username is required" });

        var profile = await _analyzerService.GetProfileAsync(username, ct);
        if (profile == null)
            return NotFound(new ProblemDetails { Title = "GitHub user not found", Detail = $"No user found with username '{username}'" });

        return Ok(profile);
    }

    [HttpGet("{username}/repositories")]
    public async Task<ActionResult<IEnumerable<RepositoryDto>>> GetRepositories(
        string username,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12,
        [FromQuery] string sortBy = "stars",
        CancellationToken ct = default)
    {
        var repos = await _gitHubService.GetRepositoriesAsync(username, page, pageSize, sortBy, ct);
        return Ok(repos);
    }

    [HttpGet("{username}/languages")]
    public async Task<ActionResult<IEnumerable<LanguageStatDto>>> GetLanguages(string username, CancellationToken ct)
    {
        var langs = await _analyzerService.GetLanguageStatsAsync(username, ct);
        return Ok(langs);
    }

    [HttpGet("{username}/top-repositories")]
    public async Task<ActionResult<IEnumerable<RepositoryDto>>> GetTopRepositories(
        string username,
        [FromQuery] int limit = 5,
        [FromQuery] string sortBy = "stars",
        CancellationToken ct = default)
    {
        var topRepos = await _analyzerService.GetTopRepositoriesAsync(username, limit, sortBy, ct);
        return Ok(topRepos);
    }

    [HttpGet("{username}/stats")]
    public async Task<ActionResult<DeveloperStatsDto>> GetStats(string username, CancellationToken ct)
    {
        var stats = await _analyzerService.GetDeveloperStatsAsync(username, ct);
        return Ok(stats);
    }

    [HttpGet("{username}/insights")]
    public async Task<ActionResult<RepositoryInsightsDto>> GetInsights(string username, CancellationToken ct)
    {
        var insights = await _analyzerService.GetRepositoryInsightsAsync(username, ct);
        return Ok(insights);
    }

    [HttpGet("compare")]
    public async Task<ActionResult<DeveloperComparisonDto>> Compare(
        [FromQuery] string user1,
        [FromQuery] string user2,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(user1) || string.IsNullOrWhiteSpace(user2))
            return BadRequest(new ProblemDetails { Title = "Both user1 and user2 parameters are required" });

        var comparison = await _analyzerService.CompareDevelopersAsync(user1, user2, ct);
        if (comparison == null)
            return NotFound(new ProblemDetails { Title = "Comparison failed", Detail = "One or both GitHub users could not be found." });

        return Ok(comparison);
    }

    [HttpGet("{username}/report")]
    public async Task<ActionResult<DeveloperReportDto>> GetReport(string username, CancellationToken ct)
    {
        var report = await _analyzerService.GetDeveloperReportAsync(username, ct);
        if (report == null)
            return NotFound(new ProblemDetails { Title = "Report generation failed", Detail = $"No developer found with username '{username}'" });

        return Ok(report);
    }
}
