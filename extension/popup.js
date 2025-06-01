document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.getElementById('toggleBtn');
  const statusEl = document.getElementById('status');
  
  // Check if we're on a YouTube video page
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0].url.includes('youtube.com/watch')) {
      // Check if the backend server is running
      fetch('http://localhost:5000/api/health')
        .then(response => {
          if (response.ok) {
            statusEl.textContent = 'Status: Server is running';
            statusEl.className = 'status enabled';
            toggleBtn.disabled = false;
          } else {
            statusEl.textContent = 'Status: Server not responding';
            statusEl.className = 'status disabled';
            toggleBtn.disabled = true;
          }
        })
        .catch(error => {
          console.error('Error checking server status:', error);
          statusEl.textContent = 'Status: Cannot connect to server';
          statusEl.className = 'status disabled';
          toggleBtn.disabled = true;
        });
    } else {
      statusEl.textContent = 'Not a YouTube video page';
      statusEl.className = 'status disabled';
      toggleBtn.disabled = true;
    }
  });

  document.getElementById('openFloating').addEventListener('click', () => {
    chrome.windows.create({
      url: chrome.runtime.getURL("work/avatarnew.html"),
      type: "popup",
      width: 400,
      height: 600,
      left: 1000,  // adjust X position
      top: 500     // adjust Y position (lower down screen)
    });
  });
  
  
  // Refresh button to manually fetch transcript
  toggleBtn.addEventListener('click', function() {
    statusEl.textContent = 'Fetching transcript...';
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'refreshTranscript'}, function(response) {
        if (response && response.success) {
          statusEl.textContent = 'Transcript fetched successfully!';
          statusEl.className = 'status enabled';
        } else {
          statusEl.textContent = 'Failed to fetch transcript';
          statusEl.className = 'status disabled';
        }
      });
    });
  });
}); 
