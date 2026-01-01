# GitHub Actions for Cloudflare Tunnel Homepage

This guide explains the GitHub Actions workflows included with the Cloudflare Tunnel Homepage project.

## Available Workflows

### 1. Docker Build and Publish (`docker-build.yml`)

**Trigger:** Push to main/master, pull requests, or manual dispatch

**What it does:**
- Builds Docker image for multiple platforms (amd64, arm64)
- Pushes to GitHub Container Registry (GHCR)
- Creates and uploads Docker image as artifact
- Tests the built image
- Updates documentation
- Sends notifications

**Key Features:**
- Multi-platform builds
- Automatic tagging (commit SHA, semver, branch)
- Docker layer caching for faster builds
- Comprehensive testing
- Automatic README updates
- Slack notifications (if configured)

### 2. Simple Docker Build (`docker-build-simple.yml`)

**Trigger:** Push to main/master, pull requests, or manual dispatch

**What it does:**
- Simple Docker image build
- Saves image as artifact
- Basic testing

**Use case:** Quick testing without publishing to registry

## Setup Instructions

### 1. Enable GitHub Container Registry

1. Go to your repository Settings
2. Navigate to "Packages"
3. Ensure package visibility is set appropriately

### 2. Configure Secrets (Optional)

For Slack notifications:
1. Go to repository Settings → Secrets → Actions
2. Add `SLACK_WEBHOOK` secret with your Slack webhook URL

### 3. Using the Workflows

#### Manual Trigger
```bash
# Trigger workflow manually
gh workflow run docker-build.yml
```

#### Automatic Trigger
- Push to main/master branch
- Open a pull request
- Changes to Dockerfile or source files

## Customization

### Change Registry
Edit `.github/workflows/docker-build.yml`:
```yaml
env:
  REGISTRY: your-registry.io  # Change from ghcr.io
  IMAGE_NAME: your-repo/name
```

### Add Additional Tags
```yaml
- name: Extract metadata
  id: meta
  uses: docker/metadata-action@v5
  with:
    tags: |
      type=ref,event=branch
      type=ref,event=pr
      type=semver,pattern={{version}}
      type=sha
      type=raw,value=dev,enable={{is_default_branch}}
```

### Change Build Platforms
```yaml
platforms: linux/amd64,linux/arm64,linux/arm/v7
```

## Using the Built Images

### Pull from GitHub Container Registry
```bash
# Authenticate
echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u USERNAME --password-stdin

# Pull image
docker pull ghcr.io/your-username/cloudflared-homepage:latest
```

### Use in Docker Compose
```yaml
services:
  homepage:
    image: ghcr.io/your-username/cloudflared-homepage:latest
    ports:
      - "8080:80"
    volumes:
      - ./config.yaml:/usr/share/nginx/html/config.yaml
      - ./cloudflared-config:/etc/cloudflared
```

## Troubleshooting

### Build Fails
```bash
# Check workflow logs
gh run list
gh run view <run-id> --log
```

### Permission Issues
```yaml
# Ensure proper permissions in workflow
permissions:
  contents: read
  packages: write
```

### Cache Issues
```bash
# Clear cache
gh run list
gh run view <run-id> --log
# Look for cache issues and manually clear if needed
```

## Best Practices

### 1. Tagging Strategy
- Use semantic versioning for releases
- Use commit SHA for development builds
- Use branch names for feature branches

### 2. Image Optimization
- Keep Dockerfile multi-stage
- Use `.dockerignore` to exclude unnecessary files
- Regularly update base images

### 3. Security
- Scan images for vulnerabilities
- Use minimal base images
- Regularly update dependencies

### 4. Testing
- Test built images before deployment
- Include integration tests in workflow
- Test on multiple platforms

## Advanced Configuration

### Conditional Builds
```yaml
jobs:
  build:
    if: github.event_name != 'pull_request'
    # Only build on push, not PR
```

### Matrix Builds
```yaml
strategy:
  matrix:
    platform: [linux/amd64, linux/arm64]
```

### Custom Build Arguments
```yaml
args:
  - BUILD_ENV=production
  - APP_VERSION=${{ github.sha }}
```

## Monitoring and Maintenance

### View Workflow Runs
```bash
gh run list --workflow=docker-build.yml
```

### Check Package Usage
```bash
# View package statistics
gh api /users/your-username/packages/container/cloudflared-homepage
```

### Cleanup Old Images
```yaml
# Add to your workflow
- name: Cleanup old packages
  uses: actions/delete-package-versions@v4
  with:
    package-name: cloudflared-homepage
    package-type: container
    min-versions-to-keep: 5
    delete-only-untagged-versions: true
```

## Conclusion

The included GitHub Actions provide:
- ✅ Automated Docker builds
- ✅ Multi-platform support
- ✅ Testing and validation
- ✅ Documentation updates
- ✅ Notification system
- ✅ Artifact management

These workflows ensure your Cloudflare Tunnel Homepage is always built, tested, and ready for deployment with minimal manual intervention.