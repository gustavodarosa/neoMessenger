// Simple status tracking
const onlineUsers = new Map();

function setupStatusHandlers(io, socket) {
  // Handle status updates
  socket.on('updateStatus', (data) => {
    if (!data.userId) return;
    
    // Save the status
    onlineUsers.set(data.userId, {
      status: data.status,
      socketId: socket.id
    });
    
    // Tell everyone about the status change
    socket.broadcast.emit('statusUpdate', data);
  });
  
  // When someone disconnects
  socket.on('disconnect', () => {
    // Find which user disconnected
    for (const [userId, userData] of onlineUsers.entries()) {
      if (userData.socketId === socket.id) {
        // Remove them from online users
        onlineUsers.delete(userId);
        
        // Tell everyone they're offline
        io.emit('statusUpdate', {
          userId,
          status: 'offline'
        });
        break;
      }
    }
  });
}

module.exports = { setupStatusHandlers, onlineUsers };