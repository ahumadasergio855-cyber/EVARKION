/* =========================================
   GUNTER'S WORLD - SISTEMA INTERACTIVO
========================================= */

// PERSONAJE
const gunter = document.getElementById("gunter");

// HABITACIÓN
const room = document.getElementById("room");

// ELEMENTOS DE INTERFAZ
const actionMessage = document.getElementById("action-message");
const karuText = document.getElementById("karu-text");
const statusText = document.getElementById("status-text");

// OBJETOS DEL ESCENARIO
const objects = document.querySelectorAll(".game-object");

// ESTADO DEL PERSONAJE
let gunterState = "descansando";

// ESTADO DE ARRASTRE
let draggedObject = null;
let dragStartX = 0;
let dragStartY = 0;
let objectStartX = 0;
let objectStartY = 0;
let hasDragged = false;


/* =========================================
   MENSAJES
========================================= */

function showMessage(message, karuMessage, status) {

    actionMessage.textContent = message;
    karuText.textContent = karuMessage;
    statusText.textContent = status;

}


/* =========================================
   POSICIÓN DE GUNTER
========================================= */

function moveGunterTo(object) {

    const roomRect = room.getBoundingClientRect();
    const objectRect = object.getBoundingClientRect();

    // Centro del objeto en coordenadas de la habitación
    const objectCenterX =
        objectRect.left + objectRect.width / 2 - roomRect.left;

    const objectCenterY =
        objectRect.top + objectRect.height / 2 - roomRect.top;

    // Convertimos la posición a porcentajes
    const x = (objectCenterX / roomRect.width) * 100;
    const y = (objectCenterY / roomRect.height) * 100;

    // Movemos a Gunter
    gunter.style.left = `${x}%`;
    gunter.style.top = `${y}%`;

}


/* =========================================
   RECONOCIMIENTO DE OBJETOS
========================================= */

function interactWithObject(object) {

    const objectType = object.dataset.object;
    const action = object.dataset.action;

    // Resaltamos el objeto seleccionado
    objects.forEach(item => {
        item.classList.remove("selected");
    });

    object.classList.add("selected");

    // Gunter se desplaza hasta el objeto
    moveGunterTo(object);

    // Cambiamos su estado según el objeto
    switch (objectType) {

        case "comida":

            gunterState = "comiendo";

            showMessage(
                "Gunter ha encontrado su comida. ¡Ñam, ñam!",
                "¡Muy bien! Gunter ha reconocido su comedero de comida.",
                "Gunter está comiendo"
            );

            break;


        case "agua":

            gunterState = "bebiendo";

            showMessage(
                "Gunter está bebiendo agua.",
                "¡Qué bien! Gunter ha encontrado el comedero de agua.",
                "Gunter está bebiendo"
            );

            break;


        case "saco":

            gunterState = "inspeccionando";

            showMessage(
                "Gunter está investigando el saco de pienso.",
                "¡Parece que Gunter ha encontrado dónde guardamos su comida!",
                "Gunter está investigando"
            );

            break;


        case "caja":

            gunterState = "sentado_en_caja";

            showMessage(
                "Gunter se ha sentado encima de la caja.",
                "¡A los gatos les encantan las cajas! Gunter ha encontrado la suya.",
                "Gunter está sentado"
            );

            break;


        default:

            gunterState = "descansando";

            showMessage(
                "Gunter está descansando.",
                "No conozco todavía ese objeto.",
                "Gunter está tranquilo"
            );

    }

    // Efecto de iluminación temporal
    gunter.classList.add("active");

    setTimeout(() => {
        gunter.classList.remove("active");
    }, 1200);

}


/* =========================================
   INTERACCIÓN CON LOS OBJETOS
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

        object.setPointerCapture(event.pointerId);

    });


    object.addEventListener("pointermove", function(event) {

        if (draggedObject !== object) {
            return;
        }

        const differenceX = event.clientX - dragStartX;
        const differenceY = event.clientY - dragStartY;

        // Evitamos confundir un pequeño movimiento con un arrastre
        if (
            Math.abs(differenceX) > 6 ||
            Math.abs(differenceY) > 6
        ) {
            hasDragged = true;
        }

        if (!hasDragged) {
            return;
        }

        const roomRect = room.getBoundingClientRect();

        const newX =
            objectStartX + (differenceX / roomRect.width) * 100;

        const newY =
            objectStartY + (differenceY / roomRect.height) * 100;

        // Limitamos el movimiento dentro de la habitación
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

        if (!hasDragged) {
            interactWithObject(object);
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
   INTERACCIÓN DIRECTA CON GUNTER
========================================= */

gunter.addEventListener("click", function() {

    gunterState = "ronroneando";

    showMessage(
        "¡Prrrrrr! Gunter está contento.",
        "¡Has acariciado a Gunter! Parece que le gusta.",
        "Gunter está ronroneando"
    );

    gunter.classList.add("active");

    setTimeout(() => {
        gunter.classList.remove("active");
    }, 1500);

});


/* =========================================
   INICIO DEL JUEGO
========================================= */

showMessage(
    "Gunter está descansando.",
    "¡Bienvenido! Puedes seleccionar los objetos o arrastrarlos por la habitación.",
    "Gunter está tranquilo"
);

console.log("Gunter's World iniciado correctamente.");
console.log("Objetos reconocidos:", objects.length);
