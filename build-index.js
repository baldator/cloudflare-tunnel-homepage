#!/usr/bin/env node

/**
 * Cloudflare Tunnel Homepage - Index HTML Builder
 * 
 * This script dynamically generates index.html using configuration from config.yaml
 * It runs when the Docker container starts to ensure the latest configuration is used
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Configuration paths
const CONFIG_PATH = path.join(__dirname, 'config.yaml');
const TEMPLATE_PATH = path.join(__dirname, 'index-template.html');
const OUTPUT_PATH = path.join(__dirname, 'index.html');
const DEFAULT_CONFIG_PATH = path.join(__dirname, 'src', 'js', 'config.js');

/**
 * Load YAML configuration
 */
function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const configContent = fs.readFileSync(CONFIG_PATH, 'utf8');
            return yaml.load(configContent);
        }
    } catch (error) {
        console.error('Error loading config.yaml:', error.message);
    }
    
    // Fallback to default configuration
    return getDefaultConfig();
}

/**
 * Get default configuration
 */
function getDefaultConfig() {
    return {
        app: {
            title: "Cloudflare Tunnel Dashboard",
            subtitle: "Your applications at a glance",
            refresh_interval: 60000,
            debug_mode: false
        },
        ui: {
            theme: {
                primary_color: "#f38200",
                secondary_color: "#0066cc",
                background_color: "#f8f9fa",
                card_background: "#ffffff",
                text_color: "#333333",
                text_light: "#666666"
            }
        },
        features: {
            search_enabled: true,
            stats_enabled: true,
            auto_refresh_enabled: true,
            copy_to_clipboard_enabled: true
        },
        status: {
            active_text: "Active",
            inactive_text: "Inactive",
            active_color: "#28a745",
            inactive_color: "#dc3545"
        },
        footer: {
            text: "Cloudflare Tunnel Dashboard | Auto-refresh every {interval} seconds",
            show_version: true
        }
    };
}

/**
 * Generate HTML from template with configuration
 */
function generateHtml(config) {
    // Load template
    let template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
    
    // Replace placeholders with config values
    template = template.replace('{{APP_TITLE}}', config.app.title || 'Cloudflare Tunnel Dashboard');
    template = template.replace('{{APP_SUBTITLE}}', config.app.subtitle || 'Your applications at a glance');
    template = template.replace('{{PRIMARY_COLOR}}', config.ui.theme.primary_color || '#f38200');
    template = template.replace('{{SECONDARY_COLOR}}', config.ui.theme.secondary_color || '#0066cc');
    template = template.replace('{{BACKGROUND_COLOR}}', config.ui.theme.background_color || '#f8f9fa');
    template = template.replace('{{CARD_BACKGROUND}}', config.ui.theme.card_background || '#ffffff');
    template = template.replace('{{TEXT_COLOR}}', config.ui.theme.text_color || '#333333');
    template = template.replace('{{TEXT_LIGHT}}', config.ui.theme.text_light || '#666666');
    
    // Features flags
    const searchEnabled = config.features.search_enabled !== false;
    const statsEnabled = config.features.stats_enabled !== false;
    const copyEnabled = config.features.copy_to_clipboard_enabled !== false;
    
    template = template.replace('{{SEARCH_ENABLED}}', searchEnabled ? '' : 'style="display:none"');
    template = template.replace('{{STATS_ENABLED}}', statsEnabled ? '' : 'style="display:none"');
    template = template.replace('{{COPY_ENABLED}}', copyEnabled ? '' : 'style="display:none"');
    
    // Status text
    template = template.replace('{{ACTIVE_TEXT}}', config.status.active_text || 'Active');
    template = template.replace('{{INACTIVE_TEXT}}', config.status.inactive_text || 'Inactive');
    
    // Footer
    const intervalSeconds = (config.app.refresh_interval || 60000) / 1000;
    const footerText = (config.footer.text || 'Cloudflare Tunnel Dashboard | Auto-refresh every {interval} seconds')
        .replace('{interval}', intervalSeconds);
    template = template.replace('{{FOOTER_TEXT}}', footerText);
    
    return template;
}

/**
 * Generate JavaScript config file
 */
function generateJsConfig(config) {
    const jsConfig = `
// Auto-generated configuration - do not edit manually
const AppConfig = ${JSON.stringify(config, null, 2)};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppConfig;
}
`;
    
    fs.writeFileSync(DEFAULT_CONFIG_PATH, jsConfig, 'utf8');
    console.log('Generated JavaScript config:', DEFAULT_CONFIG_PATH);
}

/**
 * Main build function
 */
