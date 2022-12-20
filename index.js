const express = require('express');
const ws = require('ws');

const app = express();
const port = parseInt(process.env.PORT)|| 8080;






const serveStatic = require('serve-static');

app.use(serveStatic('frontend', { index: ['index.html', 'index.htm'] }))

app.get("/",()=>{});


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