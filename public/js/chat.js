const socket = io()

//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    // new message element
    const $newMessage = $messages.lastElementChild

    // get the height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    // visible height
    const visibleHeight = $messages.offsetHeight

    // height of message scontainer
    const containerHeight = $messages.scrollHeight

    // how far I have scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('#emoji-button');
    const picker = new EmojiButton();
    picker.on('emoji', emoji => {
      document.querySelector('#message-input').value += emoji;
    });
    button.addEventListener('click', () => {
      picker.pickerVisible ? picker.hidePicker() : picker.showPicker(button);
    });
});

socket.on('message',(message) => {
    const decryptedText = CryptoJS.AES.decrypt(message.text, "436grdfgf5t45gr").toString(CryptoJS.enc.Utf8)

    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: decryptedText,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (message) => {
    const coords = JSON.parse(CryptoJS.AES.decrypt(message.url, "436grdfgf5t45gr").toString(CryptoJS.enc.Utf8))
    const url = `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({room, users}) => {
   const html = Mustache.render(sidebarTemplate, {
       room,
       users
   })
   document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    $messageFormButton.setAttribute('disabled', 'disabled')

    //disabled button
    const message = e.target.elements.message.value;
    const ciphertext = CryptoJS.AES.encrypt(message, "436grdfgf5t45gr").toString();

    socket.emit('sendMessage',ciphertext, (error) => {
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
        const locationdata = {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
        }
        const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(locationdata), "436grdfgf5t45gr").toString();
        socket.emit('sendLocation', ciphertext, () => {
            $locationButton.removeAttribute('disabled')
            console.log('Location shared..');
        })
    })
    
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})