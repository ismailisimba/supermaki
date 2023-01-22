export {server as server};
const upFiles = [];

const serverURL = window.location.hostname.includes("127.0.0.1")?"http://127.0.0.1:8080":"https://expresstoo-jzam6yvx3q-ez.a.run.app";
//const paraOne = "test";
class server {
    
    constructor(){
        this.startFetch = fetchInfoWithFilter;
        this.processProfileForm = processProfileForm;
        this.getFile = getFile;
    
        
    }
}


const fetchInfoWithFilter = async (
  data = JSON.stringify({"def":"data"}),
  paraOne="/?paraOne=1",
  method="POST",
  funcAfter = (val)=>{console.log("fetch succesful")}
  )=>{
    var myRequest = new Request(serverURL+""+paraOne);
    await fetch(myRequest,{
        method: method, // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'default', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'include', // include, *same-origin, omit
        headers: {
          //'Access-Control-Allow-Headers':'x-requested-with, Content-Type, origin, authorization, accept, client-security-token',
          //'Content-Type': 'text/plain',
          //'Access-Control-Allow-Origin':'http://127.0.0.1:8080'
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: method==="POST"?data:null// body data type must match "Content-Type" header
      }).then(async(response)=>{
        if (!response.ok){
            throw new Error("HTTP error, status = " + response.status); 
          }
          return await response.text();
      }).then(res=>{
        funcAfter(res);
      }).catch(e=>{
        console.log(e);
        //window.location.reload();
    })

}


const readAsb64 = async (file)=>{


  const b64file = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});
  return await b64file(file);
}


const getFile = async(e)=>{
  const rawFile = e.target.files[0];
  const fileSize = rawFile.size;
  const fileName = rawFile.name;
  const fileMime = rawFile.type;
  const fileSrc = e.target.id;
  const fileDataB64 = await readAsb64(rawFile);
  const fileToUpload = {fileSize,fileName,fileMime,fileSrc,fileDataB64}
  upFiles.push(fileToUpload);


  if(e.target.id==="inputPic"){
    e.target.parentNode.querySelectorAll("img")[0].src=fileDataB64;
  }


}


const processProfileForm = async (e)=>{
    e.preventDefault();
    e.stopPropagation();

    const anim = await importAmod("animation");
    const util = await importAmod("utility");
    const anime = new anim.anime(); 
    const utility = new util.utility();
    anime.startAnime();

    const formData = new FormData();
    //utility.basicFormChecks(e.target);
    const inputs = await readAllInputs(e.target);
    console.log(inputs);
    formData.append("inputs",JSON.stringify(inputs))
    fetchInfoWithFilter(formData,"/updateprofile","POST",(e)=>{
      console.log(e);
      alert("Profile Updated Succesfully!");
      window.location.reload();
    })
    
}

const readAllInputs = async(form)=>{
  const arr = [];
  form.querySelectorAll("input").forEach(async(input)=>{
    const name = input.id;
    const value = {};
    if(name==="inputPic"){
      upFiles.forEach(obj=>{
        if(obj.fileSrc===name){
          value.v = obj;
        }
      })
    }else{
      value.v = input.value;
    }
    const obj = value.v;
    arr.push({name,obj})
  })
  return arr;
}
