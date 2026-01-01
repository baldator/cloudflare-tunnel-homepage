#!/bin/sh

# Docker Entrypoint Script for Cloudflare Tunnel Homepage
# This script runs when the container starts and handles configuration

set -e

echo "🚀 Starting Cloudflare Tunnel Homepage..."

# Check if config.yaml exists
if [ -f "/usr/share/nginx/html/config.yaml" ]; then
    echo "📖 Found config.yaml"
else
    echo "ℹ️ No config.yaml found, using default configuration"
fi

# Check if cloudflared config exists
if [ -f "/etc/cloudflared/config.yml" ]; then
    echo "🔧 Cloudflared config found at /etc/cloudflared/config.yml"
else
    echo "⚠️ No cloudflared config found at /etc/cloudflared/config.yml"
fi

# Start the main process (nginx)
echo "🌐 Starting NGINX..."
exec "$@"