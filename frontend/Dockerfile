ARG NODE_VERSION=21.7.2

FROM node:${NODE_VERSION}

# Use production node environment by default.
ENV NODE_ENV=development

WORKDIR /frontend

# Copy the source files into the image.
COPY . .

# Define build-time arguments
ARG NPM_REGISTRY_SERVER
ARG CUSTOM_CA_FILE

# Debug
RUN echo "NPM_REGISTRY_SERVER is $NPM_REGISTRY_SERVER"
RUN echo "CUSTOM_CA_FILE is $CUSTOM_CA_FILE"

# Set custom Yarn registry if NPM_REGISTRY_SERVER is defined
RUN if [ -n "$NPM_REGISTRY_SERVER" ]; then \
        yarn config set registry "$NPM_REGISTRY_SERVER" --global; \
        npm config set registry "$NPM_REGISTRY_SERVER" --global; \
    fi

# Copy the CA certificate into the image and set configurations if CUSTOM_CA_FILE is defined
RUN if [ -n "$CUSTOM_CA_FILE" ]; then \
        # Import cert file
        cp ${CUSTOM_CA_FILE} "/usr/local/share/ca-certificates/${CUSTOM_CA_FILE}"; \
        update-ca-certificates: \

        # Apply the cert file
        yarn config set cafile "/usr/local/share/ca-certificates/${CUSTOM_CA_FILE}"; \
        npm config set cafile "/usr/local/share/ca-certificates/${CUSTOM_CA_FILE}"; \
        export NODE_EXTRA_CA_CERTS="/usr/local/share/ca-certificates/${CUSTOM_CA_FILE}"; \
    fi

# Install dependencies
RUN yarn install --non-interactive

# Expose the port that the application listens on.
EXPOSE 3000

# Special env to configure the proxy
ENV VITE_IN_DOCKER_CONTAINER true

# Run the application.
CMD ["yarn", "dev"]