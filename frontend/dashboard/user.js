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
          console.log(r);
        }
    )
    
}



const importAmod = (name)=>{
    return (async()=>{
        const modEd = await import("./"+`${name}`+".js");
        return modEd;
    })();
}
