using System.ClientModel;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using OpenAI;
using OpenAI.Chat;
using Toolkit.Models;

namespace Toolkit.Services;

public interface IModelService
{
    public Task<string> GetResponse(ToolMessage[] chatHistory, DeployedModels? modelName = null);
}

public sealed class ModelService(IConfiguration configuration, OpenAIClient client) : IModelService
{
    private const DeployedModels DefaultModel = DeployedModels.gpt40;

    private static List<ChatMessage> MapMessages(ToolMessage[] prompts)
    {
        ArgumentNullException.ThrowIfNull(prompts);
        
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

        var model = GetDeploymentName(modelName ?? DefaultModel);
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