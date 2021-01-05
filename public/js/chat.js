const socket = io()

//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML

socket.on('message',(message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        message
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    $messageFormButton.setAttribute('disabled', 'disabled')

    //disabled button
    const message = e.target.elements.message.value;

    socket.emit('sendMessage',message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        //enable
        if (error) {
            return console.log(error);
        }
        console.log('message delivered');
    });
})
$locationButton.addEventListener('click',() => {
    if (!navigator.geolocation) {
        return alert('Your browser dose not support geolocation!');
    }

    $locationButton.setAttribute('disabled', 'disabled')


    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation',{
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
        }, () => {
            $locationButton.removeAttribute('disabled')
            console.log('Location shared..');
        })
    })
    
})