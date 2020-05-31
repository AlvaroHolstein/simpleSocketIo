const app = require("express")();
const http = require('http').createServer(app);
const io = require("socket.io")(http);

const port = 3000;

app.get('/', (req, res) => {
    res.send("Ata Teste");
})


io.on('connection', (socket) => {
    console.log("a user connected")

    socket.on("mess", (data) => {
        console.log("on message: " + data)
    })
    socket.on('join', (data) => {
        console.log("join: ", data);
    })

    socket.on('musicnote', data => {
        console.log("nota musical", data);

    })

    socket.on('disconnect', () => {
        console.log("disconnect")
    })
})



http.listen(port, () => {
    console.log(`Listening on ${port}`)
})