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
CMD sh -c "echo 'Compiling SCSS...' && \
    sass static/scss/branches/main.scss static/css/main.css -q --no-source-map && \
    sass static/scss/branches/profile.scss static/css/profile.css -q --no-source-map && \
    sass static/scss/branches/items.scss static/css/items.css -q --no-source-map && \
    sass static/scss/branches/404.scss static/css/404.css -q --no-source-map && \
    echo 'Starting Server...' && \
    python web.py"
