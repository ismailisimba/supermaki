export {pages as pages};

const pg1 = document.getElementById("cmain").cloneNode(true);
const sideMenu = {};

class pages {
    
    constructor(){
        this.start = this.start;
    
        
    }


    start(){
        setHomePage();
        setMenuStuff();
        document.querySelectorAll(".profilepg")[0].addEventListener("click",addProfPage);
        document.querySelectorAll(".profilepg")[1].addEventListener("click",addProfPage);
        document.querySelectorAll(".contactpg")[0].addEventListener("click",addContactPage);
        document.querySelectorAll(".contactpg")[1].addEventListener("click",addContactPage);
        document.querySelectorAll(".homepg")[0].addEventListener("click",setHomePage);
        document.querySelectorAll(".homepg")[1].addEventListener("click",setHomePage);
        document.querySelectorAll(".filepg")[0].addEventListener("click",setFilesPage);
        
    }
}


const setHomePage =async(e)=>{
    if(e){
        e.stopPropagation();
        e.preventDefault();
    }

    const ele = await importAmod("elements");
    const elements = new ele.elements();
    const pg1crd = elements.obj.card;
    const title = pg1crd.querySelectorAll(".card-title")[0];
    const cardlink1 = pg1crd.querySelectorAll(".card-link")[0];
    const cardlink2 = pg1crd.querySelectorAll(".card-link")[1];
    const cardtext = pg1crd.querySelectorAll(".card-text")[0];
    title.innerHTML = "Welcome";
    cardlink1.innerHTML = "";
    cardlink2.innerHTML = "";
    cardtext.innerHTML = "";
    document.getElementById("cmain").innerHTML = "";
    document.getElementById("cmain").appendChild(pg1crd);

    updatesOnNavigation("Homepage");
    
}


const addContactPage = async(e) =>{
    e.stopPropagation();
    e.preventDefault();

    const ele = await importAmod("elements");
    const elements = new ele.elements();
    const pg1crd = elements.obj.card;
    const title = pg1crd.querySelectorAll(".card-title")[0];
    const cardlink1 = pg1crd.querySelectorAll(".card-link")[0];
    const cardlink2 = pg1crd.querySelectorAll(".card-link")[1];
    const cardtext = pg1crd.querySelectorAll(".card-text")[0];
    title.innerHTML = "Contact Us";
    cardlink1.innerHTML = "";
    cardlink2.innerHTML = "";
    cardtext.innerHTML = "Do not hesitate to reach out to us for inquiries or help. Email us at maudhuikidigitali@gmail.com. -- Usisite kututafuta kwa maswali au msaada. Tutumie barua pepe kupitia maudhuikidigitali@gmail.com";
    document.getElementById("cmain").innerHTML = "";
    document.getElementById("cmain").appendChild(pg1crd);

    updatesOnNavigation("Contact Us");

}

const updatesOnNavigation = (title)=>{
    const tit1 = document.querySelectorAll(".content-header")[0].querySelectorAll("h1")[0];
    const tit2 = document.querySelectorAll(".content-header")[0].querySelectorAll(".breadcrumb-item, .active")[1];
    tit1.innerHTML = title;
    tit2.innerHTML = title;
}


const addProfPage = async(e)=>{
    e.stopPropagation();
    e.preventDefault();
    
    const ele = await importAmod("elements");
    const dt = await importAmod("user");
    const elements = new ele.elements();
    const webData = new dt.user();
    const profMom = elements.obj.profileCols;

    document.getElementById("cmain").innerHTML = `${profMom}`;
    const fullName = document.getElementById("cmain").querySelectorAll("h3.profile-username")[0];
    const userName = document.getElementById("cmain").querySelectorAll(".text-muted")[0];
    const imgThumb = document.querySelectorAll(".profile-user-img")[0];
    const card = document.querySelectorAll(".callout-info")[0];
    if(webData.userObj.firstName===null||webData.userObj.firstName===undefined||webData.userObj.firstName==="undefined"){
        fullName.innerHTML = "<span><em>No Name Given</em></span>";
    }else{
        fullName.innerHTML = webData.userObj.firstName+" "+webData.userObj.lastName;
    }

    if(webData.userObj.thumbnail===null||webData.userObj.firstName===undefined){
        imgThumb.src = "./icons/noprofile.png";
    }else{
        imgThumb.src = webData.userObj.thumbnail;
    }

    
    userName.innerHTML = webData.userObj.username;
    
    card.querySelectorAll("h5")[0].innerHTML = webData.userObj.username;
    card.querySelectorAll("p")[0].innerHTML = "Username";
    document.getElementById("inputName").value = webData.userObj.username;

    const mom = card.parentNode;

    const emailCard = card.cloneNode(true);
    emailCard.querySelectorAll("h5")[0].innerHTML = webData.userObj.email;
    emailCard.querySelectorAll("p")[0].innerHTML = "Email";
    mom.appendChild(emailCard);
    document.getElementById("inputEmail").value = webData.userObj.email;

    const fnameCard = card.cloneNode(true);
    fnameCard.querySelectorAll("h5")[0].innerHTML = webData.userObj.firstName;
    fnameCard.querySelectorAll("p")[0].innerHTML = "First Name";
    mom.appendChild(fnameCard);
    document.getElementById("firstName").value = webData.userObj.firstName;

    const lnameCard = card.cloneNode(true);
    lnameCard.querySelectorAll("h5")[0].innerHTML = webData.userObj.lastName;
    lnameCard.querySelectorAll("p")[0].innerHTML = "Last Name";
    mom.appendChild(lnameCard);
    document.getElementById("lastName").value = webData.userObj.lastName;

    const serv = await importAmod("server");
    const server = new serv.server();
    document.getElementById("inputName").setAttribute("readonly",true);
   // document.getElementById("profform").addEventListener("click",server.processProfileForm)
    document.getElementById("inputPic").addEventListener("input",server.getFile)
    document.getElementById("profform").addEventListener("submit",server.processProfileForm) 
    updatesOnNavigation("Profile");
}

