const localVar = {};

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

const logIn = ()=>{
        const usnum = document.getElementById("username").value;
        const uspass = document.getElementById("password").value;
        const mykeys = {"defkey":"0123pass",useKey:uspass};
        console.log({usnum,uspass,mykeys});
}

const startASocketConn = ()=>{
    // Create WebSocket connection.
    const socket = new WebSocket('ws://127.0.01:8080');

    // Connection opened
    socket.addEventListener('open', (event) => {
        socket.send('Where are you Kenobi?');
    });

    // Listen for messages
    socket.addEventListener('message', (event) => {
        console.log('Message from server ', event.data);
    });
}