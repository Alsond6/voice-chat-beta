const express = require('express');
const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server);

const port = process.env.port || "5000";

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded());

app.use('/peerjs', peerServer);
app.get('/', (req, res) => {
    res.render('index');
});

app.post('/', async (req, res) => {
    const roomId = await req.body.room_id;
    res.redirect(`/${roomId}`);
    console.log(roomId);
});

app.get('/:room', (req, res) => {
    res.render("room", {roomId: req.params.room});
});

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected',userId);
        })
    })
})

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});