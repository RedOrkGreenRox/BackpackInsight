FROM python:3.13-slim

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
# Add project root AND Backend/PlayerData to PYTHONPATH
ENV PYTHONPATH=/app:/app/Backend/PlayerData

# Copy requirements
COPY Backend/PlayerData/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project to preserve structure
COPY . /app/

# Set working directory to where the code is
WORKDIR /app/Backend/PlayerData

# Expose port (e.g., 8000 for internal API)
EXPOSE 8000

# Command to run the backend app
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
