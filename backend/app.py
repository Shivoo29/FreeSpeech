from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import os
from datetime import timedelta
from werkzeug.utils import secure_filename
import wave
import numpy as np
from pydub import AudioSegment
import io
import json

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../database/freespeech.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['UPLOAD_FOLDER'] = '../uploads'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size

# Allowed audio extensions
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'ogg', 'flac', 'm4a', 'aac'}

# Initialize extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    audio_files = db.relationship('AudioFile', backref='user', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }

class AudioFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    duration = db.Column(db.Float)
    sample_rate = db.Column(db.Integer)
    channels = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    processed = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.original_filename,
            'duration': self.duration,
            'sample_rate': self.sample_rate,
            'channels': self.channels,
            'created_at': self.created_at.isoformat(),
            'processed': self.processed
        }

# Helper functions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_audio_info(file_path):
    """Extract audio file information"""
    try:
        # Try to load as WAV first
        if file_path.endswith('.wav'):
            with wave.open(file_path, 'rb') as obj:
                return {
                    'duration': obj.getnframes() / obj.getframerate(),
                    'sample_rate': obj.getframerate(),
                    'channels': obj.getnchannels()
                }
        else:
            # Use pydub for other formats
            audio = AudioSegment.from_file(file_path)
            return {
                'duration': len(audio) / 1000.0,  # Convert to seconds
                'sample_rate': audio.frame_rate,
                'channels': audio.channels
            }
    except Exception as e:
        print(f"Error getting audio info: {e}")
        return {'duration': 0, 'sample_rate': 0, 'channels': 0}

# Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'FreeSpeech API is running'})

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing required fields'}), 400

    # Check if user already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400

    # Create new user
    password_hash = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=password_hash
    )

    db.session.add(user)
    db.session.commit()

    # Generate access token
    access_token = create_access_token(identity=user.id)

    return jsonify({
        'message': 'User registered successfully',
        'user': user.to_dict(),
        'access_token': access_token
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email or password'}), 400

    user = User.query.filter_by(email=data['email']).first()

    if not user or not bcrypt.check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401

    access_token = create_access_token(identity=user.id)

    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'access_token': access_token
    })

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'user': user.to_dict()})

@app.route('/api/audio/upload', methods=['POST'])
@jwt_required()
def upload_audio():
    user_id = get_jwt_identity()

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Allowed types: ' + ', '.join(ALLOWED_EXTENSIONS)}), 400

    # Create user upload directory
    user_upload_dir = os.path.join(app.config['UPLOAD_FOLDER'], str(user_id))
    os.makedirs(user_upload_dir, exist_ok=True)

    # Save file
    filename = secure_filename(file.filename)
    timestamp = int(os.times().elapsed * 1000)
    unique_filename = f"{timestamp}_{filename}"
    file_path = os.path.join(user_upload_dir, unique_filename)
    file.save(file_path)

    # Get audio info
    audio_info = get_audio_info(file_path)

    # Save to database
    audio_file = AudioFile(
        user_id=user_id,
        filename=unique_filename,
        original_filename=filename,
        file_path=file_path,
        duration=audio_info['duration'],
        sample_rate=audio_info['sample_rate'],
        channels=audio_info['channels']
    )

    db.session.add(audio_file)
    db.session.commit()

    return jsonify({
        'message': 'File uploaded successfully',
        'file': audio_file.to_dict()
    }), 201

@app.route('/api/audio/list', methods=['GET'])
@jwt_required()
def list_audio_files():
    user_id = get_jwt_identity()
    audio_files = AudioFile.query.filter_by(user_id=user_id).order_by(AudioFile.created_at.desc()).all()

    return jsonify({
        'files': [file.to_dict() for file in audio_files]
    })

