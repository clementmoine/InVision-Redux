ARG NODE_VERSION=21.7.2

FROM node:${NODE_VERSION}

# Use production node environment by default.
ENV NODE_ENV=development

WORKDIR /frontend

# Copy the source files into the image.
COPY . .

# Set custom Yarn registry if YARN_REGISTRY is defined
ARG YARN_REGISTRY
RUN if [ -n "$YARN_REGISTRY" ]; then \
        yarn config set registry "$YARN_REGISTRY"; \
    fi

# Set custom CA file if YARN_CAFILE is defined
ARG YARN_CAFILE
RUN if [ -n "$YARN_CAFILE" ]; then \
        yarn config set cafile "$YARN_CAFILE"; \
    fi

# Install dependencies
RUN yarn install --non-interactive

# Expose the port that the application listens on.
EXPOSE 3000

# Special env to configure the proxy
ENV VITE_IN_DOCKER_CONTAINER true

# Run the application.
CMD ["yarn", "dev"]
