# Dockerfile for Cloudflare Tunnel Homepage
# Multi-stage build for optimized production image

# Stage 1: Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies including js-yaml for config processing
RUN npm install js-yaml

# Copy source files
COPY . .

# Build the application using config.yaml
RUN node build-index.js || echo "Build script failed, continuing with default files..."

# Stage 2: Production stage
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy cloudflared config (if available)
COPY cloudflared-config.yml /etc/cloudflared/config.yml 

# Copy build script for runtime config updates
COPY build-index.js /usr/share/nginx/html/build-index.js

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost/ || exit 1

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Use entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]