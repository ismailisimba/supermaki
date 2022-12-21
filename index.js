const express = require('express');
const MDBS = require("./mydirtybs");
const ws = require('ws');
const bodyParser = require('body-parser');


const mydirtybs = new MDBS();
const app = express();
const port = parseInt(process.env.PORT)|| 8080;

const textParser = bodyParser.text({limit:"50mb"});






const serveStatic = require('serve-static');

app.use(serveStatic('frontend', { index: ['index.html', 'index.htm'] }))








app.get("/",()=>{});

app.post("/checksource",textParser,mydirtybs.checksource);
app.post("/login",textParser,mydirtybs.logIn);
app.post("/signup",textParser,mydirtybs.signUp);
app.get("/dashboard",textParser,()=>{});


const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', socket => {
  socket.on('message', function message(data) {
    console.log('received: %s', data);
    socket.send("Roger, Roger, Roger, Roger!"+`
    You said: ${data}`);
  });
});



const server = app.listen(port,() => {
    console.log(`helloworld: listening on port ${port}`);
  });
server.on('upgrade', (request, socket, head) => {
    console.log("Websocket upgraded...")
    console.log("   ")
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});