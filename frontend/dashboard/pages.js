export {pages as pages};

class pages {
    
    constructor(){
        this.start = this.start;
    
        
    }


    start(){
        const pg1 = document.getElementById("cmain").cloneNode(true);
        const pg1crd = pg1.querySelectorAll(".card")[0];
        console.log(pg1crd);
        document.getElementById("cmain").innerHTML = "";
        document.getElementById("cmain").appendChild(pg1crd)
    }
}

