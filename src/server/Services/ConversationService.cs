using sdlc_toolkit_api.Models;

namespace sdlc_toolkit_api.Services;

public interface IConversationService
{
    Task<List<ToolMessage>> GetConversation(Guid sessionId);
    Task<Session> CreateNewConversation(string userId, ToolkitOption toolId);
    Task<ToolMessage> CreateResponse(Guid sessionId, string prompt, DeployedModels? modelName = null);
    Task<Session?> GetSession(string userId, ToolkitOption? toolId = null);
}

public class ConversationService : IConversationService
{
    private readonly IModelService _modelService;
    private readonly List<Session> _sessions;
    private readonly List<ToolMessage> _responses;
    private readonly IToolkitService _toolkitService;

    public ConversationService(IModelService modelService, IToolkitService toolkitService)
    {
        _modelService = modelService;
        _toolkitService = toolkitService;
        _responses = new List<ToolMessage>();
        _sessions = new List<Session>();
    }

    public async Task<List<ToolMessage>> GetConversation(Guid sessionId)
    {
        var conversation = _responses
            .Where(r => r.SessionId == sessionId)
            .OrderBy(r => r.Timestamp)
            .ToList();

        return await Task.FromResult(conversation);
    }

    public async Task<Session> CreateNewConversation(string userId, ToolkitOption toolId)
    {
        var session = new Session
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ToolId = toolId
        };

        var tool = _toolkitService.GetTool(toolId)
                   ?? throw new Exception("Tool not found");

        var systemPrompt = new ToolMessage(session, tool.SystemPrompt);

        _responses.Add(systemPrompt);

        _sessions.Add(session);

        return await Task.FromResult(session);
    }

    public async Task<ToolMessage> CreateResponse(Guid sessionId, string prompt, DeployedModels? modelName = null)
    {
        var session = _sessions.FirstOrDefault(s => s.Id == sessionId)
                      ?? throw new Exception("Session not found");

        var userPrompt = new ToolMessage(session, prompt, true);
        _responses.Add(userPrompt);

        var modelResponse = await _modelService.GetResponse(GetChatHistory(sessionId), modelName);

        var response = new ToolMessage(session, modelResponse);

        _responses.Add(response);

        return await Task.FromResult(response);
    }
    
    private ToolMessage[] GetChatHistory(Guid sessionId)
    {
        return _responses
            .Where(r => r.SessionId == sessionId)
            .OrderBy(r => r.Timestamp)
            .ToArray();
    }

    public Task<Session?> GetSession(string userId, ToolkitOption? toolId = null)
    {
        var latestResponse = _responses.ToList()
            .Where(s => s.UserId == userId)
            .Where(s => toolId == null || s.ToolId == toolId)
            .MaxBy(s => s.Timestamp);
        
        if (latestResponse == null)
        {
            return Task.FromResult<Session?>(null);
        }
        
        var session = _sessions.FirstOrDefault(s => s.Id == latestResponse.SessionId);

        return Task.FromResult(session);        
    }
}