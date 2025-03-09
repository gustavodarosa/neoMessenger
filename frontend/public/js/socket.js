/**
 * Socket Manager - Handles all socket.io related functionality
 */
const SocketManager = (() => {
  let socket;
  let currentUserId;
  const messageSound = new Audio('../audio/message.mp3');

  /**
   * Set up the socket connection for the current user
   * @param {string} userId - The current user's ID
   * @returns {Promise<boolean>} - Whether setup was successful
   */
  const setupSocketConnection = async (userId) => {
    try {
      currentUserId = userId;
      
      // Ensure we have the user ID first
      if (!currentUserId) {
        console.error("Cannot set up socket connection: No user ID available");
        return false;
      }
      
      console.log("%c Setting up socket connection for user", "color: blue; font-weight: bold", currentUserId);
      
      // Initialize Socket.io connection
      if (!socket) {
        socket = io('http://localhost:3000', {
          auth: {
            token: localStorage.getItem('token')
          }
        });
        
        // Handle connect event
        socket.on('connect', () => {
          console.log("%c Socket connected with ID:", "color: green", socket.id);
          
          // Join personal room using user's own ID - immediately after connection
          const personalRoom = `user:${currentUserId}`;
          console.log("%c Joining personal room:", "color: purple; font-weight: bold", personalRoom);
          
          socket.emit('joinPersonalRoom', currentUserId);
          
          // Initialize sound system right after joining room
          setupSoundSystem();

          // Emit user status after connection
          socket.emit('updateStatus', { status: 'online' });
        });

        // Handle reconnect event
        socket.on('reconnect', () => {
          console.log("%c Socket reconnected", "color: green");
          socket.emit('updateStatus', { status: 'online' });
        });
        
        // Set up event handlers
        setupSocketEventHandlers();
      }

      
      
      return true;
    } catch (error) {
      console.error("Error setting up socket connection:", error);
      return false;
    }
  };

  /**
   * Set up socket event handlers
   */
  const setupSocketEventHandlers = () => {
    if (!socket) return;
    
    // Handle successful room join
    socket.on('roomJoined', (data) => {
      console.log("%c Successfully joined room:", "color: green; font-weight: bold", data);

      socket.on('statusUpdate', (data) => {
        console.log("%c Status update received:", "color: purple", data);

        if (window.ContactManager && typeof window.ContactManager.updateContactStatus === 'function') {
          window.ContactManager.updateContactStatus(data.userId, data.status);
        }
      });

      socket.on('statusUpdates', (data) => {
        console.log("%c Multiple status updates received:", "color: purple", data);
        
        if (data.statuses && Array.isArray(data.statuses) && window.ContactManager) {
          data.statuses.forEach(statusInfo => {
            window.ContactManager.updateContactStatus(statusInfo.userId, statusInfo.status);
          });
        }
      });
      
      // Sound system is ready after room join confirmation
      console.log("%c Sound notification system is active", "color: green");
    });
    
    // Handle errors
    socket.on('error', (error) => {
      console.error("Socket error:", error);
    });
    
    // Handle socket disconnection
    socket.on('disconnect', () => {
      console.log("%c Socket disconnected", "color: orange");
    });
    
    // Handle personal messages (notifications)
    socket.on('personalMessage', (message) => {
      console.log("%c Personal message received in personal room:", "color: blue; font-weight: bold", message);
      
      // Play notification sound
      playNotificationSound(message);
      
      // Show desktop notifications
      if (Notification.permission === "granted") {
        const notification = new Notification("New Message", {
          body: `${message.senderName}: ${message.text}`,
          icon: "../assets/avatar.png"
        });
        
        notification.onclick = () => {
          window.focus();
          // Open chat with sender if possible
          const senderContact = document.querySelector(`.contact-item[data-contact-id="${message.sender}"]`);
          if (senderContact) {
            senderContact.click();
          }
        };
      }
      
      // If ContactManager exists, notify it
      if (window.ContactManager && typeof window.ContactManager.highlightContact === 'function') {
        window.ContactManager.highlightContact(message.sender);
      }
    });
  };

  /**
   * Set up the sound system for notifications
   */
  const setupSoundSystem = () => {
    // Ensure message sound is loaded
    messageSound.addEventListener('canplaythrough', () => {
      console.log("%c Sound file loaded successfully", "color: green");
    });
    messageSound.load();
  };

  /**
   * Play notification sound for incoming messages
   * @param {Object} message - The received message
   */
  const playNotificationSound = (message) => {
    // Get current user status
    const userStatus = document.getElementById('user-status').value;
    
    // Only mute sound if user is in "ocupado" (busy) status
    if (userStatus === 'ocupado') {
      console.log(`🔇 Sound muted: user is in "ocupado" status`);
      return;
    }
    
    console.log(`🔊 Playing notification sound for message from ${message.senderName || 'Unknown'}`);
    
    // Clone the audio to allow multiple sounds to play simultaneously
    const soundClone = messageSound.cloneNode();
    
    // Try to play the sound
    const promise = soundClone.play();
    
    if (promise !== undefined) {
      promise.catch(error => {
        console.log('Audio playback was not allowed:', error);
      });
    }
  };

  /**
   * Verify if the user is in their personal room
   */
  const verifyPersonalRoom = () => {
    if (!socket || !currentUserId) {
      console.error("Cannot verify personal room: Socket or user ID not available");
      return;
    }
    
    console.log("%c Verifying personal room membership for user:", "color: orange", currentUserId);
    socket.emit('verifyRoom', currentUserId);
    
    socket.once('roomVerification', (data) => {
      console.log("%c Room verification result:", "color: orange", data);
      
      if (!data.inRoom) {
        console.warn("%c User is not in personal room, rejoining...", "color: orange");
        socket.emit('joinPersonalRoom', currentUserId);
      } else {
        console.log("%c User is in personal room", "color: green");
      }
    });
  };

  /**
   * Join a specific chat room
   * @param {string} roomId - ID of the room to join
   */
  const joinRoom = (roomId) => {
    if (!socket) return false;
    socket.emit('joinRoom', roomId);
    return true;
  };

  /**
   * Send a message through the socket
   * @param {Object} messageData - Message data to send
   */
  const sendMessage = (messageData) => {
    if (!socket) return false;
    socket.emit('sendMessage', messageData);
    return true;
  };
  
  /**
   * Get the socket instance
   * @returns {Object|null} - The socket instance or null if not initialized
   */
  const getSocket = () => socket;

  // Public API
  return {
    setupSocketConnection,
    verifyPersonalRoom,
    joinRoom,
    sendMessage,
    getSocket
  };
})();

// Make SocketManager globally available
window.SocketManager = SocketManager;