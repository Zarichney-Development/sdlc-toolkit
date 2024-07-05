namespace Toolkit.Models;

public enum SdlcPhase
{
    Requirements,
    Design,
    Development,
    Testing,
    Deployment,
    ProjectManagement,
    Collaboration,
    Documentation
}

public class Category
{
    public Category(SdlcPhase id, string name, string? description = null)
    {
        Id = id;
        Name = name;
        if (description != null)
        {
            Description = description;
        }
    }

    public SdlcPhase Id { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
}