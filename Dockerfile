# Use a specific Node.js version
ARG NODE_VERSION=22.15.0

FROM node:${NODE_VERSION}-alpine

# Set the default environment to production
ENV NODE_ENV production

# Set the working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Switch to a non-root user
USER node

# Copy the rest of the application files
COPY . .

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "--env-file=.env", "."]
