// config.js
window.CWASA_CONFIG = {
    configPath: chrome.runtime.getURL('avatar_files/cwasacng.json'),
    basePath: chrome.runtime.getURL('avatar_files/'),
    disableEval: false // Some CWASA versions need this
  };


  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeAvatarSystem, 500);
  });