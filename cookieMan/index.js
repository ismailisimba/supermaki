const crypt = require("../crypto");
const crypto = new crypt();
const {BigQuery} = require('@google-cloud/bigquery');
const bigqueryClient = new BigQuery();

class cookieMan {
    constructor(){
        this.startSession = startSession
        this.customDateFormater = customDateFormater;
        this.getMasterKey = getMasterKey;
        this.makeACookie = makeACookie;
        this.getThisCookie = getThisCookie;
        this.getPersKey = getPersKey;
        this.ipCheck = ipCheck;

     
    }
  }



const startSession = async (action,req,uniqusnum)=>{
    const obj = {};
    if(action==="login"){
        const ip = req.ip;
        const ip2 = req.headers['x-forwarded-for'] || req.socket.remoteAddress ;
        const date = customDateFormater();
        const usnum = uniqusnum;
        obj["res"] = await makeACookie(ip,ip2,usnum,action,date);
        obj.ip = ip;
        obj.ip2 = ip2;
        obj.date = JSON.stringify(date);
    }

    options ={
        // Specify a job configuration to set optional job resource properties.
        configuration: {
          query: {
            query: `INSERT ismizo.makione.sessions
                   (Username,Time,Action,cookieVal)
                   VALUES('${uniqusnum}','${obj.date}','${action}','${obj.res}')
                  `,
            useLegacySql: false,
          },
          labels: {'example-label': 'example-value'},
        },
      };
     
      // Make API request.
      const response = await bigqueryClient.createJob(options);
      const job = response[0];
     
      // Wait for the query to finish
      const [rows] = await job.getQueryResults(job);
      obj["r"] = rows;
 
     return obj.res;
}

async function makeACookie(ip,ip2,username,action,date){
    const bodyObj = {};
    bodyObj["date"] = date
    bodyObj["ipadd"] = ip;
    bodyObj["ipaddf"] = ip2;
    bodyObj["user"] = username;
    bodyObj["action"] = action;
    const publBod = crypto.encrypt(JSON.stringify(bodyObj), await getMasterKey())
    return publBod;
  }


const customDateFormater = () =>{
    Date.prototype.toDateInputValue = (function() {
        var local = new Date(this);
        local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
        return local.toJSON();
    });
    const dateVar = new Date().toDateInputValue().toString();
    const year = dateVar.slice(0,4);
    const month = dateVar.slice(5,7);
    const day = dateVar.slice(8,10);
    const hour = dateVar.slice(11,13);
    const minute = dateVar.slice(14,16);
    const second = dateVar.slice(17,23);
    const tzone = dateVar.slice(10,11) + dateVar.slice(23,24);
    const dateVal = {year,month,day,hour,minute,second,tzone};
    return dateVal;
}



const getMasterKey = async ()=>{
    
    var rows = {};
    try{
        rows = await bigqueryClient
        .dataset("makione")
        .table("keys")
        .query(`SELECT *               
        FROM \`ismizo.makione.keys\`
        WHERE name='masterkey'
        ORDER BY name NULLS LAST;`).then(r=>{
        return r;

    }).then((r)=>{
        const allkey = r[0][0].value;
        return allkey;
    })
    }catch(e){
        rows = {"err":"err","details":JSON.stringify(e, null, 2)};
    }
        
    return rows;
}

const getPersKey = async (u)=>{
    
  var rows = {};
  try{
      rows = await bigqueryClient
      .dataset("makione")
      .table("keys")
      .query(`SELECT passEncry               
      FROM \`ismizo.makione.users\`
      WHERE Username='${u}'
      ORDER BY Username NULLS LAST;`).then(r=>{
      return r;
  }).then((r)=>{
    const allkey = r[0][0].passEncry;
    return allkey;
})
  }catch(e){
      rows = {"err":"err","details":JSON.stringify(e, null, 2)};
  }
      
  return rows;
}


const getThisCookie = async (cookieVal)=>{
    
  var rows = {};
  try{
      rows = await bigqueryClient
      .dataset("makione")
      .table("sessions")
      .query(`SELECT *               
      FROM \`ismizo.makione.sessions\`
      WHERE cookieVal='${cookieVal}'
      ORDER BY Username NULLS LAST;`).then(r=>{
      return r;

  }).then((r)=>{
      const allkey = r[0][0].cookieVal;
      return allkey;
  })
  }catch(e){
      rows = {"err":"err","details":JSON.stringify(e, null, 2)};
  }
      
  return rows;
}


const ipCheck = (req,res,next)=>{
  const origin = checkRequestOrigin(req);
    const corsWhitelist = [
      'https://ismailisimba.github.io',
      'http://127.0.0.1:5050',
      'http://127.0.0.1:8080',
      'https://expresstoo-jzam6yvx3q-ez.a.run.app',
      'https://script.google.com',
      'https://storage.googleapis.com',
      'http://localhost:8080',
      'https://agamis-jzam6yvx3q-ez.a.run.app',
      'ismailisimba.github.io',
      '127.0.0.1:5050',
      '127.0.0.1:8080',
      'localhost:8080',
      'expresstoo-jzam6yvx3q-ez.a.run.app',
      'agamis-jzam6yvx3q-ez.a.run.app',
      'script.google.com',
      'storage.googleapis.com',
  ];
  if (corsWhitelist.indexOf(origin) !== -1) {
      res.append('Access-Control-Allow-Origin', origin);
      res.append('Access-Control-Allow-Headers','x-requested-with, Content-Type, origin, authorization, accept, client-security-token');
      res.append('Access-Control-Allow-Credentials','true');
      res.append('Access-Control-Allow-Methods', 'POST, GET');
      res.append('sec-fetch-site', 'cross-site');
      console.log("Fetch origin recognized and headers set")
      next();
  }else if(origin.includes("googleusercontent.com")){
    res.append('Access-Control-Allow-Origin', "*");
    res.append('Access-Control-Allow-Headers','x-requested-with, Content-Type, origin, authorization, accept, client-security-token');
    res.append('Access-Control-Allow-Credentials','true');
    res.append('Access-Control-Allow-Methods', 'POST, GET');
    res.append('sec-fetch-site', 'cross-site');
    console.log("Fetch from "+origin+" is provisionally recognized")
    next();

  }else{
    console.log("Fetch from "+origin+" is not recognized")
    res.send(`<h1>Please access this website from <a href="https://expresstoo-jzam6yvx3q-ez.a.run.app/" target="_blank">this link.</a></h1>`)
  }  
}

function checkRequestOrigin(req){
  const obj = {};
  if(typeof req.headers.origin!=="undefined"){
    obj.val = req.headers.origin;
  }else if(typeof req.headers.host!=="undefined"){
    obj.val = req.headers.host;
  }else{
    obj.val = "undefined";
    console.log("We could not read the source from header");
    console.log(req.headers);
  }
  return obj.val;
}














  module.exports = cookieMan;