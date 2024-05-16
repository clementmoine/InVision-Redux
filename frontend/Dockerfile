# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=21.7.2

FROM node:${NODE_VERSION}

# Use production node environment by default.
ENV NODE_ENV development

WORKDIR /app

# Perform the yarn install
COPY yarn.lock package.json ./
RUN yarn install

# Copy the rest of the source files into the image.
COPY . .

# Expose the port that the application listens on.
EXPOSE 3000

# Special env to configure the proxy
ENV VITE_IN_DOCKER_CONTAINER true

# Run the application.
CMD yarn dev
