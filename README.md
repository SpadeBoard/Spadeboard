<div style="text-align: center;">
    <img src="frontend/public/Spadeboard_icon_Orange.svg" alt="Spadeboard icon" width=100 height=100/>
</div>

# SpadeBoard
An app to prototype card creation.

## Description
An open source self-hostable app where you can create rooms to design your tabletop game (like card games, TTRPGs, board games) and bring in your friends. Mainly focused on card games.

## Getting Started
### Dependencies
- Docker

### Installing
[Get Docker for your platform here](https://docs.docker.com/get-docker/)

### Executing program
Note: these commands should be ran from the project directory and currently changes in code don't automatically update the actual app, you need to build the project again

Starting: `docker compose -f docker-compose.yml up -d`

Stopping: `docker compose -f docker-compose.yml down --volumes --rmi all`
