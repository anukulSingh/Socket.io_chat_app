
const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const CryptoJS = require("crypto-js");

// security packages
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit")
// security packages


const { generateMessage,generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getuser, getUsersinRoom } = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000
const PublicDirectoryPath = path.join(__dirname,'../public');


// set security headers
app.use(helmet({
  contentSecurityPolicy: false
}))
// xss cleanups
app.use(xss())

// rate limiting
const limiter = rateLimit({
    windowMs: 15*60*1000, // In 15 mins, max 500 requests from an IP
    max: 500,
    delayMs: 0, // diable delays
    standardHeaders: true,
    legacyHeaders: false
})
app.use(limiter)

// prevent http param pollution
app.use(hpp())

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

    socket.emit('message', generateMessage('Admin','welcome'));
    socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined the chat !`))
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersinRoom(user.room)
    })
    callback()
  })

  socket.on('sendMessage',(message,callback) => {

    const user = getuser(socket.id)
    const decryptedMessage = CryptoJS.AES.decrypt(message, "436grdfgf5t45gr").toString(CryptoJS.enc.Utf8)
    const filter = new Filter()

    if (filter.isProfane(decryptedMessage)) {
      return callback('Profanity is not allowed');
    }
    io.to(user.room).emit('message',generateMessage(user.username,decryptedMessage));
    callback()
  })

  socket.on('sendLocation', (decryptedCoords,callback) => {
    const coords = JSON.parse(CryptoJS.AES.decrypt(decryptedCoords, "436grdfgf5t45gr").toString(CryptoJS.enc.Utf8))
    const user = getuser(socket.id)
    io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
    callback()
  })

  socket.on('disconnect',() => {

    const user = removeUser(socket.id)

    if (user) {
      io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left the chat`))
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersinRoom(user.room)
      })
    }
    
    
  })
})

server.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT} !`);
})

