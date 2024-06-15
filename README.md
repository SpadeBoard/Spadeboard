# DOCKER SETUP

## INITIAL
[Get Docker for your platform here](https://docs.docker.com/get-docker/)

## INIT ENTIRE PROJECT
`docker compose up`
Note: these commands should be ran from the project directory

`python manage.py makemigrations`
`python manage.py migrate`
Note: this might be necessary, despite me having specified to create migrations, sometimes it doesn't work. You most likely only have to run migrate.

### BASIC COMMANDS FOR EXISTING CONTAINER
[Basic commands for existing container](https://stackoverflow.com/a/41806119)