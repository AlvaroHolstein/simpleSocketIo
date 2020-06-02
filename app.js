const server = require("express")();
const httpserver = require("http").createServer(server);
const io = require("socket.io")(httpserver);
const jzz = require("jzz");
const port = 3001;

let midiIn = jzz().openMidiIn(function(){ return [2, 1, 0]; });
let midiOut = jzz().openMidiOut();

jzz.requestMIDIAccess()
.then(() => {
    console.log("Success on MIDI Access");
})
,() => console.error('Fail MIDI Access!!!!')

server.get("/", (req, res) => {
    res.send("ATRa")
})

// kinda que estava a funcionar
server.get("/tocar", async (req, res) => {
    await midiOut.or('Cannot open MIDI Out port!')
    .wait(500).send(jzz.MIDI([0x90, 'Eb5', 127]))
    .wait(500).send(jzz.MIDI([0x90,64,127]))
    .wait(500).send([0x90,67,127])
    .wait(500).send([0x90,72,127])
    .wait(1000).send([0x90,60,0]).send([0x90,64,0]).send([0x90,67,0])
    .send([0x90,72,0])
    .and('thank you!')

    res.send("Finito")
})

io.on("connection", (socket) => {
    //"Pingar"
    midiOut.send(jzz.MIDI([0x90, 'Eb5', 127]))

    socket.on("musicnote", (data) => {
        let value = data.split(':');
        console.log(value, data);
        if(value[0] > 61) value[0] = 61
        if(value[0] < 0) value[0] = 0
        midiOut.send([0x90, value[0], 74]);
    })
})

server.get("/close", async (req, res) => {
    console.log("a fechar");
    await jzz.close()
    res.send("closed")
})
httpserver.listen(port, () => {
    console.log("A ouvir \n port: " + port + "\n");
})