function build() {
    console.log('🚀 Starting Cloudflare Tunnel Homepage build...');
    
    try {
        // Load configuration
        console.log('📖 Loading configuration from:', CONFIG_PATH);
        const config = loadConfig();
        console.log('✅ Configuration loaded successfully');
        
        // Check if template exists
        if (!fs.existsSync(TEMPLATE_PATH)) {
            console.error('❌ Template file not found:', TEMPLATE_PATH);
            console.log('📝 Creating default template...');
            createDefaultTemplate();
        }
        
        // Generate HTML
        console.log('🔧 Generating index.html...');
        const html = generateHtml(config);
        fs.writeFileSync(OUTPUT_PATH, html, 'utf8');
        console.log('✅ Generated index.html:', OUTPUT_PATH);
        
        // Generate JavaScript config
        console.log('📜 Generating JavaScript config...');
        generateJsConfig(config);
        
        console.log('🎉 Build completed successfully!');
        console.log('📊 Configuration used:', JSON.stringify(config, null, 2));
        
        return true;
        
    } catch (error) {
        console.error('❌ Build failed:', error);
        return false;
    }
}

/**
 * Create default template if missing
 */
function createDefaultTemplate() {
    const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{APP_TITLE}}</title>
    <style>
        :root {
            --primary-color: {{PRIMARY_COLOR}};
            --secondary-color: {{SECONDARY_COLOR}};
            --background-color: {{BACKGROUND_COLOR}};
            --card-bg: {{CARD_BACKGROUND}};
            --text-color: {{TEXT_COLOR}};
            --text-light: {{TEXT_LIGHT}};
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--background-color);
            color: var(--text-color);
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        header h1 {
            color: var(--primary-color);
            font-size: 2.5rem;
        }
        
        .subtitle {
            color: var(--text-light);
            font-size: 1.1rem;
        }
        
        .search-bar {{SEARCH_ENABLED}} {
            margin-bottom: 20px;
        }
        
        .stats {{STATS_ENABLED}} {
            margin-bottom: 20px;
        }
        
        footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px 0;
            color: var(--text-light);
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>{{APP_TITLE}}</h1>
            <p class="subtitle">{{APP_SUBTITLE}}</p>
        </header>
        
        <div class="search-bar" {{SEARCH_ENABLED}}>
            <input type="text" placeholder="Search applications...">
        </div>
        
        <div class="stats" {{STATS_ENABLED}}>
            <div class="stat-card">
                <div class="stat-value">0</div>
                <div class="stat-label">Applications</div>
            </div>
        </div>
        
        <div id="apps-grid">
            <p>Loading applications...</p>
        </div>
        
        <footer>
            <p>{{FOOTER_TEXT}}</p>
        </footer>
    </div>
    
    <script>
        // Configuration from config.yaml
        window.AppConfig = {
            status: {
                active_text: '{{ACTIVE_TEXT}}',
                inactive_text: '{{INACTIVE_TEXT}}',
                active_color: '{{ACTIVE_COLOR}}',
                inactive_color: '{{INACTIVE_COLOR}}'
            },
            features: {
                search_enabled: {{SEARCH_ENABLED}},
                stats_enabled: {{STATS_ENABLED}},
                copy_to_clipboard_enabled: {{COPY_ENABLED}}
            }
        };
    </script>
    
    <script src="src/js/main.js"></script>
</body>
</html>
`;
    
    fs.writeFileSync(TEMPLATE_PATH, template, 'utf8');
    console.log('✅ Created default template:', TEMPLATE_PATH);
}

/**
 * Docker entrypoint function
 */
function dockerEntrypoint() {
    console.log('🐳 Running in Docker container - checking for config changes...');
    
    // Watch for config changes (in development)
    if (process.env.NODE_ENV === 'development') {
        console.log('👀 Watching for configuration changes...');
        fs.watch(CONFIG_PATH, (eventType) => {
            if (eventType === 'change') {
                console.log('🔄 Configuration changed - rebuilding...');
                build();
            }
        });
    }
    
    // Initial build
    const success = build();
    
    // Keep container running if needed
    if (process.env.KEEP_ALIVE === 'true') {
        console.log('🕰️ Keeping container alive...');
        setInterval(() => {}, 1000);
    }
    
    return success;
}

// Run the appropriate function based on environment
if (process.env.DOCKER_ENTRYPOINT === 'true') {
    dockerEntrypoint();
} else {
    // Regular build
    const success = build();
    process.exit(success ? 0 : 1);
}

// Export for programmatic use
module.exports = { build, loadConfig, generateHtml };