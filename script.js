<<<<<<< Updated upstream
=======
const iniciar = document.getElementById("iniciar");
const modal_container = document.getElementById("menu-principal");
const juego_simon_says = document.getElementById("juego simon says");
const reiniciar = document.getElementById("reiniciar");
const roundDisplay = document.getElementById("round");
const scoreDisplay = document.getElementById("score");
const bestScoreValueDisplay = document.getElementById("bestScoreValue");
const simonButtons = document.querySelectorAll(".boton");
const nicknameInput = document.getElementById("nicknameInput");

let simon;

iniciar.addEventListener("click", () => {
    const nickname = nicknameInput.value;
    if (nickname.trim() === "") {
        alert("Por favor, ingresa tu nombre.");
        return;
    }

    modal_container.classList.remove("show");
    juego_simon_says.style.display = "block";

    simon = new Simon(simonButtons, iniciar, roundDisplay, scoreDisplay, bestScoreValueDisplay, nickname);
    simon.init();
});

reiniciar.addEventListener("click", () => {
    if (simon) {
        simon.startGame();
    }
});

class Simon {
    constructor(simonButtons, startButton, roundDisplay, scoreDisplay, bestScoreValueDisplay, nickname) {
        this.round = 0;
        this.userPosition = 0;
        this.totalRounds = 10;
        this.sequence = [];
        this.speed = 1000;
        this.blockedButtons = true;
        this.buttons = Array.from(simonButtons);
        this.score = 0;
        this.nickname = nickname;
        this.bestScore = localStorage.getItem('bestScore') ? parseInt(localStorage.getItem('bestScore')) : 0;
        this.display = {
            startButton,
            round: roundDisplay,
            score: scoreDisplay,
            bestScoreValue: bestScoreValueDisplay
        };
        this.errorSound = new Audio('./sounds/error.wav'); // Asegúrate de tener el archivo de sonido "error.wav" en la carpeta "sounds"
        this.buttonSounds = [
            new Audio('./sounds/1.mp3'), // Asegúrate de tener los archivos de sonido "1.mp3", "2.mp3", "3.mp3" y "4.mp3" en la carpeta "sounds"
            new Audio('./sounds/2.mp3'),
            new Audio('./sounds/3.mp3'),
            new Audio('./sounds/4.mp3')
        ];
    }

    init() {
        this.display.startButton.disabled = true;
        this.display.bestScoreValue.textContent = this.bestScore;
        this.startGame();
    }

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

    updateRound(value) {
        this.round = value;
        this.display.round.textContent = `Ronda ${this.round}`;
    }

    updateScore() {
        this.display.score.textContent = `Puntaje: ${this.score}`;
    }

    createSequence() {
        return Array.from({ length: this.totalRounds }, () => this.getRandomColor());
    }

    getRandomColor() {
        return Math.floor(Math.random() * 4);
    }

    buttonClick(value) {
        if (!this.blockedButtons) {
            this.validateChosenColor(value);
        }
    }

    validateChosenColor(value) {
        if (this.sequence[this.userPosition] === value) {
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

    isGameOver() {
        if (this.round === this.totalRounds) {
            this.gameWon();
        } else {
            this.userPosition = 0;
            this.showSequence();
        }
    }

    showSequence() {
        this.blockedButtons = true;
        let sequenceIndex = 0;
        let timer = setInterval(() => {
            const button = this.buttons[this.sequence[sequenceIndex]];
            this.buttonSounds[this.sequence[sequenceIndex]].play();
            this.toggleButtonStyle(button);
            setTimeout(() => this.toggleButtonStyle(button), this.speed / 2);
            sequenceIndex++;
            if (sequenceIndex > this.round) {
                this.blockedButtons = false;
                clearInterval(timer);
            }
        }, this.speed);
    }

    toggleButtonStyle(button) {
        button.classList.toggle('active');
    }

    gameLost() {
        this.errorSound.play();
        this.display.startButton.disabled = false;
        this.blockedButtons = true;
        alert("Game Over!");
    }

    gameWon() {
        this.display.startButton.disabled = false;
        this.blockedButtons = true;
        this.buttons.forEach(element => {
            element.classList.add('winner');
        });
        this.updateRound('');
        alert("You Win!");

        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore', this.bestScore);
            this.display.bestScoreValue.textContent = this.bestScore;
        }
    }
}
>>>>>>> Stashed changes
