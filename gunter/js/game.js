
/* =========================================
   EVARKION - GOUNTER PET SYSTEM
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const room = document.getElementById("room");
    const cat = document.getElementById("gounter");
    const catArea = document.getElementById("cat-area");
    const message = document.getElementById("room-message");

    const objects = document.querySelectorAll(".room-object");

    
const needs = {
    hunger: 65,
    thirst: 75,
    energy: 85,
    happiness: 90
};

/* =====================================
   ACTUALIZAR INTERFAZ DE NECESIDADES
===================================== */

function updateNeedsUI() {

    const bars = {
        hunger: "hunger-bar",
        thirst: "thirst-bar",
        energy: "energy-bar",
        happiness: "happiness-bar"
    };

    Object.entries(bars).forEach(([need, id]) => {

        const bar = document.getElementById(id);
        const value = document.getElementById(`${need}-value`);

        if (!bar || !value) return;

        const amount = Math.round(needs[need]);

        bar.style.width = `${amount}%`;
        bar.classList.toggle("low", amount < 25);

        value.textContent = `${amount}%`;
    });
}

/* =====================================
   MODIFICAR NECESIDADES
===================================== */

function changeNeed(need, amount) {

    if (!(need in needs)) return;

    needs[need] = Math.max(
        0,
        Math.min(100, needs[need] + amount)
    );

    updateNeedsUI();
}

/* =====================================
   RECOMPENSAS POR INTERACCIÓN
===================================== */

function rewardInteraction(action) {

    switch (action) {

        case "food":
            changeNeed("hunger", 45);
            changeNeed("happiness", 5);
            break;

        case "water":
            changeNeed("thirst", 50);
            changeNeed("happiness", 5);
            break;

        case "box":
            changeNeed("energy", 35);
            changeNeed("happiness", 8);
            break;

        case "sack":
            changeNeed("happiness", 8);
            changeNeed("energy", -3);
            break;

        case "pet":
            changeNeed("happiness", 12);
            break;
    }
}

/* =====================================
   INICIO DE LAS BARRAS
===================================== */

