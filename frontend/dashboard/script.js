const localVar = {};
const keySize = 256;
const ivSize = 128;
const iterations = 100;


window.onload = (e)=>{
    startPagessModule();
    startElementsModule()
    checkLogIn();
    startUserModule();
    startMessagesModule();
}


const checkLogIn = async()=>{
    const serve = await importAmod("server");
    const server = new serve.server();
    server.startFetch(
        JSON.stringify({}),
        `/checklogin`,
        "GET",
        (r)=>{
          const response = JSON.parse(r)
            if(response&&response.useris==="in"){

            }else{
              alert("Please Log In!")
              window.location.href = "./"
            }
        }
    )
}


const importAmod = (name)=>{
    return (async()=>{
        const modEd = await import("./"+`${name}`+".js");
        return modEd;
    })();
}


const startUserModule = async() =>{
  const userMod = await importAmod("user");
  const user = new userMod.user();
  user.start();
}


const startMessagesModule = async() =>{
  const msgMod = await importAmod("messages");
  const msgs = new msgMod.messages();
  msgs.start();
}


const startElementsModule = async() =>{
  const mod = await importAmod("elements");
  const eles = new mod.elements();
  eles.start();
}


const startPagessModule = async() =>{
  const mod = await importAmod("pages");
  const pgs = new mod.pages();
  pgs.start();
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