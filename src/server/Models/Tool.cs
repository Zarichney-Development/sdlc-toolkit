namespace sdlc_toolkit_api.Models;

public enum ToolkitOption
{
    UserStoryGenerator,
    EndpointDocumentor,
    SprintReviewer
}

public interface ITool
{
    public ToolkitOption Id { get; set; }
    public string Name { get; set; }
    public string UseCase { get; set; }
    public string ExpectedInput { get; set; }
    public string ExpectedOutput { get; set; }
    public string ProcessingMethod { get; set; }
    public string SystemPrompt { get; set; }
    public Position[] Positions { get; set; }
    public string IntendedUsers { get; }
    public SdlcPhase CategoryId { get; set; }
    public string Category { get; }
    public string SuggestedGuidance { get; }
}

public abstract class BaseTool(List<Role> roles, List<Category> categories) : ITool
{
    public ToolkitOption Id { get; set; }
    public SdlcPhase CategoryId { get; set; }
    public Position[] Positions { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string UseCase { get; set; } = null!;
    public string ExpectedInput { get; set; } = null!;
    public string ExpectedOutput { get; set; } = null!;
    public string ProcessingMethod { get; set; } = null!;
    public string SystemPrompt { get; set; } = null!;
    public string SuggestedGuidance { get; set; } = null!;
    public string IntendedUsers
    {
        get { return string.Join(", ", roles.Where(r => Positions.Contains(r.Id)).Select(r => r.Name)); }
    }
    public string Category
    {
        get { return categories.First(c => c.Id == CategoryId).Name; }
    }

}