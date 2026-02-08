# Use an official Python runtime as a parent image
FROM python:3.13-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
# Add project root AND Backend/PlayerData to PYTHONPATH
# This allows imports like 'from Backend.PlayerData...' AND 'import Hero' (legacy)
ENV PYTHONPATH=/app:/app/Backend/PlayerData

# Install system dependencies and Node.js (for Sass)
RUN apt-get update && apt-get install -y --no-install-recommends \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Install Sass globally
RUN npm install -g sass

# Set the working directory in the container
WORKDIR /app

# Copy requirements file from Frontend/Web (relative to project root)
COPY Frontend/Web/requirements.txt /app/

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project
COPY . /app/

# Expose the port
EXPOSE 5080

# Set working directory to Web root for execution
WORKDIR /app/Frontend/Web

# Command to run the application:
# 1. Compile SCSS (Runtime, so it works with mounted volumes)
# 2. Start Python Server
# UPDATED: Paths now point to templates/branches where SCSS files live
CMD sh -c "echo 'Compiling SCSS...' && \
    sass templates/branches/main/main.scss templates/branches/main/main.css -q --no-source-map && \
    sass templates/branches/profile/profile.scss templates/branches/profile/profile.css -q --no-source-map && \
    sass templates/branches/items/items.scss templates/branches/items/items.css -q --no-source-map && \
    sass templates/branches/404/404.scss templates/branches/404/404.css -q --no-source-map && \
    echo 'Starting Server...' && \
    python web.py"
