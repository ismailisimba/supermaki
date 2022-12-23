export {user as user};
const userObj = {};
const userObjPubl ={};

class user {
    
    constructor(){
        this.start = this.start;
        this.userObj = userObjPubl;
        
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
    userObj.firstName = userInfObj.firstName;
    userObj.lastName = userInfObj.lastName;
    userObj.username = userInfObj.username;
    userObj.email = userInfObj.email;

    userObjPubl.username = userInfObj.username;
    paintBaseUserInfo();
}


const paintBaseUserInfo = () =>{
    const userPanelOne = document.querySelectorAll(".user-panel, .mt-3, .pb-3, .mb-3, .d-flex")[0];
    const fullName = userPanelOne.querySelectorAll("a")[0];
    const username = userPanelOne.querySelectorAll("a")[1];
    //add image e.t.c later

    userObj.firstName===null?fullName.innerHTML = "<span><em>No Name Given</em></span>":userObj.firstName+" "+userObj.lastName;
    username.innerHTML = userObj.username;
}



const importAmod = (name)=>{
    return (async()=>{
        const modEd = await import("./"+`${name}`+".js");
        return modEd;
    })();
}
