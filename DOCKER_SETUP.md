# Docker Setup Guide for Cloudflare Tunnel Homepage

This guide explains how to set up the Cloudflare Tunnel Homepage using Docker and Docker Compose, with shared configuration between the homepage and cloudflared.

## Prerequisites

- Docker installed on your system
- Docker Compose installed
- Cloudflare account with tunnel configured
- Basic understanding of Docker concepts

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/your-username/cloudflared-homepage.git
cd cloudflared-homepage
```

### 2. Set up your cloudflared configuration

Edit the `cloudflared-config.yml` file with your actual tunnel configuration:

```yaml
# cloudflared-config.yml
tunnel: your-tunnel-id-or-name
credentials-file: /etc/cloudflared/credentials.json

# Your ingress rules go here
# These will be displayed in the homepage
ingress:
  - hostname: web.your-domain.com
    service: http://localhost:3000
  - hostname: api.your-domain.com
    service: http://localhost:8080
```

### 3. Place your credentials file

Copy your Cloudflare tunnel credentials to:
```bash
cp /path/to/your/credentials.json ./cloudflared-config/credentials.json
```

### 4. Start the services
```bash
docker-compose up -d
```

### 5. Access the homepage

Open your browser and navigate to:
```
http://localhost:8080
```

## Configuration Files Explained

### `docker-compose.yml`

This file defines three services:

1. **homepage**: The Cloudflare Tunnel Homepage web interface
2. **cloudflared**: The Cloudflare tunnel service
3. **cloudflared-config**: Optional configuration manager

**Key features:**
- Shared volume for cloudflared configuration
- Network bridge for communication
- Health checks
- Automatic restarts

### `Dockerfile`

Multi-stage build that:
1. Uses Node.js for building (if needed)
2. Creates a lightweight NGINX production image
3. Includes health checks
4. Optimized for performance

### `cloudflared-config.yml`

Example configuration that:
- Defines your tunnel ID/name
- Specifies ingress rules (these become applications in the homepage)
- Includes logging and metrics configuration

## Advanced Setup

### Customizing the Homepage

Edit `config.yaml` to customize the homepage appearance and behavior:

```yaml
# config.yaml
app:
  title: "My Custom Dashboard"
  subtitle: "Production Applications"
  refresh_interval: 30000  # 30 seconds

ui:
  theme:
    primary_color: "#ff69b4"  # Hot pink theme
    secondary_color: "#8a2be2"  # Blue violet
```

### Adding Custom Applications

You can add applications that aren't in your cloudflared config:

```yaml
# In config.yaml
custom_applications:
  - name: "Internal Wiki"
    url: "https://wiki.internal.company.com"
    local_service: "http://localhost:8090"
    status: "active"
```

### Environment Variables

Add environment variables to your `docker-compose.yml`:

```yaml
services:
  homepage:
    environment:
      - APP_TITLE="Production Dashboard"
      - REFRESH_INTERVAL=60000
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs homepage
docker-compose logs cloudflared

# Check container status
docker-compose ps
```

### Configuration not loading
```bash
# Verify the config file is in the volume
docker exec -it cloudflared-homepage ls -la /etc/cloudflared/

# Check file permissions
docker exec -it cloudflared-homepage cat /etc/cloudflared/config.yml
```

### Port conflicts
```bash
# Change the port mapping in docker-compose.yml
ports:
  - "8081:80"  # Changed from 8080 to 8081
```

## Security Considerations

### Volume Permissions
```bash
# Set proper permissions on your config directory
chmod -R 750 ./cloudflared-config
chown -R 1000:1000 ./cloudflared-config
```

### Network Security
```yaml
# Add network restrictions in docker-compose.yml
networks:
  cloudflare-network:
    driver: bridge
    internal: true  # Makes the network internal only
```

### Secrets Management
For production, consider using Docker secrets or environment variables for sensitive data.

## Updating

### Update the homepage
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Update cloudflared
```bash
# In docker-compose.yml, change the image tag
docker-compose.yml:
  cloudflared:
    image: cloudflare/cloudflared:latest  # or specific version

# Then rebuild
docker-compose pull cloudflared
docker-compose up -d --force-recreate
```

## Monitoring

### View logs
```bash
# Follow logs for all services
docker-compose logs -f

# Follow logs for specific service
docker-compose logs -f homepage
```

### Check resource usage
```bash
docker stats cloudflared-homepage cloudflared-tunnel
```

## Backup and Restore

### Backup configuration
```bash
# Create backup
tar -czvf cloudflared-backup-$(date +%Y-%m-%d).tar.gz ./cloudflared-config/ ./config.yaml
```

### Restore configuration
```bash
# Restore from backup
tar -xzvf cloudflared-backup-2023-12-31.tar.gz
```

## Alternative: Separate Containers

If you prefer to run the homepage separately from cloudflared:

```yaml
# Minimal docker-compose.yml for homepage only
version: '3.8'

services:
  homepage:
    build: .
    ports:
      - "8080:80"
    volumes:
      - ./config.yaml:/usr/share/nginx/html/config.yaml
      - /path/to/your/cloudflared-config:/etc/cloudflared:ro
```

## Conclusion

This Docker setup provides:
- ✅ Easy deployment and management
- ✅ Shared configuration between services
- ✅ Production-ready setup
- ✅ Scalable architecture
- ✅ Security best practices

The shared volume approach ensures that both the homepage and cloudflared services always have access to the latest configuration, making it easy to manage your Cloudflare tunnel applications.