/**
 * Status Manager - Handles user status functionality
 */
const StatusManager = (() => {
  let currentStatus = 'online';
  
  /**
   * Initialize the status management
   * @returns {boolean} - Whether initialization was successful
   */
  const initialize = () => {
    try {
      const statusSelect = document.getElementById('user-status');
      const statusIndicator = document.getElementById('status-indicator');
      const avatarBorder = document.getElementById('avatar-container');
      
      if (!statusSelect || !statusIndicator || !avatarBorder) {
        console.error("Status elements not found in DOM");
        return false;
      }
      
      // Initialize status from localStorage
      const savedStatus = localStorage.getItem('userStatus') || 'online';
      statusSelect.value = savedStatus;
      updateStatusVisuals(savedStatus);
      currentStatus = savedStatus;
      
      // Handle status changes
      statusSelect.addEventListener('change', async function() {
        const newStatus = this.value;
        updateStatusVisuals(newStatus);
        currentStatus = newStatus;
        
        // Log sound notification status based on new status
        if (newStatus === 'ocupado') {
          console.log("%c Sound notifications disabled - status: ocupado", "color: orange");
        } else {
          console.log("%c Sound notifications enabled", "color: green");
        }
        
        // Save to localStorage
        localStorage.setItem('userStatus', newStatus);
        
        // Save to backend
        await saveStatusToServer(newStatus);
        
        // Emit status update via socket
        if (window.SocketManager && window.SocketManager.getSocket()) {
          window.SocketManager.getSocket().emit('updateStatus', {
            userId: window.ProfileManager.getCurrentUserId(),
            status: newStatus
          });
        }
      });
      
      return true;
    } catch (error) {
      console.error("Error initializing status manager:", error);
      return false;
    }
  };
  
  /**
   * Update the visual elements to reflect the current status
   * @param {string} status - The status to display
   */
  const updateStatusVisuals = (status) => {
    const statusIndicator = document.getElementById('status-indicator');
    const avatarBorder = document.getElementById('avatar-container');
    
    if (!statusIndicator || !avatarBorder) return;
    
    // Update the indicator color
    statusIndicator.className = 'status-indicator ' + status;
    
    // Update avatar border color
    avatarBorder.className = 'avatar-border ' + status;
  };
  
  /**
   * Save the status to the server
   * @param {string} status - The status to save
   * @returns {Promise<boolean>} - Whether the save was successful
   */
  const saveStatusToServer = async (status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/users/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        console.error('Failed to save status to server');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error saving status:', error);
      return false;
    }
  };
  
  /**
   * Get the current user status
   * @returns {string} - The current status
   */
  const getCurrentStatus = () => {
    return currentStatus;
  };
  
  /**
   * Check if notifications should be muted based on status
   * @returns {boolean} - True if notifications should be muted
   */
  const shouldMuteNotifications = () => {
    return currentStatus === 'ocupado';
  };
  
  // Public API
  return {
    initialize,
    getCurrentStatus,
    shouldMuteNotifications,
    updateStatusVisuals
  };
})();

// Make StatusManager globally available with specified methods
window.StatusManager = StatusManager;