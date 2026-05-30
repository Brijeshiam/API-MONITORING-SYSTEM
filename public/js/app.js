// Uptime Monitor JavaScript App Controller
const API_URL = window.location.origin + '/api';

// Application State
const state = {
  token: localStorage.getItem('token') || null,
  user: null,
  monitors: [],
  logs: [],
  pollInterval: null
};

// DOM Elements
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const addMonitorForm = document.getElementById('add-monitor-form');

const loginTab = document.getElementById('tab-login');
const registerTab = document.getElementById('tab-register');
const formLoginSection = document.getElementById('form-login-section');
const formRegisterSection = document.getElementById('form-register-section');

const addMonitorModal = document.getElementById('add-monitor-modal');
const btnOpenAddModal = document.getElementById('btn-open-add-modal');
const btnCloseAddModal = document.getElementById('btn-close-add-modal');
const btnCancelAddModal = document.getElementById('btn-cancel-add-modal');
const btnRefresh = document.getElementById('btn-refresh');
const btnLogout = document.getElementById('btn-logout');

// Metrics Elements
const metricTotal = document.getElementById('metric-total');
const metricUp = document.getElementById('metric-up');
const metricDown = document.getElementById('metric-down');
const metricUptime = document.getElementById('metric-uptime');
const metricAvgTime = document.getElementById('metric-avg-time');

// Lists Elements
const monitorsList = document.getElementById('monitors-list');
const logsList = document.getElementById('logs-list');
const userInitial = document.getElementById('user-initial');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');

// --- Initialization ---
function init() {
  setupEventListeners();
  
  if (state.token) {
    // Decode token helper
    const userPayload = parseJwt(state.token);
    if (userPayload && userPayload.exp * 1000 > Date.now()) {
      showAppView();
    } else {
      logout();
    }
  } else {
    showAuthView();
  }
}

// --- Event Listeners ---
function setupEventListeners() {
  // Tab Switching
  loginTab.addEventListener('click', () => switchAuthTab('login'));
  registerTab.addEventListener('click', () => switchAuthTab('register'));

  // Auth Forms
  loginForm.addEventListener('submit', handleLogin);
  registerForm.addEventListener('submit', handleRegister);

  // App Actions
  btnOpenAddModal.addEventListener('click', openModal);
  btnCloseAddModal.addEventListener('click', closeModal);
  btnCancelAddModal.addEventListener('click', closeModal);
  addMonitorForm.addEventListener('submit', handleCreateMonitor);
  
  btnRefresh.addEventListener('click', () => {
    showToast('Refreshing metrics...', 'warning');
    fetchData();
  });
  
  btnLogout.addEventListener('click', logout);

  // Close modal when clicking backdrop
  addMonitorModal.addEventListener('click', (e) => {
    if (e.target === addMonitorModal) closeModal();
  });
}

// --- View State Switchers ---
function showAuthView() {
  stopPolling();
  authContainer.classList.remove('hidden');
  appContainer.classList.add('hidden');
  switchAuthTab('login');
}

function showAppView() {
  authContainer.classList.add('hidden');
  appContainer.classList.remove('hidden');
  
  // Set User Profile from Token
  const payload = parseJwt(state.token);
  if (payload) {
    // We don't have the user's name directly in the token, but we can set defaults
    // or retrieve user data if required. For now, default label and show email ID or ID.
    userName.textContent = `User session`;
    userEmail.textContent = `Active ID: ${payload.id.substring(0, 10)}...`;
    userInitial.textContent = 'U';
  }
  
  fetchData();
  startPolling();
}

function switchAuthTab(tab) {
  if (tab === 'login') {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    formLoginSection.classList.remove('hidden');
    formRegisterSection.classList.add('hidden');
  } else {
    loginTab.classList.remove('active');
    registerTab.classList.add('active');
    formLoginSection.classList.add('hidden');
    formRegisterSection.classList.remove('hidden');
  }
}

// --- Modal Controls ---
function openModal() {
  addMonitorModal.classList.remove('hidden');
  document.getElementById('monitor-name').focus();
}

function closeModal() {
  addMonitorModal.classList.add('hidden');
  addMonitorForm.reset();
}

// --- Toast Notifications ---
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerText = message;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// --- API Helpers ---
async function apiCall(endpoint, method = 'GET', body = null) {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }
  
  const options = {
    method,
    headers
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API Request failed');
    }
    
    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    showToast(error.message, 'error');
    
    // If token expired/unauthorized, log out
    if (error.message.includes('token') || error.message.includes('authorized') || error.message.includes('expired')) {
      logout();
    }
    
    throw error;
  }
}

// --- Polling Systems ---
function startPolling() {
  stopPolling();
  // Poll every 15 seconds
  state.pollInterval = setInterval(fetchData, 15000);
}

function stopPolling() {
  if (state.pollInterval) {
    clearInterval(state.pollInterval);
    state.pollInterval = null;
  }
}

// --- Auth Submit Handlers ---
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  try {
    const res = await apiCall('/auth/login', 'POST', { email, password });
    if (res.success && res.token) {
      localStorage.setItem('token', res.token);
      state.token = res.token;
      showToast('Logged in successfully', 'success');
      showAppView();
      loginForm.reset();
    }
  } catch (err) {
    // Toast is handled in apiCall
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  
  try {
    const res = await apiCall('/auth/register', 'POST', { name, email, password });
    if (res.success) {
      showToast('Registration successful! Please login.', 'success');
      switchAuthTab('login');
      registerForm.reset();
    }
  } catch (err) {
    // Toast is handled in apiCall
  }
}

function logout() {
  localStorage.removeItem('token');
  state.token = null;
  state.user = null;
  state.monitors = [];
  state.logs = [];
  showToast('Logged out', 'success');
  showAuthView();
}

