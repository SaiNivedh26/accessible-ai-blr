# YouTube Sign Language Assistant

A Chrome extension for hearing impaired users that provides sign language translation for YouTube videos.

## Features

- Fetches video transcripts from YouTube videos
- Displays captions synchronized with the video
- Prepared for future integration with sign language avatar (coming soon)
- Supports multiple languages (English, Malayalam, Tamil, Hindi)

## Project Structure

```
├── app.py                 # Flask backend for transcript API
├── requirements.txt       # Python dependencies
├── extension/             # Chrome extension files
│   ├── manifest.json      # Extension manifest
│   ├── popup.html         # Extension popup
│   ├── popup.js           # Popup script
│   ├── content.js         # Content script injected into YouTube
│   ├── styles.css         # Styling for the sign language container
│   └── icons/             # Extension icons
```

## Setup Instructions

### Backend Setup

1. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the Flask backend:
   ```
   python app.py
   ```
   The API will be available at http://localhost:5000/api/transcript

### Chrome Extension Setup

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked" and select the `extension` folder from this project
4. The extension should now be installed in your browser

## Usage

1. Navigate to any YouTube video
2. Click on the extension icon in your browser toolbar
3. Click "Enable Sign Language" in the popup
4. A sign language container will appear in the bottom right corner of the video
5. The container will display captions synchronized with the video
6. In future versions, this will include a sign language avatar

## Future Enhancements

- Implement sign language avatar using 3D models
- Add user controls for container size and position
- Improve transcript processing for better sign language mapping
- Add support for more languages 