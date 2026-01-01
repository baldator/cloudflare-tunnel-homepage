# Dockerfile for Cloudflare Tunnel Homepage
FROM nginx:alpine

WORKDIR /app

COPY index.html /usr/share/nginx/html
COPY src/ /usr/share/nginx/html/src/


# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy cloudflared config (if available)
COPY cloudflared-config.yml /etc/cloudflared/config.yml 


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