// Global variables
let isDarkTheme = false;
let selectedComponent = null;
let componentCounter = 0;
let undoStack = [];
let redoStack = [];
let currentLayer = 0;
let layers = [0]; // Layer IDs
let searchQuery = '';
let isResizing = false;
let resizeHandle = null;
let componentVariants = {};
let annotations = [];
let versionHistory = [];
let currentVersion = 0;

// Service definitions with expanded categories and variants
const services = {
    // Compute
    vm: { 
        icon: '🖥️', 
        label: 'Virtual Machine', 
        color: '#0078d4', 
        category: 'compute',
        variants: ['standard', 'premium', 'basic'],
        cost: { hourly: 0.05, monthly: 36.50 },
        security: ['network-security-groups', 'encryption-at-rest'],
        performance: { cpu: '2-64 cores', memory: '1-448 GB' }
    },
    appservice: { 
        icon: '🌐', 
        label: 'App Service', 
        color: '#68217a', 
        category: 'compute',
        variants: ['free', 'basic', 'standard', 'premium'],
        cost: { hourly: 0.013, monthly: 9.49 },
        security: ['managed-identity', 'ssl-binding'],
        performance: { cpu: '1-20 cores', memory: '1.75-14 GB' }
    },
    function: { 
        icon: '⚡', 
        label: 'Function App', 
        color: '#0078d4', 
        category: 'compute',
        variants: ['consumption', 'premium', 'dedicated'],
        cost: { perMillion: 0.20, monthly: 0 },
        security: ['managed-identity', 'private-endpoints'],
        performance: { timeout: '10 minutes', memory: '1.5 GB' }
    },
    container: { 
        icon: '📦', 
        label: 'Container Instance', 
        color: '#00a1f1', 
        category: 'compute',
        variants: ['linux', 'windows'],
        cost: { hourly: 0.000014, monthly: 0.01 },
        security: ['vnet-integration', 'managed-identity'],
        performance: { cpu: '1-4 cores', memory: '1.5-16 GB' }
    },
    
    // Storage
    storage: { 
        icon: '📦', 
        label: 'Storage Account', 
        color: '#0078d4', 
        category: 'storage',
        variants: ['general-purpose-v2', 'premium', 'blob'],
        cost: { perGB: 0.0184, monthly: 0 },
        security: ['encryption-at-rest', 'rbac'],
        performance: { throughput: '60 MB/s', iops: '500' }
    },
    sql: { 
        icon: '🗄️', 
        label: 'SQL Database', 
        color: '#68217a', 
        category: 'storage',
        variants: ['basic', 'standard', 'premium'],
        cost: { hourly: 0.005, monthly: 3.66 },
        security: ['always-encrypted', 'threat-detection'],
        performance: { dtus: '5-4000', storage: '2-4 TB' }
    },
    cosmos: { 
        icon: '🌌', 
        label: 'Cosmos DB', 
        color: '#0078d4', 
        category: 'storage',
        variants: ['sql', 'mongodb', 'cassandra'],
        cost: { perRU: 0.00008, monthly: 0 },
        security: ['encryption-at-rest', 'ip-firewall'],
        performance: { ru: '400-unlimited', latency: '<10ms' }
    },
    redis: { 
        icon: '🔴', 
        label: 'Redis Cache', 
        color: '#d13438', 
        category: 'storage',
        variants: ['basic', 'standard', 'premium'],
        cost: { hourly: 0.013, monthly: 9.49 },
        security: ['ssl', 'vnet-integration'],
        performance: { memory: '250 MB-53 GB', connections: '1000-40000' }
    },
    
    // Networking
    vnet: { 
        icon: '🌐', 
        label: 'Virtual Network', 
        color: '#68217a', 
        category: 'networking',
        variants: ['standard', 'premium'],
        cost: { monthly: 0.087 },
        security: ['nsg', 'ddos-protection'],
        performance: { bandwidth: '1-100 Gbps', latency: '<1ms' }
    },
    loadbalancer: { 
        icon: '⚖️', 
        label: 'Load Balancer', 
        color: '#00a1f1', 
        category: 'networking',
        variants: ['basic', 'standard'],
        cost: { hourly: 0.003, monthly: 2.19 },
        security: ['ddos-protection', 'health-probes'],
        performance: { throughput: '1-35 Gbps', connections: '1000-1000000' }
    },
    gateway: { 
        icon: '🚪', 
        label: 'API Gateway', 
        color: '#0078d4', 
        category: 'networking',
        variants: ['consumption', 'standard', 'premium'],
        cost: { perMillion: 3.50, monthly: 0 },
        security: ['oauth2', 'rate-limiting'],
        performance: { requests: '1000-10000/sec', latency: '<100ms' }
    },
    cdn: { 
        icon: '🚀', 
        label: 'CDN', 
        color: '#00a1f1', 
        category: 'networking',
        variants: ['standard', 'premium'],
        cost: { perGB: 0.081, monthly: 0 },
        security: ['https', 'geo-filtering'],
        performance: { bandwidth: 'unlimited', edge: '200+ locations' }
    },
    
    // Security
    keyvault: { 
        icon: '🔑', 
        label: 'Key Vault', 
        color: '#68217a', 
        category: 'security',
        variants: ['standard', 'premium'],
        cost: { per10k: 0.03, monthly: 0 },
        security: ['hsm', 'rbac'],
        performance: { requests: '2000/sec', latency: '<100ms' }
    },
    firewall: { 
        icon: '🔥', 
        label: 'Firewall', 
        color: '#d13438', 
        category: 'security',
        variants: ['standard', 'premium'],
        cost: { hourly: 0.065, monthly: 47.45 },
        security: ['threat-intelligence', 'dns-proxy'],
        performance: { throughput: '30 Gbps', connections: '1000000' }
    },
    bastion: { 
        icon: '🏰', 
        label: 'Bastion', 
        color: '#0078d4', 
        category: 'security',
        variants: ['standard', 'premium'],
        cost: { hourly: 0.095, monthly: 69.35 },
        security: ['ssl-vpn', 'multi-factor'],
        performance: { connections: '25 concurrent', latency: '<100ms' }
    }
};

// Component data storage
let components = new Map();
let connections = [];
let zoomLevel = 1;
let panOffset = { x: 0, y: 0 };
let isPanning = false;
let lastPanPoint = { x: 0, y: 0 };
let panMode = false;
let spacebarPressed = false;
let gridSize = 20;
let selectedGroup = null;
let groups = new Map();

// Connection types with enhanced properties
const connectionTypes = {
    data: { 
        style: 'solid', 
        color: '#0078d4', 
        label: 'Data Flow', 
        icon: '📊',
        width: 2,
        arrowhead: true,
        latency: 'low',
        bandwidth: 'high'
    },
    network: { 
        style: 'dashed', 
        color: '#00a1f1', 
        label: 'Network', 
        icon: '🌐',
        width: 2,
        arrowhead: false,
        latency: 'medium',
        bandwidth: 'medium'
    },
    security: { 
        style: 'dotted', 
        color: '#68217a', 
        label: 'Security', 
        icon: '🔒',
        width: 3,
        arrowhead: true,
        latency: 'low',
        bandwidth: 'low'
    },
    management: { 
        style: 'solid', 
        color: '#ff8c00', 
        label: 'Management', 
        icon: '⚙️',
        width: 1,
        arrowhead: false,
        latency: 'high',
        bandwidth: 'low'
    }
};

// Advanced keyboard shortcuts
const keyboardShortcuts = {
    'Ctrl+Z': 'Undo',
    'Ctrl+Shift+Z': 'Redo',
    'Ctrl+S': 'Save Screenshot',
    'Ctrl+O': 'Import JSON',
    'Ctrl+E': 'Export JSON',
    'Ctrl+=': 'Zoom In',
    'Ctrl+-': 'Zoom Out',
    'Ctrl+0': 'Reset Zoom',
    'Delete': 'Delete Selected',
    'Ctrl+Shift+T': 'Open Terminal',
    'Ctrl+G': 'Group Selected',
    'Ctrl+Shift+G': 'Ungroup Selected',
    'Ctrl+F': 'Search Components',
    'Ctrl+L': 'Add Layer',
    'Ctrl+Shift+L': 'Delete Layer',
    'Ctrl+R': 'Resize Mode',
    'Ctrl+A': 'Select All',
    'Ctrl+D': 'Deselect All',
    'Ctrl+C': 'Copy Selected',
    'Ctrl+V': 'Paste',
    'Ctrl+X': 'Cut Selected',
    'Ctrl+Shift+S': 'Save As Template',
    'Ctrl+Shift+O': 'Open Template',
    'Ctrl+Shift+P': 'Properties Panel',
    'Ctrl+Shift+M': 'Minimap Toggle',
    'Ctrl+Shift+G': 'Grid Toggle',
    'Ctrl+Shift+A': 'Add Annotation',
    'Ctrl+Shift+C': 'Cost Calculator',
    'Ctrl+Shift+S': 'Security Analysis'
};

