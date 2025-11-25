using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using System.IO;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        //mostrar para o teste o path da api
        var projectDir = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "..", "api"));
        if (!Directory.Exists(projectDir))
        {
            throw new DirectoryNotFoundException($"Content root não encontrado: {projectDir}");
        }
        builder.UseContentRoot(projectDir);
    }
}