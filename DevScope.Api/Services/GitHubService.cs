using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using DevScope.Api.Models;

namespace DevScope.Api.Services;

public interface IGitHubService
{
    Task<DeveloperProfileDto?> GetProfileAsync(string username, CancellationToken ct = default);
    Task<IEnumerable<RepositoryDto>> GetRepositoriesAsync(string username, int page = 1, int pageSize = 100, string sortBy = "stars", CancellationToken ct = default);
    Task<Dictionary<string, long>> GetRepositoryLanguagesAsync(string username, string repoName, CancellationToken ct = default);
}

public class GitHubService : IGitHubService
{
    private readonly HttpClient _httpClient;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<GitHubService> _logger;
    private readonly string? _fallbackToken;

    public GitHubService(HttpClient httpClient, IConfiguration config, IHttpContextAccessor httpContextAccessor, ILogger<GitHubService> logger)
    {
        _httpClient = httpClient;
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;

        _httpClient.BaseAddress = new Uri("https://api.github.com/");
        _httpClient.DefaultRequestHeaders.UserAgent.Add(new ProductInfoHeaderValue("DevScopeAnalyzer", "1.0"));
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.github.v3+json"));

        _fallbackToken = config["GitHub:Token"];
    }

    private void ApplyAuthorizationHeader()
    {
        var context = _httpContextAccessor.HttpContext;
        string? userOAuthToken = null;

        if (context != null)
        {
            if (context.Request.Headers.TryGetValue("X-GitHub-Token", out var tokenHeader))
            {
                userOAuthToken = tokenHeader.ToString();
            }
            else if (context.Request.Headers.TryGetValue("Authorization", out var authHeader))
            {
                var val = authHeader.ToString();
                if (val.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    userOAuthToken = val.Substring(7);
                }
            }
        }

        var effectiveToken = !string.IsNullOrEmpty(userOAuthToken) ? userOAuthToken : _fallbackToken;

        if (!string.IsNullOrEmpty(effectiveToken) && effectiveToken != "ضع_الـ_TOKEN_الخاص_بك_هنا")
        {
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", effectiveToken);
        }
        else
        {
            _httpClient.DefaultRequestHeaders.Authorization = null;
        }
    }

    public async Task<DeveloperProfileDto?> GetProfileAsync(string username, CancellationToken ct = default)
    {
        ApplyAuthorizationHeader();
        try
        {
            string endpoint = username.Equals("user", StringComparison.OrdinalIgnoreCase) ? "user" : $"users/{username}";
            var response = await _httpClient.GetAsync(endpoint, ct);
            if (response.StatusCode == HttpStatusCode.NotFound) return null;
            if (response.StatusCode == HttpStatusCode.Forbidden || (int)response.StatusCode == 429)
            {
                _logger.LogWarning("GitHub API rate limit hit for profile fetch.");
                throw new InvalidOperationException("GitHub API rate limit exceeded. Please sign in with GitHub for 5,000 requests/hr.");
            }

            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync(ct);
            using var doc = JsonDocument.Parse(content);
            var json = doc.RootElement;

            return new DeveloperProfileDto(
                Username: json.GetProperty("login").GetString() ?? username,
                Name: json.TryGetProperty("name", out var n) && n.ValueKind != JsonValueKind.Null ? n.GetString()! : string.Empty,
                AvatarUrl: json.TryGetProperty("avatar_url", out var a) && a.ValueKind != JsonValueKind.Null ? a.GetString()! : string.Empty,
                Bio: json.TryGetProperty("bio", out var b) && b.ValueKind != JsonValueKind.Null ? b.GetString()! : string.Empty,
                ProfileUrl: json.TryGetProperty("html_url", out var h) && h.ValueKind != JsonValueKind.Null ? h.GetString()! : string.Empty,
                Company: json.TryGetProperty("company", out var c) && c.ValueKind != JsonValueKind.Null ? c.GetString()! : string.Empty,
                Location: json.TryGetProperty("location", out var l) && l.ValueKind != JsonValueKind.Null ? l.GetString()! : string.Empty,
                Blog: json.TryGetProperty("blog", out var bl) && bl.ValueKind != JsonValueKind.Null ? bl.GetString()! : string.Empty,
                Email: json.TryGetProperty("email", out var e) && e.ValueKind != JsonValueKind.Null ? e.GetString()! : string.Empty,
                PublicRepos: json.GetProperty("public_repos").GetInt32(),
                Followers: json.GetProperty("followers").GetInt32(),
                Following: json.GetProperty("following").GetInt32(),
                CreatedAt: json.GetProperty("created_at").GetDateTime()
            );
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP error fetching profile for user {Username}", username);
            throw;
        }
    }

