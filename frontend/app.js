// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';
let authToken = localStorage.getItem('authToken');
let currentUser = null;
let currentAudioId = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        checkAuth();
    }
});

// Authentication Functions
async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            showDashboard();
        } else {
            logout();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        logout();
    }
}

async function handleRegister(event) {
    event.preventDefault();

    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const errorDiv = document.getElementById('register-error');

    errorDiv.classList.remove('active');

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.access_token;
            localStorage.setItem('authToken', authToken);
            currentUser = data.user;
            closeModals();
            showDashboard();
        } else {
            errorDiv.textContent = data.error || 'Registration failed';
            errorDiv.classList.add('active');
        }
    } catch (error) {
        errorDiv.textContent = 'Network error. Please try again.';
        errorDiv.classList.add('active');
    }
}

async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');

    errorDiv.classList.remove('active');

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.access_token;
            localStorage.setItem('authToken', authToken);
            currentUser = data.user;
            closeModals();
            showDashboard();
        } else {
            errorDiv.textContent = data.error || 'Login failed';
            errorDiv.classList.add('active');
        }
    } catch (error) {
        errorDiv.textContent = 'Network error. Please try again.';
        errorDiv.classList.add('active');
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    showLandingPage();
}

// Page Navigation
function showLandingPage() {
    document.getElementById('landing-page').classList.add('active');
    document.getElementById('dashboard-page').classList.remove('active');
}

function showDashboard() {
    document.getElementById('landing-page').classList.remove('active');
    document.getElementById('dashboard-page').classList.add('active');
    document.getElementById('user-welcome').textContent = `Welcome, ${currentUser.username}`;
    loadAudioFiles();
}

// Modal Functions
function showLogin() {
    closeModals();
    document.getElementById('login-modal').classList.add('active');
}

function showRegister() {
    closeModals();
    document.getElementById('register-modal').classList.add('active');
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

function scrollToDemo() {
    document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' });
}

// File Upload
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const uploadProgress = document.getElementById('upload-progress');
    uploadProgress.style.display = 'block';

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_BASE_URL}/audio/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            uploadProgress.style.display = 'none';
            loadAudioFiles();
        } else {
            alert(data.error || 'Upload failed');
            uploadProgress.style.display = 'none';
        }
    } catch (error) {
        alert('Network error. Please try again.');
        uploadProgress.style.display = 'none';
    }

    // Reset file input
    event.target.value = '';
}

// Load Audio Files
async function loadAudioFiles() {
    try {
        const response = await fetch(`${API_BASE_URL}/audio/list`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            displayAudioFiles(data.files);
        }
    } catch (error) {
        console.error('Failed to load audio files:', error);
    }
}

function displayAudioFiles(files) {
    const container = document.getElementById('files-container');

    if (files.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎵</div>
                <h3>No audio files yet</h3>
                <p>Upload your first audio file to get started</p>
            </div>
        `;
        return;
    }

    container.innerHTML = files.map(file => `
        <div class="file-card" onclick="showAudioDetail(${file.id})">
            <div class="file-icon">🎵</div>
            <div class="file-name">${file.filename}</div>
            <div class="file-info">
                <div class="file-info-item">Duration: ${file.duration ? file.duration.toFixed(2) + 's' : 'N/A'}</div>
                <div class="file-info-item">Sample Rate: ${file.sample_rate ? file.sample_rate + ' Hz' : 'N/A'}</div>
                <div class="file-info-item">Channels: ${file.channels || 'N/A'}</div>
                <div class="file-info-item">Uploaded: ${new Date(file.created_at).toLocaleDateString()}</div>
            </div>
            ${file.processed ? '<span class="file-badge">Processed</span>' : ''}
        </div>
    `).join('');
}

// Audio Detail Modal
async function showAudioDetail(fileId) {
    currentAudioId = fileId;
    const modal = document.getElementById('audio-detail-modal');
    modal.classList.add('active');

    // Load audio analysis
    try {
        const response = await fetch(`${API_BASE_URL}/audio/${fileId}/analyze`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            displayAudioDetail(data);
        }
    } catch (error) {
        console.error('Failed to analyze audio:', error);
    }
}

function displayAudioDetail(data) {
    document.getElementById('audio-detail-title').textContent = 'Audio Analysis';

    const infoContent = document.getElementById('audio-info-content');
    infoContent.innerHTML = `
        <div class="info-row">
            <span class="info-label">Duration:</span>
            <span>${data.duration ? data.duration.toFixed(2) + ' seconds' : 'N/A'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Sample Rate:</span>
            <span>${data.sample_rate ? data.sample_rate + ' Hz' : 'N/A'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Max Amplitude:</span>
            <span>${data.max_amplitude || 'N/A'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Mean Amplitude:</span>
            <span>${data.mean_amplitude ? data.mean_amplitude.toFixed(2) : 'N/A'}</span>
        </div>
    `;

    // Draw waveform
    if (data.waveform) {
        drawWaveform(data.waveform);
    }
}

function drawWaveform(waveformData) {
    const canvas = document.getElementById('waveform-canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw waveform
    const step = canvas.width / waveformData.length;
    const amp = canvas.height / 2;
    const maxValue = Math.max(...waveformData.map(Math.abs));

    ctx.beginPath();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;

    waveformData.forEach((value, i) => {
        const x = i * step;
        const y = amp + (value / maxValue) * amp * 0.9;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    // Draw center line
    ctx.beginPath();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.moveTo(0, amp);
    ctx.lineTo(canvas.width, amp);
    ctx.stroke();
}

function closeAudioDetail() {
    document.getElementById('audio-detail-modal').classList.remove('active');
    currentAudioId = null;
}

// Audio Processing
async function processAudio(operation) {
    if (!currentAudioId) return;

    try {
        const response = await fetch(`${API_BASE_URL}/audio/${currentAudioId}/process`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ operation })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Audio processed successfully!');
            closeAudioDetail();
            loadAudioFiles();
        } else {
            alert(data.error || 'Processing failed');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

// Download Audio
async function downloadAudio() {
    if (!currentAudioId) return;

    window.open(`${API_BASE_URL}/audio/${currentAudioId}/download?token=${authToken}`, '_blank');
}

// Delete Audio
async function deleteAudio() {
    if (!currentAudioId) return;

    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/audio/${currentAudioId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            closeAudioDetail();
            loadAudioFiles();
        } else {
            alert('Delete failed');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

// Close modals on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        closeModals();
    }
}
