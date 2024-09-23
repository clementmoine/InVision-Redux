ARG NODE_VERSION=21.7.2

FROM node:${NODE_VERSION}

# Use production node environment by default.
ENV NODE_ENV=development

WORKDIR /frontend

# Copy the source files into the image.
COPY . .

# Perform install
RUN yarn install

# Expose the port that the application listens on.
EXPOSE 3000

# Special env to configure the proxy
ENV VITE_IN_DOCKER_CONTAINER true

# Run the application.
CMD ["yarn", "dev"]
