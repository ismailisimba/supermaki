const crypt = require("../crypto");
const crypto = new crypt();

const {BigQuery} = require('@google-cloud/bigquery');
const cookieMan = require("../cookieMan");
const cookieManager = new cookieMan();
const bigqueryClient = new BigQuery();
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const myBucket = storage.bucket('makiv1');






class mydirtybase {
    constructor(){
        this.checksource = checksource;
        this.logIn = logIn;
        this.signUp = signUp;
        this.addUser = addUser;
        this.checkIfLogIn = checkIfLogIn;
        this.getBasicUserInfo = getBasicUserInfo;
        this.getNotifications = getNotifications;
        this.updateProfile = updateProfile;
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
                    ans.pass = await cookieManager.startSession("login",req,ans.pass.usnum);
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

const checkIfLogIn = async (req,res,next)=>{
    const msg = crypto.decrypt(req.cookies.makiCookie, await cookieManager.getMasterKey());
    const nMsg = msg==undefined?{"useris":"notin"}:JSON.parse(msg);
    if(nMsg&&nMsg.user){
        const onCook = await cookieManager.getThisCookie(req.cookies.makiCookie);
        if(onCook===req.cookies.makiCookie){
            res.locals.plainCookie = nMsg;
            next();
        }else{
            res.redirect("/");
        }
    }else{
        res.redirect("/")
    }
}

const getBasicUserInfo = async(req,res,next)=>{
    const username = res.locals.plainCookie.user;
    const userDetails = await findUser(username,username);
    const base = {}


    if(userDetails.rows[0]&&userDetails.rows[0].FirstName||userDetails.rows[0].FirstName==null){
        base.Info ={
            "firstName":userDetails.rows[0].FirstName,
            "lastName":userDetails.rows[0].LastName,
            "username":userDetails.rows[0].Username,
            "files":userDetails.rows[0].files,
            "thumbnail":userDetails.rows[0].thumbnail,
            "email":userDetails.rows[0].email,
        }

    }else{
        base.Info ={
            "firstName":userDetails.rows2[0].FirstName,
            "lastName":userDetails.rows2[0].LastName,
            "username":userDetails.rows2[0].Username,
            "email":userDetails.rows2[0].email,
            "files":userDetails.rows2[0].files,
            "thumbnail":userDetails.rows2[0].thumbnail,
        }

    }
    res.send(base);
}

const getNotifications = async(req,res,next)=>{
    options = {
        // Specify a job configuration to set optional job resource properties.
        configuration: {
          query: {
            query: `SELECT *                 
            FROM \`ismizo.makione.messages\`
            WHERE  type='notiMsg' AND subcsribers LIKE '%${res.locals.plainCookie.user}%'`,
            useLegacySql: false,
          },
          labels: {'example-label': 'example-value'},
        },
      };

      const response = await bigqueryClient.createJob(options);
       const job = response[0];
     
       // Wait for the query to finish
       const [rows] = await job.getQueryResults(job);
       const arr = [];
       for(let i=0;i<rows.length;i++){
        arr.push(rows[i])
       }
       res.send(arr);
}

const updateProfile = async(req,res,next)=>{
    const obj = JSON.parse(req.fields.inputs);
    const file = await uploadFile(obj[0],res);
    const fName = obj[1].obj;
    const lName = obj[2].obj;
    const uName = obj[3].obj;
    const email = obj[4].obj;
    console.log(file,fName,lName,uName,email)
    //res.send({"useris":"updates"});
}


const uploadFile =async (obj,res)=>{
    const imgObj = obj.obj
    const metadata = {
        contentType: 'application/x-font-ttf',
        metadata: {
          incarindex: 'custom',
          ogname: 'go here'
        }};
    const arr = [0,0,0,0,0,0,0,0];
    for(let i=0;i<arr.length;i++){
        arr[i]= parseInt(Math.random()*9,10);
    }
    const prfx = arrToString(shuffle(arr));
    const date = cookieManager.customDateFormater();
    const usnum = res.locals.plainCookie.user;
    const filename = prfx+date.year+date.month+date.day+date.hour+date.minute+usnum;
    const safename = crypto.encrypt(filename, await cookieManager.getPersKey(usnum));
    imgObj.webname = safename;
    const file = myBucket.file(safename);
    const x = await file.save(Buffer.from(imgObj.fileDataB64.split(",")[1],"base64"), {
        contentType: imgObj.fileMime,
        resumable: false,
      }).then(()=>{
        imgObj.fileDataB64 = "uploadedSuccesfully";
        imgObj.url = file.publicUrl();
        metadata.contentType = imgObj.meme;
        metadata.metadata.ogname = imgObj.fileName;
        metadata.metadata.uniqname = imgObj.webname;
        metadata.metadata.url = imgObj.url;
        file.setMetadata(metadata, function(err, apiResponse) {
          if(err){
            console.log(err);
          }else{
          }
        })
        return imgObj;
    })
    return x;
}


function shuffle(array) {
    var tmp, current, top = array.length;
    if(top) while(--top) {
      current = Math.floor(Math.random() * (top + 1));
      tmp = array[current];
      array[current] = array[top];
      array[top] = tmp;
    }
    return array;
  }

  function arrToString(array){
    var str = "";
    for(let z=0;z<array.length;z++){
        str = str + array[z].toString();
    }
    return str;
  }


module.exports = mydirtybase;