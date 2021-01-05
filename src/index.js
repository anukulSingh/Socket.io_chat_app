
const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');

const { generateMessage,generateLocationMessage } = require('./utils/messages')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000
const PublicDirectoryPath = path.join(__dirname,'../public');

app.use(express.static(PublicDirectoryPath))



io.on('connection', (socket) => {
  console.log('New webSocket connection');

  socket.emit('message', generateMessage('welcome'));
  socket.broadcast.emit('message',generateMessage('A new user has joined!')) //emits to all except itself

  socket.on('sendMessage',(message,callback) => {
    const filter = new Filter()

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed');
    }
    io.emit('message',generateMessage(message));
    callback()
  })

  socket.on('sendLocation', (coords,callback) => {
    io.emit('locationMessage',generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
    callback()
  })

  socket.on('disconnect',() => {
    
    io.emit('message',generateMessage('A user has left!'))
  })
})

server.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT} !`);
})

