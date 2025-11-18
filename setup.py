#!/usr/bin/env python3
"""
FreeSpeech Platform Setup Script
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def print_header(text):
    print("\n" + "=" * 50)
    print(f"  {text}")
    print("=" * 50 + "\n")

def check_python_version():
    """Check if Python version is 3.8 or higher"""
    print_header("Checking Python Version")
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        print(f"   Current version: {sys.version}")
        sys.exit(1)
    print(f"✅ Python {version.major}.{version.minor}.{version.micro}")

def check_dependencies():
    """Check if required system dependencies are installed"""
    print_header("Checking System Dependencies")

    dependencies = {
        'ffmpeg': 'FFmpeg (required for audio processing)',
        'portaudio19-dev': 'PortAudio (required for audio recording)'
    }

    for dep, description in dependencies.items():
        print(f"Checking {description}...")
        # This is a simplified check
        print(f"ℹ️  Make sure {dep} is installed on your system")

    print("\nTo install on Ubuntu/Debian:")
    print("  sudo apt-get install ffmpeg portaudio19-dev")
    print("\nTo install on macOS:")
    print("  brew install ffmpeg portaudio")

def create_virtual_environment():
    """Create Python virtual environment"""
    print_header("Creating Virtual Environment")

    if os.path.exists('venv'):
        print("Virtual environment already exists")
        return

    print("Creating virtual environment...")
    subprocess.run([sys.executable, '-m', 'venv', 'venv'], check=True)
    print("✅ Virtual environment created")

def install_python_packages():
    """Install required Python packages"""
    print_header("Installing Python Packages")

    venv_python = os.path.join('venv', 'bin', 'python') if os.name != 'nt' else os.path.join('venv', 'Scripts', 'python.exe')
    venv_pip = os.path.join('venv', 'bin', 'pip') if os.name != 'nt' else os.path.join('venv', 'Scripts', 'pip.exe')

    print("Upgrading pip...")
    subprocess.run([venv_python, '-m', 'pip', 'install', '--upgrade', 'pip'], check=True)

    print("\nInstalling backend dependencies...")
    subprocess.run([venv_pip, 'install', '-r', 'backend/requirements.txt'], check=True)

    print("✅ All packages installed")

def setup_directories():
    """Create necessary directories"""
    print_header("Setting Up Directories")

    directories = ['database', 'uploads', 'uploads/temp']

    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"✅ Created: {directory}")

def setup_environment_file():
    """Create .env file from template"""
    print_header("Setting Up Environment File")

    if os.path.exists('.env'):
        print(".env file already exists")
        return

    if os.path.exists('.env.example'):
        shutil.copy('.env.example', '.env')
        print("✅ Created .env from template")
        print("⚠️  Please update .env with your configuration")
    else:
        print("⚠️  .env.example not found")

def initialize_database():
    """Initialize the database"""
    print_header("Initializing Database")

    venv_python = os.path.join('venv', 'bin', 'python') if os.name != 'nt' else os.path.join('venv', 'Scripts', 'python.exe')

    print("Creating database tables...")

    # Create a simple script to initialize the database
    init_script = """
import sys
sys.path.insert(0, 'backend')
from app import app, db

with app.app_context():
    db.create_all()
    print('Database initialized successfully')
"""

    with open('init_db.py', 'w') as f:
        f.write(init_script)

    try:
        subprocess.run([venv_python, 'init_db.py'], check=True)
        os.remove('init_db.py')
        print("✅ Database initialized")
    except Exception as e:
        print(f"⚠️  Database initialization warning: {e}")
        if os.path.exists('init_db.py'):
            os.remove('init_db.py')

def print_completion_message():
    """Print setup completion message"""
    print_header("Setup Complete!")

    print("🎉 FreeSpeech is ready to use!\n")
    print("Next steps:")
    print("  1. Review and update .env file with your configuration")
    print("  2. Run the platform:")
    print("     ./run.sh  (Linux/macOS)")
    print("  3. Open your browser:")
    print("     Frontend: http://localhost:8080")
    print("     Backend API: http://localhost:5000")
    print("\nDocumentation: README.md")
    print("\n" + "=" * 50 + "\n")

def main():
    """Main setup function"""
    print("\n🎙️  FreeSpeech Platform Setup\n")

    try:
        check_python_version()
        check_dependencies()
        create_virtual_environment()
        install_python_packages()
        setup_directories()
        setup_environment_file()
        initialize_database()
        print_completion_message()
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Setup failed: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Setup cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
