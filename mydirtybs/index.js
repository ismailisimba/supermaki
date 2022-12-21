const crypt = require("../crypto");
const crypto = new crypt();

const {BigQuery} = require('@google-cloud/bigquery');
const cookieMan = require("../cookieMan");
const cookieManager = new cookieMan();
const bigqueryClient = new BigQuery();




class mydirtybase {
    constructor(){
        this.checksource = checksource;
        this.logIn = logIn;
        this.signUp = signUp;
        this.addUser = addUser;
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
    const obj = JSON.parse(req.body);
    const ans = {};
    const userAvailability = await findUser(obj.usnum,obj.usnum);
    if(userAvailability.rows[0] &&userAvailability.rows[0].passEncry||userAvailability.rows2[0] && userAvailability.rows2[0].passEncry){
        ans["user"]="isregistered";
        const passEncry = userAvailability.rows[0] && userAvailability.rows[0].passEncry ? userAvailability.rows[0].passEncry:userAvailability.rows2[0].passEncry;
        ans["pass"] = crypto.decrypt(passEncry,obj.uspass);
            if(ans.pass){
                ans.pass = JSON.parse(ans.pass);
                if(ans.pass.usnum===obj.usnum||ans.pass.email===obj.usnum){
                    ans.pass = await cookieManager.startSession("login",req,obj);
                    res.cookie('makiCookie',ans.pass, { maxAge: 28800000, httpOnly: true,sameSite:"none",secure:true,overwrite: true });
                    ans["stat"]="in";
                }else{
                    ans.pass = "failed";
                }
            }else{
                ans.pass ="failed";
            }
    }else{
        ans["user"]="isnotregistered";
    }
    res.send(ans)
}

const signUp = async (req,res,next)=>{
    const obj = JSON.parse(req.body);
    const ans = {};
    const key = crypto.encrypt(JSON.stringify(obj),obj.uspass);
    const userAvailability = await findUser(obj.usnum,obj.email);
    if(userAvailability.rows[0] &&userAvailability.rows[0].passEncry||userAvailability.rows2[0] && userAvailability.rows2[0].passEncry){
        ans["user"]="isregistered";
    }else{
        ans["user"]="isnotregistered";
        ans["wtntx"] = await addUser(obj.usnum,key,obj.email);
    }
   
    res.send(ans);
}


async function addUser(username,key,email){
      options ={
       // Specify a job configuration to set optional job resource properties.
       configuration: {
         query: {
           query: `INSERT ismizo.makione.users
                  (Username,email, passEncry)
                  VALUES('${username}','${email}','${key}')
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
    

    return rows;
    }


async function findUser(username,email){
        options = {
         // Specify a job configuration to set optional job resource properties.
         configuration: {
           query: {
             query: `SELECT *                 
                    FROM \`ismizo.makione.users\`
                    WHERE Username='${username}'`,
             useLegacySql: false,
           },
           labels: {'example-label': 'example-value'},
         },
       };

       options2 = {
        // Specify a job configuration to set optional job resource properties.
        configuration: {
          query: {
            query: `SELECT *                 
                   FROM \`ismizo.makione.users\`
                   WHERE email='${email}'`,
            useLegacySql: false,
          },
          labels: {'example-label': 'example-value'},
        },
      };
     
       // Make API request.
       const response = await bigqueryClient.createJob(options);
       const response2 = await bigqueryClient.createJob(options2);
       const job = response[0];
       const job2 = response2[0];
     
       // Wait for the query to finish
       const [rows] = await job.getQueryResults(job);
       const [rows2] = await job2.getQueryResults(job2)
     return {rows,rows2};
    }




module.exports = mydirtybase;