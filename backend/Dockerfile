ARG PYTHON_VERSION=3.12.0
FROM python:${PYTHON_VERSION}-slim as base

# Define build-time arguments
ARG PYTHON_REGISTY_URL
ARG CUSTOM_CA_FILE

# Change working directory
WORKDIR /backend

# Copy source code
COPY . .

# Copy the CA certificate into the image and set configurations if CUSTOM_CA_FILE is defined
RUN if [ -n "$CUSTOM_CA_FILE" ]; then \
        cp ${CUSTOM_CA_FILE} "/usr/local/share/ca-certificates/${CUSTOM_CA_FILE}"; \
        update-ca-certificates; \
        pip config set global.cert "/usr/local/share/ca-certificates/${CUSTOM_CA_FILE}"; \
    fi

# Set custom PyPI index url if PIP_INDEX_URL is defined
RUN if [ -n "$PYTHON_REGISTY_URL" ]; then \
        pip config set global.index-url "$PYTHON_REGISTY_URL"; \
    fi

# Install Poetry
RUN pip install poetry

# Configure the certificate
RUN if [ -n "$CUSTOM_CA_FILE" ]; then \
        poetry config certificates.custom.cert "/usr/local/share/ca-certificates/${CUSTOM_CA_FILE}"; \
    fi

# Add custom source to poetry if env PYTHON_REGISTY_URL is defined
RUN if [ -n "$PYTHON_REGISTY_URL" ]; then \
        poetry source add custom "$PYTHON_REGISTY_URL"; \
    fi

# Install dependencies (without dev dependencies)
RUN poetry install --only main --no-interaction --no-ansi

# Flask app target
ENV FLASK_APP=/backend/src/app

# Expose the Flask port (disabled since we have a /api proxy on the frontend app)
# EXPOSE 8080

# Run Flask backend
CMD ["poetry", "run", "flask", "run", "--host=0.0.0.0", "--port=8080"]