const socket = io("http://localhost:8765/");
socket.on('connect', (event) => {
    console.log('Conectado com sucesso!');
});

socket.on('error', (error) => {
    console.log(error)
});

socket.on('sendMessageDisplay', (msg) => {
    console.log(msg);
});

function sendCommand(command) {
    socket.emit('command', command);
}

const initialScreen = document.getElementById("initial-screen");
const controllerScreen = document.getElementById("controller-screen");
let nick;

const joinGame = () => {
    nick = document.getElementById("name").value;
    initialScreen.style.display = "none";
    controllerScreen.style.display = "block";

    sendCommand({
        "nick": nick,
        "type": "connected",
    });
}

const btnElements = document.querySelectorAll(".btn-interaction");

btnElements.forEach((btn) => {
    btn.addEventListener("click", (event) => {
        let movement;

        switch(btn.id) {
            case 'joy-left':
                movement = "left";
                break;
            case 'joy-right':
                movement = "right";
                break;
            case 'joy-top':
                movement = "turn right";
                break;
            case 'joy-bottom':
                movement = "down";
                break;
            case 'button-a':
                movement = "turn right";
                break;
            case 'button-b':
                movement = "drop";
                break;
        }

        sendCommand({
            "nick": nick,
            "type": "movement",
            "movement": movement
        });
    });
})