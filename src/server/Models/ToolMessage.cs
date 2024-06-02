namespace sdlc_toolkit_api.Models;

public class ToolMessage
{
    public ToolMessage(Session session, string message, bool userMessage = false)
    {
        Id = Guid.NewGuid();
        SessionId = session.Id;
        ToolId = session.ToolId;
        if (userMessage)
            UserId = session.UserId;
        Message = message;
        Timestamp = DateTime.Now;
    }
    internal Guid Id { get; set; }
    public Guid SessionId { get; init; }
    public ToolkitOption ToolId { get; set; }
    public string Message { get; init; }
    public string? UserId { get; set; }
    public DateTime Timestamp { get; init; }
}