
/* =========================================
   EVARKION - GOUNTER GAME SYSTEM
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const room = document.getElementById("room");
    const cat = document.getElementById("gounter");
    const message = document.getElementById("room-message");

    const objects = document.querySelectorAll(".room-object");

    let currentAction = null;
    let messageTimeout = null;
    let actionTimeout = null;

    let isDragging = false;
    let dragMoved = false;

    let startX = 0;
    let startY = 0;

    let currentObject = null;
    let initialTransform = "";

    /* =====================================
       MENSAJES
    ===================================== */

    function showMessage(text, duration = 3000) {

        message.textContent = text;
        message.classList.add("visible");

        clearTimeout(messageTimeout);

        messageTimeout = setTimeout(() => {
            message.classList.remove("visible");
        }, duration);
    }

    /* =====================================
       MOVIMIENTO DE GOUNTER
    ===================================== */

    function moveCatTo(object) {

        const roomRect = room.getBoundingClientRect();
        const objectRect = object.getBoundingClientRect();

        const targetX =
            objectRect.left +
            objectRect.width / 2 -
            roomRect.left;

        const halfCat = cat.parentElement.offsetWidth / 2;

        const safeX = Math.max(
            halfCat,
            Math.min(roomRect.width - halfCat, targetX)
        );

        cat.classList.remove(
            "purring",
            "eating",
            "drinking"
        );

        cat.classList.add("walking");

        cat.parentElement.style.left = `${safeX}px`;

        showMessage("¡Gounter se acerca!");

        setTimeout(() => {

            cat.classList.remove("walking");

        }, 900);
    }

    /* =====================================
       ACCIONES DE GOUNTER
    ===================================== */

    function performAction(action) {

        if (currentAction) {
            clearTimeout(actionTimeout);
        }

        currentAction = action;

        cat.classList.remove(
            "walking",
            "eating",
            "drinking",
            "purring"
        );

        switch (action) {

            case "food":

                cat.classList.add("eating");

                showMessage("¡Ñam, ñam! Gounter está comiendo. 🐱");

                break;

            case "water":

                cat.classList.add("drinking");

                showMessage("Gounter está bebiendo agua. 💧");

                break;

            case "sack":

                showMessage("Gounter está investigando el saco. 🐾");

                cat.classList.add("purring");

                break;

            case "box":

                showMessage("¡Gounter ha encontrado su caja favorita! 📦");

                cat.classList.add("purring");

                break;

            default:
                return;
        }

        actionTimeout = setTimeout(() => {

            cat.classList.remove(
                "walking",
                "eating",
                "drinking",
                "purring"
            );

            currentAction = null;

        }, 3500);
    }

    /* =====================================
       INTERACCIÓN CON OBJETOS
    ===================================== */

    function interactWithObject(object) {

        const action = object.dataset.action;

        if (!action) return;

        moveCatTo(object);

        setTimeout(() => {
            performAction(action);
        }, 900);
    }

    /* =====================================
       ARRASTRAR OBJETOS
    ===================================== */

    objects.forEach(object => {

        object.addEventListener("pointerdown", event => {

            if (event.button !== 0) return;

            isDragging = true;
            dragMoved = false;

            currentObject = object;

            startX = event.clientX;
            startY = event.clientY;

            initialTransform =
                object.style.transform || "";

            object.setPointerCapture(event.pointerId);

        });

        object.addEventListener("pointermove", event => {

            if (!isDragging || currentObject !== object) return;

            const deltaX = event.clientX - startX;
            const deltaY = event.clientY - startY;

            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                dragMoved = true;
            }

            if (dragMoved) {

                object.style.transform =
                    `translate(${deltaX}px, ${deltaY}px)`;

            }

        });

        object.addEventListener("pointerup", () => {

            if (!isDragging || currentObject !== object) return;

            isDragging = false;

            if (dragMoved) {

                interactWithObject(object);

            } else {

                object.style.transform = initialTransform;

                interactWithObject(object);

            }

            currentObject = null;

        });

        object.addEventListener("pointercancel", () => {

            isDragging = false;
            currentObject = null;

        });

    });

    /* =====================================
       ACARICIAR A GOUNTER
    ===================================== */

    cat.addEventListener("click", () => {

        clearTimeout(actionTimeout);

        cat.classList.remove(
            "walking",
            "eating",
            "drinking"
        );

        cat.classList.add("purring");

        showMessage("¡Prrrrrr! A Gounter le encantan las caricias. ❤️");

        actionTimeout = setTimeout(() => {

            cat.classList.remove("purring");

            currentAction = null;

        }, 2500);

    });

    /* =====================================
       INICIALIZACIÓN
    ===================================== */

    showMessage("¡Bienvenido al refugio de Gounter!");

});
