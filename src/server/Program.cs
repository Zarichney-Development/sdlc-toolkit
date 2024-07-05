using System.ClientModel;
using System.Text.Json.Serialization;
using Azure;
using Azure.AI.OpenAI;
using OpenAI;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using Toolkit.Models;
using Toolkit.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile("appsettings.json");

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonNumberEnumConverter<ToolkitOption>());
    });
builder.Services.AddEndpointsApiExplorer();

var apiKey = builder.Configuration["AZURE_OPENAI_API_KEY"]
             ?? builder.Configuration["OPENAI_API_KEY"]
             ?? throw new InvalidOperationException("Missing required configuration for Azure/OpenAI API key.");

var azureEndpoint = builder.Configuration["AZURE_OPENAI_ENDPOINT"];

var openAiClient = !string.IsNullOrEmpty(azureEndpoint) 
    ? new AzureOpenAIClient(new Uri(azureEndpoint), new AzureKeyCredential(apiKey)) 
    : new OpenAIClient(apiKey);

builder.Services.AddSingleton(openAiClient);

builder.Services.AddSingleton<IModelService, ModelService>();
builder.Services.AddSingleton<IToolkitService, ToolkitService>();
builder.Services.AddSingleton<IConversationService, ConversationService>();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "SDLC Toolkit API", Version = "v1" });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        policyBuilder =>
        {
            policyBuilder.WithOrigins("http://localhost:4200")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

var app = builder.Build();

app.UseCors("AllowSpecificOrigin");

app.UseDeveloperExceptionPage();

app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "SDLC Toolkit API v1"));

app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

app.Run();