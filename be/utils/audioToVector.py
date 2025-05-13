import sys
import librosa
import numpy as np
import json

def audio_to_vector(file_path):
    y, sr = librosa.load(file_path)
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    vector = np.mean(mfccs.T, axis=0).tolist()
    return vector

if __name__ == "__main__":
    file_path = sys.argv[1]
    vector = audio_to_vector(file_path)
    print(json.dumps(vector))