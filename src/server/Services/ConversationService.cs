using Toolkit.Models;

namespace Toolkit.Services;

public interface IConversationService
{
    Task<List<ToolMessage>> GetConversation(Guid sessionId);
    void UpdateSystemPrompt(Guid sessionId, string systemPrompt);
    Task<Session> CreateNewConversation(string userId, ToolkitOption toolId);
    Task<ToolMessage> CreateResponse(Guid sessionId, string prompt, DeployedModels? modelName = null);
    Task<Session?> GetSession(string userId, ToolkitOption? toolId = null);
}

public class ConversationService(IModelService modelService, IToolkitService toolkitService) : IConversationService
{
    private readonly List<Session> _sessions = new();
    private readonly List<ToolMessage> _responses = new();

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
        var tool = toolkitService.GetTool(toolId)
                   ?? throw new Exception("Tool not found");
        
        var session = new Session
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ToolId = toolId,
            SystemPrompt = tool.SystemPrompt,
            Timestamp = DateTime.Now
        };

        _sessions.Add(session);

        return await Task.FromResult(session);
    }
    
    public void UpdateSystemPrompt(Guid sessionId, string systemPrompt)
    {
        var session = _sessions.FirstOrDefault(s => s.Id == sessionId)
                      ?? throw new Exception("Session not found");

        session.SystemPrompt = systemPrompt;
    }

    public async Task<ToolMessage> CreateResponse(Guid sessionId, string prompt, DeployedModels? modelName = null)
    {
        var session = _sessions.FirstOrDefault(s => s.Id == sessionId)
                      ?? throw new Exception("Session not found");

        var isFirstMessage = _responses.Where(r => r.SessionId == sessionId).ToList().Count == 0;
        if (isFirstMessage)
        {
            var systemPrompt = new ToolMessage(session, session.SystemPrompt);
            _responses.Add(systemPrompt);
        }

        var userPrompt = new ToolMessage(session, prompt, true);
        
        _responses.Add(userPrompt);

        var conversation = GetChatHistory(sessionId);

        var modelResponse = await modelService.GetResponse(conversation, modelName);

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
        var latestSession = _sessions.ToList()
            .Where(s=>s.UserId == userId)
            .Where(s=>toolId == null || s.ToolId == toolId)
            .MaxBy(s => s.Timestamp);
        
        if (latestSession == null)
        {
            return Task.FromResult<Session?>(null);
        }
        
        return Task.FromResult((Session?)latestSession);        
    }
}