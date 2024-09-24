# ---- Base Python Image ----
ARG PYTHON_VERSION=3.12
FROM python:${PYTHON_VERSION}-slim as base

# Set custom PyPI index if PIP_INDEX_URL is defined
ARG PIP_INDEX_URL
RUN if [ -n "$PIP_INDEX_URL" ]; then \
        pip config set global.index-url "$PIP_INDEX_URL"; \
    fi

# Install Poetry
RUN pip install poetry

# Add custom source to poetry if env POETRY_CUSTOM_SOURCE_URL is defined
ARG POETRY_CUSTOM_SOURCE_URL
RUN if [ -n "$POETRY_CUSTOM_SOURCE_URL" ]; then \
        poetry source add custom "$POETRY_CUSTOM_SOURCE_URL"; \
    fi

# Change working directory
WORKDIR /backend

# Copy source code
COPY . .

# Install dependencies (without dev dependencies)
RUN poetry install --no-dev --no-interaction --no-ansi

# Flask app target
ENV FLASK_APP=/backend/src/app

# Expose the Flask port (disabled since we have a /api proxy on the frontend app)
# EXPOSE 8080

# Run Flask backend
CMD ["poetry", "run", "flask", "run", "--host=0.0.0.0", "--port=8080"]