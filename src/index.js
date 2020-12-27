
const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000
const PublicDirectoryPath = path.join(__dirname,'../public');

app.use(express.static(PublicDirectoryPath))



io.on('connection', (socket) => {
  console.log('New webSocket connection');

  socket.emit('message','Welcome!');
  socket.broadcast.emit('message','A new user has joined!')

  socket.on('sendMessage',(message) => {
    io.emit('message',message);
  })

  socket.on('sendLocation', (coords) => {
    io.emit('message',`https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
  })

  socket.on('disconnect',() => {
    
    io.emit('message','A user has left!')
  })
})

server.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT} !`);
})

