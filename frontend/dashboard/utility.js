export {utility as utility};

const utiTMP = {};

class utility {
    
    constructor(){
        this.basicFormChecks = basicFormChecks;  
        this.paintFilesOne = paintFilesOne;
    }

}


const basicFormChecks = (form)=>{
    const rtval = {};
    form.querySelectorAll("input").forEach(input=>{
        const type = input.getAttribute("type");
        const value = input.value;
        
        if(type==="checkbox"){
            if(input.checked){
                rtval.go = "yes";
            }else{
              alert("Please agree to terms and conditions to continue.");
              rtval.go = "no";
            }
        }
       // console.log({type,value});    
    })
    return rtval.go;
}


const paintFilesOne = (ele1,ele2,files)=>{
    const x = document.createElement("p");
    const container = ele2.querySelectorAll("ul")[0].cloneNode(true);
    const card = ele2.querySelectorAll("li")[3].cloneNode(true);
    x.innerHTML = "jdbvjbdv";
    ele1.querySelectorAll("#select")[0].addEventListener("click",setupForFileDeletion)
    ele1.querySelectorAll("ul")[0]&&ele1.querySelectorAll("ul")[0].nodeType?ele1.querySelectorAll("ul")[0].remove():"";
    container.innerHTML = "";
    container.classList.add("filecontainerone");
   document.getElementById("cmain").querySelectorAll(".card-body")[0].appendChild(container);
   var counter = 1;
   files.forEach(async (file)=>{
    const serv = await importAmod("server");
    const server = new serv.server();
    server.startFetch(
        JSON.stringify({}),
        `/getmetadata/${file.split("getfile/")[1]}`,
        "GET",
        (r)=>{
          const fdeets = JSON.parse(r);
          const nwCard = card.cloneNode(true);
          nwCard.querySelectorAll(".mailbox-attachment-name")[0].innerHTML = fdeets.metadata.ogname
          nwCard.querySelectorAll(".mailbox-attachment-name")[0].href = file;
          nwCard.querySelectorAll(".filesize")[0].innerHTML = Number.parseFloat(fdeets.size/(1024*1024)).toFixed(2) +" MB";
          nwCard.querySelectorAll(".imgindex")[0].innerHTML = counter;
          const deSrc = window.location.hostname.includes("127.0.0.1")?file.replace("https://expresstoo-jzam6yvx3q-ez.a.run.app","http://127.0.0.1:8080"):file;
          nwCard.querySelectorAll(".filethumb")[0].src = deSrc;
          container.appendChild(nwCard);
          counter++;
        }
    )
    
   })
}



const setupForFileDeletion = (e) => {
    const files = document.querySelectorAll(".customoverlay");
    files.forEach(file=>{
        const style = window.getComputedStyle(file).getPropertyValue("visibility");
        file.style.visibility = style==="visible"?"collapse":"visible";
    }) 
    
}


const importAmod = (name)=>{
    return (async()=>{
        const modEd = await import("./"+`${name}`+".js");
        return modEd;
    })();
}
