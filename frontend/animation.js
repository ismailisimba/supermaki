export {anime as anime};

const loadinghand = document.querySelectorAll(".loadinghand")[0];
class anime {
    
    constructor(){
        this.startAnime = startAnime;
        this.stopAnime = stopAnime;
    }
}


const startAnime = () =>{
    loadinghand.style.transform ="translateY(0)";
}


const stopAnime = () =>{
    loadinghand.style.transform ="translateY(-500px)";
}