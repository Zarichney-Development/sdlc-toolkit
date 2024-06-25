using System.ClientModel;
using System.Text.Json;
using OpenAI.Chat;
using Microsoft.Extensions.Configuration;
using OpenAI;
using sdlc_toolkit_api.Models;

namespace sdlc_toolkit_api.Services;

public interface IModelService
{
    public Task<string> GetResponse(ToolMessage[] chatHistory, DeployedModels? modelName = null);
}

public class ModelService(IConfiguration configuration, OpenAIClient client) : IModelService
{
    private readonly DeployedModels _defaultModel = DeployedModels.gpt35;

    private List<ChatMessage> MapMessages(ToolMessage[] prompts)
    {
        var messages = new List<ChatMessage>();
        foreach (var prompt in prompts)
        {
            ChatMessage message;
            if (messages.Count == 0)
            {
                message = ChatMessage.CreateSystemMessage(prompt.Message);
            }
            else if (prompt.UserId != null)
            {
                message = ChatMessage.CreateUserMessage(prompt.Message);
            }
            else
            {
                message = ChatMessage.CreateAssistantMessage(prompt.Message);
            }

            messages.Add(message);
        }

        return messages;
    }

    private string GetDeploymentName(DeployedModels modelName)
        => configuration[$"{modelName}-deployment-name"]
           ?? throw new Exception($"Deployment name for model {modelName} not found in configuration.");

    public async Task<string> GetResponse(ToolMessage[] chatHistory, DeployedModels? modelName = null)
    {
        var messages = MapMessages(chatHistory);

        var model = GetDeploymentName(modelName ?? _defaultModel);
        var chatClient = client.GetChatClient(model);

        string userResponse;
        try
        {
            ClientResult result = await chatClient.CompleteChatAsync(messages);

            var output = result.GetRawResponse().Content;
            using var outputAsJson = JsonDocument.Parse(output.ToString());
            var message = outputAsJson.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString()!;

            var usageProperty = outputAsJson.RootElement.GetProperty("usage");
            
            var promptTokenCount = usageProperty
                .GetProperty("prompt_tokens")
                .GetInt32();
            
            var completionTokenCount = usageProperty
                .GetProperty("completion_tokens")
                .GetInt32();
            
            var totalTokenCount = promptTokenCount + completionTokenCount; // Also in property "total_tokens"
            Console.WriteLine($"Tokens used: {totalTokenCount}");

            userResponse = message;
        }
        catch (Exception e)
        {
            userResponse = e.Message;
        }

        return userResponse;
    }
}