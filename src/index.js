
const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');

const { generateMessage,generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getuser, getUsersinRoom } = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000
const PublicDirectoryPath = path.join(__dirname,'../public');

app.use(express.static(PublicDirectoryPath))


// socket.emit, io.emit, socket.broadcast.emit
// io.to.emit, spcket.broadcast.to.emit
io.on('connection', (socket) => {
  console.log('New webSocket connection');


  socket.on('join', (options, callback) => {

    const {error, user} = addUser({id: socket.id, ...options})

    if (error) {
      return callback(error)
    }

    socket.join(user.room)

    socket.emit('message', generateMessage('welcome'));
    socket.broadcast.to(user.room).emit('message',generateMessage(`${user.username} has joined the chat !`))

    callback()
  })

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

    const user = removeUser(socket.id)

    if (user) {
      io.to(user.room).emit('message',generateMessage(`${user.username} has left the chat`))
    }
    
    
  })
})

server.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT} !`);
})

