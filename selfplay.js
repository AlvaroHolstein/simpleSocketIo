const sc = require("socket.io-client")('http://localhost:3001');

sc.emit("join", "almeida");
sc.on('newConnection', (data) => {\\
    console.log(data)
})

setInterval(() => {
    sc.emit('musicnote', "30:50")
}, 6000);
setInterval(() => {
    sc.emit('musicnote', '60:60')
}, 3000);
setInterval(() => {
    sc.emit('musicnote', '80:80')
}, 1000);



https://stackoverflow.com/questions/10021373/what-is-the-windows-equivalent-of-process-onsigint-in-node-js
if (process.platform === "win32") {
    var rl = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout
    });
  
    rl.on("SIGINT", function () {
      process.emit("SIGINT");
    });
  }
  
  process.on("SIGINT", function () {
    //graceful shutdown
    sc.emit("disconnect")
    console.error("sh")
    process.exit();
  });

