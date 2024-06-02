namespace sdlc_toolkit_api.Models;

public class Session
{
    public Guid Id { get; init; }
    public required string UserId { get; init; }
    public ToolkitOption ToolId { get; set; }
}