    public async Task<IEnumerable<RepositoryDto>> GetRepositoriesAsync(string username, int page = 1, int pageSize = 100, string sortBy = "stars", CancellationToken ct = default)
    {
        ApplyAuthorizationHeader();
        pageSize = Math.Clamp(pageSize, 1, 100);
        page = Math.Max(1, page);

        string sortParam = sortBy.ToLower() switch
        {
            "stars" => "stars",
            "forks" => "forks",
            "updated" => "updated",
            _ => "full_name"
        };

        var response = await _httpClient.GetAsync($"users/{username}/repos?page={page}&per_page={pageSize}&sort={sortParam}", ct);
        if (!response.IsSuccessStatusCode) return Array.Empty<RepositoryDto>();

        var content = await response.Content.ReadAsStringAsync(ct);
        using var doc = JsonDocument.Parse(content);

        var repos = new List<RepositoryDto>();
        foreach (var repo in doc.RootElement.EnumerateArray())
        {
            repos.Add(new RepositoryDto(
                Name: repo.GetProperty("name").GetString() ?? string.Empty,
                Description: repo.TryGetProperty("description", out var d) && d.ValueKind != JsonValueKind.Null ? d.GetString()! : string.Empty,
                Url: repo.GetProperty("html_url").GetString() ?? string.Empty,
                Language: repo.TryGetProperty("language", out var lang) && lang.ValueKind != JsonValueKind.Null ? lang.GetString()! : string.Empty,
                Stars: repo.GetProperty("stargazers_count").GetInt32(),
                Forks: repo.GetProperty("forks_count").GetInt32(),
                OpenIssues: repo.GetProperty("open_issues_count").GetInt32(),
                IsFork: repo.GetProperty("fork").GetBoolean(),
                IsArchived: repo.TryGetProperty("archived", out var arch) && arch.GetBoolean(),
                License: repo.TryGetProperty("license", out var lic) && lic.ValueKind != JsonValueKind.Null && lic.TryGetProperty("name", out var licName) ? licName.GetString() ?? "None" : "None",
                DefaultBranch: repo.TryGetProperty("default_branch", out var db) ? db.GetString() ?? "main" : "main",
                CreatedAt: repo.GetProperty("created_at").GetDateTime(),
                UpdatedAt: repo.GetProperty("updated_at").GetDateTime()
            ));
        }

        return sortBy.ToLower() switch
        {
            "stars" => repos.OrderByDescending(r => r.Stars),
            "forks" => repos.OrderByDescending(r => r.Forks),
            "updated" => repos.OrderByDescending(r => r.UpdatedAt),
            _ => repos.OrderBy(r => r.Name)
        };
    }

    public async Task<Dictionary<string, long>> GetRepositoryLanguagesAsync(string username, string repoName, CancellationToken ct = default)
    {
        ApplyAuthorizationHeader();
        var response = await _httpClient.GetAsync($"repos/{username}/{repoName}/languages", ct);
        if (!response.IsSuccessStatusCode) return new Dictionary<string, long>();

        var content = await response.Content.ReadAsStringAsync(ct);
        return JsonSerializer.Deserialize<Dictionary<string, long>>(content) ?? new Dictionary<string, long>();
    }
}
