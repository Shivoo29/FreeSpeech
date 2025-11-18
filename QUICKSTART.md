# FreeSpeech Quick Start Guide

Get up and running with FreeSpeech in 5 minutes!

## Prerequisites Check

Before starting, verify you have:

```bash
# Check Python version (need 3.8+)
python3 --version

# Check if FFmpeg is installed
ffmpeg -version
```

If FFmpeg is not installed:
- **Ubuntu/Debian**: `sudo apt-get install ffmpeg portaudio19-dev`
- **macOS**: `brew install ffmpeg portaudio`

## Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/Shivoo29/FreeSpeech.git
cd FreeSpeech
```

### 2. Run Automated Setup
```bash
python3 setup.py
```

This will:
- Create a virtual environment
- Install all dependencies
- Set up database
- Create configuration files

### 3. Start the Platform
```bash
chmod +x run.sh
./run.sh
```

### 4. Open Your Browser

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:5000

## First Steps

### 1. Create an Account
- Click "Get Started" on the landing page
- Fill in username, email, and password
- Click "Create Account"

### 2. Upload Your First Audio File
- Click "Upload Audio" button
- Select a WAV, MP3, or other supported audio file
- Wait for upload to complete

### 3. Process Your Audio
- Click on your uploaded file
- View the waveform analysis
- Try different processing options:
  - **Normalize**: Balance audio levels
  - **Boost**: Increase volume by 6dB
  - **Fade In/Out**: Add smooth transitions
  - **Convert**: Change to MP3 format

### 4. Download Processed Audio
- Click "Download" to get your processed file

## Common First-Time Issues

### "Module not found" error
```bash
# Make sure virtual environment is activated
source venv/bin/activate
cd backend
pip install -r requirements.txt
```

### "Permission denied" on run.sh
```bash
chmod +x run.sh
chmod +x setup.py
```

### "FFmpeg not found"
```bash
# Ubuntu/Debian
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg
```

### Port already in use
If port 5000 or 8080 is already in use, edit the ports in:
- Backend: `backend/app.py` (line: `app.run(port=5000)`)
- Frontend: `run.sh` (line: `python3 -m http.server 8080`)

## Next Steps

- Read [README.md](README.md) for full documentation
- Check [INSTALL.md](INSTALL.md) for production deployment
- Explore the `01-basics/` directory for audio processing examples

## Need Help?

- Check [INSTALL.md](INSTALL.md) troubleshooting section
- Open an issue on GitHub
- Review the API documentation in README.md

## Stopping the Platform

Press `Ctrl+C` in the terminal where you ran `./run.sh`

---

**That's it! You're ready to process audio files with FreeSpeech!** 🎙️
