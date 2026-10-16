namespace DevScope.Api.Models;

public record OAuthCallbackRequest(string Code);

public record AuthResponseDto(
    string AccessToken,
    DeveloperProfileDto UserProfile
);

public record GitHubOAuthTokenResponse(
    string access_token,
    string token_type,
    string scope
);