// Component templates with enhanced metadata
const componentTemplates = {
    webApp: {
        name: 'Web Application',
        description: 'Basic web app with database and storage',
        components: [
            { serviceType: 'appservice', x: 200, y: 100, customName: 'Web App', variant: 'standard' },
            { serviceType: 'sql', x: 400, y: 100, customName: 'Database', variant: 'standard' },
            { serviceType: 'storage', x: 200, y: 300, customName: 'Blob Storage', variant: 'general-purpose-v2' }
        ],
        connections: [
            { from: 'Web App', to: 'Database', type: 'data' },
            { from: 'Web App', to: 'Blob Storage', type: 'data' }
        ],
        estimatedCost: 45.50,
        securityScore: 85,
        performanceScore: 90
    },
    microservices: {
        name: 'Microservices Architecture',
        description: 'Multi-service architecture with API gateway',
        components: [
            { serviceType: 'gateway', x: 100, y: 100, customName: 'API Gateway', variant: 'standard' },
            { serviceType: 'appservice', x: 300, y: 100, customName: 'User Service', variant: 'standard' },
            { serviceType: 'appservice', x: 500, y: 100, customName: 'Order Service', variant: 'standard' },
            { serviceType: 'sql', x: 300, y: 300, customName: 'User DB', variant: 'standard' },
            { serviceType: 'sql', x: 500, y: 300, customName: 'Order DB', variant: 'standard' }
        ],
        connections: [
            { from: 'API Gateway', to: 'User Service', type: 'network' },
            { from: 'API Gateway', to: 'Order Service', type: 'network' },
            { from: 'User Service', to: 'User DB', type: 'data' },
            { from: 'Order Service', to: 'Order DB', type: 'data' }
        ],
        estimatedCost: 120.30,
        securityScore: 92,
        performanceScore: 88
    },
    serverless: {
        name: 'Serverless Architecture',
        description: 'Event-driven serverless architecture',
        components: [
            { serviceType: 'gateway', x: 200, y: 100, customName: 'API Gateway', variant: 'consumption' },
            { serviceType: 'function', x: 400, y: 100, customName: 'Function App', variant: 'consumption' },
            { serviceType: 'cosmos', x: 200, y: 300, customName: 'Cosmos DB', variant: 'sql' },
            { serviceType: 'cdn', x: 400, y: 300, customName: 'CDN', variant: 'standard' }
        ],
        connections: [
            { from: 'API Gateway', to: 'Function App', type: 'network' },
            { from: 'Function App', to: 'Cosmos DB', type: 'data' },
            { from: 'Function App', to: 'CDN', type: 'data' }
        ],
        estimatedCost: 25.80,
        securityScore: 95,
        performanceScore: 85
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeEventListeners();
    initializePalette();
    initializeCanvas();
    initializeTerminal();
    loadSavedData();
    
    // Load version history
    const savedVersions = localStorage.getItem('azure-designer-versions');
    if (savedVersions) {
        versionHistory = JSON.parse(savedVersions);
        currentVersion = Math.max(...versionHistory.map(v => v.id), 0) + 1;
    }
    
    // Initialize search
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            showSearchPanel();
        }
    });
    
    // Auto-save version every 5 minutes
    setInterval(() => {
        if (components.size > 0) {
            saveVersion();
        }
    }, 300000);
    
    initializeDropdowns();
    addSmoothAnimations();
    
    enhanceUserExperience();
    enhanceKeyboardShortcuts();
    updateStatusBar();
});

// Theme management
function initializeTheme() {
    const savedTheme = localStorage.getItem('azure-designer-theme');
    if (savedTheme === 'dark') {
        toggleTheme();
    }
}

function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('dark-theme', isDarkTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    const toggleIcon = themeToggle.querySelector('.toggle-icon');
    
    if (isDarkTheme) {
        toggleIcon.textContent = '☀️';
        localStorage.setItem('azure-designer-theme', 'dark');
    } else {
        toggleIcon.textContent = '🌙';
        localStorage.setItem('azure-designer-theme', 'light');
    }
}

// Event listeners
function initializeEventListeners() {
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);
            if (target === 'tool') {
                showTool();
            } else if (target === 'docs') {
                showDocs();
            } else if (target === 'contact') {
                showContact();
            }
        });
    });
    
    // Toolbar buttons
    document.getElementById('undoBtn').addEventListener('click', undo);
    document.getElementById('clearBtn').addEventListener('click', clearCanvas);
    document.getElementById('saveBtn').addEventListener('click', saveScreenshot);
    // Templates button now uses dropdown system instead of showTemplatesMenu
    
    // Add event listeners for template items in dropdown
    document.addEventListener('click', function(e) {
        if (e.target.closest('.template-item')) {
            const templateItem = e.target.closest('.template-item');
            const templateName = templateItem.getAttribute('data-template');
            if (templateName) {
                loadTemplate(templateName);
                // Close the dropdown
                const dropdownMenu = templateItem.closest('.dropdown-menu');
                if (dropdownMenu) {
                    dropdownMenu.classList.remove('active');
                    const toggle = dropdownMenu.previousElementSibling;
                    if (toggle) {
                        toggle.classList.remove('active');
                    }
                }
            }
        }
    });
    document.getElementById('exportBtn').addEventListener('click', exportToJSON);
    document.getElementById('importBtn').addEventListener('click', openFileDialog);
    
    // Zoom controls
    document.getElementById('zoomInBtn').addEventListener('click', zoomIn);
    document.getElementById('zoomOutBtn').addEventListener('click', zoomOut);
    document.getElementById('resetZoomBtn').addEventListener('click', resetZoom);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Handle spacebar keyup to prevent flashing
    document.addEventListener('keyup', function(e) {
        if (e.key === ' ') {
            spacebarPressed = false;
        }
    });
    
    // Prevent spacebar from triggering pan mode when in any input
    document.addEventListener('keydown', function(e) {
        if (e.key === ' ') {
            const activeElement = document.activeElement;
            const isInInput = activeElement && (
                activeElement.tagName === 'INPUT' || 
                activeElement.tagName === 'TEXTAREA' || 
                activeElement.classList.contains('rename-input') ||
                activeElement.contentEditable === 'true' ||
                activeElement.isContentEditable ||
                activeElement.closest('.dropdown-menu') ||
                activeElement.closest('.templates-menu') ||
                activeElement.closest('.search-panel') ||
                activeElement.closest('.terminal-window')
            );
            
            if (isInInput) {
                spacebarPressed = true;
            }
        }
    });
    
    // Terminal easter egg (Ctrl+Shift+T)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            showTerminal();
        }
    });
    
    // Initialize zoom and pan
    initializeZoomAndPan();
}

// Initialize palette with folder functionality
function initializePalette() {
    // Folder toggle functionality
    document.querySelectorAll('.folder-header').forEach(header => {
        header.addEventListener('click', function() {
            const folderName = this.dataset.folder;
            const folderContent = document.getElementById(`${folderName}-folder`);
            const toggle = this.querySelector('.folder-toggle');
            
            if (folderContent.classList.contains('collapsed')) {
                folderContent.classList.remove('collapsed');
                this.classList.remove('collapsed');
                toggle.textContent = '▼';
            } else {
                folderContent.classList.add('collapsed');
                this.classList.add('collapsed');
                toggle.textContent = '▶';
            }
        });
    });
    
    // Initialize drag and drop for palette items
    initializePaletteDragAndDrop();
}

// Initialize drag and drop for palette items
function initializePaletteDragAndDrop() {
    document.querySelectorAll('.palette-item').forEach(item => {
        item.addEventListener('dragstart', handlePaletteDragStart);
    });
    
    const canvas = document.getElementById('architectureCanvas');
    canvas.addEventListener('dragover', handleDragOver);
    canvas.addEventListener('drop', handleCanvasDrop);
}

// Handle palette drag start
function handlePaletteDragStart(e) {
    const itemType = e.target.dataset.type;
    const itemData = e.target.dataset.service || e.target.dataset.connection;
    
    e.dataTransfer.setData('application/json', JSON.stringify({
        type: itemType,
        data: itemData
    }));
    
    e.dataTransfer.effectAllowed = 'copy';
}

// Handle drag over
function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
}

// Handle canvas drop
function handleCanvasDrop(e) {
    e.preventDefault();
    
    try {
        const dropData = JSON.parse(e.dataTransfer.getData('application/json'));
        
        // Validate drop data
        if (!dropData || typeof dropData !== 'object') {
            console.warn('Invalid drop data format');
            return;
        }
        
        const canvasRect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - canvasRect.left - panOffset.x) / zoomLevel;
        const y = (e.clientY - canvasRect.top - panOffset.y) / zoomLevel;
        
        // Validate coordinates
        if (isNaN(x) || isNaN(y)) {
            console.warn('Invalid drop coordinates');
            return;
        }
        
        if (dropData.type === 'service') {
            if (dropData.data && services[dropData.data]) {
                addComponent(dropData.data, x, y);
            } else {
                console.warn('Invalid service type in drop data:', dropData.data);
            }
        } else if (dropData.type === 'connection') {
            if (dropData.data && connectionTypes[dropData.data]) {
                startConnectionMode(dropData.data, x, y);
            } else {
                console.warn('Invalid connection type in drop data:', dropData.data);
            }
        } else {
            console.warn('Unknown drop data type:', dropData.type);
        }
    } catch (error) {
        console.error('Error handling drop:', error);
        showNotification('Error processing dropped item', 'error');
    }
}

// Start connection mode
function startConnectionMode(connectionType, x, y) {
    // Create a temporary connection line that follows the mouse
    const tempConnection = document.createElement('div');
    tempConnection.className = 'connection-line temp-connection';
    tempConnection.dataset.type = connectionType;
    tempConnection.style.position = 'absolute';
    tempConnection.style.pointerEvents = 'none';
    tempConnection.style.zIndex = '1';
    
    document.getElementById('canvasContent').appendChild(tempConnection);
    
    let startPoint = { x, y };
    let isConnecting = true;
    
    function updateTempConnection(e) {
        if (!isConnecting) return;
        
        const canvasRect = document.getElementById('architectureCanvas').getBoundingClientRect();
        const endX = (e.clientX - canvasRect.left - panOffset.x) / zoomLevel;
        const endY = (e.clientY - canvasRect.top - panOffset.y) / zoomLevel;
        
        const length = Math.sqrt(Math.pow(endX - startPoint.x, 2) + Math.pow(endY - startPoint.y, 2));
        const angle = Math.atan2(endY - startPoint.y, endX - startPoint.x) * 180 / Math.PI;
        
        tempConnection.style.left = startPoint.x + 'px';
        tempConnection.style.top = startPoint.y + 'px';
        tempConnection.style.width = length + 'px';
        tempConnection.style.transform = `rotate(${angle}deg)`;
        tempConnection.style.transformOrigin = '0 50%';
        
        // Check for component hover
        const component = document.elementFromPoint(e.clientX, e.clientY)?.closest('.canvas-component');
        if (component) {
            component.style.outline = '2px solid #0078d4';
        } else {
            document.querySelectorAll('.canvas-component').forEach(comp => {
                comp.style.outline = '';
            });
        }
    }
    
    function handleMouseUp(e) {
        if (!isConnecting) return;
        
        const component = document.elementFromPoint(e.clientX, e.clientY)?.closest('.canvas-component');
        if (component) {
            // Find the component that was dragged from (if any)
            const draggedComponent = findComponentAtPosition(startPoint.x, startPoint.y);
            if (draggedComponent && draggedComponent !== component) {
                createConnection(draggedComponent.dataset.id, component.dataset.id, connectionType);
            }
        }
        
        // Clean up
        isConnecting = false;
        tempConnection.remove();
        document.removeEventListener('mousemove', updateTempConnection);
        document.removeEventListener('mouseup', handleMouseUp);
        document.querySelectorAll('.canvas-component').forEach(comp => {
            comp.style.outline = '';
        });
    }
    
    document.addEventListener('mousemove', updateTempConnection);
    document.addEventListener('mouseup', handleMouseUp);
}

