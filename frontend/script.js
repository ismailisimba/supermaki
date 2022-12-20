const localVar = {};
const keySize = 256;
const ivSize = 128;
const iterations = 100;

window.onload = ()=>{
    addLogInNSignUpEvent();
    startASocketConn();
}




const setupForSignUp = (e)=>{
    const extraBox = document.querySelectorAll("#username")[0].cloneNode(true);
    extraBox.id = "email";
    extraBox.name = "email";
    extraBox.type = "email"
    extraBox.placeholder ="Email";

    const mom = document.getElementById("formmom");
    const be4This = document.getElementById("password");
    mom.insertBefore(extraBox,be4This);
    document.getElementById("signupbutt").remove();
    document.getElementById("submit").value = "Sign Up";
}


const addLogInNSignUpEvent = ()=>{
    document.getElementById("submit").addEventListener("click",checkLogInNSignUpEvent);
};

const checkLogInNSignUpEvent = (e)=>{
        e.stopPropagation();
        e.preventDefault();
        const val = e.target.value;
        val==="Login"?logIn():signUp();
}

const logIn = async()=>{
        const usnum = document.getElementById("username").value;
        const uspass = document.getElementById("password").value;
        const mykeys = {uspass,usnum};
        const serve = await importAmod("server");
        const server = new serve.server();
        const allkey = document.querySelector('meta[name="defsource"]').content;
        server.startFetch(
            allkey,
            "/checksource",
            "POST",
            (r)=>{
                const s = JSON.parse(r);
                if(s.source==="ok"){
                    server.startFetch(
                        JSON.stringify(mykeys),
                        "/login",
                        "POST",
                    )
                }else{
                    alert("There seems to be a security error. Please notify us at maudhuikidigitali@gmail.com")
                }
                
            }
        );


}

const startASocketConn = ()=>{
    // Create WebSocket connection.
    const socket = new WebSocket('ws://expresstoo-jzam6yvx3q-ez.a.run.app/:8080');

    // Connection opened
    socket.addEventListener('open', (event) => {
        socket.send('Where are you Kenobi?');
    });

    // Listen for messages
    socket.addEventListener('message', (event) => {
        console.log('Message from server ', event.data);
    });
}

const importAmod = (name)=>{
    return (async()=>{
        const modEd = await import("./"+`${name}`+".js");
        return modEd;
    })();
}





function encrypt (msg, pass) {
    var salt = CryptoJS.lib.WordArray.random(128/8);
    
    var key = CryptoJS.PBKDF2(pass, salt, {
        keySize: keySize/32,
        iterations: iterations
      });
  
    var iv = CryptoJS.lib.WordArray.random(128/8);
    
    var encrypted = CryptoJS.AES.encrypt(msg, key, { 
      iv: iv, 
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
      
    });
    
    // salt, iv will be hex 32 in length
    // append them to the ciphertext for use  in decryption
    var transitmessage = salt.toString()+ iv.toString() + encrypted.toString();
    return transitmessage;
  }
  
  function decrypt (transitmessage, pass) {
    var salt = CryptoJS.enc.Hex.parse(transitmessage.substr(0, 32));
    var iv = CryptoJS.enc.Hex.parse(transitmessage.substr(32, 32))
    var encrypted = transitmessage.substring(64);
    
    var key = CryptoJS.PBKDF2(pass, salt, {
        keySize: keySize/32,
        iterations: iterations
      });
  
    var decrypted = CryptoJS.AES.decrypt(encrypted, key, { 
      iv: iv, 
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
      
    })
    decrypted = decrypted.toString(CryptoJS.enc.Utf8);
    return decrypted;
  }
  