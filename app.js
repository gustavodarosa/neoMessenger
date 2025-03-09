document.addEventListener('DOMContentLoaded', () => {
  // Initialization chain moved from app.html
  // ...initialization code...

  function setupSocketEventHandlers(socket) {
    // ...existing socket.on handlers...

    socket.on('statusUpdate', (data) => {
      console.log("%c Status update received:", "color: purple", data);
      
      // Update contact's status in UI if ContactManager exists
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
  }
});