updateNeedsUI();


    let busy = false;
    let currentAction = null;

    let messageTimer;
    let idleTimer;

    let drag = null;

    const clamp = (value, min, max) =>
        Math.max(min, Math.min(max, value));

    /* =====================================
       MENSAJES
    ===================================== */

    function say(text, duration = 3000) {

        message.textContent = text;
        message.style.opacity = "1";

        clearTimeout(messageTimer);

        messageTimer = setTimeout(() => {
            message.style.opacity = "0";
        }, duration);
    }

    /* =====================================
       ESTADOS DEL GATO
    ===================================== */

    function setState(state) {

        cat.classList.remove(
            "walking",
            "sniffing",
            "eating",
            "drinking",
            "sleeping",
            "playing",
            "purring"
        );

        if (state) {
            cat.classList.add(state);
        }

        currentAction = state;
    }

    /* =====================================
       POSICIÓN DEL GATO
    ===================================== */

    function getCatPosition() {

        const roomRect = room.getBoundingClientRect();

        const catRect = catArea.getBoundingClientRect();

        return {
            x: catRect.left + catRect.width / 2 - roomRect.left,
            y: catRect.top + catRect.height / 2 - roomRect.top
        };
    }

    /* =====================================
       MOVIMIENTO NATURAL
    ===================================== */

    function walkTo(x, y) {

        return new Promise(resolve => {

            const roomWidth = room.clientWidth;
            const roomHeight = room.clientHeight;

            const catWidth = catArea.offsetWidth;
            const catHeight = catArea.offsetHeight;

            const targetX = clamp(
                x,
                catWidth / 2,
                roomWidth - catWidth / 2
            );

            const targetY = clamp(
                y,
                catHeight / 2 + 40,
                roomHeight - catHeight / 2 - 20
            );

            const start = getCatPosition();

            const distance = Math.hypot(
                targetX - start.x,
                targetY - start.y
            );

            const duration = clamp(
                distance * 4,
                900,
                2600
            );

            // Orientar el gato hacia el destino.
            cat.style.transform =
                targetX < start.x
                    ? "scaleX(-1)"
                    : "scaleX(1)";

            setState("walking");

            // La posición final se interpola mediante CSS.
            catArea.style.left = `${targetX}px`;
            catArea.style.top = `${targetY}px`;

            setTimeout(() => {
                setState(null);
                resolve();
            }, duration);
        });
    }

    /* =====================================
       ACERCARSE A UN OBJETO
    ===================================== */

    function getTargetPosition(object) {

        const roomRect = room.getBoundingClientRect();
        const rect = object.getBoundingClientRect();

        const objectX =
            rect.left + rect.width / 2 - roomRect.left;

        const objectY =
            rect.top + rect.height / 2 - roomRect.top;

        const catWidth = catArea.offsetWidth;

        const offset = objectX < room.clientWidth / 2
            ? catWidth * .43
            : -catWidth * .43;

        return {
            x: objectX + offset,
            y: objectY + 20
        };
    }

    /* =====================================
       DETECTAR OBJETO
    ===================================== */

    function isCloseToCat(object) {

        const catPosition = getCatPosition();
        const roomRect = room.getBoundingClientRect();
        const rect = object.getBoundingClientRect();

        const x = rect.left + rect.width / 2 - roomRect.left;
        const y = rect.top + rect.height / 2 - roomRect.top;

        return Math.hypot(
            x - catPosition.x,
            y - catPosition.y
        ) < 190;
    }

    /* =====================================
       COMER
    ===================================== */

    async function eat() {

        say("Gounter está olfateando su comida...");

        setState("sniffing");

        await delay(900);

        say("¡Ñam, ñam! Gounter está comiendo. 🐱");

        setState("eating");

        await delay(4500);

        needs.hunger = clamp(
            needs.hunger + 45,
            0,
            100
        );

        setState(null);

        say("Gounter ha terminado de comer. ❤️");

    }

    /* =====================================
       BEBER
    ===================================== */

    async function drink() {

        say("Gounter se acerca al agua...");

        setState("sniffing");

        await delay(800);

        say("Gounter está bebiendo agua. 💧");

        setState("drinking");

        await delay(3500);

        needs.thirst = clamp(
            needs.thirst + 50,
            0,
            100
        );

        setState(null);

        say("Gounter ha terminado de beber.");

    }

    /* =====================================
       INVESTIGAR EL SACO
    ===================================== */

    async function explore() {

        say("¿Qué habrá aquí dentro? Gounter está investigando.");

        setState("sniffing");

        await delay(1800);

        say("¡Gounter ha encontrado algo interesante!");

        setState("playing");

        await delay(3000);

        needs.energy = clamp(
            needs.energy - 5,
            0,
            100
        );

        setState(null);

        say("Gounter vuelve a explorar la habitación.");

    }

    /* =====================================
       DORMIR EN LA CAJA
    ===================================== */

    async function sleepInBox() {

        say("Gounter está acomodándose en su caja...");

        setState("sniffing");

        await delay(1200);

        say("Zzz... Gounter está durmiendo. 💤");

        setState("sleeping");

        await delay(8000);

        needs.energy = clamp(
            needs.energy + 35,
            0,
            100
        );

        setState(null);

        say("Gounter se ha despertado y está descansado.");

    }

    /* =====================================
       ESPERA
    ===================================== */

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /* =====================================
       INTERACCIÓN CON OBJETOS
    ===================================== */

    async function interact(object) {

        if (busy) return;

        busy = true;

        const action = object.dataset.action;

        const target = getTargetPosition(object);

        await walkTo(target.x, target.y);

        setState("sniffing");

        await delay(700);

        switch (action) {

            case "food":
                await eat();
                break;

            case "water":
                await drink();
                break;

            case "sack":
                await explore();
                break;

            case "box":
                await sleepInBox();
                break;

        }

        busy = false;

    }

    /* =====================================
       ARRASTRAR OBJETOS
    ===================================== */

    objects.forEach(object => {

        object.addEventListener("pointerdown", event => {

            if (event.button !== 0 || busy) return;

            const roomRect = room.getBoundingClientRect();
            const rect = object.getBoundingClientRect();

            drag = {
                object,
                pointerId: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                offsetX: event.clientX - rect.left,
                offsetY: event.clientY - rect.top,
                moved: false
            };

            object.setPointerCapture(event.pointerId);

            object.style.zIndex = "30";
        });

        object.addEventListener("pointermove", event => {

            if (!drag || drag.object !== object) return;

            const dx = event.clientX - drag.startX;
            const dy = event.clientY - drag.startY;

            if (Math.hypot(dx, dy) > 5) {
                drag.moved = true;
            }

            if (!drag.moved) return;

            const roomRect = room.getBoundingClientRect();

            const x = event.clientX -
                roomRect.left -
                drag.offsetX;

            const y = event.clientY -
                roomRect.top -
                drag.offsetY;

            object.style.left = `${clamp(
                x,
                0,
                room.clientWidth - object.offsetWidth
            )}px`;

            object.style.top = `${clamp(
                y,
                45,
                room.clientHeight - object.offsetHeight
            )}px`;

        });

        object.addEventListener("pointerup", async event => {

            if (!drag || drag.object !== object) return;

            const moved = drag.moved;

            drag = null;

            object.style.zIndex = "4";

            if (moved) {

                // Gounter sigue el objeto hasta su nueva posición.
                await interact(object);

            } else {

                // Si se pulsa sin moverlo, también puede interactuar.
                await interact(object);

            }

        });

        object.addEventListener("pointercancel", () => {
            drag = null;
            object.style.zIndex = "4";
        });

    });

    /* =====================================
       ACARICIAR A GOUNTER
    ===================================== */

    cat.addEventListener("click", async () => {

        if (busy) return;

        busy = true;

        clearTimeout(idleTimer);

        setState("purring");

        say("¡Prrrrrr! Gounter está disfrutando de las caricias. ❤️");

        await delay(3000);

        setState(null);

        busy = false;

    });

    /* =====================================
       NECESIDADES
    ===================================== */

    setInterval(() => {

        needs.hunger = clamp(
            needs.hunger - 0.12,
            0,
            100
        );

        needs.thirst = clamp(
            needs.thirst - 0.16,
            0,
            100
        );

        needs.energy = clamp(
            needs.energy - 0.05,
            0,
            100
        );

    }, 10000);

    /* =====================================
       COMPORTAMIENTO DE REPOSO
    ===================================== */

    function scheduleIdle() {

        clearTimeout(idleTimer);

        idleTimer = setTimeout(async () => {

            if (!busy) {

                // Si está cansado, busca su caja para dormir.
                if (needs.energy < 25) {

                    const box = document.querySelector(".box-object");

                    await interact(box);

                } else if (needs.hunger < 25) {

                    say("Miau... Gounter parece tener hambre.");

                } else if (needs.thirst < 25) {

                    say("Gounter está buscando agua.");

                } else {

                    say("Gounter está explorando tranquilamente.");

                    const current = getCatPosition();

                    const x = clamp(
                        current.x + (Math.random() - .5) * 180,
                        140,
                        room.clientWidth - 140
                    );

                    const y = clamp(
                        current.y + (Math.random() - .5) * 90,
                        280,
                        room.clientHeight - 150
                    );

                    await walkTo(x, y);

                }

            }

            scheduleIdle();

        }, 14000 + Math.random() * 10000);

    }

    /* =====================================
       INICIO
    ===================================== */

    cat.style.transform = "scaleX(1)";

    say("Gounter está descansando. ¡Ven a jugar con él!");

    scheduleIdle();

});
