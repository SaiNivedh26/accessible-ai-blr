// Global state
let transcriptData = null;
let signLanguageWidget = null;
let currentVideoId = null;
let currentSegmentIndex = -1;
let syncInterval = null;
let isVideoPlaying = false;
let lastVideoTime = 0;
let avatarWindow = null;

// Backend API URL
const API_URL = 'http://localhost:5000/api/transcript';

// Avatar URL
const AVATAR_URL = 'http://localhost:8000/work/avatarnew.html';

// Check if we're on a YouTube watch page
function isYouTubeWatchPage() {
  return window.location.href.includes('youtube.com/watch?v=');
}

// Extract video ID from YouTube URL
function getYouTubeVideoId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('v');
}

// Check if the main video is playing (not ads)
function isMainVideoPlaying() {
  const video = document.querySelector('video');
  if (!video) return false;
  
  // Check if video has meaningful duration (ads are usually shorter or have different characteristics)
  const duration = video.duration;
  const currentTime = video.currentTime;
  
  // Basic check: if video has duration > 30 seconds and is not at the very beginning
  // This helps distinguish from short ads
  return duration > 30 && !video.paused && video.readyState >= 2;
}

function createSignLanguageWidget() {
  if (!isYouTubeWatchPage()) {
    console.log('Not on YouTube watch page, skipping widget creation');
    return null;
  }

  if (signLanguageWidget) {
    signLanguageWidget.remove();
  }

  signLanguageWidget = document.createElement('div');
  signLanguageWidget.id = 'sign-language-widget';
  signLanguageWidget.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 400px;
    height: 200px;
    background-color: #000;
    border: 2px solid #333;
    border-radius: 10px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    font-family: Arial, sans-serif;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  `;

  signLanguageWidget.innerHTML = `
    <div style="
      background-color: #111;
      color: white;
      padding: 8px;
      text-align: center;
      font-size: 14px;
      font-weight: bold;
      border-radius: 8px 8px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <span>Sign Language Assistant</span>
      <button id="open-avatar-btn" style="
        background: #4CAF50;
        color: white;
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      ">Open Avatar</button>
    </div>
    
    <div style="
      background-color: #000;
      color: white;
      padding: 10px;
      flex: 1;
      border-radius: 0 0 8px 8px;
      font-size: 14px;
      line-height: 1.4;
      display: flex;
      flex-direction: column;
      justify-content: center;
    ">
      <div id="caption-display" style="margin-bottom: 5px;">
        Waiting for video to start...
      </div>
      <div id="timestamp-display" style="font-size: 11px; color: #aaa;">
      </div>
      <div id="video-status" style="font-size: 10px; color: #666; margin-top: 3px;">
      </div>
      <div id="avatar-status" style="font-size: 10px; color: #4CAF50; margin-top: 3px;">
        Avatar: Not opened
      </div>
    </div>
  `;

  // Add event listener for the open avatar button
  const openAvatarBtn = signLanguageWidget.querySelector('#open-avatar-btn');
  openAvatarBtn.addEventListener('click', openAvatarWindow);

  document.body.appendChild(signLanguageWidget);
  return signLanguageWidget;
}

// Open avatar window
function openAvatarWindow() {
  if (avatarWindow && !avatarWindow.closed) {
    avatarWindow.focus();
    return;
  }

  // Open new window with avatar
  avatarWindow = window.open(
    AVATAR_URL,
    'avatarWindow',
    'width=300,height=400,resizable=yes,top=90px,left=' + (window.screen.width - 300)
  );

  if (avatarWindow) {
    updateAvatarStatus('Avatar: Opening...');
    
    // Check if window is loaded
    const checkWindowLoaded = setInterval(() => {
      if (avatarWindow.closed) {
        clearInterval(checkWindowLoaded);
        updateAvatarStatus('Avatar: Closed');
        avatarWindow = null;
        return;
      }
      
      try {
        if (avatarWindow.document.readyState === 'complete') {
          clearInterval(checkWindowLoaded);
          updateAvatarStatus('Avatar: Ready');
        }
      } catch (e) {
        // Cross-origin error, window is still loading
      }
    }, 500);

    // Handle window close
    avatarWindow.addEventListener('beforeunload', () => {
      updateAvatarStatus('Avatar: Closed');
      avatarWindow = null;
    });
  } else {
    updateAvatarStatus('Avatar: Failed to open');
  }
}

// Send text to avatar by navigating to URL with text parameter
function sendTextToAvatar(text) {
  if (!avatarWindow || avatarWindow.closed) {
    console.log('Avatar window not available');
    return;
  }

  try {
    // Encode the text for URL
    const encodedText = encodeURIComponent(text);
    const avatarUrlWithText = `${AVATAR_URL}?text=${encodedText}`;
    
    console.log('Sending text to avatar:', text);
    
    // Navigate the avatar window to the new URL
    avatarWindow.location.href = avatarUrlWithText;
    
  } catch (error) {
    console.error('Error sending text to avatar:', error);
    updateAvatarStatus('Avatar: Error');
  }
}

// Update avatar status display
function updateAvatarStatus(status) {
  const avatarStatus = document.getElementById('avatar-status');
  if (avatarStatus) {
    avatarStatus.textContent = status;
  }
}

// Fetch transcript for the current video
async function fetchTranscript(videoId) {
  try {
    console.log(`Fetching transcript for video: ${videoId}`);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: videoId }),
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    
    console.log(`Transcript fetched: ${data.length} segments`);
    return data;
    
  } catch (error) {
    console.error('Failed to fetch transcript:', error);
    
    // Update widget to show error
    const captionDisplay = document.getElementById('caption-display');
    if (captionDisplay) {
      captionDisplay.textContent = 'Failed to load transcript';
      captionDisplay.style.color = '#ff6666';
    }
    
    return null;
  }
}

// Find the segment that matches the current video time
function findSegmentForTime(currentTime) {
  if (!transcriptData) return null;
  
  for (let i = 0; i < transcriptData.length; i++) {
    const segment = transcriptData[i];
    const startTime = segment.start;
    const endTime = startTime + segment.duration;
    
    if (currentTime >= startTime && currentTime < endTime) {
      return { segment, index: i };
    }
  }
  
  return null;
}

// Update the caption display
function updateCaption(segment, segmentIndex) {
  const captionDisplay = document.getElementById('caption-display');
  const timestampDisplay = document.getElementById('timestamp-display');
  
  if (captionDisplay && timestampDisplay) {
    if (segment) {
      captionDisplay.textContent = segment.text;
      captionDisplay.style.color = 'white';
      
      const startTime = Math.floor(segment.start);
      const endTime = Math.floor(segment.start + segment.duration);
      timestampDisplay.textContent = `[${startTime}s-${endTime}s]`;
      
      // Send text to avatar
      sendTextToAvatar(segment.text);
    } else {
      captionDisplay.textContent = 'No caption for this time';
      captionDisplay.style.color = '#888';
      timestampDisplay.textContent = '';
    }
  }
}

// Clear caption display
function clearCaption() {
  const captionDisplay = document.getElementById('caption-display');
  const timestampDisplay = document.getElementById('timestamp-display');
  
  if (captionDisplay && timestampDisplay) {
    captionDisplay.textContent = 'Waiting for video to start...';
    captionDisplay.style.color = '#888';
    timestampDisplay.textContent = '';
  }
}

// Update video status display
function updateVideoStatus(status) {
  const videoStatus = document.getElementById('video-status');
  if (videoStatus) {
    videoStatus.textContent = status;
  }
}

// Real-time sync with video playback
function syncWithVideo() {
  const video = document.querySelector('video');
  if (!video || !transcriptData) {
    return;
  }
  
  const currentTime = video.currentTime;
  const isPaused = video.paused;
  const duration = video.duration;
  
  // Update status
  if (isPaused) {
    updateVideoStatus('⏸️ Paused');
  } else if (isMainVideoPlaying()) {
    updateVideoStatus('▶️ Playing');
  } else {
    updateVideoStatus('⏳ Loading/Ad');
    clearCaption();
    return;
  }
  
  // Only sync captions if main video is playing
  if (!isMainVideoPlaying()) {
    return;
  }
  
  // Check if time changed significantly (seeking/jumping)
  const timeJump = Math.abs(currentTime - lastVideoTime) > 1;
  lastVideoTime = currentTime;
  
  if (timeJump) {
    console.log(`Video time jumped to: ${currentTime.toFixed(1)}s`);
  }
  
  // Find the segment for current time
  const result = findSegmentForTime(currentTime);
  
  if (result) {
    const { segment, index } = result;
    
    // Only update if segment changed or time jumped
    if (index !== currentSegmentIndex || timeJump) {
      currentSegmentIndex = index;
      updateCaption(segment, index);
      
      if (timeJump) {
        console.log(`Jumped to segment ${index}: ${segment.text}`);
      }
    }
  } else {
    // No segment found for current time
    if (currentSegmentIndex !== -1) {
      currentSegmentIndex = -1;
      updateCaption(null, -1);
    }
  }
}

// Initialize transcript for current video
async function initializeTranscript() {
  const videoId = getYouTubeVideoId();
  
  if (!videoId || !isYouTubeWatchPage()) {
    console.log('Not a valid YouTube watch page');
    return;
  }
  
  // Create widget if it doesn't exist
  if (!signLanguageWidget) {
    createSignLanguageWidget();
  }
  
  // If this is a new video, fetch transcript
  if (videoId !== currentVideoId) {
    console.log(`New video detected: ${videoId}`);
    currentVideoId = videoId;
    
    // Clear previous data
    transcriptData = null;
    currentSegmentIndex = -1;
    lastVideoTime = 0;
    clearCaption();
    
    // Stop previous sync
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
    
    // Show loading status
    updateVideoStatus('📥 Loading transcript...');
    
    // Fetch new transcript
    const data = await fetchTranscript(videoId);
    if (data && data.length > 0) {
      transcriptData = data;
      console.log(`Transcript loaded with ${data.length} segments`);
      
      // Start syncing
      syncInterval = setInterval(syncWithVideo, 100); // Check every 100ms for smooth sync
      console.log('Started real-time caption sync');
      
      updateVideoStatus('✅ Ready');
    } else {
      updateVideoStatus('❌ No transcript available');
    }
  }
}

// Handle page navigation
function handlePageChange() {
  const newVideoId = getYouTubeVideoId();
  
  // Check if we're still on a watch page
  if (!isYouTubeWatchPage()) {
    console.log('Left YouTube watch page, removing widget');
    
    // Clean up
    if (signLanguageWidget) {
      signLanguageWidget.remove();
      signLanguageWidget = null;
    }
    
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
    
    // Close avatar window
    if (avatarWindow && !avatarWindow.closed) {
      avatarWindow.close();
      avatarWindow = null;
    }
    
    // Reset state
    transcriptData = null;
    currentVideoId = null;
    currentSegmentIndex = -1;
    
    return;
  }
  
  // If we're on a watch page with a different video
  if (newVideoId && newVideoId !== currentVideoId) {
    console.log('Page changed to new video');
    initializeTranscript();
  }
}

// Initialize when page loads
function initialize() {
  console.log('YouTube Sign Language Assistant initializing...');
  
  // Only proceed if we're on a watch page
  if (!isYouTubeWatchPage()) {
    console.log('Not on YouTube watch page, waiting...');
    return;
  }
  
  // Wait for video element to be available
  const checkForVideo = setInterval(() => {
    const video = document.querySelector('video');
    const videoId = getYouTubeVideoId();
    
    if (video && videoId) {
      clearInterval(checkForVideo);
      console.log('Video element found, initializing transcript');
      
      // Add event listeners for video events
      video.addEventListener('play', () => {
        console.log('Video play event');
        isVideoPlaying = true;
      });
      
      video.addEventListener('pause', () => {
        console.log('Video pause event');
        isVideoPlaying = false;
      });
      
      video.addEventListener('seeked', () => {
        console.log('Video seeked event');
        // Force immediate sync after seeking
        setTimeout(syncWithVideo, 100);
      });
      
      video.addEventListener('timeupdate', () => {
        // This fires frequently during playback
        lastVideoTime = video.currentTime;
      });
      
      initializeTranscript();
    }
  }, 1000);
  
  // Stop checking after 15 seconds
  setTimeout(() => {
    clearInterval(checkForVideo);
  }, 15000);
}

// Run when page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Listen for URL changes (YouTube SPA navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('URL changed to:', url);
    setTimeout(handlePageChange, 1000);
  }
}).observe(document, { subtree: true, childList: true });

// Listen for extension popup messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'refreshTranscript') {
    console.log('Manual refresh requested');
    
    // Reset and reinitialize
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
    
    transcriptData = null;
    currentVideoId = null;
    currentSegmentIndex = -1;
    lastVideoTime = 0;
    
    initializeTranscript().then(() => {
      sendResponse({ success: true });
    }).catch(error => {
      console.error('Refresh failed:', error);
      sendResponse({ success: false, error: error.message });
    });
    
    return true; // Keep message channel open
  }
});

// Handle page unload to close avatar window
window.addEventListener('beforeunload', () => {
  if (avatarWindow && !avatarWindow.closed) {
    avatarWindow.close();
  }
});

console.log('YouTube Sign Language Assistant content script loaded');