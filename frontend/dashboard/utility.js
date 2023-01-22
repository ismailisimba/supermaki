export {utility as utility};

const utiTMP = {};

class utility {
    
    constructor(){
        this.basicFormChecks = basicFormChecks;  
    }

}


const basicFormChecks = (form)=>{
    form.querySelectorAll("input").forEach(input=>{
        const type = input.getAttribute("type");
        const value = input.value;
        console.log({type,value})
    })
}
