# FreeSpeech Installation Guide

## Prerequisites

Before installing FreeSpeech, ensure you have the following installed on your system:

### Required Software

1. **Python 3.8 or higher**
   ```bash
   python3 --version
   ```

2. **FFmpeg** (for audio processing)
   - **Ubuntu/Debian:**
     ```bash
     sudo apt-get update
     sudo apt-get install ffmpeg
     ```
   - **macOS:**
     ```bash
     brew install ffmpeg
     ```
   - **Windows:**
     Download from [ffmpeg.org](https://ffmpeg.org/download.html)

3. **PortAudio** (for audio recording)
   - **Ubuntu/Debian:**
     ```bash
     sudo apt-get install portaudio19-dev
     ```
   - **macOS:**
     ```bash
     brew install portaudio
     ```
   - **Windows:**
     Included with PyAudio wheel

## Installation Methods

### Method 1: Automated Setup (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/FreeSpeech.git
   cd FreeSpeech
   ```

2. Run the setup script:
   ```bash
   chmod +x setup.py
   python3 setup.py
   ```

3. The setup script will:
   - Check Python version
   - Create virtual environment
   - Install dependencies
   - Set up directories
   - Initialize database
   - Create configuration files

### Method 2: Manual Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/FreeSpeech.git
   cd FreeSpeech
   ```

2. **Create virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

4. **Create necessary directories:**
   ```bash
   mkdir -p database uploads
   ```

5. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

6. **Initialize database:**
   ```bash
   cd backend
   python -c "from app import app, db; app.app_context().push(); db.create_all()"
   cd ..
   ```

## Configuration

### Environment Variables

Edit the `.env` file to configure your installation:

```env
# Security (IMPORTANT: Change in production!)
SECRET_KEY=your-random-secret-key-here
JWT_SECRET_KEY=your-random-jwt-secret-key-here

# Database
DATABASE_URI=sqlite:///database/freespeech.db

# Server
FLASK_ENV=production  # Use 'development' for dev
FLASK_DEBUG=False     # Set to True for dev
HOST=0.0.0.0
PORT=5000

# File Upload
MAX_UPLOAD_SIZE=52428800  # 50MB
UPLOAD_FOLDER=uploads
```

### Generate Secure Keys

For production, generate secure random keys:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

## Running FreeSpeech

### Development Mode

**Option 1: Using the run script (Linux/macOS)**
```bash
chmod +x run.sh
./run.sh
```

**Option 2: Manual start**

Terminal 1 - Backend:
```bash
source venv/bin/activate
cd backend
python app.py
```

Terminal 2 - Frontend:
```bash
cd frontend
python3 -m http.server 8080
```

### Access the Application

- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/api/health

## Production Deployment

### Using Gunicorn (Recommended)

1. **Install Gunicorn:**
   ```bash
   pip install gunicorn
   ```

2. **Run backend with Gunicorn:**
   ```bash
   cd backend
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

### Using Nginx

1. **Install Nginx:**
   ```bash
   sudo apt-get install nginx
   ```

2. **Configure Nginx** (`/etc/nginx/sites-available/freespeech`):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       # Frontend
       location / {
           root /path/to/FreeSpeech/frontend;
           index index.html;
           try_files $uri $uri/ /index.html;
       }

       # Backend API
       location /api {
           proxy_pass http://127.0.0.1:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }

       # File upload size
       client_max_body_size 50M;
   }
   ```

3. **Enable and restart Nginx:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/freespeech /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Using Systemd Service

Create `/etc/systemd/system/freespeech.service`:

```ini
[Unit]
Description=FreeSpeech Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/path/to/FreeSpeech/backend
Environment="PATH=/path/to/FreeSpeech/venv/bin"
ExecStart=/path/to/FreeSpeech/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 app:app

[Install]
WantedBy=multi-user.target
```

Start the service:
```bash
sudo systemctl enable freespeech
sudo systemctl start freespeech
```

## Troubleshooting

### Common Issues

**1. PyAudio installation fails**
- Install PortAudio development files first
- Ubuntu: `sudo apt-get install portaudio19-dev`
- macOS: `brew install portaudio`

**2. FFmpeg not found**
- Install FFmpeg system-wide
- Verify with: `ffmpeg -version`

**3. Database connection errors**
- Check that the `database` directory exists and is writable
- Verify DATABASE_URI in .env

**4. CORS errors**
- Update CORS_ORIGINS in .env to include your frontend URL
- Check that backend is running and accessible

**5. File upload fails**
- Check MAX_UPLOAD_SIZE in .env
- Verify uploads directory is writable
- For Nginx, check client_max_body_size

### Logs

Check application logs for errors:
```bash
# Backend logs
cd backend
python app.py  # View console output

# System logs (if using systemd)
sudo journalctl -u freespeech -f
```

## Updating

To update FreeSpeech:

```bash
git pull origin main
source venv/bin/activate
pip install -r backend/requirements.txt --upgrade
```

## Support

For issues and support:
- GitHub Issues: https://github.com/yourusername/FreeSpeech/issues
- Documentation: README.md

## Security Notes

⚠️ **Important for Production:**

1. Change SECRET_KEY and JWT_SECRET_KEY in .env
2. Set FLASK_ENV=production and FLASK_DEBUG=False
3. Use HTTPS (configure SSL with Nginx/Let's Encrypt)
4. Implement rate limiting
5. Regular security updates
6. Backup database regularly
