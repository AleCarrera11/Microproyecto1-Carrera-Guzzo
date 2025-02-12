const iniciar = document.getElementById("iniciar");
const modal_container = document.getElementById("menu-principal");
const juego_simon_says = document.getElementById("juego simon says"); // Obtén el elemento del juego
const reiniciar = document.getElementById("reiniciar");

iniciar.addEventListener("click", () => {
    modal_container.classList.remove("show");
    juego_simon_says.style.display = "block"; // Muestra el juego
});

