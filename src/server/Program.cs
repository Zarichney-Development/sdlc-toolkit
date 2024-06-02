using Azure;
using Azure.AI.OpenAI;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using sdlc_toolkit_api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// string endpoint = builder.Configuration["AZURE_OPENAI_ENDPOINT"]
//                   ?? throw new InvalidOperationException("Missing required configuration for Azure OpenAI endpoint.");
// string apiKey = builder.Configuration["AZURE_OPENAI_API_KEY"]
//                 ?? throw new InvalidOperationException("Missing required configuration for Azure OpenAI API key.");
//
// builder.Services.AddSingleton(new OpenAIClient(new Uri(endpoint), new AzureKeyCredential(apiKey)));

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

app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "SDLC Toolkit API v1"));

app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

app.Run();