// Main application logic for Cloudflare Tunnel Homepage

// DOM Elements
const appGrid = document.getElementById('apps-grid');
const refreshBtn = document.getElementById('refresh-btn');
const searchInput = document.getElementById('search-input');
const configPathDisplay = document.getElementById('config-path-display');
const totalAppsDisplay = document.getElementById('total-apps');
const activeAppsDisplay = document.getElementById('active-apps');
const appTitle = document.querySelector('header h1');
const appSubtitle = document.querySelector('header .subtitle');

// Application state
let applications = [];
let filteredApplications = [];
let configPath = 'Not found';
let autoRefreshInterval;
let appConfig = {};

// Initialize the application
async function init() {
    console.log('Initializing Cloudflare Tunnel Homepage...');
    
    // Load configuration from YAML file
    await loadAppConfig();
    
    // Apply UI configuration
    applyUIConfiguration();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load applications from cloudflared config
    await loadApplications();
    
    // Start auto-refresh if enabled
    if (appConfig.features?.auto_refresh_enabled !== false) {
        startAutoRefresh();
    }
    
    console.log('Application initialized successfully');
}

// Set up event listeners
function setupEventListeners() {
    // Refresh button click
    refreshBtn.addEventListener('click', async () => {
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Refreshing';
        
        await loadApplications();
        
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
    });
    
    // Search input
    searchInput.addEventListener('input', () => {
        filterApplications();
    });
}

// Load applications from cloudflared config
async function loadApplications() {
    try {
        console.log('Loading applications from cloudflared config...');
        
        // Show loading state
        showLoadingState();
        
        // Find and parse cloudflared config
        const result = await findAndParseCloudflaredConfig();
        
        if (result.success) {
            applications = result.applications;
            configPath = result.configPath;
            
            // Add custom applications from config
            if (appConfig.custom_applications && appConfig.custom_applications.length > 0) {
                applications = [...applications, ...appConfig.custom_applications];
            }
            
            // Update UI
            updateConfigPathDisplay();
            filterApplications();
            updateStats();
            
            console.log(`Successfully loaded ${applications.length} applications`);
        } else {
            showErrorState(result.error || 'Failed to load applications');
            console.error('Failed to load applications:', result.error);
        }
        
    } catch (error) {
        showErrorState('Error loading applications: ' + error.message);
        console.error('Error loading applications:', error);
    }
}

// Find and parse cloudflared config file
async function findAndParseCloudflaredConfig() {
    // This is a simplified version - in a real implementation, you would:
    // 1. Try to find the cloudflared config file in common locations
    // 2. Parse the YAML configuration
    // 3. Extract ingress rules to determine available applications
    
    // For this demo, we'll simulate finding a config file and parsing it
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate finding config at a common location
            const simulatedConfigPath = '/etc/cloudflared/config.yml';
            
            // Simulate parsed applications from ingress rules
            const simulatedApplications = [
                {
                    id: 'app1',
                    name: 'Web Application',
                    url: 'https://web.your-tunnel.com',
                    localService: 'http://localhost:3000',
                    status: 'active',
                    lastUpdated: '2023-12-31T10:30:00Z'
                },
                {
                    id: 'app2',
                    name: 'API Service',
                    url: 'https://api.your-tunnel.com',
                    localService: 'http://localhost:8080',
                    status: 'active',
                    lastUpdated: '2023-12-31T09:15:00Z'
                },
                {
                    id: 'app3',
                    name: 'Admin Dashboard',
                    url: 'https://admin.your-tunnel.com',
                    localService: 'http://localhost:8000',
                    status: 'inactive',
                    lastUpdated: '2023-12-30T14:20:00Z'
                },
                {
                    id: 'app4',
                    name: 'Database Admin',
                    url: 'https://db.your-tunnel.com',
                    localService: 'http://localhost:5432',
                    status: 'active',
                    lastUpdated: '2023-12-31T11:45:00Z'
                },
                {
                    id: 'app5',
                    name: 'Monitoring System',
                    url: 'https://monitor.your-tunnel.com',
                    localService: 'http://localhost:9090',
                    status: 'active',
                    lastUpdated: '2023-12-31T10:00:00Z'
                }
            ];
            
            resolve({
                success: true,
                applications: simulatedApplications,
                configPath: simulatedConfigPath
            });
            
        }, 1500); // Simulate network delay
    });
}

// Filter applications based on search input
function filterApplications() {
    const searchTerm = searchInput.value.toLowerCase();
    
    if (searchTerm === '') {
        filteredApplications = [...applications];
    } else {
        filteredApplications = applications.filter(app => 
            app.name.toLowerCase().includes(searchTerm) ||
            app.url.toLowerCase().includes(searchTerm) ||
            app.localService.toLowerCase().includes(searchTerm)
        );
    }
    
    renderApplications();
}

// Render applications to the UI
function renderApplications() {
    if (filteredApplications.length === 0) {
        showEmptyState();
        return;
    }
    
    // Clear existing content
    appGrid.innerHTML = '';
    
    // Create app cards
    filteredApplications.forEach(app => {
        const appCard = createAppCard(app);
        appGrid.appendChild(appCard);
    });
}

