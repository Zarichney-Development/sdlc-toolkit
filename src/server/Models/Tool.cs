namespace Toolkit.Models;

public enum ToolkitOption
{
    UserStoryGenerator,
    EndpointDocumentation,
    SprintReviewer,
    GherkinWriter,
    BddEducator,
    BddValueAssessor,
    GherkinRefiner
}
public enum ToolGroup
{
    BehaviorDrivenDevelopment
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
    public Roles[] IntendedRoles { get; set; }
    public string IntendedUsers { get; }
    public SdlcPhase CategoryId { get; set; }
    public string Category { get; }
    public string SuggestedGuidance { get; }
    public ToolGroup[] Groupings { get; set; }
    public Dictionary<string, int> RelatedTools { get; set; }
}

public abstract class BaseTool(IEnumerable<Role> roles, IEnumerable<Category> categories) : ITool
{
    public ToolkitOption Id { get; set; }
    public SdlcPhase CategoryId { get; set; }
    public Roles[] IntendedRoles { get; set; } = Array.Empty<Roles>();
    public string Name { get; set; } = null!;
    public string UseCase { get; set; } = null!;
    public string ExpectedInput { get; set; } = null!;
    public string ExpectedOutput { get; set; } = null!;
    public string ProcessingMethod { get; set; } = null!;
    public string SystemPrompt { get; set; } = null!;
    public string SuggestedGuidance { get; protected init; } = null!;
    public ToolGroup[] Groupings { get; set; } = Array.Empty<ToolGroup>();
    public Dictionary<string, int> RelatedTools { get; set; } = new();

    public string IntendedUsers
    {
        get { return string.Join(", ", roles.Where(r => IntendedRoles.Contains(r.Id)).Select(r => r.Name)); }
    }
    public string Category
    {
        get { return categories.First(c => c.Id == CategoryId).Name; }
    }

}