/**
 * Azure Cloud Architecture Designer - Optimized Version
 * A professional-grade tool for designing Azure architectures
 */

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

const CONFIG = {
    GRID_SIZE: 20,
    MIN_ZOOM: 0.25,
    MAX_ZOOM: 3,
    ZOOM_STEP: 1.2,
    AUTO_SAVE_DELAY: 1000,
    ANIMATION_DURATION: 300
};

const SERVICES = {
    vm: { icon: '🖥️', label: 'Virtual Machine', color: '#0078d4' },
    loadbalancer: { icon: '⚖️', label: 'Load Balancer', color: '#00a1f1' },
    sql: { icon: '🗄️', label: 'SQL Database', color: '#68217a' },
    appservice: { icon: '🌐', label: 'App Service', color: '#68217a' },
    storage: { icon: '📦', label: 'Storage Account', color: '#0078d4' },
    cdn: { icon: '🚀', label: 'CDN', color: '#00a1f1' },
    vnet: { icon: '🌐', label: 'Virtual Network', color: '#68217a' },
    gateway: { icon: '🚪', label: 'API Gateway', color: '#0078d4' }
};

const CONNECTION_TYPES = {
    data: { style: 'solid', color: '#0078d4', label: 'Data Flow' },
    network: { style: 'dashed', color: '#00a1f1', label: 'Network' },
    security: { style: 'dotted', color: '#68217a', label: 'Security' },
    management: { style: 'solid', color: '#ff8c00', label: 'Management' }
};

