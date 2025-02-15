const iniciar = document.getElementById("iniciar");
const modal_container = document.getElementById("menu-principal");
const juego_simon_says = document.getElementById("juego-simon-says");
const reiniciar = document.getElementById("reiniciar");
const roundDisplay = document.getElementById("round");
const scoreDisplay = document.getElementById("score");
const bestScoreValueDisplay = document.getElementById("bestScoreValue");
const simonButtons = document.querySelectorAll(".boton");
const nombreJugador = document.getElementById("nombreJugadorInput");
const menu = document.getElementById("menu");

let simon;

//Cargar registros de puntajes
document.addEventListener("DOMContentLoaded", cargarRecords);

//Al clic en el botón iniciar, empieza un nuevo juego
iniciar.addEventListener("click", () => {
    const nombreJugador = nombreJugadorInput.value;
    if (nombreJugador.trim() === "") {
        alert("Por favor, ingresa tu nombre.");
        return;
    }

    localStorage.setItem("nombreJugador", nombreJugador);

    //Oculta menú y muestra el juego
    modal_container.classList.remove("show");
    juego_simon_says.style.display = "block";
    
    document.getElementById("nombreJugador").textContent = `Jugador: ${nombreJugador}`;
    simon = new Simon(simonButtons, iniciar, roundDisplay, scoreDisplay, bestScoreValueDisplay, nombreJugador);
    simon.init();
});

//Función reiniciar
reiniciar.addEventListener("click", () => {
    if (simon) {
        simon.startGame();
        
        //indicar mejor puntaje
        const bestScore = Math.max(...records.map(record => record.puntaje));
        localStorage.setItem("bestScore", bestScore);

    }
});


//Botón volver al menú
menu.addEventListener("click", () => {
    juego_simon_says.style.display = "none";
    modal_container.classList.add("show");
    iniciar.disabled = false; 

    // Recuperar el nombre del jugador y el mejor puntaje del localStorage
    const nombreJugadorGuardado = localStorage.getItem("nombreJugador");
    if (nombreJugadorGuardado) {
        document.getElementById("nombreJugadorInput").value = nombreJugadorGuardado;  
    }

    cargarRecords();
});


//Clase principal del juego 
class Simon {
    constructor(simonButtons, startButton, roundDisplay, scoreDisplay, bestScoreValueDisplay, nombreJugador) {
        this.round = 0;
        this.userPosition = 0;
        this.totalRounds = 10;
        this.sequence = [];
        this.speed = 1000;
        this.blockedButtons = true;
        this.buttons = Array.from(simonButtons);
        this.score = 0;
        this.nombreJugador = nombreJugador;
        this.bestScore = localStorage.getItem('bestScore') ? parseInt(localStorage.getItem('bestScore')) : 0;
        this.display = {
            startButton,
            round: roundDisplay,
            score: scoreDisplay,
            bestScoreValue: bestScoreValueDisplay
        };
        this.errorSound = new Audio('./sounds/error.mp3'); 
        this.buttonSounds = {
            0: new Audio('./sounds/do.mp3'),   
            1: new Audio('./sounds/re.mp3'),   
            2: new Audio('./sounds/mi.mp3'),   
            3: new Audio('./sounds/fa.mp3')    
        };
    }

    //iniciar el juego
    init() {
        this.display.startButton.disabled = true;
        this.display.bestScoreValue.textContent = this.bestScore;
        this.startGame();
        const bestScore = Math.max(...records.map(record => record.puntaje));
        localStorage.setItem("bestScore", bestScore);
    }

    //Comenzar una nueva ronda del juego
    startGame() {
        this.display.startButton.disabled = true;
        this.updateRound(0);
        this.score = 0;
        this.updateScore();
        this.userPosition = 0;
        this.sequence = this.createSequence();
        this.buttons.forEach((element, i) => {
            element.classList.remove('winner');
            element.onclick = () => this.buttonClick(i);
        });
        this.showSequence();
    }

