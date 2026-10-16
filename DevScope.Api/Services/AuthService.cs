using System.Net.Http.Headers;
using System.Text.Json;
using DevScope.Api.Models;

namespace DevScope.Api.Services;

public interface IAuthService
{
    string GetGitHubLoginUrl();
    Task<AuthResponseDto?> ExchangeCodeAsync(string code, CancellationToken ct = default);
}

public class AuthService : IAuthService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthService> _logger;

    public AuthService(HttpClient httpClient, IConfiguration config, ILogger<AuthService> logger)
    {
        _httpClient = httpClient;
        _config = config;
        _logger = logger;
    }

    public string GetGitHubLoginUrl()
    {
        var clientId = _config["GitHub:ClientId"];
        var redirectUri = _config["GitHub:RedirectUri"] ?? "http://localhost:5173";
        return $"https://github.com/login/oauth/authorize?client_id={clientId}&redirect_uri={Uri.EscapeDataString(redirectUri)}&scope=read:user";
    }

    public async Task<AuthResponseDto?> ExchangeCodeAsync(string code, CancellationToken ct = default)
    {
        var clientId = _config["GitHub:ClientId"];
        var clientSecret = _config["GitHub:ClientSecret"];

        var requestBody = new Dictionary<string, string>
        {
            { "client_id", clientId ?? "" },
            { "client_secret", clientSecret ?? "" },
            { "code", code }
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://github.com/login/oauth/access_token")
        {
            Content = new FormUrlEncodedContent(requestBody)
        };
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        var response = await _httpClient.SendAsync(request, ct);
        if (!response.IsSuccessStatusCode) return null;

        var jsonStr = await response.Content.ReadAsStringAsync(ct);
        using var doc = JsonDocument.Parse(jsonStr);
        var root = doc.RootElement;

        if (root.TryGetProperty("error", out var errProp))
        {
            _logger.LogWarning("GitHub OAuth error: {Error} - {Desc}", errProp.GetString(), root.TryGetProperty("error_description", out var d) ? d.GetString() : "");
            return null;
        }

        if (!root.TryGetProperty("access_token", out var tokenProp))
        {
            _logger.LogWarning("GitHub OAuth code exchange did not return access_token.");
            return null;
        }

        var accessToken = tokenProp.GetString()!;

        // Fetch profile using the newly generated OAuth access_token directly
        using var profileReq = new HttpRequestMessage(HttpMethod.Get, "https://api.github.com/user");
        profileReq.Headers.UserAgent.Add(new ProductInfoHeaderValue("DevScopeAnalyzer", "1.0"));
        profileReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        profileReq.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.github.v3+json"));

        var profileRes = await _httpClient.SendAsync(profileReq, ct);
        if (!profileRes.IsSuccessStatusCode) return null;

        var profileJson = await profileRes.Content.ReadAsStringAsync(ct);
        using var profileDoc = JsonDocument.Parse(profileJson);
        var json = profileDoc.RootElement;

        var userProfile = new DeveloperProfileDto(
            Username: json.GetProperty("login").GetString() ?? "authenticated_user",
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

        return new AuthResponseDto(
            AccessToken: accessToken,
            UserProfile: userProfile
        );
    }
}
