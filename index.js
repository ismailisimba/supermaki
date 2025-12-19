const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const MDBS = require("./mydirtybs");
const cookieMan = require("./cookieMan");
const webscrap = require("./webscrap");
const frenchSchool = require("./frenchSchool");
const ws = require('ws');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const formidable = require('formidable');


const mydirtybs = new MDBS();
const cookieManager = new cookieMan();
const scrapy = new webscrap();
const frenchschoolClass = new frenchSchool();
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
app.get("/deletethisfile/:id",[cookieParser(),mydirtybs.checkIfLogIn],mydirtybs.deleteThisFile);


app.post("/updateprofile",[cookieParser(),mydirtybs.checkIfLogIn,(req,res,next)=>{
  var form = new formidable.IncomingForm({multiples:Infinity,maxFileSize:135*1024*1024,maxFieldsSize:135*1024*1024})
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
app.post("/autosearchsql",[textParser,],async(req,res,next)=>{
  try{
    const bodyobj = JSON.parse(req.body);
    const queryResults = mydirtybs.generateSQLQuery(bodyobj);
    res.send(queryResults);
}catch(e){
    res.send(e);
}

})

app.post("/alliancepdf1",textParser,(req,res,next)=>{
  const form = new formidable.IncomingForm({multiples:Infinity,maxFileSize:135*1024*1024,maxFieldsSize:135*1024*1024})
  form.parse(req, async function(err, fields, files) {
      if(err){
        res.send({"file":"tooBig"})
      }else{
        scrapy.pdfFunc({fields:fields},res,next);
      }  
  });
});
app.get("/getalliancepdf/:id",scrapy.getalliancepdf);

app.get("/scrap/:id",textParser,scrapy.geturl);
app.get("/oldscrap/:id",textParser,scrapy.getoldscraps);
app.get("/getscrap/:id",textParser,scrapy.getscrap);
app.get("/comparescrap/:url/:picUrl",textParser,scrapy.comparescraps)




// ROUTE: French School Fee Calculator
app.post("/french-school-pdf", (req, res, next) => {
    // IMPORTANT: Do NOT use bodyParser on routes that use formidable
    const form = new formidable.IncomingForm();
    
    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Form parsing error");
        }

        try {
            const data = {
                parentName: Array.isArray(fields.parentName) ? fields.parentName[0] : fields.parentName,
                address: Array.isArray(fields.address) ? fields.address[0] : fields.address,
                phone: Array.isArray(fields.phone) ? fields.phone[0] : fields.phone || "",
                email: Array.isArray(fields.email) ? fields.email[0] : fields.email,
                existingChildren: parseInt(Array.isArray(fields.existingChildren) ? fields.existingChildren[0] : fields.existingChildren),
                schoolYear: Array.isArray(fields.schoolYear) ? fields.schoolYear[0] : fields.schoolYear,
                nationality: Array.isArray(fields.nationality) ? fields.nationality[0] : fields.nationality, 
            };

            const calculations = frenchschoolClass.calculateFrenchSchoolFees(data);
            const htmlContent = frenchschoolClass.generateInvoiceHTML(data, calculations);
            const pdfData = await frenchschoolClass.pdfFunc(htmlContent, null);

            // --- THE FIX ---
            // 1. Convert the Uint8Array to a proper Node.js Buffer to be safe.
            const pdfBuffer = Buffer.from(pdfData);

            // 2. Set all necessary headers for a file download.
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="Proforma_Invoice.pdf"');
            res.setHeader('Content-Length', pdfBuffer.length);

            // 3. Use res.end() for sending raw buffers to prevent any further processing.
            res.end(pdfBuffer);

        } catch (e) {
            console.error("PDF Generation Error:", e);
            res.status(500).send("Error generating PDF");
        }
    });
});





app.get("/getendpointlist",[cookieParser(),mydirtybs.checkIfLogIn],(req,res,next)=>{
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Routes registered directly on the application
      routes.push({
        method: Object.keys(middleware.route.methods)[0].toUpperCase(),
        path: middleware.route.path,
      });
    } else if (middleware.name === 'router') {
      // Routes registered on routers (like router.get, router.post, etc.)
      middleware.handle.stack.forEach((handler) => {
        routes.push({
          method: Object.keys(handler.route.methods)[0].toUpperCase(),
          path: middleware.regexp.toString(),
        });
      });
    }
  });
  res.send(routes);
});



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