// Create an application card element
function createAppCard(app) {
    const card = document.createElement('div');
    card.className = 'app-card';
    
    const statusText = app.status === 'active' 
        ? (appConfig.status?.active_text || 'Active') 
        : (appConfig.status?.inactive_text || 'Inactive');
    const statusClass = app.status === 'active' ? 'active' : 'inactive';
    
    card.innerHTML = `
        <div class="app-header">
            <div class="app-name">${app.name}</div>
            <div class="app-status ${statusClass}">${statusText}</div>
        </div>
        
        <div class="app-url">${app.url}</div>
        
        <div class="app-details">
            <div class="app-detail-row">
                <span class="app-detail-label">Local Service:</span>
                <span class="app-detail-value">${app.localService}</span>
            </div>
            <div class="app-detail-row">
                <span class="app-detail-label">Last Updated:</span>
                <span class="app-detail-value">${formatDate(app.lastUpdated)}</span>
            </div>
        </div>
        
        <div class="app-actions">
            <button class="app-btn primary" onclick="window.open('${app.url}', '_blank')">
                <i class="fas fa-external-link-alt"></i> Open
            </button>
            <button class="app-btn secondary" onclick="copyToClipboard('${app.url}')">
                <i class="fas fa-copy"></i> Copy
            </button>
        </div>
    `;
    
    return card;
}

// Show loading state
function showLoadingState() {
    appGrid.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading applications...</p>
        </div>
    `;
}

// Show empty state
function showEmptyState() {
    appGrid.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-inbox"></i>
            <h3>No applications found</h3>
            <p>Try adjusting your search or refresh the page</p>
        </div>
    `;
}

// Show error state
function showErrorState(errorMessage) {
    appGrid.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Error loading applications</h3>
            <p>${errorMessage}</p>
            <button class="btn" onclick="loadApplications()" style="margin-top: 15px;">
                <i class="fas fa-redo"></i> Try Again
            </button>
        </div>
    `;
}

// Update config path display
function updateConfigPathDisplay() {
    configPathDisplay.textContent = configPath;
}

// Update statistics
function updateStats() {
    totalAppsDisplay.textContent = applications.length;
    const activeCount = applications.filter(app => app.status === 'active').length;
    activeAppsDisplay.textContent = activeCount;
}

// Format date string
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleString();
    } catch (error) {
        return dateString;
    }
}

// Copy to clipboard utility
function copyToClipboard(text) {
    if (appConfig.features?.copy_to_clipboard_enabled === false) {
        return;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        // Show temporary notification (would be better with a proper toast system)
        const originalText = event.target.innerHTML;
        event.target.innerHTML = '<i class="fas fa-check"></i> Copied!';
        
        setTimeout(() => {
            event.target.innerHTML = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

// Start auto-refresh
function startAutoRefresh() {
    const refreshInterval = appConfig.app?.refresh_interval || 60000;
    autoRefreshInterval = setInterval(async () => {
        console.log('Auto-refreshing applications...');
        await loadApplications();
    }, refreshInterval);
}

// Stop auto-refresh
function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
}

// Update footer text
function updateFooter() {
    const footer = document.querySelector('footer p');
    if (footer) {
        const intervalSeconds = (appConfig.app?.refresh_interval || 60000) / 1000;
        footer.textContent = appConfig.footer?.text
            ? appConfig.footer.text.replace('{interval}', intervalSeconds)
            : `Cloudflare Tunnel Dashboard | Auto-refresh every ${intervalSeconds} seconds`;
    }
}

// Load application configuration from YAML
async function loadAppConfig() {
    try {
        // In a real implementation, this would load and parse config.yaml
        // For this demo, we'll use a simplified approach
        appConfig = {
            app: {
                title: "Cloudflare Tunnel Dashboard",
                subtitle: "Your applications at a glance",
                refresh_interval: 60000,
                debug_mode: false
            },
            cloudflared: {
                config_paths: [
                    'C:\\Program Files\\Cloudflare\\cloudflared\\config.yml',
                    '/etc/cloudflared/config.yml',
                    '~/.cloudflared/config.yml',
                    './config.yml'
                ]
            },
            ui: {
                theme: {
                    primary_color: '#f38200',
                    secondary_color: '#0066cc'
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
        
        console.log('Configuration loaded successfully');
        
    } catch (error) {
        console.error('Error loading configuration:', error);
        // Fall back to default configuration
        appConfig = {
            app: {
                title: "Cloudflare Tunnel Dashboard",
                subtitle: "Your applications at a glance",
                refresh_interval: 60000,
                debug_mode: false
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
            footer: {
                text: 'Cloudflare Tunnel Dashboard | Auto-refresh every {interval} seconds',
                show_version: true
            }
        };
    }
}

// Apply UI configuration
function applyUIConfiguration() {
    // Update title and subtitle
    if (appConfig.app?.title) {
        appTitle.innerHTML = `<i class="fas fa-cloud"></i> ${appConfig.app.title}`;
    }
    
    if (appConfig.app?.subtitle) {
        appSubtitle.textContent = appConfig.app.subtitle;
    }
    
    // Apply theme colors if available
    if (appConfig.ui?.theme) {
        const theme = appConfig.ui.theme;
        if (theme.primary_color) {
            document.documentElement.style.setProperty('--primary-color', theme.primary_color);
        }
        if (theme.secondary_color) {
            document.documentElement.style.setProperty('--secondary-color', theme.secondary_color);
        }
        if (theme.background_color) {
            document.documentElement.style.setProperty('--background-color', theme.background_color);
        }
        if (theme.card_background) {
            document.documentElement.style.setProperty('--card-bg', theme.card_background);
        }
        if (theme.text_color) {
            document.documentElement.style.setProperty('--text-color', theme.text_color);
        }
        if (theme.text_light) {
            document.documentElement.style.setProperty('--text-light', theme.text_light);
        }
    }
    
    // Update footer
    updateFooter();
    
    // Toggle features based on configuration
    if (appConfig.features?.search_enabled === false) {
        searchInput.style.display = 'none';
    }
    
    if (appConfig.features?.stats_enabled === false) {
        document.querySelector('.stats').style.display = 'none';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Clean up when page unloads
window.addEventListener('beforeunload', stopAutoRefresh);