// Find component at position
function findComponentAtPosition(x, y) {
    const components = document.querySelectorAll('.canvas-component');
    for (let component of components) {
        const compX = parseInt(component.style.left);
        const compY = parseInt(component.style.top);
        const compWidth = component.offsetWidth;
        const compHeight = component.offsetHeight;
        
        if (x >= compX && x <= compX + compWidth && y >= compY && y <= compY + compHeight) {
            return component;
        }
    }
    return null;
}

// Keyboard shortcuts
function handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'z':
                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
                break;
            case 's':
                e.preventDefault();
                if (e.shiftKey) {
                    saveAsTemplate();
                } else {
                    saveScreenshot();
                }
                break;
            case 'Delete':
            case 'Backspace':
                e.preventDefault();
                deleteSelectedComponent();
                break;
            case 'o':
                e.preventDefault();
                if (e.shiftKey) {
                    openTemplateDialog();
                } else {
                    openFileDialog();
                }
                break;
            case 'e':
                e.preventDefault();
                exportToJSON();
                break;
            case 'g':
                e.preventDefault();
                if (e.shiftKey) {
                    ungroupSelectedComponents();
                } else {
                    groupSelectedComponents();
                }
                break;
            case 'f':
                e.preventDefault();
                showSearchPanel();
                break;
            case 'l':
                e.preventDefault();
                if (e.shiftKey) {
                    deleteCurrentLayer();
                } else {
                    addLayer();
                }
                break;
            case 'r':
                e.preventDefault();
                toggleResizeMode();
                break;
            case 'a':
                e.preventDefault();
                selectAllComponents();
                break;
            case 'd':
                e.preventDefault();
                deselectAllComponents();
                break;
            case 'c':
                e.preventDefault();
                copySelectedComponents();
                break;
            case 'v':
                e.preventDefault();
                pasteComponents();
                break;
            case 'x':
                e.preventDefault();
                cutSelectedComponents();
                break;
            case 'p':
                e.preventDefault();
                if (e.shiftKey) {
                    togglePropertiesPanel();
                }
                break;
            case 'm':
                e.preventDefault();
                if (e.shiftKey) {
                    toggleMinimap();
                }
                break;
        }
    }
    
    // Zoom shortcuts
    if (e.ctrlKey) {
        switch (e.key) {
            case '=':
            case '+':
                e.preventDefault();
                zoomIn();
                break;
            case '-':
                e.preventDefault();
                zoomOut();
                break;
            case '0':
                e.preventDefault();
                resetZoom();
                break;
        }
    }
    
    // Special shortcuts
    if (e.ctrlKey && e.shiftKey) {
        switch (e.key) {
            case 'A':
                e.preventDefault();
                addAnnotation();
                break;
            case 'C':
                e.preventDefault();
                showCostCalculator();
                break;
            case 'S':
                e.preventDefault();
                showSecurityAnalysis();
                break;
        }
    }
    
    // Pan shortcuts - only when not in rename mode and not already pressed
    if (e.key === ' ' && !spacebarPressed) {
        // Check if we're in any input field or editable element
        const activeElement = document.activeElement;
        const isInInput = activeElement && (
            activeElement.tagName === 'INPUT' || 
            activeElement.tagName === 'TEXTAREA' || 
            activeElement.classList.contains('rename-input') ||
            activeElement.contentEditable === 'true' ||
            activeElement.isContentEditable
        );
        
        // Also check if we're in any dropdown or menu
        const isInDropdown = activeElement && (
            activeElement.closest('.dropdown-menu') ||
            activeElement.closest('.templates-menu') ||
            activeElement.closest('.search-panel') ||
            activeElement.closest('.terminal-window')
        );
        
        // Additional check for any form elements
        const isInForm = activeElement && (
            activeElement.closest('form') ||
            activeElement.closest('.contact-form')
        );
        
        if (!isInInput && !isInDropdown && !isInForm) {
            e.preventDefault();
            spacebarPressed = true;
            togglePanMode();
        }
    }
}

// Navigation functions
function showTool() {
    hideAllPages();
    document.getElementById('tool').style.display = 'block';
    updateActiveNavLink('tool');
}

function showLanding() {
    hideAllPages();
    document.getElementById('landing').style.display = 'block';
    updateActiveNavLink('landing');
    
    // Force vertical layout for features grid
    const featuresGrid = document.querySelector('.features-grid');
    if (featuresGrid) {
        featuresGrid.style.display = 'flex';
        featuresGrid.style.flexDirection = 'column';
        featuresGrid.style.gridTemplateColumns = 'none';
    }
}

function showDocs() {
    hideAllPages();
    document.getElementById('docs').style.display = 'block';
    updateActiveNavLink('docs');
    initializeDocsNavigation();
}

function showContact() {
    hideAllPages();
    document.getElementById('contact').style.display = 'block';
    updateActiveNavLink('contact');
    initializeContactForm();
}

function hideAllPages() {
    document.getElementById('landing').style.display = 'none';
    document.getElementById('tool').style.display = 'none';
    document.getElementById('docs').style.display = 'none';
    document.getElementById('contact').style.display = 'none';
}

