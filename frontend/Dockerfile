ARG NODE_VERSION=22.8.0
FROM node:${NODE_VERSION}

# Use production node environment by default.
ENV NODE_ENV=development

WORKDIR /frontend

# Copy the source files into the image.
COPY . .

# Define build-time arguments
ARG NPM_REGISTRY_SERVER
ARG CUSTOM_CA_FILE

# Copy the CA certificate into the image and set configurations if CUSTOM_CA_FILE is defined
RUN if [ -n "$CUSTOM_CA_FILE" ]; then \
        cp ${CUSTOM_CA_FILE} "/usr/local/share/ca-certificates/${CUSTOM_CA_FILE}"; \
        update-ca-certificates; \
        yarn config set cafile "/usr/local/share/ca-certificates/${CUSTOM_CA_FILE}"; \
        npm config set cafile "/usr/local/share/ca-certificates/${CUSTOM_CA_FILE}"; \
        export NODE_EXTRA_CA_CERTS="/usr/local/share/ca-certificates/${CUSTOM_CA_FILE}"; \
    fi


# Set custom Yarn registry if NPM_REGISTRY_SERVER is defined
RUN if [ -n "$NPM_REGISTRY_SERVER" ]; then \
        yarn config set registry "$NPM_REGISTRY_SERVER" --global; \
        npm config set registry "$NPM_REGISTRY_SERVER" --global; \
    fi

# Install dependencies
RUN yarn install --non-interactive

# Expose the port that the application listens on.
EXPOSE 3000

# Special env to configure the proxy
ENV VITE_IN_DOCKER_CONTAINER true

# Run the application.
CMD ["yarn", "dev"]