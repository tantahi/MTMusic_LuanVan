# -*- coding: utf-8 -*-
import sys
import io
import numpy as np
import librosa
import requests
import csv
import soundfile as sf

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Đường dẫn đến mô hình đã được huấn luyện trước
MODEL_PATH = 'http://localhost:3000/validated_sentences.tsv'

# Biến toàn cục để lưu trữ dữ liệu JSON
json_data = None

def load_model():
    global json_data
    try:
        tsv_data = fetch_tsv(MODEL_PATH)
        json_data = convert_tsv_to_json(tsv_data)
        print('Dữ liệu đã được tải và chuyển đổi thành công.')
    except Exception as error:
        print('Lỗi khi tải và chuyển đổi dữ liệu:', str(error))
        raise

def fetch_tsv(url):
    response = requests.get(url)
    response.raise_for_status()
    return response.text

def convert_tsv_to_json(tsv_data):
    reader = csv.DictReader(io.StringIO(tsv_data), delimiter='\t')
    return list(reader)

def extract_features(audio_buffer):
    audio, sr = sf.read(io.BytesIO(audio_buffer))
    
    # Kiểm tra độ dài của âm thanh
    if len(audio) < sr * 0.1:  # Nếu âm thanh ngắn hơn 0.1 giây
        raise ValueError("Tệp âm thanh quá ngắn để xử lý")
    
    # Giới hạn độ dài tối đa của âm thanh lên 20 phút
    max_audio_length = sr * 60 * 20  # Tối đa 20 phút
    if len(audio) > max_audio_length:
        audio = audio[:max_audio_length]
    
    # Chia âm thanh thành các đoạn 30 giây
    segment_length = sr * 30
    num_segments = len(audio) // segment_length + (1 if len(audio) % segment_length != 0 else 0)
    
    mfccs_all = []
    for i in range(num_segments):
        start = i * segment_length
        end = min((i + 1) * segment_length, len(audio))
        segment = audio[start:end]
        
        # Kiểm tra độ dài tối thiểu của đoạn
        if len(segment) < 512:  # Đảm bảo đoạn đủ dài cho hop_length
            continue
        
        # Sử dụng các tham số để giảm việc sử dụng bộ nhớ
        mfccs = librosa.feature.mfcc(y=segment, sr=sr, n_mfcc=13, n_fft=512, hop_length=256)
        mfccs_processed = np.mean(mfccs.T, axis=0)
        mfccs_all.append(mfccs_processed)
    
    # Kiểm tra nếu không có đoạn nào được xử lý
    if not mfccs_all:
        raise ValueError("Không thể trích xuất đặc trưng từ tệp âm thanh")
    
    # Tính trung bình của các đặc trưng MFCC từ tất cả các đoạn
    return np.mean(mfccs_all, axis=0)

def find_nearest_sentence(features):
    if not json_data:
        raise ValueError('Dữ liệu chưa được tải hoặc không có dữ liệu')

    nearest_sentence = ''
    min_distance = float('inf')

    for entry in json_data:
        entry_features = np.array(eval(entry['features']))
        distance = np.linalg.norm(features - entry_features)
        if distance < min_distance:
            min_distance = distance
            nearest_sentence = entry['sentence']

    return nearest_sentence

def transcribe_audio(file_buffer):
    try:
        if not json_data:
            raise ValueError('Dữ liệu chưa được tải')

        features = extract_features(file_buffer)
        transcription = find_nearest_sentence(features)

        print(f"Transcription: {transcription}")
        return transcription
    except ValueError as ve:
        print(f'Lỗi khi nhận dạng âm thanh: {str(ve)}')
        return str(ve)
    except Exception as error:
        print('Lỗi khi nhận dạng âm thanh:', str(error))
        return str(error)

if __name__ == "__main__":
    load_model()
    if len(sys.argv) != 2:
        print("Sử dụng: python speechToText.py <đường_dẫn_tệp_âm_thanh>")
        sys.exit(1)

    audio_file_path = sys.argv[1]
    with open(audio_file_path, 'rb') as audio_file:
        audio_buffer = audio_file.read()
    
    result = transcribe_audio(audio_buffer)
    print(result)