function updateActiveNavLink(activePage) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`.nav-link[href="#${activePage}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Documentation navigation
function initializeDocsNavigation() {
    const navLinks = document.querySelectorAll('.docs-nav-link');
    const sections = document.querySelectorAll('.docs-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Hide all sections
            sections.forEach(section => {
                section.style.display = 'none';
            });
            
            // Show target section
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
        });
    });
}

// Contact form handling
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message')
            };
            
            // Simulate form submission
            submitContactForm(data);
        });
    }
}

function submitContactForm(data) {
    // Show loading state
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Show success message
        alert('Thank you for your message! We\'ll get back to you soon.');
        
        // Reset form
        document.getElementById('contactForm').reset();
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// Canvas initialization
function initializeCanvas() {
    const canvas = document.getElementById('architectureCanvas');
    const canvasContent = document.getElementById('canvasContent');
    
    // Create grid
    const grid = document.createElement('div');
    grid.className = 'canvas-grid';
    canvas.appendChild(grid);
    
    // Initialize canvas content
    canvasContent.style.position = 'relative';
    canvasContent.style.width = '100%';
    canvasContent.style.height = '100%';
    
    // Add canvas event listeners
    canvas.addEventListener('click', function(e) {
        if (e.target === canvas || e.target === canvasContent && !panMode) {
            deselectComponent();
        }
    });
    
    // Add pan mode support
    canvas.addEventListener('mousedown', function(e) {
        if (panMode && e.button === 0) { // Left click in pan mode
            e.preventDefault();
            isPanning = true;
            lastPanPoint = { x: e.clientX, y: e.clientY };
            canvas.style.cursor = 'grabbing';
        }
    });
    
    canvas.addEventListener('mousemove', function(e) {
        if (panMode && isPanning) {
            const deltaX = e.clientX - lastPanPoint.x;
            const deltaY = e.clientY - lastPanPoint.y;
            
            panOffset.x += deltaX;
            panOffset.y += deltaY;
            
            lastPanPoint = { x: e.clientX, y: e.clientY };
            updateCanvasTransform();
        }
    });
    
    canvas.addEventListener('mouseup', function(e) {
        if (panMode && isPanning) {
            isPanning = false;
            canvas.style.cursor = 'grab';
        }
    });
}

// Add component to canvas
function addComponent(serviceType, x, y) {
    // Validate inputs
    if (!serviceType || !services[serviceType]) {
        console.error('Invalid service type:', serviceType);
        return;
    }
    
    if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
        console.error('Invalid coordinates:', { x, y });
        return;
    }
    
    const service = services[serviceType];
    
    componentCounter++;
    const componentId = componentCounter;
    
    // Snap to grid
    const snappedX = Math.round(x / gridSize) * gridSize;
    const snappedY = Math.round(y / gridSize) * gridSize;
    
    const component = document.createElement('div');
    component.className = 'canvas-component';
    component.style.left = snappedX + 'px';
    component.style.top = snappedY + 'px';
    component.dataset.id = componentId;
    component.dataset.serviceType = serviceType;
    
    component.innerHTML = `
        <div class="component-icon">${service.icon}</div>
        <div class="component-label">${service.label}</div>
    `;
    
    // Add event listeners
    component.addEventListener('mousedown', startComponentDrag);
    component.addEventListener('dblclick', startRename);
    
    // Store component data
    components.set(componentId, {
        serviceType: serviceType,
        x: snappedX,
        y: snappedY,
        customName: service.label
    });
    
    const canvasContent = document.getElementById('canvasContent');
    if (canvasContent) {
        canvasContent.appendChild(component);
        saveState();
        saveToLocalStorage();
    } else {
        console.error('Canvas content element not found');
    }
}

// Component drag functionality
function startComponentDrag(e) {
    // Don't start component drag if in pan mode
    if (panMode) {
        return;
    }
    
    e.stopPropagation();
    e.preventDefault();
    
    const component = e.currentTarget;
    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = parseInt(component.style.left);
    const startTop = parseInt(component.style.top);
    
    // Track if we actually moved (to distinguish between drag and click)
    let hasMoved = false;
    const moveThreshold = 5; // pixels
    
    function handleMouseMove(e) {
        const deltaX = Math.abs(e.clientX - startX);
        const deltaY = Math.abs(e.clientY - startY);
        
        // Check if we've moved enough to consider this a drag
        if (deltaX > moveThreshold || deltaY > moveThreshold) {
            hasMoved = true;
        }
        
        const deltaXTotal = (e.clientX - startX) / zoomLevel;
        const deltaYTotal = (e.clientY - startY) / zoomLevel;
        
        // Snap to grid
        const gridSize = 20;
        const newX = Math.round((startLeft + deltaXTotal) / gridSize) * gridSize;
        const newY = Math.round((startTop + deltaYTotal) / gridSize) * gridSize;
        
        component.style.left = newX + 'px';
        component.style.top = newY + 'px';
        
        // Update stored data
        const componentId = parseInt(component.dataset.id);
        const componentData = components.get(componentId);
        if (componentData) {
            componentData.x = newX;
            componentData.y = newY;
        }
        
        // Update connections in real-time during drag
        updateConnections();
    }
    
    function handleMouseUp(e) {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        // Only update connections and save if we actually moved
        if (hasMoved) {
            updateConnections();
            saveToLocalStorage();
        } else {
            // If we didn't move, treat this as a click for selection
            // Create a proper event object for selection
            const clickEvent = {
                stopPropagation: () => {},
                currentTarget: component
            };
            selectComponent(clickEvent);
        }
    }
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

// Component selection
function selectComponent(e) {
    // Don't select components if in pan mode
    if (panMode) {
        return;
    }
    
    e.stopPropagation();
    
    if (selectedComponent) {
        selectedComponent.classList.remove('selected');
    }
    
    selectedComponent = e.currentTarget;
    selectedComponent.classList.add('selected');
    showComponentProperties(selectedComponent);
}

function deselectComponent() {
    if (selectedComponent) {
        selectedComponent.classList.remove('selected');
        selectedComponent = null;
        hideComponentProperties();
    }
}

function deleteSelectedComponent() {
    if (selectedComponent) {
        const componentId = parseInt(selectedComponent.dataset.id);
        
        // Remove connections involving this component
        connections = connections.filter(conn => 
            conn.from !== componentId && conn.to !== componentId
        );
        
        // Remove component
        components.delete(componentId);
        selectedComponent.remove();
        selectedComponent = null;
        
        updateConnections();
        hideComponentProperties();
        saveState();
        saveToLocalStorage();
    }
}

// Component properties
function showComponentProperties(component) {
    const componentId = parseInt(component.dataset.id);
    const componentData = components.get(componentId);
    const serviceType = component.dataset.serviceType;
    const service = services[serviceType];
    
    if (!componentData || !service) {
        console.error('Component data or service not found:', componentId, serviceType);
        return;
    }
    
    const propertiesContent = document.getElementById('propertiesContent');
    
    if (!propertiesContent) {
        console.error('Properties content element not found!');
        return;
    }
    
    propertiesContent.innerHTML = `
        <div class="property-group">
            <label>Service Type</label>
            <div class="property-value">${service.label}</div>
        </div>
        <div class="property-group">
            <label>Name</label>
            <input type="text" class="property-input" value="${componentData.customName}" 
                   onchange="updateComponentName(${componentId}, this.value)">
        </div>
        <div class="property-group">
            <label>Position</label>
            <div class="property-value">X: ${componentData.x}, Y: ${componentData.y}</div>
        </div>
        <div class="property-group">
            <label>Connections</label>
            <div class="property-value">${getConnectionCount(componentId)}</div>
        </div>
        <div class="property-group">
            <label>Variant</label>
            <select onchange="updateComponentVariant(${componentId}, this.value)">
                ${service.variants.map(variant => 
                    `<option value="${variant}" ${componentData.variant === variant ? 'selected' : ''}>${variant}</option>`
                ).join('')}
            </select>
        </div>
        <div class="property-group">
            <label>Cost (Monthly)</label>
            <span>$${calculateComponentCost(componentData).toFixed(2)}</span>
        </div>
        <div class="property-group">
            <label>Security Features</label>
            <div class="security-features">
                ${service.security.map(feature => `<span class="security-tag">${feature}</span>`).join('')}
            </div>
        </div>
        <div class="property-actions">
            <button onclick="deleteSelectedComponent()" class="delete-btn">Delete</button>
            <button onclick="duplicateComponent(${componentId})" class="duplicate-btn">Duplicate</button>
        </div>
    `;
}

function hideComponentProperties() {
    const propertiesContent = document.getElementById('propertiesContent');
    propertiesContent.innerHTML = '<p class="no-selection">Select a component to edit its properties</p>';
}

// State management
function saveState() {
    const state = {
        components: Array.from(components.entries()),
        connections: connections,
        componentCounter: componentCounter
    };
    
    undoStack.push(JSON.stringify(state));
    if (undoStack.length > 50) {
        undoStack.shift();
    }
    
    redoStack = [];
    updateUndoButton();
    
    // Auto-save to localStorage
    saveToLocalStorage();
    
    // Save version every 5 minutes
    if (Date.now() - lastVersionSave > 300000) {
        saveVersion();
        lastVersionSave = Date.now();
    }
}

function undo() {
    if (undoStack.length === 0) return;
    
    const currentState = {
        components: Array.from(components.entries()),
        connections: connections,
        componentCounter: componentCounter
    };
    
    redoStack.push(JSON.stringify(currentState));
    
    const previousState = JSON.parse(undoStack.pop());
    loadState(previousState);
    updateUndoButton();
}

function redo() {
    if (redoStack.length === 0) return;
    
    const currentState = {
        components: Array.from(components.entries()),
        connections: connections,
        componentCounter: componentCounter
    };
    
    undoStack.push(JSON.stringify(currentState));
    
    const nextState = JSON.parse(redoStack.pop());
    loadState(nextState);
    updateUndoButton();
}

function loadState(state) {
    components = new Map(state.components || []);
    connections = state.connections || [];
    componentCounter = state.componentCounter || 0;
    
    // Clear canvas
    const canvasContent = document.getElementById('canvasContent');
    canvasContent.innerHTML = '';
    
    // Recreate components
    components.forEach((componentData, id) => {
        const service = services[componentData.serviceType];
        if (service) {
            const component = document.createElement('div');
            component.className = 'canvas-component';
            component.style.left = componentData.x + 'px';
            component.style.top = componentData.y + 'px';
            component.dataset.id = id;
            component.dataset.serviceType = componentData.serviceType;
            
            component.innerHTML = `
                <div class="component-icon">${service.icon}</div>
                <div class="component-label">${componentData.customName || service.label}</div>
            `;
            
            component.addEventListener('mousedown', startComponentDrag);
            component.addEventListener('dblclick', startRename);
            
            canvasContent.appendChild(component);
        }
    });
    
    updateConnections();
    saveToLocalStorage();
}

function updateUndoButton() {
    const undoBtn = document.getElementById('undoBtn');
    undoBtn.disabled = undoStack.length === 0;
}

function clearCanvas() {
    if (confirm('Are you sure you want to clear the canvas?')) {
        components.clear();
        connections = [];
        componentCounter = 0;
        
        const canvasContent = document.getElementById('canvasContent');
        canvasContent.innerHTML = '';
        
        deselectComponent();
        saveState();
        saveToLocalStorage();
    }
}

// Connection management
function createConnection(fromId, toId, type = 'data') {
    // Validate inputs
    if (!fromId || !toId || fromId === toId) {
        console.error('Invalid connection parameters:', { fromId, toId, type });
        return;
    }
    
    // Check if connection already exists
    const existingConnection = connections.find(conn => 
        (conn.from === fromId && conn.to === toId) || 
        (conn.from === toId && conn.to === fromId)
    );
    
    if (existingConnection) {
        showNotification('Connection already exists between these components', 'error');
        return;
    }
    
    const newConnection = {
        id: Date.now(),
        from: fromId,
        to: toId,
        type: type
    };
    
    connections.push(newConnection);
    updateConnections();
    saveToLocalStorage();
}

function updateConnections() {
    const canvas = document.getElementById('canvasContent');
    if (!canvas) return;
    
    const existingConnections = canvas.querySelectorAll('.connection-line:not(.temp-connection)');
    existingConnections.forEach(conn => conn.remove());
    
    connections.forEach(connection => {
        const fromComponent = document.querySelector(`[data-id="${connection.from}"]`);
        const toComponent = document.querySelector(`[data-id="${connection.to}"]`);
        
        if (fromComponent && toComponent) {
            try {
                const line = createConnectionLine(fromComponent, toComponent, connection.type);
                canvas.appendChild(line);
            } catch (error) {
                console.error('Error creating connection line:', error);
            }
        }
    });
}

function createConnectionLine(fromComponent, toComponent, type = 'data') {
    if (!fromComponent || !toComponent) {
        throw new Error('Invalid components provided to createConnectionLine');
    }
    
    const line = document.createElement('div');
    line.className = 'connection-line';
    line.dataset.type = type;
    
    // Get component positions relative to the canvas
    const fromX = parseInt(fromComponent.style.left) + fromComponent.offsetWidth / 2;
    const fromY = parseInt(fromComponent.style.top) + fromComponent.offsetHeight / 2;
    const toX = parseInt(toComponent.style.left) + toComponent.offsetWidth / 2;
    const toY = parseInt(toComponent.style.top) + toComponent.offsetHeight / 2;
    
    // Validate positions
    if (isNaN(fromX) || isNaN(fromY) || isNaN(toX) || isNaN(toY)) {
        throw new Error('Invalid component positions');
    }
    
    const length = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
    const angle = Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI;
    
    const connectionType = connectionTypes[type] || connectionTypes.data;
    const borderStyle = connectionType.style === 'dashed' ? 'dashed' : 
                       connectionType.style === 'dotted' ? 'dotted' : 'solid';
    
    line.style.cssText = `
        position: absolute;
        left: ${fromX}px;
        top: ${fromY}px;
        width: ${length}px;
        height: 2px;
        background: ${connectionType.color};
        border-top: 2px ${borderStyle} ${connectionType.color};
        transform-origin: 0 50%;
        transform: rotate(${angle}deg);
        pointer-events: none;
        z-index: 1;
    `;
    
    return line;
}

function getConnectionCount(componentId) {
    return connections.filter(conn => 
        conn.from === componentId || conn.to === componentId
    ).length;
}

// Test connection system
function testConnections() {
    console.log('Testing connection system...');
    
    // Check if we have components
    const componentElements = document.querySelectorAll('.canvas-component');
    console.log('Found components:', componentElements.length);
    
    // Check if we have connections
    console.log('Stored connections:', connections.length);
    
    // Check if connection lines are rendered
    const connectionLines = document.querySelectorAll('.connection-line');
    console.log('Rendered connection lines:', connectionLines.length);
    
    // Test creating a connection between first two components
    if (componentElements.length >= 2) {
        const comp1 = componentElements[0];
        const comp2 = componentElements[1];
        const id1 = parseInt(comp1.dataset.id);
        const id2 = parseInt(comp2.dataset.id);
        
        console.log('Testing connection between components:', id1, 'and', id2);
        createConnection(id1, id2, 'data');
        console.log('Connection created successfully');
    }
    
    console.log('Connection test completed');
}

// Component renaming
function startRename(e) {
    e.stopPropagation();
    
    const component = e.currentTarget;
    const label = component.querySelector('.component-label');
    const currentText = label.textContent;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'rename-input';
    input.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: none;
        background: var(--bg-primary);
        color: var(--text-primary);
        font-size: inherit;
        font-family: inherit;
        text-align: center;
        outline: 2px solid var(--accent-color);
        z-index: 10;
    `;
    
    label.style.visibility = 'hidden';
    component.appendChild(input);
    input.focus();
    input.select();
    
    function finishRename() {
        const newName = input.value.trim() || currentText;
        const componentId = parseInt(component.dataset.id);
        
        updateComponentName(componentId, newName);
        label.style.visibility = 'visible';
        input.remove();
    }
    
    input.addEventListener('blur', finishRename);
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            finishRename();
        } else if (e.key === 'Escape') {
            label.style.visibility = 'visible';
            input.remove();
        }
        // Prevent spacebar from triggering pan mode during rename
        if (e.key === ' ') {
            e.stopPropagation();
            spacebarPressed = true; // Mark as pressed to prevent pan mode toggle
        }
    });
    
    // Reset spacebar flag when input loses focus
    input.addEventListener('blur', function() {
        spacebarPressed = false;
    });
}

