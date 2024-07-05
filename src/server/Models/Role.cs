namespace Toolkit.Models;

public enum Roles
{
    Developer,
    ProjectManager,
    ScrumMaster,
    ProductOwner,
    BusinessAnalyst,
    QualityAssurance,
}

public class Role
{
    public Role(Roles id, string name)
    {
        Id = id;
        Name = name;
    }

    public Roles Id { get; set; }
    public string Name { get; set; }
}