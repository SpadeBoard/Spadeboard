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
1. [Clone the files for SpadeBoard or download the zip file for SpadeBoard](https://github.com/SpadeBoard/Spadeboard/archive/refs/heads/prototype-angular-asp.net-core-postgres.zip)

<div style="text-align: center;">
    <img src="/frontend/public/spadeboard-instructions-step-one.png" width=417 height=317>
</div>

2. [Install Docker for your platform](https://docs.docker.com/get-docker/)

3. After verifying Docker is on your system, check to make sure that the files (if you downloaded it instead of cloned it), are unzipped, else _unzip it_. 

4. Open a new terminal, either in Docker Desktop, or just a terminal on your OS, head to the root directory of your files via `cd /path/to/root`, replace `/path/to/root` with your path.

5. Input the command `GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD) GIT_HASH=$(git rev-parse --short HEAD) APP_VERSION=$(node -p "require('./frontend/package.json').version") docker compose -f docker-compose.yml up -d --build` and press enter. This will start the app, it will load.

If on Powershell, use the following single-line command instead (starting from `$env:...`):
```powershell
$env:GIT_BRANCH = $(git rev-parse --abbrev-ref HEAD); `
$env:GIT_HASH   = $(git rev-parse --short HEAD); `
$env:APP_VERSION = $(node -p "require('./frontend/package.json').version"); `
docker compose -f docker-compose.yml up -d --build
```
6. Open `http://localhost:4200/` to head to SpadeBoard

7. To stop the program, either run `docker compose -f docker-compose.yml down` or press the square on your container inside of Docker Desktop to stop it. If you want to delete your volumes and images, run `docker compose -f docker-compose.yml down --volumes --rmi all`, or delete them via Docker Desktop.

# Contributing
Please read [CONTRIBUTING.md](/CONTRIBUTING.md).