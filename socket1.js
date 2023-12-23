const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const connectedUsers = {};

io.on('connection', (socket) => {
    socket.on('userConnected', (username) => {
      connectedUsers[socket.id] = username;
      io.emit('connectedUsers', Object.values(connectedUsers));
    });
  
    socket.on('privateMessage', (data) => {
      io.to(data.toSocketId).emit('privateMessage', {
        from: connectedUsers[socket.id],
        message: data.message,
      });
    });
  
    socket.on('disconnect', () => {
      delete connectedUsers[socket.id];
      io.emit('connectedUsers', Object.values(connectedUsers));
    });
  });

server.listen(3001, () => {
  console.log('Server is running on port 3001');
});