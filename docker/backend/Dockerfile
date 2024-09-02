# Use a slim version of Python as a base image
FROM python:3.10.15-slim

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

# Install curl and pip requirements
# Slim comes with wget, not curl
# For health checks
RUN apt-get update && apt-get install -y curl && apt-get clean

# Install pip requirements
COPY ./backend/requirements.txt /app/backend/requirements.txt
RUN python -m pip install -r /app/backend/requirements.txt

# Set the working directory
WORKDIR /app/backend

# Copy the rest of the application to the working directory
COPY ./backend /app/backend

# Creates a non-root user with an explicit UID and adds permission to access the /app folder
RUN adduser -u 5678 --disabled-password --gecos "" appuser && chown -R appuser /app/backend
USER appuser

# Run Django migrations using entrypoint script
CMD ["/bin/bash", "/app/backend/entrypoint.sh"]