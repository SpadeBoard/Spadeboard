# For more information, please refer to https://aka.ms/vscode-docker-python
FROM python:latest

EXPOSE 8000

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

# Install pip requirements
COPY ./backend/requirements.txt /app/backend/requirements.txt
RUN python -m pip install -r /app/backend/requirements.txt

# Set the working directory
WORKDIR /app/backend

# Copy the rest of the application to the working directory
COPY ./backend /app/backend

# Creates a non-root user with an explicit UID and adds permission to access the /app folder
# For more info, please refer to https://aka.ms/vscode-docker-python-configure-containers
RUN adduser -u 5678 --disabled-password --gecos "" appuser && chown -R appuser /app/backend
USER appuser

# During debugging, this entry point will be overridden. For more information, please refer to https://aka.ms/vscode-docker-python-debug
# Run Django migrations using entrypoint script
CMD ["/bin/bash", "/app/backend/entrypoint.sh"]