    //Actualiza el valor de ronda, con el actual
    updateRound(value) {
        this.round = value;
        this.display.round.textContent = `Ronda ${this.round}`;
    }

    //Actualiza el valor del puntaje
    updateScore() {
        this.display.score.textContent = `Puntaje: ${this.score}`;
    }

    //Crea una nueva secuencia
    createSequence() {
        return Array.from({ length: this.totalRounds }, () => this.getRandomColor());
    }

    //Para la escogencia aleatorio del botón en la secuencia
    getRandomColor() {
        return Math.floor(Math.random() * 4);
    }

    //Función al presionar un botón
    buttonClick(value) {
        if (!this.blockedButtons) {
            this.validateChosenColor(value);
        }
    }
    // Valida si el color seleccionado es el correcto
    validateChosenColor(value) {
        if (this.sequence[this.userPosition] === value) {
            this.buttonSounds[value].currentTime = 0;
            this.buttonSounds[value].play();
            if (this.round === this.userPosition) {
                this.updateRound(this.round + 1);
                this.score++;
                this.updateScore();
                this.speed /= 1.02;
                this.isGameOver();
            } else {
                this.userPosition++;
            }
        } else {
            this.gameLost();
        }
    }

    // Verifica si el juego terminó
    isGameOver() {
        if (this.round === this.totalRounds) {
            this.gameWon();
        } else {
            this.userPosition = 0;
            this.showSequence();
        }
    }

    // Muestra la secuencia de botones a repetir
    showSequence() {
        this.blockedButtons = true;
        let sequenceIndex = 0;
        let timer = setInterval(() => {
            const button = this.buttons[this.sequence[sequenceIndex]];
            const sound = this.buttonSounds[this.sequence[sequenceIndex]];
            sound.currentTime = 0;
            sound.play(); 
            this.toggleButtonStyle(button);
            setTimeout(() => this.toggleButtonStyle(button), this.speed / 2);
            sequenceIndex++;
    
            if (sequenceIndex > this.round) {
                this.blockedButtons = false;
                clearInterval(timer);
            }
        }, this.speed);
    }

    // Cambia el estilo del botón 
    toggleButtonStyle(button) {
        button.classList.toggle('active');
    }

    gameLost() {
        this.errorSound.play();
        this.display.startButton.disabled = false;
        this.blockedButtons = true;
        alert("Perdiste! Reinicia de nuevo el juego si quieres volver a intentarlo");
        guardarRecord(this.nombreJugador, this.score); 
    }

    gameWon() {
        this.display.startButton.disabled = false;
        this.blockedButtons = true;
        this.buttons.forEach(element => {
            element.classList.add('winner');
        });
        this.updateRound('');
        alert("Ganaste!");
    
        guardarRecord(this.nombreJugador, this.score); 
    }
}

// Función para cargar los records en la interfaz 
function cargarRecords() {
    const records = JSON.parse(localStorage.getItem("records")) || [];
    const listaRecords = document.querySelector(".record ol");
    
    //Ordenar record
    records.sort((a, b) => b.puntaje - a.puntaje);

    listaRecords.innerHTML = "";
    records.forEach((record, index) => {
        const li = document.createElement("li");
        li.textContent = ` ${record.nombre}: ${record.puntaje}`;
        listaRecords.appendChild(li);
    });
}

// Guardar un nuevo record
function guardarRecord(nombreJugador, puntaje) {
    const records = JSON.parse(localStorage.getItem("records")) || [];
    
    records.push({ nombre: nombreJugador, puntaje: puntaje });
    
    
    records.sort((a, b) => b.puntaje - a.puntaje);

    if (records.length > 5) {
        records.pop();
    }
    localStorage.setItem("records", JSON.stringify(records));
    
    const bestScore = Math.max(...records.map(record => record.puntaje));
    localStorage.setItem("bestScore", bestScore);
}
