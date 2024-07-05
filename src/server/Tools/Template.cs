using Toolkit.Models;

namespace Toolkit.Tools;

// TODO: Remove abstract after copying
public abstract class Template : BaseTool
{
    public Template(IEnumerable<Role> roles, IEnumerable<Category> categories) : base(roles, categories)
    {
        Id = ToolkitOption.UserStoryGenerator;
        IntendedRoles = new [] { Roles.BusinessAnalyst, Roles.ProductOwner, Roles.QualityAssurance, Roles.Developer };
        CategoryId = SdlcPhase.Testing;
        Name = "Template";
        UseCase = "";
        ExpectedInput = "";
        ExpectedOutput = "";
        ProcessingMethod = "";
        SuggestedGuidance = """

                            """.Trim();
        SystemPrompt = """

                       """.Trim();
    }
}