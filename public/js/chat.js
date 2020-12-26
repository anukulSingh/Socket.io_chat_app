const socket = io()

socket.on('countUpdated', (count) => {
    console.log('count updated',count);
})

document.querySelector('#inc').addEventListener('click', () => {
    console.log('clicked');
    socket.emit('increment')
})