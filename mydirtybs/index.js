const crypt = require("../crypto");
const crypto = new crypt();

const {BigQuery} = require('@google-cloud/bigquery');
const bigqueryClient = new BigQuery();




class mydirtybase {
    constructor(){
        this.checksource = checksource;
        this.logIn = logIn;
    }
}


const checksource = async (req,res,next)=>{
    
var rows = {};
try{
  rows = await bigqueryClient
  .dataset("makione")
  .table("keys")
  .query(`SELECT *               
  FROM \`ismizo.makione.keys\`
  WHERE name='allkey'
  ORDER BY name NULLS LAST;`).then(r=>{
   return r;

  }).then((r)=>{
    
    const allkey = r[0][0].value;
    const bodyPlain = crypto.decrypt(req.body,allkey);
    const r2 = JSON.parse(bodyPlain);
    const obj = {};
    if(r2.usnum==="ismaadmin"){
        obj["source"] = "ok";
    }else{
        obj["source"] = "notok";
    };
    return obj;
  })
}catch(e){
  rows = {"err":"err","details":JSON.stringify(e, null, 2)};
}

    
res.send(rows);
}

const logIn = async (req,res,next)=>{
    console.log(req.body);
}




module.exports = mydirtybase;