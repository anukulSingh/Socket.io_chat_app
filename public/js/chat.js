const socket = io()

socket.on('message',(message) => {
    console.log(message);
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const message = e.target.elements.message.value;

    socket.emit('sendMessage',message);
})
document.querySelector('#send-location').addEventListener('click',() => {
    if (!navigator.geolocation) {
        return alert('Your browser dose not support geolocation!');
    }
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation',{
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
        })
    })
    
})