const TEMPLATES = {
    webApp: [
        { serviceType: 'appservice', x: 200, y: 100, customName: 'Web App' },
        { serviceType: 'sql', x: 400, y: 100, customName: 'Database' },
        { serviceType: 'storage', x: 200, y: 300, customName: 'Blob Storage' }
    ],
    microservices: [
        { serviceType: 'appservice', x: 100, y: 100, customName: 'API Gateway' },
        { serviceType: 'appservice', x: 300, y: 100, customName: 'User Service' },
        { serviceType: 'appservice', x: 500, y: 100, customName: 'Order Service' },
        { serviceType: 'sql', x: 300, y: 300, customName: 'User DB' },
        { serviceType: 'sql', x: 500, y: 300, customName: 'Order DB' }
    ],
    serverless: [
        { serviceType: 'gateway', x: 200, y: 100, customName: 'API Gateway' },
        { serviceType: 'appservice', x: 400, y: 100, customName: 'Function App' },
        { serviceType: 'storage', x: 200, y: 300, customName: 'Cosmos DB' },
        { serviceType: 'cdn', x: 400, y: 300, customName: 'CDN' }
    ]
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

class AppState {
    constructor() {
        this.isDarkTheme = false;
        this.selectedComponent = null;
        this.componentCounter = 0;
        this.undoStack = [];
        this.redoStack = [];
        this.components = new Map();
        this.connections = [];
        this.connectionMode = false;
        this.connectionStart = null;
        this.zoomLevel = 1;
        this.panOffset = { x: 0, y: 0 };
        this.isPanning = false;
        this.lastPanPoint = { x: 0, y: 0 };
        this.autoSaveTimeout = null;
    }

    // Component management
    addComponent(serviceType, x, y) {
        const service = SERVICES[serviceType];
        if (!service) return null;

        const componentId = ++this.componentCounter;
        const componentData = {
            id: componentId,
            serviceType,
            label: service.label,
            x: Math.round(x / CONFIG.GRID_SIZE) * CONFIG.GRID_SIZE,
            y: Math.round(y / CONFIG.GRID_SIZE) * CONFIG.GRID_SIZE,
            customName: service.label
        };

        this.components.set(componentId, componentData);
        this.saveState();
        this.autoSave();
        return componentData;
    }

    updateComponent(componentId, updates) {
        const component = this.components.get(componentId);
        if (component) {
            Object.assign(component, updates);
            this.saveState();
            this.autoSave();
        }
    }

    removeComponent(componentId) {
        this.components.delete(componentId);
        this.connections = this.connections.filter(conn => 
            conn.from !== componentId && conn.to !== componentId
        );
        this.saveState();
        this.autoSave();
    }

    // Connection management
    addConnection(fromId, toId, type = 'data') {
        const existingConnection = this.connections.find(conn => 
            (conn.from === fromId && conn.to === toId) || 
            (conn.from === toId && conn.to === fromId)
        );

        if (existingConnection) return false;

        this.connections.push({
            id: Date.now(),
            from: fromId,
            to: toId,
            type
        });

        this.saveState();
        this.autoSave();
        return true;
    }

    removeConnection(connectionId) {
        this.connections = this.connections.filter(conn => conn.id !== connectionId);
        this.saveState();
        this.autoSave();
    }

    // State persistence
    saveState() {
        const state = {
            components: Array.from(this.components.entries()),
            connections: this.connections,
            componentCounter: this.componentCounter
        };
        this.undoStack.push(JSON.stringify(state));
        this.redoStack = [];
    }

    undo() {
        if (this.undoStack.length > 1) {
            const currentState = this.undoStack.pop();
            this.redoStack.push(currentState);
            
            const previousState = JSON.parse(this.undoStack[this.undoStack.length - 1]);
            this.loadFromState(previousState);
        }
    }

    redo() {
        if (this.redoStack.length > 0) {
            const nextState = JSON.parse(this.redoStack.pop());
            this.undoStack.push(JSON.stringify(nextState));
            this.loadFromState(nextState);
        }
    }

    loadFromState(state) {
        this.components = new Map(state.components || []);
        this.connections = state.connections || [];
        this.componentCounter = state.componentCounter || 0;
    }

    // Auto-save functionality
    autoSave() {
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }
        
        this.autoSaveTimeout = setTimeout(() => {
            this.saveToLocalStorage();
        }, CONFIG.AUTO_SAVE_DELAY);
    }

    saveToLocalStorage() {
        const data = {
            components: Array.from(this.components.entries()),
            connections: this.connections,
            componentCounter: this.componentCounter,
            theme: this.isDarkTheme ? 'dark' : 'light'
        };
        localStorage.setItem('azure-designer-data', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        const savedData = localStorage.getItem('azure-designer-data');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.loadFromState(data);
                if (data.theme === 'dark') {
                    this.isDarkTheme = true;
                }
                return true;
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        }
        return false;
    }

    // Zoom and pan
    setZoom(level, centerX = null, centerY = null) {
        const oldZoom = this.zoomLevel;
        this.zoomLevel = Math.max(CONFIG.MIN_ZOOM, Math.min(CONFIG.MAX_ZOOM, level));
        
        if (centerX !== null && centerY !== null) {
            const scale = this.zoomLevel / oldZoom;
            this.panOffset.x = centerX - (centerX - this.panOffset.x) * scale;
            this.panOffset.y = centerY - (centerY - this.panOffset.y) * scale;
        }
    }

    zoomIn() {
        this.setZoom(this.zoomLevel * CONFIG.ZOOM_STEP);
    }

    zoomOut() {
        this.setZoom(this.zoomLevel / CONFIG.ZOOM_STEP);
    }

    resetZoom() {
        this.setZoom(1);
        this.panOffset = { x: 0, y: 0 };
    }
}

// ============================================================================
// UI COMPONENTS
// ============================================================================

class UIComponents {
    static createComponentElement(componentData) {
        const service = SERVICES[componentData.serviceType];
        const element = document.createElement('div');
        
        element.className = 'canvas-component';
        element.dataset.id = componentData.id;
        element.dataset.serviceType = componentData.serviceType;
        element.style.left = componentData.x + 'px';
        element.style.top = componentData.y + 'px';
        
        element.innerHTML = `
            <div class="component-icon">${service.icon}</div>
            <div class="component-label">${componentData.customName}</div>
        `;
        
        return element;
    }

