export {messages as messages};
const messObj = {};
const messObjPubl ={};

class messages {
    
    constructor(){
        this.start = this.start;
        this.messagesObj = messObjPubl;
        
    }

    start(){
        getNotiForThisUser();
    }

}


const getNotiForThisUser = async ()=>{
    const serve = await importAmod("server");
    const s = new serve.server();
    s.startFetch(
        JSON.stringify({}),
        `/getnotifications`,
        "GET",
        (r)=>{
            const notis = JSON.parse(r)
            paintNotifications(notis);
        }
    )
}

const paintNotifications=async(notifications)=>{
    const eles = await importAmod("elements");
    const elements = new eles.elements();
    document.getElementById("notibadge").innerHTML = notifications.length;
    if(notifications.length>0){
        document.getElementById("notibadge").classList.add("badge-danger");
        for(let i=0;i<notifications.length;i++){
            const newEl = elements.obj.notiMsgCardOne[0].cloneNode(true);
            newEl.querySelectorAll("p.text-sm")[0].innerHTML = notifications[i].summary
            newEl.querySelectorAll("h3")[0].innerHTML = notifications[i].owner
            document.querySelectorAll(".dropdown-menu dropdown-menu-lg, .dropdown-menu-right")[0].appendChild(newEl);
        }
    }else{
        document.getElementById("notibadge").classList.remove("badge-danger");
    }
    console.log(notifications)
    console.log(elements.obj)
}


const importAmod = (name)=>{
    return (async()=>{
        const modEd = await import("./"+`${name}`+".js");
        return modEd;
    })();
}