#!/bin/bash

# Apply migrations
python manage.py makemigrations --name initial_migration --no-input
python manage.py migrate --no-input

# Start Django server
python manage.py runserver 0.0.0.0:8000