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

    // Validate file type
    const allowedExtensions = ['wav', 'mp3', 'ogg', 'flac', 'm4a', 'aac'];
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
        alert(`Invalid file type. Allowed formats: ${allowedExtensions.join(', ').toUpperCase()}`);
        event.target.value = '';
        return;
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
        alert('File too large. Maximum size is 50MB.');
        event.target.value = '';
        return;
    }

    const uploadProgress = document.getElementById('upload-progress');
    const uploadMessage = document.getElementById('upload-message');
    uploadProgress.style.display = 'block';
    uploadMessage.textContent = `Uploading ${file.name}...`;

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
            uploadMessage.textContent = 'Upload successful!';
            setTimeout(() => {
                uploadProgress.style.display = 'none';
            }, 1000);
            loadAudioFiles();
            showSuccessMessage('File uploaded successfully!');
        } else {
            uploadProgress.style.display = 'none';
            showErrorMessage(data.error || 'Upload failed');
        }
    } catch (error) {
        uploadProgress.style.display = 'none';
        showErrorMessage('Network error. Please try again.');
    }

    // Reset file input
    event.target.value = '';
}

// Helper Functions for Messages
function showSuccessMessage(message) {
    // Create temporary success message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message active';
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.zIndex = '10000';
    messageDiv.style.minWidth = '300px';
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function showErrorMessage(message) {
    // Create temporary error message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'error-message active';
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.zIndex = '10000';
    messageDiv.style.minWidth = '300px';
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
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

    // Load audio in player
    const audioPlayer = document.getElementById('audio-player');
    audioPlayer.src = `${API_BASE_URL}/audio/${currentAudioId}/stream`;
    audioPlayer.load();

    // Add authorization header for audio requests
    fetch(`${API_BASE_URL}/audio/${currentAudioId}/stream`, {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    })
    .then(response => response.blob())
    .then(blob => {
        const url = URL.createObjectURL(blob);
        audioPlayer.src = url;
        audioPlayer.load();
    })
    .catch(error => {
        console.error('Failed to load audio:', error);
        showErrorMessage('Failed to load audio player');
    });

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

    const statusDiv = document.getElementById('processing-status');
    statusDiv.textContent = 'Processing audio...';
    statusDiv.classList.add('active');

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
            statusDiv.classList.remove('active');
            showSuccessMessage('Audio processed successfully!');
            closeAudioDetail();
            loadAudioFiles();
        } else {
            statusDiv.classList.remove('active');
            showErrorMessage(data.error || 'Processing failed');
        }
    } catch (error) {
        statusDiv.classList.remove('active');
        showErrorMessage('Network error. Please try again.');
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
            showSuccessMessage('File deleted successfully');
            closeAudioDetail();
            loadAudioFiles();
        } else {
            showErrorMessage('Delete failed');
        }
    } catch (error) {
        showErrorMessage('Network error. Please try again.');
    }
}

// Search/Filter Files
function filterFiles() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const fileCards = document.querySelectorAll('.file-card');

    fileCards.forEach(card => {
        const filename = card.querySelector('.file-name').textContent.toLowerCase();
        if (filename.includes(searchTerm)) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });

    // Check if any files are visible
    const visibleCards = Array.from(fileCards).filter(card => !card.classList.contains('hidden'));
    const container = document.getElementById('files-container');

    if (visibleCards.length === 0 && searchTerm !== '') {
        // Show no results message
        const existingEmpty = container.querySelector('.empty-state');
        if (!existingEmpty) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <div class="empty-icon">🔍</div>
                <h3>No files found</h3>
                <p>No files match your search "${searchTerm}"</p>
            `;
            container.appendChild(emptyState);
        }
    } else {
        // Remove no results message if exists
        const emptyState = container.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }
    }
}

// Close modals on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        closeModals();
    }
}
