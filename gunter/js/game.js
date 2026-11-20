
/* =========================================
   GUNTER'S WORLD - SISTEMA INTERACTIVO
   Gunter + Karu + objetos + arrastre
========================================= */


/* =========================================
   1. ELEMENTOS DEL JUEGO
========================================= */

// Personaje
const gunter = document.getElementById("gunter");

// Habitación
const room = document.getElementById("room");

// Interfaz
const actionMessage = document.getElementById("action-message");
const karuText = document.getElementById("karu-text");
const karuAvatar = document.getElementById("karu-avatar");
const karuPanel = document.getElementById("karu-panel");

// Indicador de estado: admite el HTML anterior y el nuevo
const statusText =
    document.getElementById("status-text") ||
    document.querySelector("#status-indicator .status-text") ||
    document.getElementById("status-indicator");

// Objetos interactivos
const objects = document.querySelectorAll(".game-object");


/* =========================================
   2. ESTADO DEL JUEGO
========================================= */

let gunterState = "descansando";

let draggedObject = null;
let dragStartX = 0;
let dragStartY = 0;
let objectStartX = 0;
let objectStartY = 0;
let hasDragged = false;

let karuDialogueIndex = 0;
let lastInteraction = "inicio";


/* =========================================
   3. MENSAJES DEL SISTEMA
========================================= */

function showMessage(message, karuMessage, status) {

    if (actionMessage) {
        actionMessage.textContent = message;
    }

    if (karuText) {
        karuText.textContent = karuMessage;
    }

    if (statusText) {
        statusText.textContent = status;
    }

}


/* =========================================
   4. EFECTOS VISUALES DE GUNTER
========================================= */

function activateGunter(duration = 1200) {

    if (!gunter) return;

    gunter.classList.add("active");

    setTimeout(() => {
        gunter.classList.remove("active");
    }, duration);

}


/* =========================================
   5. MOVIMIENTO DE GUNTER
========================================= */

function moveGunterTo(object) {

    if (!gunter || !room || !object) return;

    const roomRect = room.getBoundingClientRect();
    const objectRect = object.getBoundingClientRect();

    if (!roomRect.width || !roomRect.height) return;

    const centerX =
        objectRect.left + objectRect.width / 2 - roomRect.left;

    const centerY =
        objectRect.top + objectRect.height / 2 - roomRect.top;

    const x = (centerX / roomRect.width) * 100;
    const y = (centerY / roomRect.height) * 100;

    gunter.style.left = `${x}%`;
    gunter.style.top = `${y}%`;

}


/* =========================================
   6. RECONOCIMIENTO DE OBJETOS
========================================= */

function identifyObject(object) {

    const objectType = object.dataset.object || "";
    const action = object.dataset.action || "";

    // Admitimos tanto los identificadores antiguos
    // como los nuevos del HTML.

    const aliases = {
        "comida": "food",
        "food-bowl": "food",
        "feed": "food",

        "agua": "water",
        "water-bowl": "water",
        "drink": "water",

        "saco": "bag",
        "food-bag": "bag",
        "food": "bag",

        "caja": "box",
        "cardboard-box": "box",
        "play": "box"
    };

    return aliases[objectType] || aliases[action] || "unknown";

}


/* =========================================
   7. INTERACCIÓN CON LOS OBJETOS
========================================= */

function interactWithObject(object) {

    if (!object) return;

    const type = identifyObject(object);

    // Quitamos el resaltado anterior
    objects.forEach(item => {
        item.classList.remove("selected");
    });

    // Resaltamos el objeto actual
    object.classList.add("selected");

    // Gunter se acerca al objeto
    moveGunterTo(object);

    lastInteraction = type;

    switch (type) {

        case "food":

            gunterState = "comiendo";

            showMessage(
                "Gunter ha encontrado su comida. ¡Ñam, ñam!",
                "¡Qué hambre tenía! Gunter ha encontrado su comedero. No le molestes mientras come.",
                "Gunter está comiendo"
            );

            break;


        case "water":

            gunterState = "bebiendo";

            showMessage(
                "Gunter está bebiendo agua. ¡Glup, glup!",
                "¡Muy bien! Mantenerse hidratado es importante hasta para los gatitos.",
                "Gunter está bebiendo"
            );

            break;


        case "bag":

            gunterState = "inspeccionando";

            showMessage(
                "Gunter está investigando el saco de pienso.",
                "¡Vaya, vaya! Creo que Gunter ha descubierto dónde guardamos sus reservas de comida.",
                "Gunter está investigando"
            );

            break;


        case "box":

            gunterState = "sentado_en_caja";

            showMessage(
                "Gunter se ha sentado encima de la caja.",
                "¡Lo sabía! Puedes comprarle una cama carísima, pero siempre elegirá una caja de cartón.",
                "Gunter está en su caja"
            );

            break;


        default:

            gunterState = "descansando";

            showMessage(
                "Gunter no reconoce este objeto.",
                "Mmm... todavía no sé qué es eso. ¡Tendremos que enseñárselo!",
                "Gunter está tranquilo"
            );

            break;

    }

    activateGunter();

}


