using Microsoft.AspNetCore.Mvc;
using DevScope.Api.Services;
using DevScope.Api.Models;

namespace DevScope.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpGet("login-url")]
    public ActionResult<object> GetLoginUrl()
    {
        var url = _authService.GetGitHubLoginUrl();
        return Ok(new { Url = url });
    }

    [HttpPost("callback")]
    public async Task<ActionResult<AuthResponseDto>> Callback([FromBody] OAuthCallbackRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.Code))
            return BadRequest(new ProblemDetails { Title = "Code is required" });

        var result = await _authService.ExchangeCodeAsync(req.Code, ct);
        if (result == null)
            return BadRequest(new ProblemDetails { Title = "GitHub OAuth exchange failed", Detail = "Invalid or expired authorization code." });

        return Ok(result);
    }
}