function updateComponentName(componentId, newName) {
    const componentData = components.get(componentId);
    if (componentData) {
        componentData.customName = newName;
        
        // Update the visual component label on the canvas
        const componentElement = document.querySelector(`[data-id="${componentId}"]`);
        if (componentElement) {
            const labelElement = componentElement.querySelector('.component-label');
            if (labelElement) {
                labelElement.textContent = newName;
            }
        }
        
        // Update the properties panel if this component is currently selected
        if (selectedComponent && parseInt(selectedComponent.dataset.id) === componentId) {
            showComponentProperties(selectedComponent);
        }
        
        saveState();
        saveToLocalStorage();
    }
}

// Persistence
function saveToLocalStorage() {
    try {
        const data = {
            components: Array.from(components.entries()),
            connections: connections,
            componentCounter: componentCounter
        };
        localStorage.setItem('azure-designer-data', JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        showNotification('Failed to save data to browser storage', 'error');
    }
}

function loadSavedData() {
    try {
        const savedData = localStorage.getItem('azure-designer-data');
        if (savedData) {
            const data = JSON.parse(savedData);
            if (data && typeof data === 'object') {
                loadState(data);
            } else {
                console.warn('Invalid saved data format');
            }
        }
    } catch (error) {
        console.error('Error loading saved data:', error);
        showNotification('Failed to load saved data', 'error');
    }
}

// Screenshot functionality
function saveScreenshot() {
    const canvas = document.getElementById('architectureCanvas');
    
    // Try html2canvas if available
    if (typeof html2canvas !== 'undefined') {
        html2canvas(canvas, {
            backgroundColor: isDarkTheme ? '#1a1a1a' : '#ffffff',
            scale: 2,
            useCORS: true,
            allowTaint: true
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'azure-architecture.png';
            link.href = canvas.toDataURL();
            link.click();
        });
    } else {
        // Fallback: use browser's built-in screenshot
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
            navigator.mediaDevices.getDisplayMedia({
                video: { mediaSource: 'screen' }
            }).then(stream => {
                const video = document.createElement('video');
                video.srcObject = stream;
                video.onloadedmetadata = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0);
                    
                    const link = document.createElement('a');
                    link.download = 'azure-architecture.png';
                    link.href = canvas.toDataURL();
                    link.click();
                    
                    stream.getTracks().forEach(track => track.stop());
                };
                video.play();
            });
        } else {
            alert('Screenshot not supported in this browser. Please use Ctrl+Shift+I to open developer tools and take a screenshot manually.');
        }
    }
}

