from flask import Flask, request, jsonify
from youtube_transcript_api import YouTubeTranscriptApi
from flask_cors import CORS
import json
import os
import time

app = Flask(__name__)
CORS(app)

def create_semantic_map(text):
    # This is a placeholder function that would be implemented later
    # to transform the transcript text into semantic representations for sign language
    # For now, just return the original text
    return text

def save_transcript_to_file(video_id, transcript_data):
    """Save transcript data to a file named video_id.txt"""
    try:
        # Create transcripts directory if it doesn't exist
        os.makedirs('transcripts', exist_ok=True)
        
        filename = os.path.join('transcripts', f"{video_id}.txt")
        
        with open(filename, 'w', encoding='utf-8') as f:
            # First write a simple header
            f.write(f"Transcript for YouTube video: {video_id}\n")
            f.write("-" * 50 + "\n\n")
            
            # Write each segment with timeline
            for segment in transcript_data:
                start_time = segment['start']
                duration = segment['duration']
                text = segment['text']
                
                # Format: [00:15.3 - 00:18.2] Text of the segment
                end_time = start_time + duration
                time_format = f"[{start_time:.1f}s - {end_time:.1f}s] {text}\n"
                f.write(time_format)
        
        # Also save as JSON for easier processing if needed
        json_filename = os.path.join('transcripts', f"{video_id}.json")
        with open(json_filename, 'w', encoding='utf-8') as f:
            json.dump(transcript_data, f, ensure_ascii=False, indent=2)
        
        print(f"Transcript saved to {filename} and {json_filename}")
        return True
    except Exception as e:
        print(f"Error saving transcript: {e}")
        return False

@app.route('/api/transcript', methods=['POST'])
def get_transcript():
    data = request.json
    video_id = data.get("id")
    if not video_id:
        return jsonify({"error": "YouTube video ID missing"}), 400

    try:
        print(f"Fetching transcript for video ID: {video_id}")
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['en', 'ml', 'ta', 'hi'])
        
        for segment in transcript:
            segment['text'] = create_semantic_map(segment['text'])
        
        # Save transcript to file
        save_transcript_to_file(video_id, transcript)
        
        print(f"Successfully processed transcript with {len(transcript)} segments")
        return jsonify(transcript)
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