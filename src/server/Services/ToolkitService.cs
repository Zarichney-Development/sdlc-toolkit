using sdlc_toolkit_api.Models;
using sdlc_toolkit_api.Tools;

namespace sdlc_toolkit_api.Services;

public interface IToolkitService
{
    List<Category> GetCategories();
    List<Role> GetRoles();
    List<ITool> GetTools();
    ITool GetTool(ToolkitOption toolId);
}

public class ToolkitService : IToolkitService
{
    private readonly List<ITool> _tools;

    public ToolkitService()
    {
        _tools = new List<ITool>();

        var roles = GetRoles();
        var categories = GetCategories();

        var assemblyClasses = typeof(ToolkitService).Assembly.GetTypes();
        foreach (var tool in assemblyClasses.Where(c => c.IsSubclassOf(typeof(BaseTool))))
        {
            // all tools must have a constructor that takes a List<Role> and List<Category>
            _tools.Add((ITool)Activator.CreateInstance(tool, roles, categories)!);
        }
    }

    public List<Category> GetCategories()
        => new()
        {
            new Category(SdlcPhase.Requirements, "Requirement Analysis and Planning"),
            new Category(SdlcPhase.Design, "Design"),
            new Category(SdlcPhase.Development, "Development"),
            new Category(SdlcPhase.Testing, "Testing"),
            new Category(SdlcPhase.Deployment, "Deployment"),
            new Category(SdlcPhase.ProjectManagement, "Project Management and Task Maintenance"),
            new Category(SdlcPhase.Collaboration, "Collaboration and Communication"),
            new Category(SdlcPhase.Documentation, "Documentation"),
        };

    public List<Role> GetRoles()
        => new()
        {
            new Role(Position.Developer, "Developer"),
            new Role(Position.ProjectManager, "Project Manager"),
            new Role(Position.ScrumMaster, "Scrum Master"),
            new Role(Position.ProductOwner, "Product Owner"),
            new Role(Position.BusinessAnalyst, "Business Analyst"),
        };

    public List<ITool> GetTools() => _tools;

    public ITool GetTool(ToolkitOption toolId)
    {
        return _tools.FirstOrDefault(t => t.Id == toolId)
               ?? throw new ArgumentException("Invalid tool ID.");
    }
}