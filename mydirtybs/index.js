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
        this.checkIfLogInToo = checkIfLogInToo;
        this.getBasicUserInfo = getBasicUserInfo;
        this.getNotifications = getNotifications;
        this.updateProfile = updateProfile;
        this.getFilePubl = getFilePubl;
        this.getFileMeta = getFileMeta;
        this.deleteThisFile = deleteThisFile;
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

const checkIfLogInToo = async (cookie)=>{
    const msg = crypto.decrypt(cookie, await cookieManager.getMasterKey());
    const nMsg = msg==undefined?{"useris":"notin"}:JSON.parse(msg);
    const obj ={};
    if(nMsg&&nMsg.user){
        const onCook = await cookieManager.getThisCookie(cookie);
        if(onCook===cookie){
            obj.ans = nMsg.user;
        }else{
            obj.ans = "no";
        }
    }else{
        obj.ans = "no"
    }
    return obj;
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

const updateProfile = async(f,res,next)=>{
    const obj = JSON.parse(f.fields.inputs);
    const uName = res.locals.plainCookie.user;
    const fName = obj.firstName;
    const lName = obj.lastName;
    const email = obj.email;
    const iPic = obj.inputPic;
    const numOfItems = obj.length;

    updateFirstName(fName,uName);
    updateLastName(lName,uName);
    if(iPic&& typeof iPic !== "undefined"){updateProfilePic(iPic,res)}else{};
     
   
    res.send({"is":"updated"})
}

const updateFirstName = (fName,uName)=>{
  const options = {
    // Specify a job configuration to set optional job resource properties.
    configuration: {
      query: {
        query: `UPDATE ismizo.makione.users
     SET FirstName = '${fName}'
     WHERE Username = '${uName}' 
   `,
        useLegacySql: false,
      },
      labels: {'example-label': 'example-value'},
    },
  };
  doDataJob(options)
}

const updateLastName = (fName,uName)=>{
  const options = {
    // Specify a job configuration to set optional job resource properties.
    configuration: {
      query: {
        query: `UPDATE ismizo.makione.users
     SET LastName = '${fName}'
     WHERE Username = '${uName}' 
   `,
        useLegacySql: false,
      },
      labels: {'example-label': 'example-value'},
    },
  };
  doDataJob(options);
}

const updateProfilePic = async(obj,res)=>{
    const file = await uploadFile(obj,res,"profpic");
    const uName = res.locals.plainCookie.user;
    updateUserFileList(uName,file);
  const options = {
    // Specify a job configuration to set optional job resource properties.
    configuration: {
      query: {
        query: `UPDATE ismizo.makione.users
     SET thumbnail ='${file.publUrL}'
     WHERE Username = '${uName}' 
   `,
        useLegacySql: false,
      },
      labels: {'example-label': 'example-value'},
    },
  };
  doDataJob(options);
}


const doDataJob = async(options,next=()=>{})=>{
  const response = await bigqueryClient.createJob(options);
  const job = response[0];   
  // Wait for the query to finish
  const [rows] = await job.getQueryResults(job);
    
} 

const getFilePubl =  async(req,res,next) =>{
    const file = myBucket.file(req.params.id);
    const meta = await file.getMetadata().then(function(data) {
        const metadata = data[0];
        const apiResponse = data[1];
        return metadata;
      });
      if(meta.metadata.genaccess==="public"){
        const fileData = await file.download().then(function(data) {
            const contents = data[0];
            return contents;
          }).catch(e=>{
            console.log(e);
          });
          res.set('Content-Disposition', `inline; filename="${meta.metadata.ogname}"`);
          res.contentType(`${meta.contentType}`);
          res.send(fileData);

      }else if(req.cookies.makiCookie){
        const ans = await  checkIfLogInToo(req.cookies.makiCookie);
        if(ans.ans!=="no"&&ans.ans===meta.metadata.owner){
            const fileData = await file.download().then(function(data) {
                const contents = data[0];
                return contents;
              }).catch(e=>{
                console.log(e);
              });
              res.set('Content-Disposition', `inline; filename="${meta.metadata.ogname}"`);
              res.contentType(`${meta.contentType}`);
              res.send(fileData);
            
        }else{
            res.send(`<h2 style="display:block;position:relative;margin:0 auto;color:red;font-size:42px">You have no permission to view this file.</h2>`)
        }

      }else{
        res.send(`<h2 style="display:block;position:relative;margin:0 auto;color:red;font-size:42px">Please log in to view this file.</h2>`);
      }

}

const getFileMeta =  async(req,res,next) =>{
  const file = myBucket.file(req.params.id);
  const meta = await file.getMetadata().then(function(data) {
      const metadata = data[0];
      const apiResponse = data[1];
      return metadata;
    });
    meta.metadata.inaccess = "***";
    res.send(meta);
}


const deleteThisFile =  async(req,res,next) =>{
  const file = myBucket.file(req.params.id);
  const meta = await file.getMetadata().then(function(data) {
      const metadata = data[0];
      return metadata;
    });

    if(meta.metadata.owner===res.locals.plainCookie.user){
      await deleteThisUserFile(meta.metadata.owner,req.params.id)
      res.send("Deleted...");
    }else{
      res.send("No permission...");
    }
}


const deleteThisUserFile = async (user,file)=>{
  //console.log({user,file});
  //get the current user file list
  const options1 = {
      // Specify a job configuration to set optional job resource properties.
      configuration: {
        query: {
          query: `SELECT files FROM ismizo.makione.users WHERE Username='${user}'`,
          useLegacySql: false,
        },
        labels: {'example-label': 'example-value'},
      },
    };
    const response = await bigqueryClient.createJob(options1);
     const job = response[0];
   
     // Wait for the query to finish
     const [rows] = await job.getQueryResults(job);
     let newList = "";
     if(rows[0].files===null||rows[0].files==="null"){
      newList = file.publUrL;
     }else{
      const oldfiles = rows[0].files.split(", ");
      const filetodelete = file;

      for(item of oldfiles){
          if(item.includes(filetodelete)){
            const index = oldfiles.indexOf(item);
            oldfiles.splice(index, 1);
            const file = myBucket.file(filetodelete);
            const ans2 = await file.delete().then(data=>{
              return data
            })
            const ans1 = await updateDeletedList(oldfiles,user);

            console.log(ans1,ans2)
          }else{

          }
      }
      
      //newList = rows[0].files +", "+file.publUrL;
     }
    /* const options2 = {
      // Specify a job configuration to set optional job resource properties.
      configuration: {
        query: {
          query: `UPDATE ismizo.makione.users
       SET files = '${newList}'
       WHERE Username = '${user}' 
     `,
          useLegacySql: false,
        },
        labels: {'example-label': 'example-value'},
      },
    };
    const response2 = await bigqueryClient.createJob(options2);
     const job2 = response2[0];
*/
}



const updateDeletedList = async (array,user)=>{
  
    const newList = {"0":""};
    for(item of array){
        newList["0"] = newList["0"]+item+", ";
    }
     const options2 = {
      // Specify a job configuration to set optional job resource properties.
      configuration: {
        query: {
          query: `UPDATE ismizo.makione.users
       SET files = '${newList["0"]}'
       WHERE Username = '${user}' 
     `,
          useLegacySql: false,
        },
        labels: {'example-label': 'example-value'},
      },
    };
    const response2 = await bigqueryClient.createJob(options2);
     const job2 = response2[0];
     const [rows] = await job2.getQueryResults(job2);
     return rows;
}





const updateUserFileList = async (user,file)=>{
    //console.log({user,file});
    //get the current user file list
    const options1 = {
        // Specify a job configuration to set optional job resource properties.
        configuration: {
          query: {
            query: `SELECT files FROM ismizo.makione.users WHERE Username='${user}'`,
            useLegacySql: false,
          },
          labels: {'example-label': 'example-value'},
        },
      };
      const response = await bigqueryClient.createJob(options1);
       const job = response[0];
     
       // Wait for the query to finish
       const [rows] = await job.getQueryResults(job);
       let newList = "";
       if(rows[0].files===null||rows[0].files==="null"){
        newList = file.publUrL;
       }else{
        newList = rows[0].files +", "+file.publUrL;
       }
       const options2 = {
        // Specify a job configuration to set optional job resource properties.
        configuration: {
          query: {
            query: `UPDATE ismizo.makione.users
         SET files = '${newList}'
         WHERE Username = '${user}' 
       `,
            useLegacySql: false,
          },
          labels: {'example-label': 'example-value'},
        },
      };
      const response2 = await bigqueryClient.createJob(options2);
       const job2 = response2[0];

}

const uploadFile =async (obj,res,folder)=>{
    const imgObj = obj;
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
    const filename = prfx+date.year+date.month+date.day+date.hour+date.minute+date.second.replaceAll(".","_");
    imgObj.webname = filename;
    const file = myBucket.file(filename);
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
        metadata.metadata.owner = usnum;
        metadata.metadata.genaccess = "private";
        metadata.metadata.inaccess = ""+usnum+", ";
        metadata.metadata.folder = folder;
        metadata.metadata.time = date.year+"_"+date.month+"_"+date.day+"_"+date.hour+"_"+date.minute+"_"+date.second;
        file.setMetadata(metadata, function(err, apiResponse) {
          if(err){
            console.log(err);
          }else{
          }
        })
        imgObj.TMP = "https://expresstoo-jzam6yvx3q-ez.a.run.app/getfile/";
        imgObj.publUrL = imgObj.TMP+imgObj.url.split("makiv1/")[1];
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