/* =========================================
   8. SISTEMA DE ARRASTRE DE OBJETOS
========================================= */

objects.forEach(object => {

    object.addEventListener("pointerdown", function(event) {

        draggedObject = object;
        hasDragged = false;

        dragStartX = event.clientX;
        dragStartY = event.clientY;

        const roomRect = room.getBoundingClientRect();
        const objectRect = object.getBoundingClientRect();

        objectStartX =
            ((objectRect.left - roomRect.left) / roomRect.width) * 100;

        objectStartY =
            ((objectRect.top - roomRect.top) / roomRect.height) * 100;

        try {
            object.setPointerCapture(event.pointerId);
        } catch (error) {
            // El navegador puede haber perdido el puntero.
        }

    });


    object.addEventListener("pointermove", function(event) {

        if (draggedObject !== object || !room) return;

        const differenceX = event.clientX - dragStartX;
        const differenceY = event.clientY - dragStartY;

        // Umbral para distinguir clic y arrastre
        if (
            Math.abs(differenceX) > 6 ||
            Math.abs(differenceY) > 6
        ) {
            hasDragged = true;
        }

        if (!hasDragged) return;

        const roomRect = room.getBoundingClientRect();

        if (!roomRect.width || !roomRect.height) return;

        const newX =
            objectStartX + (differenceX / roomRect.width) * 100;

        const newY =
            objectStartY + (differenceY / roomRect.height) * 100;

        const maxX =
            100 - (object.offsetWidth / roomRect.width) * 100;

        const maxY =
            100 - (object.offsetHeight / roomRect.height) * 100;

        object.style.left =
            `${Math.max(0, Math.min(maxX, newX))}%`;

        object.style.top =
            `${Math.max(0, Math.min(maxY, newY))}%`;

    });


    object.addEventListener("pointerup", function() {

        if (draggedObject !== object) return;

        // Si no se ha arrastrado, interpretamos que es un clic
        if (!hasDragged) {
            interactWithObject(object);
        } else {
            showMessage(
                "Has cambiado de sitio un objeto de la habitación.",
                "¡Oh! Has reorganizado la habitación. Gunter tendrá que investigar su nueva distribución.",
                "Habitación reorganizada"
            );
        }

        draggedObject = null;
        hasDragged = false;

    });


    object.addEventListener("pointercancel", function() {

        draggedObject = null;
        hasDragged = false;

    });

});


/* =========================================
   9. ACARICIAR A GUNTER
========================================= */

if (gunter) {

    gunter.addEventListener("click", function() {

        gunterState = "ronroneando";
        lastInteraction = "acariciar";

        showMessage(
            "¡Prrrrrr! Gunter está contento.",
            "¡Awww! Parece que le gustan tus caricias. ¡Sigue así!",
            "Gunter está ronroneando"
        );

        activateGunter(1500);

    });

}


/* =========================================
   10. DIÁLOGOS DE KARU
========================================= */

