
/* =============================================
   EVARKION - GOUNTER AI
   ACTIONS.JS
   Acciones físicas de Gounter
============================================= */

const room = document.getElementById("room");
const cat = document.getElementById("gounter");
const catArea = document.getElementById("cat-area");
const roomMessage = document.getElementById("room-message");

/* =============================================
   UTILIDADES
============================================= */

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getObject(action) {
    return document.querySelector(
        `.room-object[data-action="${action}"]`
    );
}

/* =============================================
   APPROACH OBJECT
   Gounter se acerca a un objeto
============================================= */

export async function approachObject(action) {

    const object = getObject(action);

    if (!object || !catArea || !room) {
        console.warn("Gounter no encuentra el objeto:", action);
        return false;
    }

    const roomRect = room.getBoundingClientRect();
    const objectRect = object.getBoundingClientRect();

    const targetX =
        objectRect.left +
        objectRect.width / 2 -
        roomRect.left;

    const targetY =
        objectRect.top +
        objectRect.height / 2 -
        roomRect.top;

    const catRect = catArea.getBoundingClientRect();

    const currentX =
        catRect.left +
        catRect.width / 2 -
        roomRect.left;

    const currentY =
        catRect.top +
        catRect.height / 2 -
        roomRect.top;

    const distance = Math.hypot(
        targetX - currentX,
        targetY - currentY
    );

    if (distance < 65) return true;

    cat.classList.add("walking");

    if (targetX < currentX) {
        cat.classList.add("facing-left");
        cat.classList.remove("facing-right");
    } else {
        cat.classList.add("facing-right");
        cat.classList.remove("facing-left");
    }

    const duration = Math.max(500, distance * 5);

    catArea.style.transition =
        `left ${duration}ms linear, top ${duration}ms linear`;

    catArea.style.left =
        `${targetX - catArea.offsetWidth / 2}px`;

    catArea.style.top =
        `${targetY - catArea.offsetHeight / 2}px`;

    await wait(duration);

    cat.classList.remove("walking");

    return true;
}

/* =============================================
   EAT
   Gounter come
============================================= */

export async function eat() {

    if (!cat) return;

    cat.classList.add("eating");

    if (roomMessage) {
        roomMessage.textContent = "Gounter está comiendo...";
    }

    await wait(2500);

    cat.classList.remove("eating");

    if (roomMessage) {
        roomMessage.textContent = "¡Gounter ha comido!";
    }

    return true;
}

/* =============================================
   DRINK
   Gounter bebe agua
============================================= */

export async function drink() {

    if (!cat) return;

    cat.classList.add("drinking");

    if (roomMessage) {
        roomMessage.textContent = "Gounter está bebiendo agua...";
    }

    await wait(2000);

    cat.classList.remove("drinking");

    if (roomMessage) {
        roomMessage.textContent = "¡Gounter ha bebido agua!";
    }

    return true;
}
