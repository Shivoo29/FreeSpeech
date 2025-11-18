# FreeSpeech

🎙️ **Professional Audio Processing Platform**

FreeSpeech is a comprehensive web-based audio processing platform that allows users to upload, analyze, process, and download audio files with ease. Built with Python Flask backend and vanilla JavaScript frontend, it provides professional-grade audio processing capabilities through an intuitive interface.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Flask](https://img.shields.io/badge/Flask-3.0-green.svg)](https://flask.palletsprojects.com/)

## 🌟 Features

### Core Functionality
- **Multi-Format Support**: Upload and process WAV, MP3, OGG, FLAC, AAC, and M4A files
- **Real-time Waveform Visualization**: Interactive audio waveform display
- **Audio Analysis**: View detailed audio properties (duration, sample rate, channels, amplitude)
- **Audio Processing**: Normalize, boost volume, add fades, and convert formats
- **Secure File Management**: Encrypted storage with user authentication
- **User Dashboard**: Manage all your audio files in one place

### User Experience
- **Modern Landing Page**: Clear value proposition and feature showcase
- **Seamless Onboarding**: Quick registration and login process
- **Intuitive Interface**: Drag-and-drop file uploads
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Feedback**: Upload progress and processing status

### Security
- **JWT Authentication**: Secure token-based authentication
- **Password Encryption**: Bcrypt password hashing
- **User Isolation**: Each user's files are completely isolated
- **File Validation**: Strict file type and size validation
- **SQL Injection Protection**: SQLAlchemy ORM with parameterized queries

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- FFmpeg
- PortAudio (for audio recording features)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Shivoo29/FreeSpeech.git
   cd FreeSpeech
   ```

2. **Run automated setup:**
   ```bash
   python3 setup.py
   ```

3. **Configure environment:**
   ```bash
   # Edit .env with your settings
   nano .env
   ```

4. **Start the platform:**
   ```bash
   chmod +x run.sh
   ./run.sh
   ```

5. **Access the application:**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:5000

For detailed installation instructions, see [INSTALL.md](INSTALL.md).

## 📁 Project Structure

```
FreeSpeech/
├── backend/                    # Flask backend application
│   ├── app.py                 # Main Flask application
│   └── requirements.txt       # Python dependencies
├── frontend/                   # Web frontend
│   ├── index.html             # Main HTML file
│   ├── styles.css             # Styling
│   └── app.js                 # JavaScript logic
├── 01-basics/                 # Audio processing examples
│   ├── load_mp3.py           # MP3 loading example
│   ├── plot_audio.py         # Waveform visualization
│   ├── record_audio.py       # Audio recording
│   └── wav_expamle.py        # WAV file handling
├── database/                  # SQLite database storage
├── uploads/                   # User uploaded files
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── setup.py                  # Automated setup script
├── run.sh                    # Startup script
├── INSTALL.md                # Detailed installation guide
└── README.md                 # This file
```

## 🎯 User Journey

### 1. Landing Page
Users arrive at a professional landing page that clearly communicates:
- What FreeSpeech does (audio processing platform)
- Key features and benefits
- How it works (4-step process)
- Clear call-to-action buttons

### 2. Registration/Login
- Quick registration with username, email, and password
- Secure login for returning users
- JWT token-based authentication
- Password validation and encryption

### 3. Dashboard
After authentication, users access their personal dashboard:
- View all uploaded audio files
- See file details (duration, sample rate, channels)
- Upload new audio files
- Access individual files for processing

### 4. Audio Processing
For each audio file, users can:
- View detailed analysis and waveform
- Apply processing operations:
  - Normalize volume
  - Boost by 6dB
  - Add fade in/out effects
  - Convert to MP3 format
- Download processed files
- Delete unwanted files

## 🔧 API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Audio Endpoints

#### Upload Audio
```http
POST /api/audio/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [audio file]
```

#### List Audio Files
```http
GET /api/audio/list
Authorization: Bearer {token}
```

#### Analyze Audio
```http
GET /api/audio/{file_id}/analyze
Authorization: Bearer {token}
```

#### Process Audio
```http
POST /api/audio/{file_id}/process
Authorization: Bearer {token}
Content-Type: application/json

{
  "operation": "normalize",  // normalize, boost, fade_in, fade_out, convert_mp3
  "format": "mp3"           // optional
}
```

#### Download Audio
```http
GET /api/audio/{file_id}/download
Authorization: Bearer {token}
```

#### Delete Audio
```http
DELETE /api/audio/{file_id}
Authorization: Bearer {token}
```

## 🛠️ Technology Stack

### Backend
- **Flask 3.0**: Web framework
- **SQLAlchemy**: ORM for database operations
- **Flask-JWT-Extended**: JWT authentication
- **Flask-Bcrypt**: Password hashing
- **Flask-CORS**: Cross-origin resource sharing
- **PyDub**: Audio file manipulation
- **NumPy**: Numerical operations for audio analysis
- **PyAudio**: Audio recording capabilities

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript**: No framework dependencies
- **Canvas API**: Waveform visualization
- **Fetch API**: RESTful API communication

### Database
- **SQLite**: Lightweight, file-based database
- Easily upgradeable to PostgreSQL/MySQL for production

## 📊 Database Schema

### User Table
```sql
id              INTEGER PRIMARY KEY
username        VARCHAR(80) UNIQUE NOT NULL
email           VARCHAR(120) UNIQUE NOT NULL
password_hash   VARCHAR(200) NOT NULL
created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
```

### AudioFile Table
```sql
id                  INTEGER PRIMARY KEY
user_id             INTEGER FOREIGN KEY REFERENCES user(id)
filename            VARCHAR(255) NOT NULL
original_filename   VARCHAR(255) NOT NULL
file_path           VARCHAR(500) NOT NULL
duration            FLOAT
sample_rate         INTEGER
channels            INTEGER
created_at          DATETIME DEFAULT CURRENT_TIMESTAMP
processed           BOOLEAN DEFAULT FALSE
```

## 🔐 Security Features

1. **Authentication**: JWT-based secure authentication
2. **Password Security**: Bcrypt hashing with salt
3. **User Isolation**: Files are stored per-user with access controls
4. **File Validation**: Type and size validation
5. **SQL Injection Protection**: ORM with parameterized queries
6. **CORS Configuration**: Controlled cross-origin access
7. **Environment Variables**: Sensitive data in .env file

## 🎨 Design Principles

### Clear Messaging
- Immediate value proposition on landing page
- Feature benefits clearly explained
- Simple 4-step process visualization
- No jargon, straightforward language

### User-Centric Design
- Minimal clicks to core functionality
- Visual feedback for all actions
- Error messages that help users
- Responsive design for all devices

### Professional Appearance
- Modern gradient hero section
- Consistent color scheme
- Clean typography
- Smooth transitions and hover effects

## 🚀 Deployment

### Development
```bash
./run.sh
```

### Production with Gunicorn
```bash
cd backend
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Production with Nginx
See [INSTALL.md](INSTALL.md) for complete Nginx configuration.

## 🧪 Development Examples

The `01-basics/` directory contains fundamental audio processing examples:

### Load and Process MP3
```python
from pydub import AudioSegment

audio = AudioSegment.from_wav("voice.wav")
audio = audio + 6  # Boost by 6dB
audio = audio.fade_in(2000)  # 2 second fade in
audio.export("output.mp3", format="mp3")
```

### Record Audio
```python
import pyaudio
import wave

# Configure recording
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000

# See record_audio.py for complete example
```

### Visualize Waveform
```python
import wave
import matplotlib.pyplot as plt
import numpy as np

obj = wave.open("voice.wav", "rb")
signal = obj.readframes(-1)
signal_array = np.frombuffer(signal, dtype=np.int16)

# See plot_audio.py for complete example
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Flask team for the excellent web framework
- PyDub developers for audio processing capabilities
- The open-source community for various libraries and tools

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Shivoo29/FreeSpeech/issues)
- **Documentation**: This README and INSTALL.md

## 🗺️ Roadmap

### Future Features
- [ ] Speech-to-text transcription
- [ ] Text-to-speech synthesis
- [ ] Real-time audio streaming
- [ ] Audio effects library (reverb, echo, compression)
- [ ] Batch processing
- [ ] Mobile apps (iOS/Android)
- [ ] Docker containerization
- [ ] AI-powered audio enhancement

## 🔍 Troubleshooting

### Common Issues

**1. Import errors when running backend**
- Ensure virtual environment is activated
- Run `pip install -r backend/requirements.txt`

**2. FFmpeg not found**
- Install FFmpeg system-wide
- Verify with `ffmpeg -version`

**3. Database errors**
- Check that `database/` directory exists
- Re-run `python setup.py`

**4. CORS errors in browser**
- Check CORS_ORIGINS in .env
- Ensure backend is running on port 5000

**5. File upload fails**
- Check MAX_UPLOAD_SIZE in .env
- Verify `uploads/` directory is writable

For more troubleshooting, see [INSTALL.md](INSTALL.md).

---

**Built with ❤️ for audio processing enthusiasts**

