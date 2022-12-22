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

     
    }
  }



const startSession = async (action,req,bodyobj)=>{
    const obj = {};
    if(action==="login"){
        const ip = req.ip;
        const ip2 = req.headers['x-forwarded-for'] || req.socket.remoteAddress ;
        const date = customDateFormater();
        const usnum = bodyobj.usnum;
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
                   VALUES('${bodyobj.usnum}','${obj.date}','${action}','${obj.res}')
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

















  module.exports = cookieMan;