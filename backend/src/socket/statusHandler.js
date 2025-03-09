const onlineUsers = new Map();

function setupStatusHandlers(io, socket) {
  socket.on('updateStatus', (data) => {
    onlineUsers.set(data.userId, {
      status: data.status,
      socketId: socket.id,
      lastSeen: new Date()
    });
    io.emit('statusUpdate', { userId: data.userId, status: data.status });
  });

  socket.on('disconnect', () => {
    const user = Array.from(onlineUsers.entries()).find(([userId, info]) => info.socketId === socket.id);
    if (user) {
      onlineUsers.delete(user[0]);
      io.emit('statusUpdate', { userId: user[0], status: 'offline' });
    }
  });

  socket.on('checkStatuses', (data) => {
    const statuses = data.userIds.map(userId => ({
      userId,
      status: onlineUsers.get(userId)?.status || 'offline'
    }));
    socket.emit('statusUpdates', { statuses });
  });
}

module.exports = { setupStatusHandlers };