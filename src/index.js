
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

let count = 0;

io.on('connection', (socket) => {
  console.log('New webSocket connection');
  socket.emit('countUpdated', count)

  socket.on('increment',() => {
    count++;
    //socket.emit('countUpdated', count) //emits event to only that connection
    io.emit('countUpdated', count) //emits event to everry connection
  })
})

server.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT} !`);
})

