# Cloudflare Tunnel Homepage

A user-friendly dashboard that displays all applications available through your Cloudflare Tunnel, with dynamic configuration retrieval from cloudflared.

## Features

- **Automatic Discovery**: Automatically finds and parses your cloudflared configuration
- **Application Listing**: Displays all applications with their URLs and status
- **Search Functionality**: Quickly find applications by name or URL
- **Auto-Refresh**: Automatically updates every 60 seconds
- **Responsive Design**: Works on desktop and mobile devices
- **One-Click Access**: Open applications directly from the dashboard

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/cloudflared-homepage.git
   cd cloudflared-homepage
   ```

2. **Install dependencies** (if any):
   ```bash
   # No dependencies required for basic functionality
   ```

3. **Configure cloudflared access**:
   - If running cloudflared in Docker, follow the [Docker Configuration Guide](DOCKER_CONFIGURATION.md) to export your config
   - Or place your `config.yml` in one of the default locations

4. **Run the application**:
   - Simply open `index.html` in your web browser
   - Or use a local web server for better performance:
   ```bash
   python -m http.server 8000
   ```

## Configuration

The application automatically looks for your cloudflared configuration in common locations:

- Windows: `C:\Program Files\Cloudflare\cloudflared\config.yml`
- Linux/macOS: `/etc/cloudflared/config.yml`
- User directory: `~/.cloudflared/config.yml`
- Current directory: `./config.yml`

## Usage

1. Open the application in your web browser
2. The dashboard will automatically load and display all applications from your cloudflared configuration
3. Use the search bar to find specific applications
4. Click "Refresh" to manually reload the configuration
5. Click "Open" to access an application or "Copy" to copy the URL to clipboard

## Customization

You can customize the application by modifying:

- **Styling**: Edit `src/css/style.css`
- **Configuration**: Edit `src/js/config.js`
- **Functionality**: Edit `src/js/main.js`

## Development

To work on the project:

1. Make your changes to the HTML, CSS, or JavaScript files
2. Test in your browser
3. Create a pull request with your improvements

## License

MIT License - feel free to use, modify, and distribute this software.

## Support

For issues or feature requests, please open an issue on GitHub.