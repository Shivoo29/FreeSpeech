#from posix import times
import wave
import matplotlib.pyplot as plt
import numpy as np

obj = wave.open("voice.wav","rb")

sample_freq = obj.getframerate()
n_sample = obj.getnframes()
signal_wave = obj.readframes(-1)

obj.close()

t_audio = n_sample / sample_freq

print(t_audio)

# Convert the byte buffer of the signal into a numpy array of type int16 (16-bit integers)
signal_array = np.frombuffer(signal_wave, dtype=np.int16)

# Create an array of linearly spaced values over the range from 0 to t_audio
# 'num' specifies the number of samples which should match the length of the audio signal
time = np.linspace(0, t_audio, num=n_sample)

# Set the size of the figure for the plot
plt.figure(figsize=(15, 5))

# Plot the audio signal; the x-axis is time, and the y-axis is the audio signal values
plt.plot(time, signal_array)

# Set the title of the plot
plt.title("Audio Signal")

# Set the label for the y-axis
plt.ylabel("Signal wave")

# Set the label for the x-axis
plt.xlabel("time (s)")

# Set the limits for the x-axis to be from 0 to the total duration of the audio
plt.xlim(0, t_audio)

# Display the plot
plt.show()