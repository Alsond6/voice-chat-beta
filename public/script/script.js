const socket = io('/');
const myPeer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '5000'
})

const constraints = {
    'video': false,
    'audio': true
}
const audioGrid = document.getElementById("audio-grid");
const myAudio = document.createElement('audio');

const userDiv = document.createElement('div');

const peers = {}

navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
        addAudioStream(myAudio, userDiv, stream);

        myPeer.on('call', call => {
            call.answer(stream);

            const audio = document.createElement('audio');
            const userDiv = document.createElement('div');

            call.on('stream', userVideoStream => {
                addAudioStream(audio, userDiv, userVideoStream);
            })
        })

        socket.on('user-connected', userId => {
            connectToNewUser(userId, stream);
        })
    })
    .catch(error => {
        console.log('Error', error);
    })

socket.on('user-disconnected', userId => {
    if (peers[userId])
        peers[userId].close()
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
})

function connectToNewUser(userId, stream){
    const call = myPeer.call(userId, stream);
    const audio = document.createElement('audio');
    const userDiv = document.createElement('div');

    call.on('stream', userVideoStream => {
        addAudioStream(audio, userDiv, userVideoStream)
    })

    call.on('close', () => {
        userDiv.remove();
    })

    peers[userId] = call;
}

function addAudioStream(audio, div, stream){
    audio.srcObject = stream;
    div.classList.add('user-div');
    audio.addEventListener('loadedmetadata', () => {
        audio.play();
    })
    div.append(audio);
    audioGrid.append(div);
}