// Templates functionality
function showTemplatesMenu() {
    const templatesBtn = document.getElementById('templatesBtn');
    const rect = templatesBtn.getBoundingClientRect();
    
    const menu = document.createElement('div');
    menu.className = 'templates-menu';
    menu.style.cssText = `
        position: absolute;
        top: ${rect.bottom + 5}px;
        left: ${rect.left}px;
        background: var(--panel-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        min-width: 200px;
        padding: 8px 0;
    `;
    
    Object.keys(componentTemplates).forEach(templateName => {
        const item = document.createElement('div');
        item.className = 'template-item';
        item.style.cssText = `
            padding: 8px 16px;
            cursor: pointer;
            transition: background-color 0.2s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        item.innerHTML = `
            <span>📋</span>
            <span>${templateName.charAt(0).toUpperCase() + templateName.slice(1)}</span>
        `;
        
        item.addEventListener('click', () => {
            loadTemplate(templateName);
            menu.remove();
        });
        
        item.addEventListener('mouseenter', () => {
            item.style.backgroundColor = 'var(--hover-bg)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.backgroundColor = '';
        });
        
        menu.appendChild(item);
    });
    
    document.body.appendChild(menu);
    
    // Close menu when clicking outside
    document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target) && !templatesBtn.contains(e.target)) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    });
}

function loadTemplate(templateName) {
    const template = componentTemplates[templateName];
    if (!template) {
        showNotification('Template not found: ' + templateName, 'error');
        return;
    }
    
    try {
        // Clear existing components
        components.clear();
        connections = [];
        componentCounter = 0;
        
        const canvasContent = document.getElementById('canvasContent');
        if (!canvasContent) {
            console.error('Canvas content element not found');
            return;
        }
        
        canvasContent.innerHTML = '';
        
        // Add template components
        template.components.forEach(componentData => {
            if (componentData.serviceType && services[componentData.serviceType]) {
                addComponent(componentData.serviceType, componentData.x, componentData.y);
                
                // Update custom name if provided
                if (componentData.customName) {
                    const componentId = componentCounter;
                    const storedData = components.get(componentId);
                    if (storedData) {
                        storedData.customName = componentData.customName;
                        const component = document.querySelector(`[data-id="${componentId}"]`);
                        if (component) {
                            const label = component.querySelector('.component-label');
                            if (label) {
                                label.textContent = componentData.customName;
                            }
                        }
                    }
                }
            } else {
                console.warn('Invalid service type in template:', componentData.serviceType);
            }
        });
        
        saveState();
        saveToLocalStorage();
        showNotification('Template loaded: ' + template.name, 'success');
    } catch (error) {
        console.error('Error loading template:', error);
        showNotification('Error loading template', 'error');
    }
}

// Import/Export functionality
function openFileDialog() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    loadArchitectureFromJSON(data);
                } catch (error) {
                    console.error('Error parsing JSON file:', error);
                    showNotification('Invalid file format. Please select a valid JSON file.', 'error');
                }
            };
            reader.onerror = function() {
                showNotification('Error reading file', 'error');
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

function exportToJSON() {
    const data = {
        components: Array.from(components.entries()),
        connections: connections,
        metadata: {
            version: '1.0',
            created: new Date().toISOString(),
            name: 'Azure Architecture'
        }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'azure-architecture.json';
    link.click();
    URL.revokeObjectURL(url);
}

function loadArchitectureFromJSON(data) {
    try {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data format');
        }
        
        if (!Array.isArray(data.components) || !Array.isArray(data.connections)) {
            throw new Error('Missing required components or connections arrays');
        }
        
        loadState(data);
        showNotification('Architecture loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading architecture:', error);
        showNotification('Invalid architecture file format', 'error');
    }
}

// Zoom and Pan functionality
function initializeZoomAndPan() {
    const canvas = document.getElementById('architectureCanvas');
    
    // Mouse wheel zoom
    canvas.addEventListener('wheel', function(e) {
        if (e.ctrlKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            const newZoom = Math.max(0.1, Math.min(3, zoomLevel * delta));
            setZoom(newZoom, e.offsetX, e.offsetY);
        }
    });
    
    // Pan with middle mouse button
    canvas.addEventListener('mousedown', function(e) {
        if (e.button === 1) { // Middle mouse button
            e.preventDefault();
            isPanning = true;
            lastPanPoint = { x: e.clientX, y: e.clientY };
            document.body.style.cursor = 'grabbing';
        }
    });
    
    document.addEventListener('mousemove', function(e) {
        if (isPanning) {
            const deltaX = e.clientX - lastPanPoint.x;
            const deltaY = e.clientY - lastPanPoint.y;
            
            panOffset.x += deltaX;
            panOffset.y += deltaY;
            
            lastPanPoint = { x: e.clientX, y: e.clientY };
            updateCanvasTransform();
        }
    });
    
    document.addEventListener('mouseup', function() {
        if (isPanning) {
            isPanning = false;
            document.body.style.cursor = 'default';
        }
    });
}

function setZoom(level, centerX = null, centerY = null) {
    const oldZoom = zoomLevel;
    zoomLevel = level;
    
    if (centerX !== null && centerY !== null) {
        const scale = level / oldZoom;
        panOffset.x = centerX - (centerX - panOffset.x) * scale;
        panOffset.y = centerY - (centerY - panOffset.y) * scale;
    }
    
    updateCanvasTransform();
    updateZoomDisplay();
}

function zoomIn() {
    setZoom(Math.min(3, zoomLevel * 1.2));
}

function zoomOut() {
    setZoom(Math.max(0.1, zoomLevel / 1.2));
}

function resetZoom() {
    setZoom(1);
    panOffset = { x: 0, y: 0 };
    updateCanvasTransform();
}

function updateCanvasTransform() {
    const canvasContent = document.getElementById('canvasContent');
    canvasContent.style.transform = `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`;
}

function updateZoomDisplay() {
    const zoomLevelElement = document.getElementById('zoomLevel');
    zoomLevelElement.textContent = Math.round(zoomLevel * 100) + '%';
}

function togglePanMode() {
    panMode = !panMode;
    const canvas = document.getElementById('architectureCanvas');
    const panModeStatus = document.getElementById('panModeStatus');
    
    // Disable resize mode when entering pan mode
    if (panMode && isResizing) {
        toggleResizeMode();
    }
    
    if (panMode) {
        canvas.style.cursor = 'grab';
        canvas.title = 'Pan Mode Active - Click and drag to pan, Space to exit';
        showNotification('Pan mode activated - Click and drag to pan', 'info');
        if (panModeStatus) panModeStatus.style.display = 'block';
    } else {
        canvas.style.cursor = 'default';
        canvas.title = '';
        showNotification('Pan mode deactivated', 'info');
        if (panModeStatus) panModeStatus.style.display = 'none';
    }
    
    // Update UI to show pan mode status
    const panBtn = document.querySelector('[data-action="pan"]');
    if (panBtn) {
        panBtn.classList.toggle('active', panMode);
    }
    
    // Reset spacebar flag after toggling
    spacebarPressed = false;
}

// Terminal functionality
function initializeTerminal() {
    const terminalInput = document.getElementById('terminalInput');
    if (terminalInput) {
        terminalInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const command = this.value.trim();
                if (command) {
                    executeTerminalCommand(command);
                    this.value = '';
                }
            }
        });
    }
}

function showTerminal() {
    document.getElementById('terminalOverlay').style.display = 'flex';
    document.getElementById('terminalInput').focus();
}

function hideTerminal() {
    document.getElementById('terminalOverlay').style.display = 'none';
}

function executeTerminalCommand(command) {
    const output = document.getElementById('terminalOutput');
    const commandLine = document.createElement('div');
    commandLine.className = 'terminal-line';
    commandLine.textContent = '> ' + command;
    output.appendChild(commandLine);
    
    const response = document.createElement('div');
    response.className = 'terminal-line';
    
    switch (command.toLowerCase()) {
        case 'help':
            response.innerHTML = `
                Available commands:<br>
                - help: Show this help<br>
                - clear: Clear canvas<br>
                - components: Show component count<br>
                - connections: Show connection count<br>
                - zoom [level]: Set zoom level<br>
                - theme: Toggle theme<br>
                - exit: Close terminal
            `;
            break;
        case 'clear':
            clearCanvas();
            response.textContent = 'Canvas cleared';
            break;
        case 'components':
            response.textContent = `Components: ${components.size}`;
            break;
        case 'connections':
            response.textContent = `Connections: ${connections.length}`;
            break;
        case 'theme':
            toggleTheme();
            response.textContent = 'Theme toggled';
            break;
        case 'exit':
            hideTerminal();
            return;
        default:
            if (command.startsWith('zoom ')) {
                const level = parseFloat(command.split(' ')[1]);
                if (!isNaN(level)) {
                    setZoom(level);
                    response.textContent = `Zoom set to ${Math.round(level * 100)}%`;
                } else {
                    response.textContent = 'Invalid zoom level';
                }
            } else {
                response.textContent = `Unknown command: ${command}`;
            }
    }
    
    output.appendChild(response);
    output.scrollTop = output.scrollHeight;
} 

// ===== PREMIUM FEATURES =====

// Component Resizing
function toggleResizeMode() {
    isResizing = !isResizing;
    const components = document.querySelectorAll('.canvas-component');
    
    // Disable pan mode when entering resize mode
    if (isResizing && panMode) {
        togglePanMode();
    }
    
    components.forEach(component => {
        if (isResizing) {
            addResizeHandles(component);
        } else {
            removeResizeHandles(component);
        }
    });
    
    // Update UI to show resize mode
    const resizeBtn = document.querySelector('[data-action="resize"]');
    if (resizeBtn) {
        resizeBtn.classList.toggle('active', isResizing);
    }
}

function addResizeHandles(component) {
    if (component.querySelector('.resize-handle')) return;
    
    const handles = ['nw', 'ne', 'sw', 'se'];
    handles.forEach(pos => {
        const handle = document.createElement('div');
        handle.className = `resize-handle resize-${pos}`;
        handle.dataset.position = pos;
        handle.addEventListener('mousedown', startResize);
        component.appendChild(handle);
    });
}

function removeResizeHandles(component) {
    const handles = component.querySelectorAll('.resize-handle');
    handles.forEach(handle => handle.remove());
}

function startResize(e) {
    e.stopPropagation();
    const handle = e.target;
    const component = handle.closest('.canvas-component');
    const position = handle.dataset.position;
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = component.offsetWidth;
    const startHeight = component.offsetHeight;
    
    function handleResize(e) {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        let newWidth = startWidth;
        let newHeight = startHeight;
        
        if (position.includes('e')) newWidth += deltaX;
        if (position.includes('w')) newWidth -= deltaX;
        if (position.includes('s')) newHeight += deltaY;
        if (position.includes('n')) newHeight -= deltaY;
        
        // Minimum size constraints
        newWidth = Math.max(100, newWidth);
        newHeight = Math.max(60, newHeight);
        
        component.style.width = newWidth + 'px';
        component.style.height = newHeight + 'px';
        
        // Update component data
        const componentId = component.dataset.id;
        const componentData = components.get(componentId);
        if (componentData) {
            componentData.width = newWidth;
            componentData.height = newHeight;
            saveState();
        }
    }
    
    function stopResize() {
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', stopResize);
    }
    
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
}

// Search and Filtering
function showSearchPanel() {
    const searchPanel = document.getElementById('searchPanel') || createSearchPanel();
    searchPanel.style.display = 'block';
    document.getElementById('searchInput').focus();
}

function createSearchPanel() {
    const panel = document.createElement('div');
    panel.id = 'searchPanel';
    panel.className = 'search-panel';
    panel.innerHTML = `
        <div class="search-header">
            <h3>Search Components</h3>
            <button class="close-btn" onclick="hideSearchPanel()">×</button>
        </div>
        <div class="search-content">
            <input type="text" id="searchInput" placeholder="Search by name, type, or properties..." />
            <div class="search-filters">
                <label><input type="checkbox" value="compute" checked> Compute</label>
                <label><input type="checkbox" value="storage" checked> Storage</label>
                <label><input type="checkbox" value="networking" checked> Networking</label>
                <label><input type="checkbox" value="security" checked> Security</label>
            </div>
            <div class="search-results" id="searchResults"></div>
        </div>
    `;
    
    document.body.appendChild(panel);
    
    // Add search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', performSearch);
    
    return panel;
}

function hideSearchPanel() {
    const panel = document.getElementById('searchPanel');
    if (panel) {
        panel.style.display = 'none';
    }
}

function performSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filters = Array.from(document.querySelectorAll('.search-filters input:checked')).map(cb => cb.value);
    const results = document.getElementById('searchResults');
    
    const matchingComponents = Array.from(components.entries()).filter(([id, component]) => {
        const matchesQuery = component.customName.toLowerCase().includes(query) ||
                            services[component.serviceType].label.toLowerCase().includes(query) ||
                            services[component.serviceType].category.toLowerCase().includes(query);
        const matchesFilter = filters.includes(services[component.serviceType].category);
        return matchesQuery && matchesFilter;
    });
    
    results.innerHTML = matchingComponents.map(([id, component]) => `
        <div class="search-result" onclick="selectComponentById('${id}')">
            <div class="result-icon">${services[component.serviceType].icon}</div>
            <div class="result-info">
                <div class="result-name">${component.customName}</div>
                <div class="result-type">${services[component.serviceType].label}</div>
            </div>
        </div>
    `).join('');
}

function selectComponentById(id) {
    const component = document.querySelector(`[data-id="${id}"]`);
    if (component) {
        selectComponent({ target: component });
        hideSearchPanel();
    }
}

// Component Grouping
function groupSelectedComponents() {
    const selectedComponents = Array.from(components.entries())
        .filter(([id, component]) => component.selected);
    
    if (selectedComponents.length < 2) {
        alert('Select at least 2 components to group');
        return;
    }
    
    const groupId = 'group_' + Date.now();
    const group = {
        id: groupId,
        components: selectedComponents.map(([id, component]) => id),
        name: `Group ${groups.size + 1}`,
        created: new Date().toISOString()
    };
    
    groups.set(groupId, group);
    
    // Visual grouping
    selectedComponents.forEach(([id, component]) => {
        const element = document.querySelector(`[data-id="${id}"]`);
        if (element) {
            element.classList.add('grouped');
            element.dataset.groupId = groupId;
        }
    });
    
    saveState();
}

function ungroupSelectedComponents() {
    const selectedComponents = Array.from(components.entries())
        .filter(([id, component]) => component.selected);
    
    selectedComponents.forEach(([id, component]) => {
        const element = document.querySelector(`[data-id="${id}"]`);
        if (element && element.dataset.groupId) {
            const groupId = element.dataset.groupId;
            const group = groups.get(groupId);
            if (group) {
                group.components = group.components.filter(cId => cId !== id);
                if (group.components.length === 0) {
                    groups.delete(groupId);
                }
            }
            element.classList.remove('grouped');
            delete element.dataset.groupId;
        }
    });
    
    saveState();
}

// Layer Management
function addLayer() {
    const newLayerId = Math.max(...layers) + 1;
    layers.push(newLayerId);
    currentLayer = newLayerId;
    
    updateLayerUI();
    saveState();
}

function deleteCurrentLayer() {
    if (layers.length <= 1) {
        alert('Cannot delete the last layer');
        return;
    }
    
    // Move components to default layer
    const componentsInLayer = Array.from(components.entries())
        .filter(([id, component]) => component.layer === currentLayer);
    
    componentsInLayer.forEach(([id, component]) => {
        component.layer = 0;
    });
    
    layers = layers.filter(id => id !== currentLayer);
    currentLayer = layers[0];
    
    updateLayerUI();
    saveState();
}

function updateLayerUI() {
    // This would update the layer selector in the UI
    console.log('Layers:', layers, 'Current:', currentLayer);
}

// Copy/Paste functionality
let clipboard = [];

function copySelectedComponents() {
    const selectedComponents = Array.from(components.entries())
        .filter(([id, component]) => component.selected);
    
    clipboard = selectedComponents.map(([id, component]) => ({
        ...component,
        id: undefined // Remove ID for new instances
    }));
}

function pasteComponents() {
    if (clipboard.length === 0) return;
    
    const offset = 20; // Offset for pasted components
    clipboard.forEach(componentData => {
        const newId = 'component_' + Date.now() + Math.random();
        const newComponent = {
            ...componentData,
            id: newId,
            x: componentData.x + offset,
            y: componentData.y + offset,
            selected: false
        };
        
        components.set(newId, newComponent);
        addComponentToCanvas(newComponent);
    });
    
    saveState();
}

function cutSelectedComponents() {
    copySelectedComponents();
    deleteSelectedComponent();
}

// Select All/Deselect All
function selectAllComponents() {
    components.forEach((component, id) => {
        component.selected = true;
        const element = document.querySelector(`[data-id="${id}"]`);
        if (element) {
            element.classList.add('selected');
        }
    });
}

function deselectAllComponents() {
    components.forEach((component, id) => {
        component.selected = false;
        const element = document.querySelector(`[data-id="${id}"]`);
        if (element) {
            element.classList.remove('selected');
        }
    });
    selectedComponent = null;
    hideComponentProperties();
}

// Cost Calculator
function showCostCalculator() {
    const calculator = document.getElementById('costCalculator') || createCostCalculator();
    calculator.style.display = 'block';
    updateCostCalculation();
}

function createCostCalculator() {
    const calculator = document.createElement('div');
    calculator.id = 'costCalculator';
    calculator.className = 'cost-calculator';
    calculator.innerHTML = `
        <div class="calculator-header">
            <h3>Azure Cost Calculator</h3>
            <button class="close-btn" onclick="hideCostCalculator()">×</button>
        </div>
        <div class="calculator-content">
            <div class="cost-summary">
                <div class="cost-item">
                    <span>Monthly Cost:</span>
                    <span id="monthlyCost">$0.00</span>
                </div>
                <div class="cost-item">
                    <span>Annual Cost:</span>
                    <span id="annualCost">$0.00</span>
                </div>
            </div>
            <div class="cost-breakdown" id="costBreakdown"></div>
            <div class="cost-optimization">
                <h4>Optimization Suggestions</h4>
                <div id="optimizationSuggestions"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(calculator);
    return calculator;
}

function hideCostCalculator() {
    const calculator = document.getElementById('costCalculator');
    if (calculator) {
        calculator.style.display = 'none';
    }
}

function updateCostCalculation() {
    let totalMonthly = 0;
    const breakdown = {};
    
    components.forEach((component, id) => {
        const service = services[component.serviceType];
        if (service.cost) {
            let cost = 0;
            if (service.cost.monthly) {
                cost = service.cost.monthly;
            } else if (service.cost.hourly) {
                cost = service.cost.hourly * 730; // 730 hours per month
            }
            
            totalMonthly += cost;
            breakdown[service.label] = cost;
        }
    });
    
    const annualCost = totalMonthly * 12;
    
    document.getElementById('monthlyCost').textContent = `$${totalMonthly.toFixed(2)}`;
    document.getElementById('annualCost').textContent = `$${annualCost.toFixed(2)}`;
    
    // Update breakdown
    const breakdownElement = document.getElementById('costBreakdown');
    breakdownElement.innerHTML = Object.entries(breakdown)
        .map(([service, cost]) => `
            <div class="breakdown-item">
                <span>${service}</span>
                <span>$${cost.toFixed(2)}/month</span>
            </div>
        `).join('');
    
    // Update optimization suggestions
    updateOptimizationSuggestions();
}

function updateOptimizationSuggestions() {
    const suggestions = [];
    
    components.forEach((component, id) => {
        const service = services[component.serviceType];
        if (service.cost && service.cost.monthly > 50) {
            suggestions.push(`Consider using reserved instances for ${service.label} to save up to 60%`);
        }
    });
    
    if (suggestions.length === 0) {
        suggestions.push('Your architecture is cost-optimized!');
    }
    
    document.getElementById('optimizationSuggestions').innerHTML = suggestions
        .map(suggestion => `<div class="suggestion">• ${suggestion}</div>`)
        .join('');
}

// Security Analysis
function showSecurityAnalysis() {
    const analysis = document.getElementById('securityAnalysis') || createSecurityAnalysis();
    analysis.style.display = 'block';
    updateSecurityAnalysis();
}

function createSecurityAnalysis() {
    const analysis = document.createElement('div');
    analysis.id = 'securityAnalysis';
    analysis.className = 'security-analysis';
    analysis.innerHTML = `
        <div class="analysis-header">
            <h3>Security Analysis</h3>
            <button class="close-btn" onclick="hideSecurityAnalysis()">×</button>
        </div>
        <div class="analysis-content">
            <div class="security-score">
                <div class="score-circle">
                    <span id="securityScore">0</span>
                </div>
                <div class="score-label">Security Score</div>
            </div>
            <div class="security-findings" id="securityFindings"></div>
            <div class="security-recommendations" id="securityRecommendations"></div>
        </div>
    `;
    
    document.body.appendChild(analysis);
    return analysis;
}

function hideSecurityAnalysis() {
    const analysis = document.getElementById('securityAnalysis');
    if (analysis) {
        analysis.style.display = 'none';
    }
}

function updateSecurityAnalysis() {
    let score = 100;
    const findings = [];
    const recommendations = [];
    
    // Check for security best practices
    const hasFirewall = Array.from(components.values()).some(c => c.serviceType === 'firewall');
    const hasKeyVault = Array.from(components.values()).some(c => c.serviceType === 'keyvault');
    const hasVNet = Array.from(components.values()).some(c => c.serviceType === 'vnet');
    
    if (!hasFirewall) {
        score -= 20;
        findings.push('No firewall detected');
        recommendations.push('Add Azure Firewall for network security');
    }
    
    if (!hasKeyVault) {
        score -= 15;
        findings.push('No Key Vault for secrets management');
        recommendations.push('Add Azure Key Vault for secure secret storage');
    }
    
    if (!hasVNet) {
        score -= 10;
        findings.push('No Virtual Network for network isolation');
        recommendations.push('Add Virtual Network for network segmentation');
    }
    
    // Check for public-facing services
    const publicServices = Array.from(components.values()).filter(c => 
        ['appservice', 'vm', 'gateway'].includes(c.serviceType)
    );
    
    if (publicServices.length > 0 && !hasFirewall) {
        score -= 25;
        findings.push('Public-facing services without firewall protection');
        recommendations.push('Implement network security groups and firewall rules');
    }
    
    document.getElementById('securityScore').textContent = Math.max(0, score);
    
    document.getElementById('securityFindings').innerHTML = findings.length > 0 
        ? findings.map(finding => `<div class="finding">⚠️ ${finding}</div>`).join('')
        : '<div class="finding positive">✅ No security issues found</div>';
    
    document.getElementById('securityRecommendations').innerHTML = recommendations.length > 0
        ? recommendations.map(rec => `<div class="recommendation">💡 ${rec}</div>`).join('')
        : '<div class="recommendation">✅ Security best practices followed</div>';
}

// Annotations
function addAnnotation() {
    const annotation = prompt('Enter annotation text:');
    if (annotation && selectedComponent) {
        const annotationId = 'annotation_' + Date.now();
        const annotationData = {
            id: annotationId,
            componentId: selectedComponent.id,
            text: annotation,
            created: new Date().toISOString(),
            position: { x: 50, y: 50 }
        };
        
        annotations.push(annotationData);
        createAnnotationElement(annotationData);
        saveState();
    }
}

function createAnnotationElement(annotationData) {
    const annotation = document.createElement('div');
    annotation.className = 'annotation';
    annotation.dataset.id = annotationData.id;
    annotation.style.left = annotationData.position.x + 'px';
    annotation.style.top = annotationData.position.y + 'px';
    annotation.innerHTML = `
        <div class="annotation-content">
            <div class="annotation-text">${annotationData.text}</div>
            <button class="annotation-delete" onclick="deleteAnnotation('${annotationData.id}')">×</button>
        </div>
    `;
    
    document.getElementById('canvasContent').appendChild(annotation);
}

function deleteAnnotation(annotationId) {
    annotations = annotations.filter(a => a.id !== annotationId);
    const element = document.querySelector(`[data-id="${annotationId}"]`);
    if (element) {
        element.remove();
    }
    saveState();
}

// Template Management
function saveAsTemplate() {
    const templateName = prompt('Enter template name:');
    if (!templateName) return;
    
    const template = {
        name: templateName,
        description: prompt('Enter template description:') || '',
        components: Array.from(components.entries()).map(([id, component]) => ({
            serviceType: component.serviceType,
            x: component.x,
            y: component.y,
            customName: component.customName,
            variant: component.variant || 'standard'
        })),
        connections: connections.map(conn => ({
            from: components.get(conn.from)?.customName,
            to: components.get(conn.to)?.customName,
            type: conn.type
        })),
        created: new Date().toISOString()
    };
    
    const savedTemplates = JSON.parse(localStorage.getItem('azure-designer-templates') || '[]');
    savedTemplates.push(template);
    localStorage.setItem('azure-designer-templates', JSON.stringify(savedTemplates));
    
    alert(`Template "${templateName}" saved successfully!`);
}

function openTemplateDialog() {
    const savedTemplates = JSON.parse(localStorage.getItem('azure-designer-templates') || '[]');
    
    if (savedTemplates.length === 0) {
        alert('No saved templates found');
        return;
    }
    
    const templateList = savedTemplates.map((template, index) => 
        `${index + 1}. ${template.name} - ${template.description}`
    ).join('\n');
    
    const choice = prompt(`Select template (1-${savedTemplates.length}):\n\n${templateList}`);
    const templateIndex = parseInt(choice) - 1;
    
    if (templateIndex >= 0 && templateIndex < savedTemplates.length) {
        loadCustomTemplate(savedTemplates[templateIndex]);
    }
}

function loadCustomTemplate(template) {
    if (confirm(`Load template "${template.name}"? This will replace your current architecture.`)) {
        clearCanvas();
        
        // Add components
        template.components.forEach(componentData => {
            addComponent(componentData.serviceType, componentData.x, componentData.y);
            // Set custom name
            const componentId = Array.from(components.keys()).pop();
            const component = components.get(componentId);
            if (component) {
                component.customName = componentData.customName;
                component.variant = componentData.variant;
            }
        });
        
        // Add connections
        template.connections.forEach(connData => {
            const fromComponent = Array.from(components.values()).find(c => c.customName === connData.from);
            const toComponent = Array.from(components.values()).find(c => c.customName === connData.to);
            
            if (fromComponent && toComponent) {
                createConnection(fromComponent.id, toComponent.id, connData.type);
            }
        });
        
        saveState();
        alert(`Template "${template.name}" loaded successfully!`);
    }
}

// Minimap
function toggleMinimap() {
    const minimap = document.getElementById('minimap') || createMinimap();
    minimap.style.display = minimap.style.display === 'none' ? 'block' : 'none';
}

function createMinimap() {
    const minimap = document.createElement('div');
    minimap.id = 'minimap';
    minimap.className = 'minimap';
    minimap.innerHTML = `
        <div class="minimap-header">
            <span>Minimap</span>
            <button class="minimap-close" onclick="toggleMinimap()">×</button>
        </div>
        <div class="minimap-content" id="minimapContent"></div>
    `;
    
    document.body.appendChild(minimap);
    updateMinimap();
    return minimap;
}

function updateMinimap() {
    const minimapContent = document.getElementById('minimapContent');
    if (!minimapContent) return;
    
    // Create a scaled-down representation of the canvas
    const scale = 0.1;
    minimapContent.innerHTML = '';
    
    components.forEach((component, id) => {
        const element = document.createElement('div');
        element.className = 'minimap-component';
        element.style.left = (component.x * scale) + 'px';
        element.style.top = (component.y * scale) + 'px';
        element.style.backgroundColor = services[component.serviceType].color;
        minimapContent.appendChild(element);
    });
}

// Grid customization
function toggleGrid() {
    const canvas = document.getElementById('architectureCanvas');
    const grid = canvas.querySelector('.canvas-grid');
    grid.style.display = grid.style.display === 'none' ? 'block' : 'none';
}

function setGridSize(size) {
    gridSize = size;
    // Update grid visual
    const canvas = document.getElementById('architectureCanvas');
    const grid = canvas.querySelector('.canvas-grid');
    grid.style.backgroundSize = `${size}px ${size}px`;
}

// Properties panel toggle
function togglePropertiesPanel() {
    const panel = document.querySelector('.properties-panel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

// Version History
function saveVersion() {
    const version = {
        id: currentVersion++,
        timestamp: new Date().toISOString(),
        components: Array.from(components.entries()),
        connections: connections,
        name: `Version ${currentVersion}`
    };
    
    versionHistory.push(version);
    
    // Keep only last 10 versions
    if (versionHistory.length > 10) {
        versionHistory.shift();
    }
    
    localStorage.setItem('azure-designer-versions', JSON.stringify(versionHistory));
}

function showVersionHistory() {
    const history = document.getElementById('versionHistory') || createVersionHistory();
    history.style.display = 'block';
    updateVersionHistory();
}

function createVersionHistory() {
    const history = document.createElement('div');
    history.id = 'versionHistory';
    history.className = 'version-history';
    history.innerHTML = `
        <div class="history-header">
            <h3>Version History</h3>
            <button class="close-btn" onclick="hideVersionHistory()">×</button>
        </div>
        <div class="history-content" id="historyContent"></div>
    `;
    
    document.body.appendChild(history);
    return history;
}

function hideVersionHistory() {
    const history = document.getElementById('versionHistory');
    if (history) {
        history.style.display = 'none';
    }
}

function updateVersionHistory() {
    const content = document.getElementById('historyContent');
    if (!content) return;
    
    content.innerHTML = versionHistory.map(version => `
        <div class="version-item" onclick="restoreVersion(${version.id})">
            <div class="version-name">${version.name}</div>
            <div class="version-date">${new Date(version.timestamp).toLocaleString()}</div>
            <div class="version-stats">${version.components.length} components, ${version.connections.length} connections</div>
        </div>
    `).join('');
}

function restoreVersion(versionId) {
    const version = versionHistory.find(v => v.id === versionId);
    if (version && confirm(`Restore to ${version.name}?`)) {
        loadState({
            components: version.components,
            connections: version.connections
        });
    }
}

// Enhanced component properties with variants


function updateComponentVariant(componentId, variant) {
    const component = components.get(componentId);
    if (component) {
        component.variant = variant;
        saveState();
    }
}

function updateComponentPosition(componentId, axis, value) {
    const component = components.get(componentId);
    if (component) {
        component[axis] = parseInt(value);
        const element = document.querySelector(`[data-id="${componentId}"]`);
        if (element) {
            element.style[axis === 'x' ? 'left' : 'top'] = value + 'px';
        }
        saveState();
    }
}

function updateComponentSize(componentId, dimension, value) {
    const component = components.get(componentId);
    if (component) {
        component[dimension] = parseInt(value);
        const element = document.querySelector(`[data-id="${componentId}"]`);
        if (element) {
            element.style[dimension] = value + 'px';
        }
        saveState();
    }
}

function updateComponentLayer(componentId, layer) {
    const component = components.get(componentId);
    if (component) {
        component.layer = parseInt(layer);
        saveState();
    }
}

function calculateComponentCost(componentData) {
    const service = services[componentData.serviceType];
    if (service && service.cost) {
        if (service.cost.monthly) {
            return service.cost.monthly;
        } else if (service.cost.hourly) {
            return service.cost.hourly * 730;
        }
    }
    return 0;
}

function duplicateComponent(componentId) {
    const original = components.get(componentId);
    if (original) {
        // Create a new component with the same service type
        addComponent(original.serviceType, original.x + 20, original.y + 20);
        
        // Update the newly created component's name
        const newComponentId = componentCounter;
        const newComponentData = components.get(newComponentId);
        if (newComponentData) {
            newComponentData.customName = original.customName + ' (Copy)';
            
            // Update the component label on the canvas
            const newComponentElement = document.querySelector(`[data-id="${newComponentId}"]`);
            if (newComponentElement) {
                const labelElement = newComponentElement.querySelector('.component-label');
                if (labelElement) {
                    labelElement.textContent = newComponentData.customName;
                }
            }
        }
        
        saveState();
    }
}

// Enhanced save state to include new features
function saveState() {
    const state = {
        components: Array.from(components.entries()),
        connections: connections,
        componentCounter: componentCounter,
        zoomLevel: zoomLevel,
        panOffset: panOffset,
        currentLayer: currentLayer,
        layers: layers,
        groups: Array.from(groups.entries()),
        annotations: annotations,
        versionHistory: versionHistory,
        currentVersion: currentVersion
    };
    
    undoStack.push(JSON.stringify(state));
    redoStack = [];
    updateUndoButton();
    
    // Auto-save to localStorage
    saveToLocalStorage();
    
    // Save version every 5 minutes
    if (Date.now() - lastVersionSave > 300000) {
        saveVersion();
        lastVersionSave = Date.now();
    }
}

// Global variables for version management
let lastVersionSave = Date.now();

// Dropdown Menu Management
function initializeDropdowns() {
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
        const menu = toggle.nextElementSibling;
        
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Close other dropdowns
            dropdownToggles.forEach(otherToggle => {
                if (otherToggle !== toggle) {
                    otherToggle.classList.remove('active');
                    otherToggle.nextElementSibling.classList.remove('active');
                }
            });
            
            // Toggle current dropdown
            toggle.classList.toggle('active');
            menu.classList.toggle('active');
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.tool-group')) {
            dropdownToggles.forEach(toggle => {
                toggle.classList.remove('active');
                toggle.nextElementSibling.classList.remove('active');
            });
        }
    });
    
    // Handle dropdown item clicks
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const toggle = item.closest('.tool-group').querySelector('.dropdown-toggle');
            toggle.classList.remove('active');
            item.closest('.dropdown-menu').classList.remove('active');
        });
    });
}

