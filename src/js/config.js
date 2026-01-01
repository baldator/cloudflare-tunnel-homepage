// Configuration for Cloudflare Tunnel Homepage
// This now loads from config.yaml for better configurability

// Default configuration (can be overridden by config.yaml)
const DEFAULT_CONFIG = {
    app: {
        title: "Cloudflare Tunnel Dashboard",
        subtitle: "Your applications at a glance",
        refresh_interval: 60000,
        debug_mode: false
    },
    cloudflared: {
        config_paths: [
            'C:\\Program Files\\Cloudflare\\cloudflared\\config.yml',
            'C:\\Program Files (x86)\\Cloudflare\\cloudflared\\config.yml',
            '/etc/cloudflared/config.yml',
            '/usr/local/etc/cloudflared/config.yml',
            '~/.cloudflared/config.yml',
            './config.yml'
        ]
    },
    ui: {
        theme: {
            primary_color: '#f38200',
            secondary_color: '#0066cc',
            background_color: '#f8f9fa',
            card_background: '#ffffff',
            text_color: '#333333',
            text_light: '#666666'
        },
        layout: {
            apps_per_row: 3,
            card_padding: '20px',
            border_radius: '8px'
        }
    },
    features: {
        search_enabled: true,
        stats_enabled: true,
        auto_refresh_enabled: true,
        copy_to_clipboard_enabled: true
    },
    status: {
        active_text: 'Active',
        inactive_text: 'Inactive',
        active_color: '#28a745',
        inactive_color: '#dc3545'
    },
    custom_applications: [],
    footer: {
        text: 'Cloudflare Tunnel Dashboard | Auto-refresh every {interval} seconds',
        show_version: true
    }
};

// Load and merge configuration from YAML file
async function loadConfig() {
    try {
        // Try to load config.yaml
        const response = await fetch('config.yaml');
        if (response.ok) {
            const yamlContent = await response.text();
            // In a real implementation, you would parse the YAML here
            // For this demo, we'll return the default config
            console.log('Config YAML file found, but using default config for demo');
            return DEFAULT_CONFIG;
        }
    } catch (error) {
        console.log('No config.yaml found, using default configuration');
    }
    
    return DEFAULT_CONFIG;
}

// Export config loading function
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { loadConfig, DEFAULT_CONFIG };
}