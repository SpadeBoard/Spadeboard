# Use the official .NET SDK as the build environment
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine3.20 AS build
WORKDIR /app/backend/

# Copy project files and restore dependencies
COPY ../../backend/backend.csproj ./
RUN dotnet restore

# Copy the entire backend directory
COPY ../../backend ./

# https://stackoverflow.com/a/76652397
RUN dotnet tool install --global dotnet-ef --version 8.0.0
ENV PATH="$PATH:/root/.dotnet/tools"

# Make migrations
RUN dotnet ef migrations add InitialCreate -v

# Update the database - should not be necessary as inside of Program.cs, it will run pending migrations
# RUN dotnet ef database update -v

RUN dotnet publish -c Release -o /publish

# Use the official ASP.NET Core runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine3.20 AS runtime
WORKDIR /app/backend/
COPY --from=build /publish ./

# Expose port 80 and set the entry point
EXPOSE 80

# https://stackoverflow.com/questions/60546843/aspnetcore-urls-not-being-applied-deploying-in-docker-container
# https://www.reddit.com/r/dotnet/comments/8hmjin/exposing_aspnet_core_port_via_docker/?rdt=44866
# https://learn.microsoft.com/en-us/dotnet/core/compatibility/containers/8.0/aspnet-port
# Probably should use port 8080 for non-root priviledges
ENV ASPNETCORE_URLS=http://+:80
ENV ASPNETCORE_ENVIRONMENT=Development


ENV SNOWFLAKE_NODE_ID=0
ENV SNOWFLAKE_WORKER_ID=0
ENV SNOWFLAKE_EPOCH_TIME=1288834974657

ENTRYPOINT ["dotnet", "backend.dll"]