    static createConnectionLine(fromComponent, toComponent, type = 'data') {
        const line = document.createElement('div');
        line.className = 'connection-line';
        
        const fromRect = fromComponent.getBoundingClientRect();
        const toRect = toComponent.getBoundingClientRect();
        const canvasRect = document.getElementById('architectureCanvas').getBoundingClientRect();
        
        const fromX = fromRect.left + fromRect.width / 2 - canvasRect.left;
        const fromY = fromRect.top + fromRect.height / 2 - canvasRect.top;
        const toX = toRect.left + toRect.width / 2 - canvasRect.left;
        const toY = toRect.top + toRect.height / 2 - canvasRect.top;
        
        const length = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
        const angle = Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI;
        
        const connectionType = CONNECTION_TYPES[type] || CONNECTION_TYPES.data;
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

    static createToolbarButton(icon, text, onClick, className = '') {
        const button = document.createElement('button');
        button.className = `tool-btn ${className}`;
        button.innerHTML = `<span class="btn-icon">${icon}</span> ${text}`;
        button.addEventListener('click', onClick);
        return button;
    }

    static createTemplatesMenu() {
        const menu = document.createElement('div');
        menu.className = 'templates-menu';
        
        const templateItems = Object.entries(TEMPLATES).map(([key, template]) => {
            const name = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
            return `
                <div class="template-item" data-template="${key}">
                    <h4>${name}</h4>
                    <p>${template.length} components</p>
                </div>
            `;
        }).join('');
        
        menu.innerHTML = templateItems;
        return menu;
    }
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

class EventHandlers {
    constructor(appState) {
        this.appState = appState;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
    }

    // Component interactions
    handleComponentDragStart(e) {
        e.preventDefault();
        e.stopPropagation();
        
        this.isDragging = true;
        const component = e.currentTarget;
        const rect = component.getBoundingClientRect();
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;
        
        document.addEventListener('mousemove', this.handleComponentDragMove.bind(this));
        document.addEventListener('mouseup', this.handleComponentDragEnd.bind(this));
    }

    handleComponentDragMove(e) {
        if (!this.isDragging) return;
        
        const component = this.appState.selectedComponent;
        if (!component) return;
        
        const canvasRect = document.getElementById('architectureCanvas').getBoundingClientRect();
        let x = e.clientX - canvasRect.left - this.dragOffset.x;
        let y = e.clientY - canvasRect.top - this.dragOffset.y;
        
        // Snap to grid
        x = Math.round(x / CONFIG.GRID_SIZE) * CONFIG.GRID_SIZE;
        y = Math.round(y / CONFIG.GRID_SIZE) * CONFIG.GRID_SIZE;
        
        // Keep within canvas bounds
        const componentRect = component.getBoundingClientRect();
        x = Math.max(0, Math.min(x, canvasRect.width - componentRect.width));
        y = Math.max(0, Math.min(y, canvasRect.height - componentRect.height));
        
        component.style.left = x + 'px';
        component.style.top = y + 'px';
        
        // Update state
        const componentId = parseInt(component.dataset.id);
        this.appState.updateComponent(componentId, { x, y });
    }

    handleComponentDragEnd() {
        this.isDragging = false;
        document.removeEventListener('mousemove', this.handleComponentDragMove.bind(this));
        document.removeEventListener('mouseup', this.handleComponentDragEnd.bind(this));
    }

    handleComponentClick(e) {
        e.stopPropagation();
        this.selectComponent(e.currentTarget);
    }

    handleComponentDoubleClick(e) {
        e.preventDefault();
        e.stopPropagation();
        this.startRename(e.currentTarget);
    }

    // Canvas interactions
    handleCanvasClick(e) {
        if (e.target === e.currentTarget || e.target.classList.contains('canvas-grid')) {
            this.deselectComponent();
        }
    }

    handleCanvasWheel(e) {
        if (e.ctrlKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            const newZoom = Math.max(CONFIG.MIN_ZOOM, Math.min(CONFIG.MAX_ZOOM, this.appState.zoomLevel * delta));
            this.appState.setZoom(newZoom, e.offsetX, e.offsetY);
            this.updateCanvasTransform();
            this.updateZoomDisplay();
        }
    }

    handleCanvasMouseDown(e) {
        if (e.button === 1) { // Middle mouse button
            e.preventDefault();
            this.appState.isPanning = true;
            this.appState.lastPanPoint = { x: e.clientX, y: e.clientY };
            document.body.style.cursor = 'grabbing';
        }
    }

    handleGlobalMouseMove(e) {
        if (this.appState.isPanning) {
            const deltaX = e.clientX - this.appState.lastPanPoint.x;
            const deltaY = e.clientY - this.appState.lastPanPoint.y;
            this.appState.panOffset.x += deltaX;
            this.appState.panOffset.y += deltaY;
            this.updateCanvasTransform();
            this.appState.lastPanPoint = { x: e.clientX, y: e.clientY };
        }
    }

    handleGlobalMouseUp() {
        if (this.appState.isPanning) {
            this.appState.isPanning = false;
            document.body.style.cursor = 'default';
        }
    }

    // Keyboard shortcuts
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'z':
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.appState.redo();
                    } else {
                        this.appState.undo();
                    }
                    this.renderCanvas();
                    break;
                case 's':
                    e.preventDefault();
                    this.saveScreenshot();
                    break;
                case 'o':
                    e.preventDefault();
                    this.openFileDialog();
                    break;
                case 'e':
                    e.preventDefault();
                    this.exportToJSON();
                    break;
                case '=':
                case '+':
                    e.preventDefault();
                    this.appState.zoomIn();
                    this.updateCanvasTransform();
                    this.updateZoomDisplay();
                    break;
                case '-':
                    e.preventDefault();
                    this.appState.zoomOut();
                    this.updateCanvasTransform();
                    this.updateZoomDisplay();
                    break;
                case '0':
                    e.preventDefault();
                    this.appState.resetZoom();
                    this.updateCanvasTransform();
                    this.updateZoomDisplay();
                    break;
                case 'Delete':
                case 'Backspace':
                    e.preventDefault();
                    this.deleteSelectedComponent();
                    break;
            }
        }
        
        if (e.key === ' ') {
            e.preventDefault();
            this.togglePanMode();
        }
    }
}

