export {user as user};
const userObj = {};
const userObjPubl ={};

class user {
    
    constructor(){
        this.start = this.start;
        this.userObj = userObj;
        
    }

    start(){
        getUserName();
    }
}


const getUserName = async()=>{
    const serve = await importAmod("server");
    const server = new serve.server();
    server.startFetch(
        JSON.stringify({}),
        `/getUserName`,
        "GET",
        (r)=>{
          setUserInfo(JSON.parse(r));
        }
    )
    
}


const setUserInfo = (userInfObj)=>{
    userObj.firstName = userInfObj.Info.firstName;
    userObj.lastName = userInfObj.Info.lastName;
    userObj.username = userInfObj.Info.username;
    userObj.email = userInfObj.Info.email;
    userObj.thumbnail = userInfObj.Info.thumbnail;
    userObj.files = userInfObj.Info.files;

    userObjPubl.username = userInfObj.Info.username;
    paintBaseUserInfo();
}


const paintBaseUserInfo = () =>{
    const userPanelOne = document.querySelectorAll(".user-panel, .mt-3, .pb-3, .mb-3, .d-flex")[0];
    const fullName = userPanelOne.querySelectorAll("a")[0];
    const imgThumb = userPanelOne.querySelectorAll(".image")[0].querySelectorAll("img")[0];
    const username = userPanelOne.querySelectorAll("a")[1];
    //add image e.t.c later

    userObj.firstName===null?fullName.innerHTML = "<span><em>No Name Given</em></span>":userObj.firstName+" "+userObj.lastName;
    userObj.thumbnail===null?imgThumb.src = "./icons/noprofile.png":userObj.thumbnail;
    username.innerHTML = userObj.username;
}



const importAmod = (name)=>{
    return (async()=>{
        const modEd = await import("./"+`${name}`+".js");
        return modEd;
    })();
}
