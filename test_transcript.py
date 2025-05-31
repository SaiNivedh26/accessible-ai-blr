from youtube_transcript_api import YouTubeTranscriptApi
import os

def extract_transcript_with_timeline(video_id):
    """
    Extract transcript and format it with timeline
    """
    try:
        # Fetch transcript
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['en', 'ml', 'ta', 'hi'])
        
        # Create transcripts directory if it doesn't exist
        os.makedirs('transcripts', exist_ok=True)
        
        # Save to file with timeline format
        filename = f"transcripts/{video_id}.txt"
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(f"Transcript for YouTube video: {video_id}\n")
            f.write("-" * 50 + "\n\n")
            
            for segment in transcript:
                start_time = int(segment['start'])
                end_time = int(segment['start'] + segment['duration'])
                text = segment['text'].strip()
                
                # Format: [1s-10s] They talked, then...
                timeline_format = f"[{start_time}s-{end_time}s] {text}\n"
                f.write(timeline_format)
        
        print(f"Transcript saved to {filename}")
        print(f"Total segments: {len(transcript)}")
        
        # Print first few segments as example
        print("\nFirst 3 segments:")
        for i, segment in enumerate(transcript[:3]):
            start_time = int(segment['start'])
            end_time = int(segment['start'] + segment['duration'])
            text = segment['text'].strip()
            print(f"[{start_time}s-{end_time}s] {text}")
        
        return transcript
        
    except Exception as e:
        print(f"Error extracting transcript: {e}")
        return None

if __name__ == "__main__":
    # Test with a video ID
    video_id = input("Enter YouTube video ID: ")
    extract_transcript_with_timeline(video_id) 