// --- Core Data Retrievers ---
async function fetchData() {
  try {
    const [monitorsRes, logsRes] = await Promise.all([
      apiCall('/monitors', 'GET'),
      apiCall('/logs', 'GET')
    ]);
    
    state.monitors = monitorsRes.data || [];
    state.logs = logsRes.data || [];
    
    renderDashboard();
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
  }
}

// --- Dashboard Render Engines ---
function renderDashboard() {
  renderMetrics();
  renderMonitors();
  renderLogs();
}

function renderMetrics() {
  const total = state.monitors.length;
  const up = state.monitors.filter(m => m.status === 'UP').length;
  const down = state.monitors.filter(m => m.status === 'DOWN').length;
  
  // Calculate Avg Response Time for UP monitors
  const upMonitors = state.monitors.filter(m => m.status === 'UP' && m.responseTime > 0);
  const avgResponse = upMonitors.length 
    ? Math.round(upMonitors.reduce((sum, m) => sum + m.responseTime, 0) / upMonitors.length)
    : 0;
    
  // Calculate overall uptime percentage
  const uptimePct = total > 0 ? Math.round((up / total) * 100) : 0;
  
  metricTotal.textContent = total;
  metricUp.textContent = up;
  metricDown.textContent = down;
  metricUptime.textContent = `${uptimePct}%`;
  metricAvgTime.textContent = `${avgResponse}ms`;
}

function renderMonitors() {
  if (state.monitors.length === 0) {
    monitorsList.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" />
        </svg>
        <p>No APIs being monitored yet.</p>
        <p style="font-size: 0.8rem; margin-top: 4px;">Click "+ Add Monitor" to track your first endpoint.</p>
      </div>
    `;
    return;
  }
  
  monitorsList.innerHTML = '';
  
  state.monitors.forEach(monitor => {
    const card = document.createElement('div');
    card.className = 'monitor-card';
    
    const statusClass = monitor.status ? monitor.status.toLowerCase() : 'unknown';
    const methodClass = monitor.method ? monitor.method.toLowerCase() : 'get';
    
    // Format response time & checked date
    const responseTimeStr = monitor.responseTime ? `${monitor.responseTime} ms` : '--';
    const checkedDate = monitor.lastChecked ? new Date(monitor.lastChecked).toLocaleTimeString() : 'Never';
    
    card.innerHTML = `
      <div class="monitor-details">
        <div class="status-ring ${statusClass}">
          <div class="pulse-indicator ${statusClass}"></div>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            ${statusClass === 'up' 
              ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />'
              : statusClass === 'down'
              ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />'
              : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />'
            }
          </svg>
        </div>
        <div class="monitor-info">
          <div class="monitor-name-container">
            <span class="monitor-name">${monitor.name}</span>
            <span class="method-badge ${methodClass}">${monitor.method}</span>
          </div>
          <div class="monitor-url" title="${monitor.url}">${monitor.url}</div>
        </div>
      </div>
      
      <div class="monitor-metrics">
        <div class="metric-item">
          <div class="metric-label">Latency</div>
          <div class="metric-value">${responseTimeStr}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">Last Checked</div>
          <div class="metric-value" style="font-size: 0.8rem; font-weight: 400;">${checkedDate}</div>
        </div>
      </div>
      
      <button class="btn btn-danger" onclick="deleteMonitorConfirm('${monitor._id}', '${monitor.name}')">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    `;
    
    monitorsList.appendChild(card);
  });
}

function renderLogs() {
  if (state.logs.length === 0) {
    logsList.innerHTML = `
      <div class="empty-state" style="padding: 20px 0;">
        <p>No activity logged yet.</p>
      </div>
    `;
    return;
  }
  
  logsList.innerHTML = '';
  
  state.logs.slice(0, 30).forEach(log => {
    const item = document.createElement('div');
    item.className = 'log-item';
    
    const statusClass = log.status ? log.status.toLowerCase() : 'unknown';
    const monitorName = log.monitorId ? log.monitorId.name : 'Unknown API';
    const logTime = new Date(log.checkedAt).toLocaleTimeString();
    
    item.innerHTML = `
      <div class="log-left">
        <div class="log-status-dot ${statusClass}"></div>
        <div>
          <div class="log-title">${monitorName}</div>
          <div class="log-time">${logTime}</div>
        </div>
      </div>
      <div class="log-right">
        ${log.status === 'UP' ? `${log.responseTime}ms` : '<span class="text-danger">Offline</span>'}
      </div>
    `;
    
    logsList.appendChild(item);
  });
}

// --- Actions Event Handlers ---
async function handleCreateMonitor(e) {
  e.preventDefault();
  const name = document.getElementById('monitor-name').value;
  const url = document.getElementById('monitor-url').value;
  const method = document.getElementById('monitor-method').value;
  
  try {
    const res = await apiCall('/monitors', 'POST', { name, url, method });
    if (res.success) {
      showToast('Monitor added successfully', 'success');
      closeModal();
      fetchData();
    }
  } catch (err) {
    // Errors are already toasted in apiCall
  }
}

// Expose delete to global scope since it's called inline via onclick
window.deleteMonitorConfirm = async function(id, name) {
  if (confirm(`Are you sure you want to stop monitoring and delete "${name}"?`)) {
    try {
      const res = await apiCall(`/monitors/${id}`, 'DELETE');
      if (res.success) {
        showToast('Monitor and logs deleted', 'success');
        fetchData();
      }
    } catch (err) {
      // Errors are already toasted in apiCall
    }
  }
};

// --- Helper Functions ---
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// Run setup on load
document.addEventListener('DOMContentLoaded', init);