const setFilesPage =async(e)=>{
    if(e){
        e.stopPropagation();
        e.preventDefault();
    }

    const ele = await importAmod("elements");
    const elements = new ele.elements();
    const user = await importAmod("user");
    const userInfo = new user.user();
    const files = userInfo.userObj.files.split(", ");
    const pg1crd = elements.obj.card;
    const title = pg1crd.querySelectorAll(".card-title")[0];
    const cardlink1 = pg1crd.querySelectorAll(".card-link")[0];
    const cardlink2 = pg1crd.querySelectorAll(".card-link")[1];
    const cardtext = pg1crd.querySelectorAll(".card-text")[0];
    title.innerHTML = "Files ("+files.length+")";
    cardlink1.innerHTML = "";
    cardlink2.innerHTML = "";
    cardtext.innerHTML = elements.obj.files.innerHTML;
    document.getElementById("cmain").innerHTML = "";
    document.getElementById("cmain").appendChild(pg1crd);
    pg1crd.style.width = "100%";
    console.log(files)
    updatesOnNavigation("Files");
    
}


const importAmod = (name)=>{
    return (async()=>{
        const modEd = await import("./"+`${name}`+".js");
        return modEd;
    })();
}


const setMenuStuff =()=>{
    const nav1 = document.querySelectorAll(".nav-sidebar")[0].querySelectorAll("ul")[0];
    const nav2 = document.querySelectorAll(".nav-sidebar")[0].querySelectorAll("ul")[1];
    const nav3 = document.querySelectorAll(".nav-sidebar")[0].querySelectorAll("ul")[2];
    const nav4 = document.querySelectorAll(".nav-sidebar")[0].querySelectorAll("ul")[3];
    const arrNav = [nav1.parentNode,nav2.parentNode,nav3.parentNode,nav4.parentNode];
    sideMenu.one = arrNav;
    const navkids = nav1.querySelectorAll(".nav-item");
    const navkids1 = nav2.querySelectorAll(".nav-item");
    const navkids2 = nav3.querySelectorAll(".nav-item");
    const navkids3 = nav4.querySelectorAll(".nav-item");
    navkids.forEach(navKid=>{
        navKid.addEventListener("click",menuOneActiveTheming)
    })
    navkids1.forEach(navKid=>{
        navKid.addEventListener("click",menuOneActiveTheming3)
    })
    navkids2.forEach(navKid=>{
        navKid.addEventListener("click",menuOneActiveTheming3)
    })
    arrNav.forEach(navKid=>{
        navKid.addEventListener("click",menuOneActiveTheming2)
    })
    navkids3.forEach(navKid=>{
        navKid.addEventListener("click",menuOneActiveTheming3)
    })
}


const menuOneActiveTheming = (e)=>{
    const item = e.currentTarget;
    const parent = item.parentNode;
    parent.querySelectorAll(".nav-item").forEach(r=>{
        r.childNodes[1].classList.remove("active");
    });
   const topdeskmenu =  document.querySelectorAll(`.navbar-nav`)[0].querySelectorAll(".nav-item");
   for(let i=1; i<topdeskmenu.length;i++){
    topdeskmenu[i].childNodes[1].classList.remove('active');
   }
    window.setTimeout(()=>{
        item.childNodes[1].classList.add("active");
        document.querySelectorAll(`.${item.classList[1]}`)[0].classList.add('active');
    },600);
}

const menuOneActiveTheming3 = (e)=>{
    const item = e.currentTarget;
    const parent = item.parentNode;
    parent.querySelectorAll(".nav-item").forEach(r=>{
        r.childNodes[1].classList.remove("active");
    });
    window.setTimeout(()=>{
        item.childNodes[1].classList.add("active");
    },100);
}


const menuOneActiveTheming2 = (e)=>{
    const item = e.currentTarget;
    sideMenu.one.forEach(m=>{
            m.childNodes[1].classList.remove("active");
    })
    item.childNodes[1].classList.add("active");
}

