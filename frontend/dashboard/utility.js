export {utility as utility};

const utiTMP = {};

class utility {
    
    constructor(){
        this.basicFormChecks = basicFormChecks;  
        this.paintFilesOne = paintFilesOne;
        this.addCheckboxSelectClicks = addCheckboxSelectClicks;
        this.startBasicAnimation = startBasicAnimation;
        this.stopBasicAnimation = stopBasicAnimation;
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


const paintFilesOne = async(ele1,ele2,files)=>{
    const x = document.createElement("p");
    const container = ele2.querySelectorAll("ul")[0].cloneNode(true);
    const card = ele2.querySelectorAll("li")[3].cloneNode(true);
    x.innerHTML = "jdbvjbdv";
    ele1.querySelectorAll("#select")[0].addEventListener("click",setupForFileDeletion);
    ele1.querySelectorAll("ul")[0]&&ele1.querySelectorAll("ul")[0].nodeType?ele1.querySelectorAll("ul")[0].remove():"";
    container.innerHTML = "";
    container.classList.add("filecontainerone");
   document.getElementById("cmain").querySelectorAll(".card-body")[0].appendChild(container);
   var counter = 1;
   files.forEach(async (file)=>{
    const serv = await importAmod("server");
    const server = new serv.server();
    const nwCard = card.cloneNode(true);
    startBasicAnimation();

        if(typeof file.split("getfile/")[1] !== "undefined"){
            server.startFetch(
                JSON.stringify({}),
                `/getmetadata/${file.split("getfile/")[1]}`,
                "GET",
                (r)=>{
                    try{
                        const fdeets = JSON.parse(r);
                        nwCard.querySelectorAll(".mailbox-attachment-name")[0].innerHTML = fdeets.metadata.ogname
                        nwCard.querySelectorAll(".mailbox-attachment-name")[0].href = file;
                        nwCard.querySelectorAll(".filesize")[0].innerHTML = Number.parseFloat(fdeets.size/(1024*1024)).toFixed(2) +" MB";
                        nwCard.querySelectorAll(".imgindex")[0].innerHTML = counter;
                        const deSrc = window.location.hostname.includes("127.0.0.1")?file.replace("https://expresstoo-jzam6yvx3q-ez.a.run.app","http://127.0.0.1:8080"):file;
                        nwCard.querySelectorAll(".filethumb")[0].src = deSrc;
                        container.appendChild(nwCard);
                        counter++;
                    }catch(e){
                        console.log(e);
                        console.log(r);

                    }
                }
            ).then(()=>{
                nwCard.querySelectorAll(".customoverlay")[0]
                .querySelectorAll("img")[0]
                .addEventListener("click",addCheckboxSelectClicks)
        
                document.getElementById("delete")
                .addEventListener("click",deleteSelectedFiles)
                stopBasicAnimation();
            })
        }else{
            
        }
    
   })
}

const deleteSelectedFiles = (e)=>{
    e.stopPropagation();
    e.preventDefault();
    const filesArr = document.getElementById("cmain").querySelectorAll("img.active");
    if(typeof filesArr !== "undefined" && filesArr.length>=1){
        alert("Deleting selected files...")
        startBasicAnimation();
        filesArr.forEach(async(file)=>{
            const fileUrl = file.parentNode.parentNode.querySelectorAll("a")[0];
            console.log(fileUrl.href);
            const serv = await importAmod("server");
            const server = new serv.server();           
            server.startFetch(
                JSON.stringify({}),
                `/deletethisfile/${fileUrl.href.split("getfile/")[1]}`,
                "GET",
                (r)=>{
                    stopBasicAnimation();
                    console.log(r);
                    window.location.reload();
                }
                )
         })
    }else{
        alert("No files selected!");
    }
}



const setupForFileDeletion = (e) => {
    const files = document.querySelectorAll(".customoverlay");
    files.forEach(file=>{
        const style = window.getComputedStyle(file).getPropertyValue("visibility");
        file.style.visibility = style==="visible"?"collapse":"visible";
    }) 
    
}


const addCheckboxSelectClicks = async(e) =>{
    e.stopPropagation();
    e.preventDefault();
    const item = e.target;
    if(item.classList.contains("active")){
        item.classList.remove("active");
        item.src = "../icons/checkbox.png"
    }else{
        item.classList.add("active");
        item.src = "../icons/checkbox-select.png"
    }
}

//complete file deletion by multi select.
//Delete or edit details via buttons on top of the file page






const startBasicAnimation = async()=>{
    const ani = await importAmod("animation");
    const anime = new ani.anime();
    anime.startAnime();
  }


  const stopBasicAnimation = async()=>{
    const ani = await importAmod("animation");
    const anime = new ani.anime();
    anime.stopAnime();
  }


  const importAmod = (name)=>{
    return (async()=>{
        const modEd = await import("./"+`${name}`+".js");
        return modEd;
    })();
}