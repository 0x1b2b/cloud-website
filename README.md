<<<<<<< HEAD
# Azure Cloud Architecture Designer

A professional-grade web-based tool for designing, visualizing, and deploying Azure cloud architectures with enterprise features and export options.

## 🌟 Features

### Core Functionality
- **Drag & Drop Interface**: Intuitive component placement with snap-to-grid precision
- **Azure Native Components**: Official Azure service icons organized by category
- **Real-time Connections**: Visual connections between components with different types
- **Zoom & Pan**: Smooth navigation with mouse wheel zoom and pan controls
- **Undo/Redo**: Full history management with keyboard shortcuts

### Professional Features
- **Templates**: Pre-built architecture templates (Web App, Microservices, Serverless)
- **Export Options**: High-resolution screenshots and JSON export
- **Auto-save**: Automatic saving to browser storage
- **Version History**: Track changes and restore previous versions
- **Component Properties**: Detailed editing of component attributes

### Advanced Tools
- **Cost Calculator**: Real-time cost estimation and optimization suggestions
- **Security Analysis**: Security feature analysis and recommendations
- **Search & Filter**: Find components quickly with search functionality
- **Grouping**: Organize components into logical groups
- **Layers**: Multi-layer architecture support
- **Annotations**: Add notes and comments to your designs

### User Experience
- **Dark/Light Theme**: Toggle between themes
- **Keyboard Shortcuts**: Comprehensive shortcut support
- **Responsive Design**: Works on desktop and tablet devices
- **Minimap**: Overview of large architectures
- **Grid System**: Customizable grid for precise alignment

## 🚀 Quick Start

1. **Open the Application**: Simply open `index.html` in your web browser
2. **Choose Components**: Drag Azure services from the left panel to the canvas
3. **Create Connections**: Drag connection types between components
4. **Customize**: Double-click components to rename, use properties panel for details
5. **Export**: Save as screenshot or export as JSON for documentation

## 📋 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+S` | Save Screenshot |
| `Ctrl+Shift+S` | Save as Template |
| `Ctrl+O` | Open File |
| `Ctrl+E` | Export JSON |
| `Ctrl+F` | Search Components |
| `Ctrl+G` | Group Selected |
| `Ctrl+Shift+G` | Toggle Grid |
| `Ctrl+R` | Toggle Resize Mode |
| `Space` | Toggle Pan Mode |
| `Ctrl+A` | Select All |
| `Delete` | Delete Selected |

## 🏗️ Architecture Templates

### Web Application
Basic web app with database and storage components.

### Microservices
Multi-service architecture with API gateway and separate databases.

### Serverless
Event-driven serverless architecture with functions and managed services.

## 🛠️ Technical Details

- **Frontend**: Pure HTML5, CSS3, and JavaScript (ES6+)
- **No Dependencies**: Self-contained, no external libraries required
- **Browser Storage**: Uses localStorage for data persistence
- **Export Formats**: PNG screenshots and JSON architecture files
- **Responsive**: Works on desktop and tablet devices

## 📁 File Structure

```
├── index.html          # Main application file
├── script.js           # Core application logic
├── styles.css          # Main stylesheet
├── README.md           # This file
├── .gitignore          # Git ignore rules
└── optimized-*         # Optimized versions (optional)
```

## 🔧 Customization

### Adding New Services
Edit the `services` object in `script.js` to add new Azure services:

```javascript
const services = {
    newservice: {
        icon: '🔧',
        label: 'New Service',
        color: '#0078d4',
        category: 'compute',
        variants: ['basic', 'standard'],
        cost: { hourly: 0.05, monthly: 36.50 },
        security: ['encryption', 'rbac'],
        performance: { cpu: '2-8 cores', memory: '4-32 GB' }
    }
};
```

### Custom Templates
Add new templates to the `componentTemplates` object:

```javascript
const componentTemplates = {
    customtemplate: {
        name: 'Custom Template',
        description: 'Your custom architecture',
        components: [
            { serviceType: 'vm', x: 200, y: 100, customName: 'Server' }
        ],
        connections: [],
        estimatedCost: 50.00,
        securityScore: 85,
        performanceScore: 90
    }
};
```

## 🌐 Browser Support

- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Internet Explorer**: Not supported

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Built with ❤️ for the Azure community** 
=======
# cloud-website
A fun, interactive web app showcasing cloud concepts with CSS animations and JavaScript.
>>>>>>> 9e4905aa5251f187f9c69a79692d275bb14ff900