// Enhanced smooth animations
function addSmoothAnimations() {
    // Add smooth transitions to all interactive elements
    const interactiveElements = document.querySelectorAll('.tool-btn, .palette-item, .canvas-component, .view-btn');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            element.style.transform = 'translateY(-1px)';
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'translateY(0)';
        });
    });
}

// Enhanced Micro-interactions and Animations
function enhanceUserExperience() {
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.tool-btn, .view-btn, .dropdown-item');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Smooth component dragging feedback
    let isDragging = false;
    const canvas = document.getElementById('architectureCanvas');
    
    canvas.addEventListener('mousedown', () => {
        isDragging = true;
        canvas.style.cursor = 'grabbing';
    });
    
    canvas.addEventListener('mouseup', () => {
        isDragging = false;
        canvas.style.cursor = 'grab';
    });
    
    // Enhanced palette item feedback
    const paletteItems = document.querySelectorAll('.palette-item');
    
    paletteItems.forEach(item => {
        item.addEventListener('dragstart', () => {
            item.style.opacity = '0.5';
            item.style.transform = 'scale(0.95)';
        });
        
        item.addEventListener('dragend', () => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
        });
    });
    
    // Smooth folder animations
    const folderHeaders = document.querySelectorAll('.folder-header');
    
    folderHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const toggle = header.querySelector('.folder-toggle');
            
            if (content.classList.contains('collapsed')) {
                content.style.maxHeight = content.scrollHeight + 'px';
                setTimeout(() => {
                    content.style.maxHeight = '300px';
                }, 10);
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
                setTimeout(() => {
                    content.style.maxHeight = '0px';
                }, 10);
            }
            
            header.classList.toggle('collapsed');
            content.classList.toggle('collapsed');
        });
    });
}

