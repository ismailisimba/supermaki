const express = require('express');
const favicon = require('serve-favicon')
const path = require('path');
const MDBS = require("./mydirtybs");
const ws = require('ws');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');


const mydirtybs = new MDBS();
const app = express();
const port = parseInt(process.env.PORT)|| 8080;

const textParser = bodyParser.text({limit:"50mb"});






const serveStatic = require('serve-static');





app.use(favicon(path.join(__dirname, 'frontend', 'favicon.png')))
app.use("/",serveStatic('frontend', { index: ['index.html', 'index.htm'] }))







app.get("/",()=>{});
app.get("/checklogin",[cookieParser(),mydirtybs.checkIfLogIn],(req,res,next)=>{
  res.send({"useris":"in"});
});
app.get("/getUserName",[cookieParser(),mydirtybs.checkIfLogIn],mydirtybs.getBasicUserInfo);
app.get("/dashboard",[cookieParser(),mydirtybs.checkIfLogIn],(req,res,next)=>{
  res.sendFile('index.html', { root: path.join(__dirname, './dashboard') });
});
app.get("/getnotifications",[cookieParser(),mydirtybs.checkIfLogIn],mydirtybs.getNotifications);


app.post("/checksource",textParser,mydirtybs.checksource);
app.post("/login",textParser,mydirtybs.logIn);
app.post("/signup",textParser,mydirtybs.signUp);



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