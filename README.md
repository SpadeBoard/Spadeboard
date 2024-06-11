# DOCKER SETUP

## INITIAL
[Get Docker for your platform here](https://docs.docker.com/get-docker/)

## INIT ENTIRE PROJECT
Note: these commands should be ran from the project directory
`docker compose up`

## INIT INDIVIDUAL CONTAINERS
Note: all of these commands in the terminal should be ran in the project directory.

### Client side
[Pull image here](https://hub.docker.com/layers/library/node/22.2.0-alpine/images/sha256-af91495523ac23f316a698fcf7fe3d451e2a63dbf7fd7f901ea7e772da00de86?context=explore)

Command in terminal:
Note: be in `/path/to/project/client`
`docker run --name spadeboard-react-client -p 3000:3000 -it --rm -v ${PWD}:/app -w /app  node:22-alpine npm start`

### Server side
[Pull image here - docker pull mcr.microsoft.com/dotnet/sdk:8.0](https://hub.docker.com/_/microsoft-dotnet-sdk)

Command in terminal:
Note: be in `/path/to/project/server`
`docker run --name spadeboard-aspnetcore-server -p 8080:8080 -e 'ASPNETCORE_URLS=http://*:8080' -it --rm -v ${PWD}:/app -w /app mcr.microsoft.com/dotnet/sdk:8.0 dotnet run`

### For PostgreSQL and PGAdmin
Note: 
- When connecting to your PostgreSQL database from PGAdmin, the default username is `spadeboard-db-user` and the default password is `spadeboard-db-pwd`

[Image for PostgreSQL](https://hub.docker.com/layers/library/postgres/alpine3.20/images/sha256-310f6f160c12e898a5b92bf225c60963b62ad798bd5c32888b43aeda80f4ca9e?context=explore)

[Image for PgAdmin 4](https://hub.docker.com/layers/dpage/pgadmin4/latest/images/sha256-6571236d0fe4a2e8945492134e04113bbdf877b4c6e227da9d858142c330c0d8?context=explore)

[Original instructions for how to set up in docker](https://www.sqlshack.com/getting-started-with-postgresql-on-docker/)

Commands in terminal:
Note: be in `/path/to/project/db`

`docker run --name spadeboard-pgsql-db  -e POSTGRES_USER=spadeboard-db-user -e POSTGRES_PASSWORD=spadeboard-db-pwd -e POSTGRES_DB=spadeboard-db -p 5432:5432 -it --rm -v ${PWD}:/app -w /app postgres:alpine3.20`

`docker run -e 'PGADMIN_DEFAULT_EMAIL=spadeboard@admin.io' -e 'PGADMIN_DEFAULT_PASSWORD=spadeboard' -p 80:80 --name spadeboard-pgadmin4-db -it --rm -v ${PWD}:/app dpage/pgadmin4:latest`

#### Backing up volume data
`docker run --rm --volumes-from spadeboard-pgsql-db -v ${PWD}:/app ubuntu tar cvf /backup/backup.tar.gz /app`

#### Restoring the volume to the same container
`docker run -v $(pwd):/app --name spadeboard-pgsql-db ubuntu /bin/bash`

`docker run --rm --volumes-from spadeboard-pgsql-db  -v $(pwd):/app ubuntu bash -c "cd /dbdata && tar xvf /backup/backup.tar --strip 1"`


### BASIC COMMANDS FOR EXISTING CONTAINER
[Basic commands for existing container](https://stackoverflow.com/a/41806119)