# Exporting Cloudflared Configuration from Docker Container

This guide explains how to export the `config.yml` file from a running cloudflared Docker container so it can be used by the Cloudflare Tunnel Homepage.

## Method 1: Using Docker Copy Command

### Step 1: Find your cloudflared container
```bash
docker ps | grep cloudflared
```

### Step 2: Copy the config file from the container
```bash
docker cp <container_name_or_id>:/etc/cloudflared/config.yml ./cloudflared-config.yml
```

### Step 3: Update your homepage configuration
Edit the `config.yaml` file and update the cloudflared config paths:
```yaml
cloudflared:
  config_paths:
    - "./cloudflared-config.yml"  # Point to the copied file
    - "/etc/cloudflared/config.yml"
```

## Method 2: Using Docker Volume (Recommended)

### Step 1: Create a volume for cloudflared configuration
```bash
docker volume create cloudflared-config
```

### Step 2: Run cloudflared with the volume mounted
```bash
docker run \
  --name cloudflared \
  -v cloudflared-config:/etc/cloudflared \
  cloudflare/cloudflared:latest \
  tunnel --config /etc/cloudflared/config.yml run
```

### Step 3: Copy the config file from the volume
```bash
# Create a temporary container to access the volume
docker run --rm -it \
  -v cloudflared-config:/temp-config \
  alpine \
  cp /temp-config/config.yml /host-path/cloudflared-config.yml
```

## Method 3: Using Docker Exec

### Step 1: Access the container shell
```bash
docker exec -it <container_name_or_id> sh
```

### Step 2: Locate and copy the config file
```bash
# Inside the container
cat /etc/cloudflared/config.yml
```

### Step 3: Copy the content to your host machine
```bash
# On your host machine
docker exec <container_name_or_id> cat /etc/cloudflared/config.yml > cloudflared-config.yml
```

## Method 4: Using Docker Compose with Volume

### Step 1: Create a docker-compose.yml file
```yaml
docker-compose.yml:
version: '3'
services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    volumes:
      - ./cloudflared-config:/etc/cloudflared
    command: tunnel --config /etc/cloudflared/config.yml run
```

### Step 2: Start the container
```bash
docker-compose up -d
```

### Step 3: Access the config file
The config file will now be available in the `./cloudflared-config` directory on your host machine.

## Troubleshooting

### Permission Issues
If you encounter permission issues:
```bash
sudo chown -R $USER:$USER ./cloudflared-config.yml
```

### Container Not Found
Make sure your container is running:
```bash
docker ps -a
```

### Config File Not Found
Check the actual path in your container:
```bash
docker exec -it <container_name> find / -name config.yml
```

## Security Note

⚠️ **Important Security Consideration:**

The `config.yml` file contains sensitive information including your Cloudflare tunnel credentials. Be careful when handling this file:

1. **Never commit it to version control** (add to `.gitignore`)
2. **Set proper file permissions**: `chmod 600 cloudflared-config.yml`
3. **Consider using environment variables** for sensitive data
4. **Clean up** when no longer needed

## Alternative: Use Cloudflare API

Instead of exporting the config file, you can use the Cloudflare API to retrieve tunnel information:

```bash
# Get tunnel list
curl -X GET "https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/cfd_tunnel" \
  -H "Authorization: Bearer <API_TOKEN>" \
  -H "Content-Type: application/json"

# Get tunnel details
curl -X GET "https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/cfd_tunnel/<TUNNEL_ID>" \
  -H "Authorization: Bearer <API_TOKEN>" \
  -H "Content-Type: application/json"
```

This approach avoids handling sensitive configuration files while still providing access to tunnel information.