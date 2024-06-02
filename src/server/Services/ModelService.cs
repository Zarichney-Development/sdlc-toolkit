using Azure;
using Azure.AI.OpenAI;
using Microsoft.Extensions.Configuration;
using sdlc_toolkit_api.Models;

namespace sdlc_toolkit_api.Services;

public interface IModelService
{
    public Task<string> GetResponse(ToolMessage[] chatHistory, DeployedModels? modelName = null);
}

public class ModelService : IModelService
{
    private readonly OpenAIClient _client;
    private readonly DeployedModels _defaultModel;
    private readonly IConfiguration _config;

    public ModelService(IConfiguration configuration) //OpenAIClient client)
    {
        // _client = client;
        _config = configuration;
        _defaultModel = DeployedModels.gpt35;
    }

    private ChatCompletionsOptions GetChatCompletionsOptions(ToolMessage[] prompts, DeployedModels? modelName = null)
    {
        var messages = new List<ChatRequestMessage>();
        foreach (var prompt in prompts)
        {
            if (prompt.UserId == null)
            {
                messages.Add(new ChatRequestSystemMessage(prompt.Message));
            }
            else
            {
                messages.Add(new ChatRequestUserMessage(prompt.Message));
            }
        }

        var deploymentName = GetDeploymentName(modelName ?? _defaultModel);

        return new ChatCompletionsOptions(deploymentName, messages);
    }

    private string GetDeploymentName(DeployedModels modelName)
        => _config[$"{modelName}-deployment-name"]
           ?? throw new Exception($"Deployment name for model {modelName} not found in configuration.");

    public async Task<string> GetResponse(ToolMessage[] chatHistory, DeployedModels? modelName = null)
    {
        var chatCompletionsOptions = GetChatCompletionsOptions(chatHistory);

        string userResponse;
        try
        {
            Response<ChatCompletions> modelResponse = await _client.GetChatCompletionsAsync(chatCompletionsOptions);

            userResponse = modelResponse.Value.Choices[0].Message.Content;
        }
        catch (Exception e)
        {
            userResponse = e.Message;
        }

        return userResponse;
    }
}