# Audio files format
# .WAV (Waveform Audio File Format)
# .AIFF (Audio Interchange File Format)
# .FLAC (Free Lossless Audio Codec)
# .ALAC (Apple Lossless Audio Codec)
# .MP3 (MPEG-1 Audio Layer 3)
# .AAC (Advanced Audio Coding)
# .OGG (Ogg Vorbis)
# .WMA (Windows Media Audio)
# .DSD (Direct Stream Digital)
# .MIDI (Musical Instrument Digital Interface)
# .DTS (Digital Theater Systems)
# .M4A (MPEG-4 Audio)
# .AVI (Audio Video Interleave)
# .MKV (Matroska Multimedia Container)
import wave
import os

'''
Audio Signal Parameters
    - number of channels
    - sample width
    - framerate/sample_rate: 44,100 Hz
    - number of frames
    - value of frames
'''

file_path = "voice.wav"
obj = wave.open(file_path, "rb")

channels = obj.getnchannels()
sample_width = obj.getsampwidth()
framerate = obj.getframerate()
num_frames = obj.getnframes()
parameters = obj.getparams()

print("Number of channels: ", channels, "\nSample Width: ", sample_width, "\nFramerate: ", framerate, "\nNumber of frames: ", num_frames, "\nParameters: ", parameters)
time = num_frames / framerate
print(time)
frames = obj.readframes(-1)
print(type(frames), type(frames[0]))
print(len(frames))
obj.close()

obj_new = wave.open("new_voice.wav",'wb')
obj_new.setnchannels(1)
obj_new.setsampwidth(2)
obj_new.setframerate(48000.0)
obj_new.writeframes(frames)
obj_new.close()