// ============================================================================
// MAIN APPLICATION CLASS
// ============================================================================

class AzureDesigner {
    constructor() {
        this.state = new AppState();
        this.handlers = new EventHandlers(this.state);
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        this.initializeTheme();
        this.initializeEventListeners();
        this.initializeCanvas();
        this.initializeToolbar();
        this.loadSavedData();
        
        this.initialized = true;
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('azure-designer-theme');
        if (savedTheme === 'dark') {
            this.toggleTheme();
        }
    }

    initializeEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme());
        
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.target.getAttribute('href')?.substring(1);
                if (target === 'tool') {
                    this.showTool();
                }
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handlers.handleKeyboardShortcuts(e));
        
        // Global mouse events
        document.addEventListener('mousemove', (e) => this.handlers.handleGlobalMouseMove(e));
        document.addEventListener('mouseup', () => this.handlers.handleGlobalMouseUp());
        
        // Terminal easter egg
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.showTerminal();
            }
        });
    }

    initializeCanvas() {
        const canvas = document.getElementById('architectureCanvas');
        if (!canvas) return;
        
        canvas.addEventListener('click', (e) => this.handlers.handleCanvasClick(e));
        canvas.addEventListener('wheel', (e) => this.handlers.handleCanvasWheel(e));
        canvas.addEventListener('mousedown', (e) => this.handlers.handleCanvasMouseDown(e));
    }

    initializeToolbar() {
        const toolbarLeft = document.querySelector('.toolbar-left');
        const toolbarRight = document.querySelector('.toolbar-right');
        
        if (!toolbarLeft || !toolbarRight) return;
        
        // Left toolbar buttons
        const undoBtn = UIComponents.createToolbarButton('↶', 'Undo', () => {
            this.state.undo();
            this.renderCanvas();
        });
        undoBtn.id = 'undoBtn';
        undoBtn.disabled = true;
        toolbarLeft.appendChild(undoBtn);
        
        const clearBtn = UIComponents.createToolbarButton('🗑', 'Clear', () => this.clearCanvas());
        toolbarLeft.appendChild(clearBtn);
        
        const connectBtn = UIComponents.createToolbarButton('🔗', 'Connect', () => this.toggleConnectionMode());
        connectBtn.id = 'connectBtn';
        toolbarLeft.appendChild(connectBtn);
        
        // Right toolbar buttons
        const saveBtn = UIComponents.createToolbarButton('📸', 'Save Screenshot', () => this.saveScreenshot());
        saveBtn.className = 'tool-btn primary';
        toolbarRight.appendChild(saveBtn);
        
        const templatesBtn = UIComponents.createToolbarButton('📋', 'Templates', () => this.showTemplatesMenu());
        toolbarRight.appendChild(templatesBtn);
        
        const importBtn = UIComponents.createToolbarButton('📁', 'Import', () => this.openFileDialog());
        toolbarRight.appendChild(importBtn);
        
        const exportBtn = UIComponents.createToolbarButton('💾', 'Export', () => this.exportToJSON());
        toolbarRight.appendChild(exportBtn);
        
        // Zoom controls
        const zoomContainer = document.createElement('div');
        zoomContainer.className = 'zoom-controls';
        zoomContainer.innerHTML = `
            <button class="tool-btn" onclick="app.zoomOut()" title="Zoom Out (Ctrl+-)">-</button>
            <span class="zoom-level">100%</span>
            <button class="tool-btn" onclick="app.zoomIn()" title="Zoom In (Ctrl+=)">+</button>
        `;
        toolbarRight.appendChild(zoomContainer);
    }

    // Navigation
    showTool() {
        document.getElementById('landing').style.display = 'none';
        document.getElementById('tool').style.display = 'block';
        document.querySelector('.nav-link[href="#tool"]')?.classList.add('active');
    }

    showLanding() {
        document.getElementById('tool').style.display = 'none';
        document.getElementById('landing').style.display = 'block';
        document.querySelector('.nav-link[href="#tool"]')?.classList.remove('active');
    }

    // Theme management
    toggleTheme() {
        this.state.isDarkTheme = !this.state.isDarkTheme;
        document.body.classList.toggle('dark-theme', this.state.isDarkTheme);
        
        const themeToggle = document.getElementById('themeToggle');
        const toggleIcon = themeToggle?.querySelector('.toggle-icon');
        
        if (toggleIcon) {
            toggleIcon.textContent = this.state.isDarkTheme ? '☀️' : '🌙';
        }
        
        localStorage.setItem('azure-designer-theme', this.state.isDarkTheme ? 'dark' : 'light');
    }

    // Canvas rendering
    renderCanvas() {
        const canvasContent = document.getElementById('canvasContent');
        if (!canvasContent) return;
        
        // Clear existing components
        canvasContent.innerHTML = '';
        
        // Render components
        this.state.components.forEach((componentData) => {
            const element = UIComponents.createComponentElement(componentData);
            element.addEventListener('mousedown', (e) => this.handlers.handleComponentDragStart(e));
            element.addEventListener('click', (e) => this.handlers.handleComponentClick(e));
            element.addEventListener('dblclick', (e) => this.handlers.handleComponentDoubleClick(e));
            canvasContent.appendChild(element);
        });
        
        // Render connections
        this.updateConnections();
    }

    updateConnections() {
        const canvasContent = document.getElementById('canvasContent');
        if (!canvasContent) return;
        
        const existingConnections = canvasContent.querySelectorAll('.connection-line');
        existingConnections.forEach(conn => conn.remove());
        
        this.state.connections.forEach(connection => {
            const fromComponent = document.querySelector(`[data-id="${connection.from}"]`);
            const toComponent = document.querySelector(`[data-id="${connection.to}"]`);
            
            if (fromComponent && toComponent) {
                const line = UIComponents.createConnectionLine(fromComponent, toComponent, connection.type);
                canvasContent.appendChild(line);
            }
        });
    }

    updateCanvasTransform() {
        const canvasContent = document.getElementById('canvasContent');
        if (canvasContent) {
            canvasContent.style.transform = `translate(${this.state.panOffset.x}px, ${this.state.panOffset.y}px) scale(${this.state.zoomLevel})`;
        }
    }

    updateZoomDisplay() {
        const zoomLevelElement = document.querySelector('.zoom-level');
        if (zoomLevelElement) {
            zoomLevelElement.textContent = Math.round(this.state.zoomLevel * 100) + '%';
        }
    }

    // Component management
    addComponent(serviceType, x, y) {
        const componentData = this.state.addComponent(serviceType, x, y);
        if (componentData) {
            this.renderCanvas();
        }
    }

    selectComponent(component) {
        this.deselectComponent();
        component.classList.add('selected');
        this.state.selectedComponent = component;
        this.showComponentProperties(component);
    }

    deselectComponent() {
        if (this.state.selectedComponent) {
            this.state.selectedComponent.classList.remove('selected');
            this.state.selectedComponent = null;
            this.hideComponentProperties();
        }
    }

    deleteSelectedComponent() {
        if (this.state.selectedComponent) {
            const componentId = parseInt(this.state.selectedComponent.dataset.id);
            this.state.removeComponent(componentId);
            this.state.selectedComponent.remove();
            this.state.selectedComponent = null;
            this.hideComponentProperties();
            this.renderCanvas();
        }
    }

    // Properties panel
    showComponentProperties(component) {
        const componentId = parseInt(component.dataset.id);
        const componentData = this.state.components.get(componentId);
        const service = SERVICES[componentData.serviceType];
        const propertiesContent = document.getElementById('propertiesContent');
        
        if (!propertiesContent) return;
        
        propertiesContent.innerHTML = `
            <h4>${componentData.customName}</h4>
            <div class="property-group">
                <label>Name:</label>
                <input type="text" value="${componentData.customName}" 
                       class="property-input" onchange="app.updateComponentName(${componentId}, this.value)">
            </div>
            <div class="property-group">
                <label>Service Type:</label>
                <span class="property-value">${componentData.serviceType}</span>
            </div>
            <div class="property-group">
                <label>Position:</label>
                <span class="property-value">${componentData.x}, ${componentData.y}</span>
            </div>
            <div class="property-group">
                <label>Connections:</label>
                <span class="property-value">${this.getConnectionCount(componentId)}</span>
            </div>
            <button class="tool-btn" onclick="app.deleteSelectedComponent()">Delete Component</button>
        `;
    }

    hideComponentProperties() {
        const propertiesContent = document.getElementById('propertiesContent');
        if (propertiesContent) {
            propertiesContent.innerHTML = '<p class="no-selection">Select a component to edit its properties</p>';
        }
    }

    updateComponentName(componentId, newName) {
        this.state.updateComponent(componentId, { customName: newName });
        this.renderCanvas();
        
        if (this.state.selectedComponent && parseInt(this.state.selectedComponent.dataset.id) === componentId) {
            this.showComponentProperties(this.state.selectedComponent);
        }
    }

    getConnectionCount(componentId) {
        return this.state.connections.filter(conn => 
            conn.from === componentId || conn.to === componentId
        ).length;
    }

    // Connection management
    toggleConnectionMode() {
        this.state.connectionMode = !this.state.connectionMode;
        const connectBtn = document.getElementById('connectBtn');
        
        if (connectBtn) {
            if (this.state.connectionMode) {
                connectBtn.classList.add('active');
                connectBtn.innerHTML = '<span class="btn-icon">✋</span> Cancel';
                document.body.style.cursor = 'crosshair';
            } else {
                connectBtn.classList.remove('active');
                connectBtn.innerHTML = '<span class="btn-icon">🔗</span> Connect';
                document.body.style.cursor = 'default';
                this.state.connectionStart = null;
            }
        }
    }

    // Templates
    showTemplatesMenu() {
        const menu = UIComponents.createTemplatesMenu();
        
        // Position menu
        const templatesBtn = document.querySelector('.tool-btn');
        const rect = templatesBtn?.getBoundingClientRect();
        if (rect) {
            menu.style.position = 'absolute';
            menu.style.top = rect.bottom + 'px';
            menu.style.right = '0';
            menu.style.zIndex = '1000';
        }
        
        document.body.appendChild(menu);
        
        // Add event listeners
        menu.addEventListener('click', (e) => {
            const templateItem = e.target.closest('.template-item');
            if (templateItem) {
                const templateName = templateItem.dataset.template;
                this.loadTemplate(templateName);
                menu.remove();
            }
        });
        
        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target) && !templatesBtn?.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 0);
    }

    loadTemplate(templateName) {
        if (confirm('This will replace your current architecture. Continue?')) {
            this.clearCanvas();
            
            const template = TEMPLATES[templateName];
            if (template) {
                template.forEach(item => {
                    this.addComponent(item.serviceType, item.x, item.y);
                    const componentId = this.state.componentCounter;
                    this.updateComponentName(componentId, item.customName);
                });
                
                // Add template connections
                this.addTemplateConnections(templateName);
            }
        }
    }

    addTemplateConnections(templateName) {
        if (templateName === 'webApp') {
            this.state.addConnection(1, 2, 'data');
            this.state.addConnection(1, 3, 'data');
        } else if (templateName === 'microservices') {
            this.state.addConnection(1, 2, 'network');
            this.state.addConnection(1, 3, 'network');
            this.state.addConnection(2, 4, 'data');
            this.state.addConnection(3, 5, 'data');
        } else if (templateName === 'serverless') {
            this.state.addConnection(1, 2, 'network');
            this.state.addConnection(2, 3, 'data');
            this.state.addConnection(1, 4, 'network');
        }
        
        this.renderCanvas();
    }

    // Import/Export
    openFileDialog() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        this.loadArchitectureFromJSON(data);
                    } catch (error) {
                        alert('Invalid file format');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    exportToJSON() {
        const data = {
            components: Array.from(this.state.components.entries()),
            connections: this.state.connections,
            componentCounter: this.state.componentCounter,
            metadata: {
                version: '1.0',
                exportedAt: new Date().toISOString(),
                name: 'Azure Architecture'
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `azure-architecture-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    loadArchitectureFromJSON(data) {
        this.clearCanvas();
        
        if (data.components) {
            this.state.loadFromState(data);
            this.renderCanvas();
            this.state.saveToLocalStorage();
        }
    }

    // Canvas operations
    clearCanvas() {
        if (confirm('Are you sure you want to clear the canvas?')) {
            this.state.components.clear();
            this.state.connections = [];
            this.state.componentCounter = 0;
            this.deselectComponent();
            this.renderCanvas();
            this.state.saveState();
        }
    }

    // Screenshot
    saveScreenshot() {
        const canvas = document.getElementById('architectureCanvas');
        
        if (typeof html2canvas !== 'undefined') {
            html2canvas(canvas, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: this.state.isDarkTheme ? '#111111' : '#ffffff'
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `azure-architecture-${new Date().toISOString().slice(0, 10)}.png`;
                link.href = canvas.toDataURL('image/png', 1.0);
                link.click();
            });
        } else {
            alert('Screenshot functionality requires html2canvas library. Please use browser dev tools (F12) and take a screenshot manually.');
        }
    }

    // Zoom controls
    zoomIn() {
        this.state.zoomIn();
        this.updateCanvasTransform();
        this.updateZoomDisplay();
    }

    zoomOut() {
        this.state.zoomOut();
        this.updateCanvasTransform();
        this.updateZoomDisplay();
    }

    resetZoom() {
        this.state.resetZoom();
        this.updateCanvasTransform();
        this.updateZoomDisplay();
    }

    togglePanMode() {
        const canvas = document.getElementById('architectureCanvas');
        if (canvas) {
            canvas.style.cursor = canvas.style.cursor === 'grab' ? 'default' : 'grab';
        }
    }

    // Data persistence
    loadSavedData() {
        if (this.state.loadFromLocalStorage()) {
            this.renderCanvas();
        }
    }

    // Terminal (easter egg)
    showTerminal() {
        const terminalOverlay = document.getElementById('terminalOverlay');
        if (terminalOverlay) {
            terminalOverlay.style.display = 'flex';
            document.getElementById('terminalInput')?.focus();
        }
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Global app instance
let app;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    app = new AzureDesigner();
    app.init();
});

// Export for external use
window.AzureDesigner = app; 