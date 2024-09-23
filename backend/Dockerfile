# ---- Base Python Image ----
ARG PYTHON_VERSION=3.12
FROM python:${PYTHON_VERSION}-slim as base

# Install Poetry
RUN pip install poetry

# Change working directory
WORKDIR /backend

# Copy source code
COPY . .

# Install dependencies (without dev dependencies)
RUN poetry install --no-dev --no-interaction --no-ansi

# Flask app target
ENV FLASK_APP=/backend/src/app

# Expose the Flask port
EXPOSE 8080

# Run Flask backend
CMD ["poetry", "run", "flask", "run", "--host=0.0.0.0", "--port=8080"]