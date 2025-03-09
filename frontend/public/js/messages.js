/**
 * Message Manager - Handles messaging functionality
 */
const MessageManager = (() => {
  let currentUserId;
  let currentUserName;
  
  /**
   * Initialize the message manager
   * @param {string} userId - Current user's ID
   * @param {string} userName - Current user's name
   * @returns {boolean} - Whether initialization was successful
   */
  const initialize = (userId, userName) => {
    try {
      if (!userId || !userName) {
        console.error("MessageManager initialization failed: missing user ID or name");
        return false;
      }
      
      currentUserId = userId;
      currentUserName = userName;
      
      console.log("MessageManager initialized for user:", userName);
      return true;
    } catch (error) {
      console.error("Error initializing MessageManager:", error);
      return false;
    }
  };

  /**
   * Fetch messages for a specific contact
   * @param {string} contactId - ID of the contact to fetch messages for
   * @returns {Promise<Array>} - Array of messages
   */
  const fetchMessages = async (contactId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/messages/${contactId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const messages = await response.json();
      return messages;
    } catch (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
  };

  /**
   * Generate a room ID from two user IDs
   * @param {string} userId1 - First user ID
   * @param {string} userId2 - Second user ID
   * @returns {string} - The room ID
   */
  const getRoomId = (userId1, userId2) => {
    // Always sort the IDs to ensure both users generate the same room ID
    return [userId1, userId2].sort().join('_');
  };

  /**
   * Open a chat window with a contact
   * @param {Object} contact - The contact to chat with
   */
  const openChatWindow = (contact) => {
    // Use contact.contactId instead of contact._id - this is the actual user ID of the person
    const contactUserId = contact.contactId || contact.userId || contact._id;
    console.log("Creating chat room between users:", currentUserId, "and", contactUserId);
    
    const roomId = getRoomId(currentUserId, contactUserId);
    console.log("Generated room ID:", roomId);
    
    const chatWindow = window.open('', '_blank', 'width=400,height=500');
    
    const styleTag = chatWindow.document.createElement('style');
    styleTag.textContent = `
      .chat-window {
        background-color: #fafafa;
      }
      .chat-window h2 {
        margin: 0;
        padding: 10px;
        background-color: #f0f0f0;
        border-bottom: 1px solid #ddd;
      }
      .message {
        margin-bottom: 10px;
      }
      .message .sender {
        font-weight: bold;
      }
      .message .text {
        margin-left: 20px;
      }
    `;
    chatWindow.document.head.appendChild(styleTag);
    
    chatWindow.document.body.style.margin = 0;
    chatWindow.document.body.style.padding = 0;
    chatWindow.document.body.style.display = 'flex';
    chatWindow.document.body.style.flexDirection = 'column';
    chatWindow.document.body.style.height = '100vh';
    
    const container = chatWindow.document.createElement('div');
    container.classList.add('chat-window');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.height = '100%';
    chatWindow.document.body.appendChild(container);
    
    const header = chatWindow.document.createElement('h2');
    header.textContent = `Chat com ${contact.name}`;
    header.style.margin = 0;
    header.style.padding = '10px';
    header.style.backgroundColor = '#f0f0f0';
    header.style.borderBottom = '1px solid #ddd';
    container.appendChild(header);
    
    const messagesDiv = chatWindow.document.createElement('div');
    messagesDiv.id = 'messagesRoom';
    messagesDiv.style.flex = 1;
    messagesDiv.style.padding = '10px';
    messagesDiv.style.overflowY = 'auto';
    container.appendChild(messagesDiv);
    
    const input = chatWindow.document.createElement('input');
    input.id = 'message-input';
    input.placeholder = 'Digite uma mensagem...';
    input.style.padding = '10px';
    input.style.border = 'none';
    input.style.borderTop = '1px solid #ddd';
    input.style.width = 'calc(100% - 20px)';
    input.style.margin = '0 10px';
    input.addEventListener('keyup', function(e) {
      if (e.key === 'Enter') {
        sendMessage(roomId);
      }
    });
    container.appendChild(input);
    
    const button = chatWindow.document.createElement('button');
    button.textContent = 'Enviar';
    button.style.padding = '10px';
    button.style.border = 'none';
    button.style.backgroundColor = 'var(--primary-color)';
    button.style.color = '#fff';
    button.style.cursor = 'pointer';
    button.onclick = function() {
      sendMessage(roomId);
    };
    container.appendChild(button);
    
    // Initialize socket connection
    const socket = io('http://localhost:3000');
    
    // Use SocketManager to join the room
    if (window.SocketManager) {
      window.SocketManager.joinRoom(roomId);
    } else {
      // Fallback if SocketManager is not available
      socket.emit('joinRoom', roomId);
    }
    
    socket.on('receiveMessage', (message) => {
      console.log("Real-time message received:", message);
      
      // Only add visual notification if the message is from someone else and window is not focused
      if (message.sender !== currentUserId) {
        if (!chatWindow.document.hasFocus()) {
          header.classList.add('new-message');
          // Remove the class after animation completes
          setTimeout(() => {
            header.classList.remove('new-message');
          }, 1000);
        }
      }
      
      displayMessage(message, messagesDiv);
    });
    
    function sendMessage(rId) {
      const messageInput = chatWindow.document.getElementById('message-input');
      const messageText = messageInput.value.trim();
      if (!messageText) return;
      if (!currentUserName) {
        console.error("currentUserName is undefined");
        return;
      }
      
      // Use SocketManager to send message if available
      if (window.SocketManager) {
        window.SocketManager.sendMessage({
          room: rId,
          text: messageText,
          sender: currentUserId,
          recipient: contactUserId
        });
      } else {
        // Fallback if SocketManager is not available
        socket.emit('sendMessage', {
          room: rId,
          text: messageText,
          sender: currentUserId,
          recipient: contactUserId
        });
      }
      
      messageInput.value = '';
    }
    
    // Load previous messages
    fetchMessages(contactUserId).then(messages => {
      messages.forEach(message => {
        displayMessage(message, messagesDiv);
      });
    });
  };

  /**
   * Display a message in the chat window
   * @param {Object} message - The message to display
   * @param {HTMLElement} container - The container to display the message in
   */
  const displayMessage = (message, container) => {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    
    const senderDiv = document.createElement('div');
    senderDiv.classList.add('sender');
    senderDiv.textContent = `${message.senderName} diz:`; // Use senderName from MongoDB
    
    const textDiv = document.createElement('div');
    textDiv.classList.add('text');
    textDiv.textContent = `• ${message.text}`;
    
    messageDiv.appendChild(senderDiv);
    messageDiv.appendChild(textDiv);
    container.appendChild(messageDiv);
    
    // Scroll to the bottom after appending
    container.scrollTop = container.scrollHeight;
  };

  /**
   * Send a message
   * @param {string} roomId - The room ID
   * @param {string} text - Message text
   * @param {string} recipientId - Recipient's user ID
   * @returns {boolean} - Whether the message was sent
   */
  const sendMessage = (roomId, text, recipientId) => {
    if (!currentUserId || !currentUserName) {
      console.error("Cannot send message: User info missing");
      return false;
    }
    
    if (!text.trim()) {
      console.warn("Cannot send empty message");
      return false;
    }
    
    // Use SocketManager to send the message
    if (window.SocketManager) {
      return window.SocketManager.sendMessage({
        room: roomId,
        text: text.trim(),
        sender: currentUserId,
        recipient: recipientId
      });
    } else {
      console.error("SocketManager not available");
      return false;
    }
  };

  /**
   * Play a sound notification for a message
   * @param {Object} message - The message that triggered the notification
   */
  const playNotificationSound = (message) => {
    // Check if notifications should be muted based on user status
    if (window.StatusManager && window.StatusManager.shouldMuteNotifications()) {
      console.log(`🔇 Sound muted: user is in "ocupado" status`);
      return;
    }
    
    console.log(`🔊 Playing notification sound for message from ${message.senderName || 'Unknown'}`);
    
    try {
      // Create new audio element for this notification
      const messageSound = new Audio('../audio/message.mp3');
      
      // Clone the audio to allow multiple sounds to play simultaneously
      const soundClone = messageSound.cloneNode();
      
      // Try to play the sound
      const promise = soundClone.play();
      
      if (promise !== undefined) {
        promise.catch(error => {
          console.log('Audio playback was not allowed:', error);
        });
      }
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  };
  
  // Public API
  return {
    initialize,
    fetchMessages,
    getRoomId,
    openChatWindow,
    displayMessage,
    sendMessage,
    playNotificationSound
  };
})();

// Make MessageManager globally available
window.MessageManager = MessageManager;
