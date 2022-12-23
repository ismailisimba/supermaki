export {elements as elements};
const eleObj = {};
const eleObjPubl ={};

class elements {
    
    constructor(){
        this.start = this.start;
        this.obj = eleObj;
        this.getEle = getEle;
        
    }

    start(){
        getInitElements();
    }

}



const getInitElements  = ()=>{
    eleObj.notiMsgCardOne = document.querySelectorAll(".dropdown-menu dropdown-menu-lg, .dropdown-menu-right")[0].querySelectorAll(".dropdown-item");
    eleObj.notiMsgCardOne.forEach(element => {
        element.remove();
    });
    eleObj.dividerOne = document.querySelectorAll(".dropdown-menu dropdown-menu-lg, .dropdown-menu-right")[0].querySelectorAll(".dropdown-divider");
    eleObj.dividerOne.forEach(element => {
        element.remove();
    });
    eleObj.notiMsgCardTwo = document.querySelectorAll(".dropdown-menu dropdown-menu-lg, .dropdown-menu-right")[1].querySelectorAll(".dropdown-item");
    eleObj.notiMsgCardTwo.forEach(element => {
        element.remove();
    });
}



const importAmod = (name)=>{
    return (async()=>{
        const modEd = await import("./"+`${name}`+".js");
        return modEd;
    })();
}

const getEle = (ele)=>{
    if(ele.includes(".")){
        return document.querySelectorAll(`${ele}`);
    }else{
        return document.getElementById(`${ele}`);
    }
}


const removeEle = (ele)=>{
    if(ele.includes(".")){
        document.querySelectorAll(`${ele}`).forEach(e=>e.remove());
    }else{
        document.getElementById(`${ele}`).remove();
    }
    return "removed";
}