@app.route('/api/audio/<int:file_id>/analyze', methods=['GET'])
@jwt_required()
def analyze_audio(file_id):
    user_id = get_jwt_identity()
    audio_file = AudioFile.query.filter_by(id=file_id, user_id=user_id).first()

    if not audio_file:
        return jsonify({'error': 'File not found'}), 404

    try:
        # Load audio file
        if audio_file.file_path.endswith('.wav'):
            with wave.open(audio_file.file_path, 'rb') as obj:
                sample_rate = obj.getframerate()
                n_frames = obj.getnframes()
                signal_wave = obj.readframes(-1)
                signal_array = np.frombuffer(signal_wave, dtype=np.int16)
        else:
            audio = AudioSegment.from_file(audio_file.file_path)
            sample_rate = audio.frame_rate
            signal_array = np.array(audio.get_array_of_samples())
            n_frames = len(signal_array)

        # Calculate statistics
        duration = n_frames / sample_rate
        max_amplitude = int(np.max(np.abs(signal_array)))
        mean_amplitude = float(np.mean(np.abs(signal_array)))

        # Downsample for visualization (max 1000 points)
        downsample_factor = max(1, len(signal_array) // 1000)
        downsampled = signal_array[::downsample_factor]

        return jsonify({
            'duration': duration,
            'sample_rate': sample_rate,
            'max_amplitude': max_amplitude,
            'mean_amplitude': mean_amplitude,
            'waveform': downsampled.tolist()[:1000]  # Limit to 1000 points
        })
    except Exception as e:
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

@app.route('/api/audio/<int:file_id>/process', methods=['POST'])
@jwt_required()
def process_audio(file_id):
    user_id = get_jwt_identity()
    audio_file = AudioFile.query.filter_by(id=file_id, user_id=user_id).first()

    if not audio_file:
        return jsonify({'error': 'File not found'}), 404

    data = request.get_json() or {}
    operation = data.get('operation', 'normalize')

    try:
        # Load audio
        audio = AudioSegment.from_file(audio_file.file_path)

        # Apply processing based on operation
        if operation == 'normalize':
            # Normalize volume
            audio = audio.normalize()
        elif operation == 'boost':
            # Boost volume by 6dB
            audio = audio + 6
        elif operation == 'fade_in':
            # Add 2 second fade in
            audio = audio.fade_in(2000)
        elif operation == 'fade_out':
            # Add 2 second fade out
            audio = audio.fade_out(2000)
        elif operation == 'convert_mp3':
            # Convert to MP3
            pass  # Will be handled in export
        else:
            return jsonify({'error': 'Unknown operation'}), 400

        # Save processed file
        output_format = data.get('format', 'mp3')
        processed_filename = f"processed_{audio_file.filename.rsplit('.', 1)[0]}.{output_format}"
        processed_path = os.path.join(os.path.dirname(audio_file.file_path), processed_filename)

        audio.export(processed_path, format=output_format)

        # Create new audio file record
        audio_info = get_audio_info(processed_path)
        processed_audio = AudioFile(
            user_id=user_id,
            filename=processed_filename,
            original_filename=f"processed_{audio_file.original_filename}",
            file_path=processed_path,
            duration=audio_info['duration'],
            sample_rate=audio_info['sample_rate'],
            channels=audio_info['channels'],
            processed=True
        )

        db.session.add(processed_audio)
        db.session.commit()

        return jsonify({
            'message': 'Audio processed successfully',
            'file': processed_audio.to_dict()
        })
    except Exception as e:
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500

@app.route('/api/audio/<int:file_id>/stream', methods=['GET'])
@jwt_required()
def stream_audio(file_id):
    user_id = get_jwt_identity()
    audio_file = AudioFile.query.filter_by(id=file_id, user_id=user_id).first()

    if not audio_file:
        return jsonify({'error': 'File not found'}), 404

    # Determine MIME type
    ext = audio_file.file_path.rsplit('.', 1)[1].lower()
    mime_types = {
        'wav': 'audio/wav',
        'mp3': 'audio/mpeg',
        'ogg': 'audio/ogg',
        'flac': 'audio/flac',
        'm4a': 'audio/mp4',
        'aac': 'audio/aac'
    }
    mime_type = mime_types.get(ext, 'audio/mpeg')

    return send_file(
        audio_file.file_path,
        mimetype=mime_type,
        as_attachment=False
    )

@app.route('/api/audio/<int:file_id>/download', methods=['GET'])
@jwt_required()
def download_audio(file_id):
    user_id = get_jwt_identity()
    audio_file = AudioFile.query.filter_by(id=file_id, user_id=user_id).first()

    if not audio_file:
        return jsonify({'error': 'File not found'}), 404

    return send_file(
        audio_file.file_path,
        as_attachment=True,
        download_name=audio_file.original_filename
    )

@app.route('/api/audio/<int:file_id>', methods=['DELETE'])
@jwt_required()
def delete_audio(file_id):
    user_id = get_jwt_identity()
    audio_file = AudioFile.query.filter_by(id=file_id, user_id=user_id).first()

    if not audio_file:
        return jsonify({'error': 'File not found'}), 404

    # Delete file from filesystem
    try:
        if os.path.exists(audio_file.file_path):
            os.remove(audio_file.file_path)
    except Exception as e:
        print(f"Error deleting file: {e}")

    # Delete from database
    db.session.delete(audio_file)
    db.session.commit()

    return jsonify({'message': 'File deleted successfully'})

# Create database tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
