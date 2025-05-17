using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;

namespace Services
{
    public class FileCleanupService(ILogger<FileCleanupService> logger, IServiceProvider serviceProvider) : BackgroundService
    {
        private readonly ILogger<FileCleanupService> _logger = logger;
        private readonly IServiceProvider _serviceProvider = serviceProvider;
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        IFileMetadataService fileMetadataService = scope.ServiceProvider.GetRequiredService<IFileMetadataService>();
                        DateTime thresholdDate = DateTime.UtcNow.AddDays(-7);
                        bool deleted = await fileMetadataService.DeleteFilesByThresholdDataAsync(thresholdDate, stoppingToken);


                        if (!deleted)
                        {
                            throw new Exception("Files weren't deleted");
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while cleaning up old files.");
                }

                // Wait 24 hours before next check
                await Task.Delay(TimeSpan.FromDays(1), stoppingToken);
            }
        }
    }
}