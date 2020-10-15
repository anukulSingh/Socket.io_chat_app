
const express = require('express');
const http = require('http');
const app = express();

const connect = http.createServer(app);

const io = require('socket.io')(connect)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
});

io.on('connection', (socket) => {
   socket.on('chat message', (msg) => {
       console.log(`message: ${msg}`);
   })
})

connect.listen(3000, () => {
  console.log('Server running...');
});