// Enhanced loading states
function showLoadingState(element, message = 'Loading...') {
    element.classList.add('loading');
    element.setAttribute('data-loading-text', message);
}

function hideLoadingState(element) {
    element.classList.remove('loading');
    element.removeAttribute('data-loading-text');
}

// Smooth notifications
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `${type}-message`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto remove
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Enhanced keyboard shortcuts with visual feedback
function enhanceKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Visual feedback for shortcuts
        if (e.ctrlKey || e.metaKey) {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.classList.contains('tool-btn')) {
                activeElement.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    activeElement.style.transform = '';
                }, 150);
            }
        }
    });
}

// Status bar updates
function updateStatusBar() {
    const componentCount = document.getElementById('componentCount');
    const statusZoom = document.getElementById('statusZoom');
    const mousePosition = document.getElementById('mousePosition');
    
    if (componentCount) {
        componentCount.textContent = components.size;
    }
    
    if (statusZoom) {
        statusZoom.textContent = Math.round(zoomLevel * 100) + '%';
    }
    
    // Update mouse position on canvas
    const canvas = document.getElementById('architectureCanvas');
    if (canvas && mousePosition) {
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = Math.round((e.clientX - rect.left - panOffset.x) / zoomLevel);
            const y = Math.round((e.clientY - rect.top - panOffset.y) / zoomLevel);
            mousePosition.textContent = `${x}, ${y}`;
        });
    }
}

// Debug function for pan mode (can be removed in production)
function testPanMode() {
    console.log('=== Pan Mode Debug ===');
    console.log('Current pan mode:', panMode);
    console.log('Spacebar pressed:', spacebarPressed);
    
    const activeElement = document.activeElement;
    console.log('Active element:', activeElement);
    console.log('Active element tag:', activeElement ? activeElement.tagName : 'none');
    console.log('Active element class:', activeElement ? activeElement.className : 'none');
    
    const isInInput = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.classList.contains('rename-input') ||
        activeElement.contentEditable === 'true' ||
        activeElement.isContentEditable
    );
    
    console.log('Is in input:', isInInput);
    console.log('Should allow spacebar:', !isInInput && !spacebarPressed);
}

// Initialize enhanced UX
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    
    enhanceUserExperience();
    enhanceKeyboardShortcuts();
    
    // ... rest of existing code ...
}); 