const karuDialogues = {

    inicio: [
        "¡Hola! Soy Karu, el cuidador de Gunter. ¿Qué aventura tendremos hoy?",
        "¡Bienvenido al refugio! Gunter estaba esperándote.",
        "¡Ey! ¿Has venido a visitar a nuestro pequeño peludo?"
    ],

    acariciar: [
        "¡Mira cómo ronronea! Creo que te has ganado su confianza.",
        "Gunter es bastante cariñoso cuando está de buen humor.",
        "¡Qué bonito! No hay nada como un buen rato de mimos."
    ],

    food: [
        "¡Hora de comer! Recuerda que los gatitos necesitan una alimentación adecuada.",
        "¡Qué rápido ha encontrado su comedero! Tiene buen olfato.",
        "Gunter nunca olvida dónde está su comida. ¡Nunca!"
    ],

    water: [
        "¡Un descanso para beber agua! Siempre debe tener agua limpia y fresca.",
        "¡Muy bien, Gunter! La hidratación también es importante.",
        "Después de beber seguro que vuelve a explorar la habitación."
    ],

    bag: [
        "¡No, Gunter! Ese saco no es un comedero gigante.",
        "Creo que ha reconocido el olor de su pienso favorito.",
        "¡Qué curioso es! Siempre quiere investigar cualquier cosa nueva."
    ],

    box: [
        "¡La caja! Su lugar favorito del mundo.",
        "No importa lo cómoda que sea su cama: Gunter siempre elegirá el cartón.",
        "¡Qué elegante está sentado ahí! Parece el rey de la habitación."
    ],

    unknown: [
        "Todavía no conozco ese objeto. ¡Tendremos que investigarlo!",
        "¿Qué será eso? Gunter parece tener curiosidad.",
        "¡Hay tantas cosas que descubrir en esta habitación!"
    ],

    default: [
        "¿Sabías que los gatos pasan muchas horas descansando?",
        "Gunter tiene una personalidad muy especial.",
        "¡Me encanta ver cómo explora su habitación!",
        "¿Qué te parece nuestro pequeño refugio?",
        "¡No pierdas de vista a Gunter! Siempre está tramando algo."
    ]

};


/* =========================================
   11. KARU RESPONDE SEGÚN LA ACTIVIDAD
========================================= */

function getKaruDialogue() {

    const dialogues =
        karuDialogues[lastInteraction] ||
        karuDialogues.default;

    const message = dialogues[
        karuDialogueIndex % dialogues.length
    ];

    karuDialogueIndex++;

    return message;

}


/* =========================================
   12. INTERACCIÓN CON EL AVATAR DE KARU
========================================= */

function talkToKaru() {

    if (!karuText) return;

    const message = getKaruDialogue();

    karuText.textContent = message;

    if (karuPanel) {
        karuPanel.classList.add("active");
    }

    // Animación visual del avatar
    if (karuAvatar) {
        karuAvatar.classList.add("talking");

        setTimeout(() => {
            karuAvatar.classList.remove("talking");
        }, 800);
    }

}

if (karuAvatar) {

    karuAvatar.addEventListener("click", talkToKaru);

    // Permite utilizar el avatar con teclado
    karuAvatar.setAttribute("role", "button");
    karuAvatar.setAttribute("tabindex", "0");
    karuAvatar.setAttribute("aria-label", "Hablar con Karu");

    karuAvatar.addEventListener("keydown", function(event) {

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            talkToKaru();
        }

    });

}


/* =========================================
   13. MENSAJES AUTOMÁTICOS DE KARU
========================================= */

// Karu puede saludar de nuevo después de una interacción.
// No sustituimos mensajes inmediatamente para evitar interrumpir
// al usuario.

function karuWelcome() {

    if (!karuText) return;

    karuText.textContent =
        "¡Hola! Soy Karu. Haz clic en mi avatar cuando quieras hablar conmigo.";

}


/* =========================================
   14. INICIALIZACIÓN
========================================= */

function initializeGame() {

    if (!gunter) {
        console.error("No se ha encontrado el elemento #gunter.");
    }

    if (!room) {
        console.error("No se ha encontrado el elemento #room.");
    }

    showMessage(
        "Gunter está descansando tranquilamente.",
        "¡Bienvenido al refugio! Puedes acariciar a Gunter, interactuar con los objetos o hablar conmigo.",
        "Gunter está tranquilo"
    );

    console.log("Gunter's World iniciado correctamente.");
    console.log("Objetos reconocidos:", objects.length);

    if (objects.length === 0) {
        console.warn("No se han encontrado objetos con la clase .game-object");
    }

}

initializeGame();
