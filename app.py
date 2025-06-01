from flask import Flask, request, jsonify
from youtube_transcript_api import YouTubeTranscriptApi
from flask_cors import CORS
import json
import os
import time
import requests
from dotenv import load_dotenv
from google.cloud import translate_v2 as translate
from google.oauth2 import service_account

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Google Cloud Translation client
credentials = service_account.Credentials.from_service_account_file('credentials.json')
translate_client = translate.Client(credentials=credentials)

# Maximum number of segments per translation request
MAX_SEGMENTS_PER_REQUEST = 128

def detect_language(text):
    """Detect the language of the given text using Google Cloud Translation"""
    try:
        result = translate_client.detect_language(text)
        return {'language_code': result['language']}
    except Exception as e:
        print(f"Error in language detection: {e}")
        return None

def batch_translate_texts(texts, source_lang="auto"):
    """Translate multiple texts to English using Google Cloud Translation"""
    try:
        # Split texts into chunks of MAX_SEGMENTS_PER_REQUEST
        chunks = [texts[i:i + MAX_SEGMENTS_PER_REQUEST] for i in range(0, len(texts), MAX_SEGMENTS_PER_REQUEST)]
        translated_texts = []
        
        print(f"Processing {len(chunks)} chunks of text for translation")
        
        # Process each chunk
        for i, chunk in enumerate(chunks):
            print(f"Translating chunk {i+1}/{len(chunks)} with {len(chunk)} segments")
            results = translate_client.translate(
                chunk,
                target_language='en',
                source_language=source_lang
            )
            
            # Extract translated texts from this chunk
            chunk_translations = [result['translatedText'] for result in results]
            translated_texts.extend(chunk_translations)
            
            # Add a small delay between chunks to avoid rate limiting
            if i < len(chunks) - 1:
                time.sleep(0.5)
        
        print(f"Batch translation completed for {len(translated_texts)} total segments")
        return translated_texts
    except Exception as e:
        print(f"Error in batch translation: {e}")
        return None

def create_semantic_map(text):
    # This is a placeholder function that would be implemented later
    # to transform the transcript text into semantic representations for sign language
    # For now, just return the original text
    return text

def save_transcript_to_file(video_id, transcript_data, is_translated=False):
    """Save transcript data to a file named video_id.txt"""
    try:
        # Create transcripts directory if it doesn't exist
        os.makedirs('transcripts', exist_ok=True)
        
        filename = os.path.join('transcripts', f"{video_id}{'_translated' if is_translated else ''}.txt")
        
        with open(filename, 'w', encoding='utf-8') as f:
            # First write a simple header
            f.write(f"Transcript for YouTube video: {video_id}\n")
            f.write("-" * 50 + "\n\n")
            
            # Write each segment with timeline
            for segment in transcript_data:
                start_time = segment['start']
                duration = segment['duration']
                text = segment['text']
                original_text = segment.get('original_text', '')
                
                # Format: [00:15.3 - 00:18.2] Text of the segment
                end_time = start_time + duration
                time_format = f"[{start_time:.1f}s - {end_time:.1f}s] {text}\n"
                if original_text:
                    time_format += f"[{start_time:.1f}s - {end_time:.1f}s] {original_text}\n"
                f.write(time_format)
        
        # Also save as JSON for easier processing if needed
        json_filename = os.path.join('transcripts', f"{video_id}{'_translated' if is_translated else ''}.json")
        with open(json_filename, 'w', encoding='utf-8') as f:
            json.dump(transcript_data, f, ensure_ascii=False, indent=2)
        
        print(f"Transcript saved to {filename} and {json_filename}")
        return True
    except Exception as e:
        print(f"Error saving transcript: {e}")
        return False

def get_all_transcripts(video_id):
    """Get all available transcripts for a video"""
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        return transcript_list
    except Exception as e:
        print(f"Error getting transcript list: {e}")
        return None

@app.route('/api/transcript', methods=['POST'])
def get_transcript():
    data = request.json
    video_id = data.get("id")
    if not video_id:
        return jsonify({"error": "YouTube video ID missing"}), 400

    try:
        print(f"Fetching transcript for video ID: {video_id}")
        
        # Get all available transcripts
        transcript_list = get_all_transcripts(video_id)
        if not transcript_list:
            return jsonify({"error": "No transcripts available"}), 404

        # Try to get English transcript first
        try:
            transcript = transcript_list.find_transcript(['en']).fetch()
            print("Found English transcript")
            return jsonify(transcript)
        except:
            # If English not available, try other languages
            try:
                # Try to get transcript in preferred languages
                transcript = transcript_list.find_transcript(['ml', 'ta', 'hi']).fetch()
                print("Found non-English transcript, will translate to English")
                
                # Save original transcript first
                save_transcript_to_file(video_id, transcript)
                
                # Prepare texts for batch translation
                original_texts = [segment['text'] for segment in transcript]
                
                # Detect language of the first segment to use for all
                lang_detection = detect_language(original_texts[0])
                source_lang = lang_detection.get('language_code', 'auto') if lang_detection else 'auto'
                
                # Batch translate all texts
                translated_texts = batch_translate_texts(original_texts, source_lang)
                
                if translated_texts and len(translated_texts) == len(transcript):
                    # Create translated segments with original timing
                    translated_segments = []
                    for i, segment in enumerate(transcript):
                        translated_segment = {
                            'start': segment['start'],
                            'duration': segment['duration'],
                            'text': translated_texts[i],
                            'original_text': original_texts[i],
                            'detected_language': source_lang
                        }
                        translated_segments.append(translated_segment)
                    
                    # Save translated transcript
                    save_transcript_to_file(video_id, translated_segments, is_translated=True)
                    
                    # Return the translated transcript for the extension
                    return jsonify(translated_segments)
                else:
                    print("Batch translation failed or returned incorrect number of segments")
                    return jsonify({"error": "Translation failed"}), 500
                    
            except Exception as e:
                print(f"Error processing non-English transcript: {e}")
                return jsonify({"error": "Failed to process transcript"}), 500

    except Exception as e:
        error_msg = str(e)
        print(f"Error fetching transcript: {error_msg}")
        return jsonify({"error": error_msg}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify the API is running"""
    return jsonify({"status": "ok", "message": "API is running"}), 200

if __name__ == '__main__':
    print("Starting YouTube Transcript API Server...")
    app.run(debug=True) 