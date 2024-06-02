namespace sdlc_toolkit_api.Models;

public enum Position
{
    Developer,
    ProjectManager,
    ScrumMaster,
    ProductOwner,
    BusinessAnalyst,
}

public class Role
{
    public Role(Position id, string name)
    {
        Id = id;
        Name = name;
    }

    public Position Id { get; set; }
    public string Name { get; set; }
}