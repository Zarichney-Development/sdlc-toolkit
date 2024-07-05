using Microsoft.AspNetCore.Mvc;
using Toolkit.Models;
using Toolkit.Services;

namespace Toolkit.Controllers;

[ApiController]
[Route("api")]
public class ApiController : ControllerBase
{
    private readonly IToolkitService _toolkitService;
    private readonly IConversationService _conversationService;

    public ApiController(IToolkitService toolkitService, IConversationService conversationService)
    {
        _toolkitService = toolkitService;
        _conversationService = conversationService;
    }

    [HttpGet]
    [Route("category")]
    public async Task<List<Category>> GetCategories()
    {
        var result = _toolkitService.GetCategories();

        return await Task.FromResult(result);
    }

    [HttpGet]
    [Route("role")]
    public async Task<List<Role>> GetRoles()
    {
        var result = _toolkitService.GetRoles();

        return await Task.FromResult(result);
    }

    [HttpGet]
    [Route("tool")]
    public async Task<List<ITool>> GetTools()
    {
        var result = _toolkitService.GetTools();

        return await Task.FromResult(result);
    }
    
    [HttpGet]
    [Route("tool/{toolId}")]
    public async Task<ITool> GetTool(ToolkitOption toolId)
    {
        var result = _toolkitService.GetTool(toolId);

        return await Task.FromResult(result);
    }
    
    [HttpPost]
    [Route("session")]
    public async Task<Session> CreateNewSession([FromBody] CreateConversationRequest request)
    {
        var result = await _conversationService.CreateNewConversation(request.UserId, request.ToolId);

        return result;
    }

    public class PatchSession
    {
        public required string SystemPrompt { get; init; }
    }
    
    [HttpPatch]
    [Route("session/{sessionId}")]
    public ActionResult UpdateSession(Guid sessionId, [FromBody] PatchSession session)
    {
        _conversationService.UpdateSystemPrompt(sessionId, session.SystemPrompt);

        return Ok();
    }

    [HttpGet]
    [Route("session")]
    public async Task<Session?> GetSession(string userId, ToolkitOption? toolId)
    {
        var result = await _conversationService.GetSession(userId, toolId);
        
        if (result == null && toolId != null)
        {
            result = await _conversationService.CreateNewConversation(userId, toolId.Value);
        }

        return result;
    }

    [HttpGet]
    [Route("session/{sessionId}")]
    public async Task<List<ToolMessage>> GetConversation(Guid sessionId)
    {
        var result = await _conversationService.GetConversation(sessionId);

        return result;
    }
    
    [HttpPost]
    [Route("prompt")]
    public async Task<ToolMessage> CreateResponse([FromBody] CreateResponseRequest request)
    {
        DeployedModels? modelName = null;
        if (!string.IsNullOrEmpty(request.ModelName))
        {
            modelName = Enum.Parse<DeployedModels>(request.ModelName);
        }
        var result = await _conversationService.CreateResponse(request.SessionId, request.Message, modelName);
        
        return result;
    }
}

public class CreateConversationRequest
{
    public required string UserId { get; set; }
    public ToolkitOption ToolId { get; set; }
}

public class CreateResponseRequest
{
    public Guid SessionId { get; set; }
    public required string Message { get; set; }
    public string? ModelName { get; set; }
}
