export {utility as utility};

const utiTMP = {};

class utility {
    
    constructor(){
        this.basicFormChecks = basicFormChecks;  
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
