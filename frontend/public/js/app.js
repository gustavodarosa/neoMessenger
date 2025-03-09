document.addEventListener('DOMContentLoaded', () => {
    console.log('Starting neoMessenger application...');
  
    // Create audio objects for notifications
    window.messageSound = new Audio('audio/message.mp3');
    
    // Call the setup functions after fetching user info
    ProfileManager.initialize()
      .then((user) => {
        if (user) {
          console.log("%c User authenticated:", "color: green", {
            id: ProfileManager.getCurrentUserId(),
            name: ProfileManager.getCurrentUserName()
          });
          
          // Set up socket connection first thing after user authentication
          return SocketManager.setupSocketConnection(ProfileManager.getCurrentUserId());
        }
      })
      .then((socketConnected) => {
        // Continue with other initializations
        StatusManager.initialize(); 
        ContactManager.initialize(); 
        MessageManager.initialize(ProfileManager.getCurrentUserId(), ProfileManager.getCurrentUserName());
        
        // Log socket setup status
        if (socketConnected) {
          console.log("%c Socket setup complete", "color: green");
        } else {
          console.warn("%c Socket setup failed or was not completed", "color: orange");
        }
      })
      .catch((error) => {
        console.error("Error during initialization:", error);
      });
    
    // Check personal room membership after 5 seconds (to allow other initialization to complete)
    setTimeout(() => {
      if (ProfileManager.getCurrentUserId()) {
        SocketManager.verifyPersonalRoom();
      }
    }, 5000);
  
    // Initialize audio on first user interaction
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('keypress', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });
  
    function initAudio() {
      if (window.messageSound) {
        window.messageSound.play().catch(() => {});
        window.messageSound.pause();
        window.messageSound.currentTime = 0;
        console.log('🔊 Audio system initialized on user interaction');
      }
    }
  });