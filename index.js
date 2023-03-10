const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const MDBS = require("./mydirtybs");
const cookieMan = require("./cookieMan");
const ws = require('ws');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const formidable = require('formidable');

const mydirtybs = new MDBS();
const cookieManager = new cookieMan();
const app = express();
const port = parseInt(process.env.PORT)|| 8080;

const textParser = bodyParser.text({limit:"35mb"});
const serveStatic = require('serve-static');


app.get("*",(req,res,next)=>{
  cookieManager.ipCheck(req,res,next);
});
app.post("*",(req,res,next)=>{
  cookieManager.ipCheck(req,res,next);
});


app.use(favicon(path.join(__dirname, 'frontend', 'favicon.png')))
app.use("/",serveStatic('frontend', { index: ['index.html', 'index.htm'] }))







app.get("/checklogin",[cookieParser(),mydirtybs.checkIfLogIn],(req,res,next)=>{
  res.send({"useris":"in"});
});
app.get("/getUserName",[cookieParser(),mydirtybs.checkIfLogIn],mydirtybs.getBasicUserInfo);
app.get("/dashboard",[cookieParser(),mydirtybs.checkIfLogIn],(req,res,next)=>{
  res.sendFile('index.html', { root: path.join(__dirname, './dashboard') });
});
app.get("/getnotifications",[cookieParser(),mydirtybs.checkIfLogIn],mydirtybs.getNotifications);
app.get("/getfile/:id",[cookieParser()],mydirtybs.getFilePubl);
app.get("/getmetadata/:id",[cookieParser()],mydirtybs.getFileMeta);


app.post("/updateprofile",[cookieParser(),mydirtybs.checkIfLogIn,(req,res,next)=>{
  var form = new formidable.IncomingForm({multiples:Infinity,maxFileSize:35*1024*1024,maxFieldsSize:35*1024*1024})
  form.parse(req, async function(err, fields, files) {
    const x = await mydirtybs.checkIfLogInToo(req.cookies.makiCookie);
    if(x.ans==="no"){
      res.send("<h1>Please log in</h1>")
    }else{
      if(err){
        res.send({"file":"tooBig"})
      }else{
        mydirtybs.updateProfile({fields:fields},res,next);
      }
    }
    
  });
}]);


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