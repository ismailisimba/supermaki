export {server as server};

//const serverURL = "https://expressongoogle-jzam6yvx3q-ez.a.run.app"
const serverURL = "http://127.0.0.1:8080"
//const paraOne = "test";
class server {
    
    constructor(){
        this.startFetch = fetchInfoWithFilter;
    
        
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
        body: data // body data type must match "Content-Type" header
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


