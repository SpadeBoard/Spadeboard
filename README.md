# DOCKER SETUP

## INITIAL
[Get Docker for your platform here](https://docs.docker.com/get-docker/)

## INIT ENTIRE PROJECT
Starting: `docker compose -f docker-compose.yaml up -d`

Stopping: `docker compose -f docker-compose.yml down --volumes --rmi all`
Note: these commands should be ran from the project directory and currently changes in code don't automatically update the actual app, you need to build the project again

### BASIC COMMANDS FOR EXISTING CONTAINER
[Basic commands for existing container](https://stackoverflow.com/a/41806119)