using Toolkit.Models;

namespace Toolkit.Services;

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
        foreach (var tool in assemblyClasses.Where(c => c.IsSubclassOf(typeof(BaseTool)) && !c.IsAbstract))
        {
            // all tools must have a constructor that takes a List<Role> and List<Category>
            _tools.Add((ITool)Activator.CreateInstance(tool, roles, categories)!);
        }

        // If the tool does not have any Roles, it implies that it is intended for all roles
        foreach (var tool in _tools.Where(tool => tool.IntendedRoles.Length == 0))
        {
            tool.IntendedRoles = roles.Select(r => r.Id).ToArray();
        }
        
        // Build a dictionary of groups holding list of the tools
        var groupedTools = _tools
            .SelectMany(t => t.Groupings.Select(g => new { Group = g, Tool = t }))
            .GroupBy(x => x.Group)
            .ToDictionary(g => g.Key, g => g.Select(x => x.Tool.Id).ToList());

        // Assign the related tools to each of the same grouping
        foreach (var tool in _tools)
        {
            tool.RelatedTools = tool.Groupings
                .SelectMany(g => groupedTools[g])
                .Distinct()
                .Where(id => id != tool.Id)
                .ToDictionary(id => _tools.Single(t => t.Id == id).Name, id => (int)id);
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
            new Role(Roles.Developer, "Developer"),
            new Role(Roles.ProjectManager, "Project Manager"),
            new Role(Roles.ScrumMaster, "Scrum Master"),
            new Role(Roles.ProductOwner, "Product Owner"),
            new Role(Roles.BusinessAnalyst, "Business Analyst"),
            new Role(Roles.QualityAssurance, "Quality Assurance"),
        };

    public List<ITool> GetTools() => _tools;

    public ITool GetTool(ToolkitOption toolId)
    {
        return _tools.FirstOrDefault(t => t.Id == toolId)
               ?? throw new ArgumentException("Invalid tool ID.");
    }
}