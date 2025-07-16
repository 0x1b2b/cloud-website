// Cloud Designer Test Dashboard Logic

const DEFAULT_APP_URL = 'index.html';
const TESTS = [
  {
    id: 'nav-logo',
    desc: 'Logo is visible',
    selector: '.nav-logo',
  },
  {
    id: 'nav-tool',
    desc: 'Tool nav link is present',
    selector: 'a[href="#tool"]',
  },
  {
    id: 'nav-docs',
    desc: 'Docs nav link is present',
    selector: 'a[href="#docs"]',
  },
  {
    id: 'theme-toggle',
    desc: 'Theme toggle button is present',
    selector: '#themeToggle',
  },
  {
    id: 'cta-start',
    desc: 'Start Designing button is present',
    selector: '.cta-button.primary',
  },
  {
    id: 'cta-docs',
    desc: 'View Documentation button is present',
    selector: '.cta-button.secondary',
  },
  {
    id: 'toolbar',
    desc: 'Toolbar is visible on tool page',
    selector: '.toolbar',
  },
  {
    id: 'palette',
    desc: 'Component palette is visible',
    selector: '.palette-panel',
  },
  {
    id: 'canvas',
    desc: 'Canvas area is present',
    selector: '.tool-main',
  },
  {
    id: 'export-btn',
    desc: 'Export button is present',
    selector: '#exportBtn',
  },
  {
    id: 'import-btn',
    desc: 'Import button is present',
    selector: '#importBtn',
  },
];

const CHECKLIST = [
  { id: 'drag-drop', label: 'Drag and drop a component onto the canvas' },
  { id: 'undo-redo', label: 'Undo and redo an action' },
  { id: 'clear-canvas', label: 'Clear the canvas and verify it is empty' },
  { id: 'template-load', label: 'Load a template and verify components appear' },
  { id: 'zoom-controls', label: 'Test zoom in, out, and reset' },
  { id: 'pan-mode', label: 'Toggle pan mode and move the canvas' },
  { id: 'export-json', label: 'Export design as JSON and verify download' },
  { id: 'import-json', label: 'Import a JSON file and verify design loads' },
  { id: 'theme-toggle', label: 'Toggle between light and dark themes' },
  { id: 'docs-nav', label: 'Open documentation and verify content' },
];

// --- Automated UI Health Checks ---
function runAutomatedTests() {
  const url = document.getElementById('targetUrl').value.trim() || DEFAULT_APP_URL;
  const testList = document.getElementById('testList');
  testList.innerHTML = '';

  // Show pending status
  TESTS.forEach(test => {
    const li = document.createElement('li');
    li.className = 'test-item';
    li.id = 'test-' + test.id;
    li.innerHTML = `<span class="test-status pending">...</span>${test.desc}`;
    testList.appendChild(li);
  });

  // Try to access the app window directly first
  let appWindow = null;
  
  // Check if we can access the app through window.opener or window.parent
  if (window.opener && window.opener.location.href.includes('index.html')) {
    appWindow = window.opener;
  } else if (window.parent && window.parent !== window && window.parent.location.href.includes('index.html')) {
    appWindow = window.parent;
  }

  if (appWindow) {
    // We can access the app window directly
    try {
      const doc = appWindow.document;
      TESTS.forEach(test => {
        const el = doc.querySelector(test.selector);
        setTestStatus(test.id, el ? 'pass' : 'fail');
      });
      return;
    } catch (e) {
      console.log('Could not access app window directly, trying iframe method...');
    }
  }

  // Fallback to iframe method
  let iframe = document.getElementById('appTestFrame');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'appTestFrame';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    document.body.appendChild(iframe);
  }

  // For local files, try to use the same origin
  const currentPath = window.location.pathname;
  const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
  const fullUrl = url.startsWith('http') ? url : basePath + url;
  
  iframe.src = fullUrl;

  iframe.onload = () => {
    let doc;
    try {
      doc = iframe.contentDocument || iframe.contentWindow.document;
    } catch (e) {
      TESTS.forEach(test => setTestStatus(test.id, 'fail'));
      alert('Could not access app content. Please ensure both the dashboard and app are open in the same browser, or try opening the app first using the "Open App" button.');
      return;
    }
    TESTS.forEach(test => {
      const el = doc.querySelector(test.selector);
      setTestStatus(test.id, el ? 'pass' : 'fail');
    });
  };

  iframe.onerror = () => {
    TESTS.forEach(test => setTestStatus(test.id, 'fail'));
    alert('Failed to load the app. Please check the URL and ensure the app is accessible.');
  };
}

function setTestStatus(testId, status) {
  const li = document.getElementById('test-' + testId);
  if (!li) return;
  li.className = 'test-item ' + status;
  const icon = status === 'pass' ? '✔' : status === 'fail' ? '✖' : '...';
  li.querySelector('.test-status').className = 'test-status ' + status;
  li.querySelector('.test-status').textContent = icon;
}

function openApp() {
  const url = document.getElementById('targetUrl').value.trim() || DEFAULT_APP_URL;
  const appWindow = window.open(url, 'appWindow');
  
  // Wait a moment for the app to load, then try to run tests
  setTimeout(() => {
    if (appWindow && !appWindow.closed) {
      console.log('App opened successfully. You can now run automated tests.');
    }
  }, 1000);
}

// --- Manual Checklist ---
function loadChecklist() {
  const checklist = document.getElementById('checklist');
  checklist.innerHTML = '';
  const state = getChecklistState();
  CHECKLIST.forEach(item => {
    const li = document.createElement('li');
    li.className = 'check-item';
    const id = 'check-' + item.id;
    li.innerHTML = `<input type="checkbox" id="${id}" ${state[item.id] ? 'checked' : ''} /> <label for="${id}">${item.label}</label>`;
    checklist.appendChild(li);
    li.querySelector('input').addEventListener('change', e => {
      saveChecklistState(item.id, e.target.checked);
    });
  });
}

function getChecklistState() {
  try {
    return JSON.parse(localStorage.getItem('cloudDesignerChecklist') || '{}');
  } catch {
    return {};
  }
}

function saveChecklistState(id, checked) {
  const state = getChecklistState();
  state[id] = checked;
  localStorage.setItem('cloudDesignerChecklist', JSON.stringify(state));
}

function resetChecklist() {
  localStorage.removeItem('cloudDesignerChecklist');
  loadChecklist();
}

// --- Init ---
window.runAutomatedTests = runAutomatedTests;
window.openApp = openApp;
window.resetChecklist = resetChecklist;

document.addEventListener('DOMContentLoaded', () => {
  loadChecklist();
}); 