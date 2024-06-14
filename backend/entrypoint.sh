#!/bin/bash

# Apply migrations
python manage.py makemigrations --name initial_migration --noinput
python manage.py migrate --noinput

# Start Django server
python manage.py runserver 0.0.0.0:8000