const server = require("express")();
const httpserver = require("http").createServer(server);
const io = require("socket.io")(httpserver);
const jzz = require("jzz");
const port = 3001;

let midiIn = jzz().openMidiIn(function () { return [2, 1, 0]; });
let midiOut = jzz().openMidiOut();

/** Primeiro "saber" se é possivel aceder ao midi do dispositivo */
jzz.requestMIDIAccess()
    .then(() => {
        console.log("Success on MIDI Access");
        io.on("connection", mainSocketFunction);
    })
    , () => console.error('Fail MIDI Access!!!!')


/** Dá para fazer isto de duas/tres maneiras
 * io.sockets.clients().lenght, mas (https://stackoverflow.com/questions/10275667/socket-io-connected-user-count)
 * por um contador (é o que está atualmente)
 * por um array local, onde a cada connection dá se push para o array e a cada disconnction faz se o splice dessa disconnection
 */
// E depois podia mandar sempre isto em vez de estar a fazer chamadas À BD...
// E aqui já dava para controlar o tempo mas.........
let totalConnectedUsers = 0;


/** Função chamada pelo socket */
function mainSocketFunction(socket) {
    //"Pingar"
    midiOut.send(jzz.MIDI([0x90, 'Eb2', 127]))
    totalConnectedUsers++;

    for(let cli in io.sockets.clients()) {
        // console.log(cli, io.sockets.clients().connected)
    }
    socket.on("join", (data) => {
        console.log("Entrou o campeão " + data+ ", já são " + totalConnectedUsers)
        /** A "flag" bradcast faz com que o emit vá para toda a gente menos para quem fez o "pedido" */
        socket.broadcast.emit('newConnection', data)
    })

    socket.on("musicnote", receiveAndPlay)

    /** Vai haver um socket listener para cada instrumento */
    socket.on("drumm", receiveAndPlay)


    

    /** Mandar para toda a gente quantos users estão disponiveis no momento */
    socket.broadcast.emit("totalUsers", totalConnectedUsers);


    socket.on("disconnect", (data) => {
        if(totalConnectedUsers>0) totalConnectedUsers--;
        console.log("Menos Um!!!", totalConnectedUsers);
    })
}


function receiveAndPlay(data) {
    let value = data.split(':');
    console.log(value, data);
    let note = Math.floor(value[0]);
    if (note > 61) note = 61
    if (note < 0) note = 0
    
    midiOut.send([0x90, note, 74]);
}

/** Para ter mais opções de teste */
server.get("/", (req, res) => {
    res.send("HOME")
})
server.get("/tocar", async (req, res) => {
    await midiOut.or('Cannot open MIDI Out port!')
        .wait(500).send(jzz.MIDI([0x90, 'Eb5', 127]))
        .wait(500).send(jzz.MIDI([0x90, 64, 127]))
        .wait(500).send([0x90, 67, 127])
        .wait(500).send([0x90, 72, 127])
        .wait(1000).send([0x90, 60, 0]).send([0x90, 64, 0]).send([0x90, 67, 0])
        .send([0x90, 72, 0])
        .and('thank you!')

    res.send("Finito")
})
/** Uma maneira de termos todos os users sem ter que estar dentro do PlayPerfomance */
server.get("/totalUsers", (req, res) => {
    res.send(totalConnectedUsers);
})
/** Fechar o concerto basicamente */
server.get("/close", async (req, res) => {
    console.log("a fechar");
    await jzz.close()
    res.send("closed")
})



httpserver.listen(port, () => {
    midiOut.or('Cannot open MIDI Out port!')
        .wait(500).send(jzz.MIDI([0x90, 'Ab4', 60]))

    setTimeout(() => {
        midiOut.allNotesOff(0);
    }, 1000) // Serve para não deixar o som prelongar se demais
    console.log("A ouvir \n port: " + port + "\n");
})