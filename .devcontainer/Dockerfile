# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /workspace

# Install dependencies
RUN apk add --no-cache bash git

# Add non-root user for security
RUN addgroup -S devgroup && adduser -S devuser -G devgroup
USER devuser

# Expose ports for services
EXPOSE 3000 3001 9090 3005
