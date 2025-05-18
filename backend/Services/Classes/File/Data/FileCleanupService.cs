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
                    using var scope = _serviceProvider.CreateScope();
                    {
                        IFileMetadataService fileMetadataService = scope.ServiceProvider.GetRequiredService<IFileMetadataService>();

                        bool marked = await fileMetadataService.MarkPendingToOrphanedAsync();

                        if (!marked)
                        {
                            Console.WriteLine("There were no pending files, presumably");
                        }

                        DateTime thresholdDate = DateTime.UtcNow.AddDays(-3);
                        bool deleted = await fileMetadataService.DeleteFilesByThresholdDataAsync(thresholdDate, stoppingToken);

                        if (!deleted)
                        {
                            Console.WriteLine("There were no orphaned files, presumably");
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