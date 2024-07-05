namespace Toolkit.Models;

public class Session
{
    public Guid Id { get; init; }
    public required string UserId { get; init; }
    public ToolkitOption ToolId { get; init; }
    public required string SystemPrompt { get; set; }
    public DateTime Timestamp { get; init; }
}