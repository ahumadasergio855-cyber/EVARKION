
/* =============================================
   EVARKION - GOUNTER PET SYSTEM
   Sistema de mascota virtual
============================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       ELEMENTOS PRINCIPALES
    ========================================= */

    const room = document.getElementById("room");
    const cat = document.getElementById("gounter");
    const catArea = document.getElementById("cat-area");
    const message = document.getElementById("room-message");

    const objects = document.querySelectorAll(".room-object");

    if (!room || !cat || !catArea) {
        console.error("EVARKION: No se encontraron los elementos de Gounter.");
        return;
    }

    /* =========================================
       CONFIGURACIÓN GENERAL
    ========================================= */

    let busy = false;
    let currentAction = null;

    let messageTimer = null;
    let idleTimer = null;
    let needsTimer = null;

    let drag = null;

    const clamp = (value, min, max) =>
        Math.max(min, Math.min(max, value));

    const delay = ms =>
        new Promise(resolve => setTimeout(resolve, ms));


    /* =========================================
       NECESIDADES DE GOUNTER
    ========================================= */

    const needs = {
        hunger: 65,
        thirst: 75,
        energy: 85,
        happiness: 90
    };


    /* =========================================
       ACTUALIZAR INTERFAZ
    ========================================= */

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

            if (!bar) return;

            const amount = Math.round(needs[need]);

            bar.style.width = `${amount}%`;
            bar.classList.toggle("low", amount < 25);

            if (value) {
                value.textContent = `${amount}%`;
            }

        });
    }


    /* =========================================
       MODIFICAR NECESIDADES
    ========================================= */

    function changeNeed(need, amount) {

        if (!(need in needs)) return;

        needs[need] = clamp(
            needs[need] + amount,
            0,
            100
        );

        updateNeedsUI();
    }


    /* =========================================
       RECOMPENSAS DE INTERACCIÓN
    ========================================= */

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


    /* =========================================
       MENSAJES DE GOUNTER
    ========================================= */

    function say(text, duration = 3500) {

        if (!message) return;

        message.textContent = text;
        message.style.opacity = "1";

        clearTimeout(messageTimer);

        messageTimer = setTimeout(() => {

            message.style.opacity = "0";

        }, duration);
    }


    /* =========================================
       ESTADOS DEL GATO
    ========================================= */

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


    /* =========================================
       SOMBRA DINÁMICA
    ========================================= */

    function createCatShadow() {

        let shadow = catArea.querySelector(".cat-shadow");

        if (!shadow) {

            shadow = document.createElement("div");

            shadow.className = "cat-shadow";

            catArea.insertBefore(shadow, cat);

        }

        return shadow;
    }

    createCatShadow();


    /* =========================================
       POSICIÓN DEL GATO
    ========================================= */

    function getCatPosition() {

        const roomRect = room.getBoundingClientRect();
        const catRect = catArea.getBoundingClientRect();

        return {

            x: catRect.left + catRect.width / 2 - roomRect.left,

            y: catRect.top + catRect.height / 2 - roomRect.top

        };
    }


    /* =========================================
       CORAZONES AL ACARICIAR
    ========================================= */

    function showHearts() {

        const roomRect = room.getBoundingClientRect();
        const catRect = cat.getBoundingClientRect();

        const centerX =
            catRect.left - roomRect.left + catRect.width / 2;

        const topY =
            catRect.top - roomRect.top + 10;

        const hearts = ["♥", "♡", "♥", "❤"];

        hearts.forEach((symbol, index) => {

            const heart = document.createElement("span");

            heart.className = "heart-float";

            heart.textContent = symbol;

            heart.style.left =
                `${centerX + (Math.random() - 0.5) * 65}px`;

            heart.style.top =
                `${topY + Math.random() * 25}px`;

            heart.style.animationDelay =
                `${index * 180}ms`;

            room.appendChild(heart);

            setTimeout(() => {
                heart.remove();
            }, 2500);

        });
    }


    /* =========================================
       HUELLAS TEMPORALES
    ========================================= */

    function createPaw(x, y, index = 0) {

        const paw = document.createElement("span");

        paw.className = "cat-paw";

        paw.textContent = "🐾";

        paw.style.left = `${x}px`;
        paw.style.top = `${y}px`;

        paw.style.transform =
            `rotate(${index % 2 === 0 ? -15 : 15}deg)`;

        room.appendChild(paw);

        setTimeout(() => {

            paw.remove();

        }, 2400);
    }


    /* =========================================
       GENERAR RASTRO DE HUELLAS
    ========================================= */

    function createPawTrail(start, target, duration) {

        const distance = Math.hypot(
            target.x - start.x,
            target.y - start.y
        );

        const numberOfPaws = Math.min(
            16,
            Math.max(3, Math.floor(distance / 38))
        );

        for (let i = 0; i < numberOfPaws; i++) {

            const progress =
                (i + 1) / (numberOfPaws + 1);

            const x =
                start.x +
                (target.x - start.x) * progress;

            const y =
                start.y +
                (target.y - start.y) * progress;

            const side =
                i % 2 === 0 ? -7 : 7;

            setTimeout(() => {

                createPaw(
                    x + side,
                    y + catArea.offsetHeight * 0.32,
                    i
                );

            }, duration * progress);
        }
    }


    /* =========================================
       MOVIMIENTO NATURAL
    ========================================= */

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

            if (distance < 8) {
                resolve();
                return;
            }

            const duration = clamp(
                distance * 4,
                900,
                2600
            );

            /* Orientación */

            cat.classList.toggle(
                "facing-left",
                targetX < start.x
            );

            /* Animación */

            setState("walking");

            /* Huellas */

            createPawTrail(
                start,
                { x: targetX, y: targetY },
                duration
            );

            /* Desplazamiento */

            catArea.style.left =
                `${targetX - catWidth / 2}px`;

            catArea.style.top =
                `${targetY - catHeight / 2}px`;

            setTimeout(() => {

                setState(null);

                resolve();

            }, duration);

        });
    }


    /* =========================================
       POSICIÓN DE LOS OBJETOS
    ========================================= */

    function getTargetPosition(object) {

        const roomRect = room.getBoundingClientRect();
        const rect = object.getBoundingClientRect();

        const objectX =
            rect.left + rect.width / 2 - roomRect.left;

        const objectY =
            rect.top + rect.height / 2 - roomRect.top;

        const catWidth = catArea.offsetWidth;

        const offset =
            objectX < room.clientWidth / 2
                ? catWidth * 0.43
                : -catWidth * 0.43;

        return {

            x: objectX + offset,

            y: objectY + 20

        };
    }


    /* =========================================
       COMPROBAR DISTANCIA
    ========================================= */

    function isCloseToCat(object) {

        const catPosition = getCatPosition();

        const roomRect = room.getBoundingClientRect();
        const rect = object.getBoundingClientRect();

        const x =
            rect.left + rect.width / 2 - roomRect.left;

        const y =
            rect.top + rect.height / 2 - roomRect.top;

        return Math.hypot(
            x - catPosition.x,
            y - catPosition.y
        ) < 190;
    }


    /* =========================================
       COMER
    ========================================= */

    async function eat() {

        say("Gounter está olfateando su comida...");

        setState("sniffing");

        await delay(900);

        say("¡Ñam, ñam! Gounter está comiendo. 🐱");

        setState("eating");

        await delay(4500);

        rewardInteraction("food");

        setState(null);

        say("Gounter ha terminado de comer. ❤️");
    }


    /* =========================================
       BEBER AGUA
    ========================================= */

    async function drink() {

        say("Gounter se acerca al agua...");

        setState("sniffing");

        await delay(800);

        say("Gounter está bebiendo agua. 💧");

        setState("drinking");

        await delay(3500);

        rewardInteraction("water");

        setState(null);

        say("Gounter ha terminado de beber.");
    }


    /* =========================================
       EXPLORAR EL SACO
    ========================================= */

    async function explore() {

        say("¿Qué habrá aquí dentro? Gounter está investigando.");

        setState("sniffing");

        await delay(1800);

        say("¡Gounter ha encontrado algo interesante!");

        setState("playing");

        await delay(3000);

        rewardInteraction("sack");

        setState(null);

        say("Gounter vuelve a explorar la habitación.");
    }


    /* =========================================
       DORMIR EN LA CAJA
    ========================================= */

    async function sleepInBox() {

        say("Gounter está acomodándose en su caja...");

        setState("sniffing");

        await delay(1200);

        say("Zzz... Gounter está durmiendo. 💤");

        setState("sleeping");

        await delay(8000);

        rewardInteraction("box");

        setState(null);

        say("Gounter se ha despertado y está descansado.");
    }


    /* =========================================
       INTERACTUAR CON OBJETOS
    ========================================= */

    async function interact(object) {

        if (busy || !object) return;

        busy = true;

        try {

            const action = object.dataset.action;

            const target = getTargetPosition(object);

            /* Acercarse al objeto */

            await walkTo(target.x, target.y);

            setState("sniffing");

            await delay(700);

            /* Ejecutar actividad */

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

                default:

                    say("Gounter está investigando este objeto.");

            }

        } catch (error) {

            console.error("Error al interactuar con Gounter:", error);

            setState(null);

            say("Gounter ha tenido un pequeño problema.");

        } finally {

            busy = false;

            scheduleIdle();

        }
    }


    /* =========================================
       ARRASTRAR Y MOVER OBJETOS
    ========================================= */

    objects.forEach(object => {

        object.addEventListener("pointerdown", event => {

            if (event.button !== 0 || busy) return;

            event.preventDefault();

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

            const x =
                event.clientX -
                roomRect.left -
                drag.offsetX;

            const y =
                event.clientY -
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

            /* Tanto mover como pulsar permite interactuar */

            await interact(object);

        });


        object.addEventListener("pointercancel", () => {

            drag = null;

            object.style.zIndex = "4";

        });

    });


    /* =========================================
       ACARICIAR A GOUNTER
    ========================================= */

    cat.addEventListener("click", async () => {

        if (busy) return;

        busy = true;

        clearTimeout(idleTimer);

        setState("purring");

        /* Corazones */

        showHearts();

        /* Felicidad */

        rewardInteraction("pet");

        say("¡Prrrrrr! Gounter está disfrutando de las caricias. ❤️");

        await delay(3000);

        setState(null);

        busy = false;

        scheduleIdle();

    });


    /* =========================================
       EVOLUCIÓN DE LAS NECESIDADES
    ========================================= */

    needsTimer = setInterval(() => {

        // El hambre disminuye lentamente.
        changeNeed("hunger", -0.12);

        // La sed disminuye lentamente.
        changeNeed("thirst", -0.16);

        // La energía baja cuando está despierto.
        if (currentAction !== "sleeping") {

            changeNeed("energy", -0.05);

        }

        // La felicidad disminuye lentamente.
        if (currentAction !== "purring") {

            changeNeed("happiness", -0.025);

        }

    }, 10000);


    /* =========================================
       COMPORTAMIENTO AUTÓNOMO
    ========================================= */

    function scheduleIdle() {

        clearTimeout(idleTimer);

        idleTimer = setTimeout(async () => {

            if (busy) {

                scheduleIdle();

                return;
            }

            try {

                /* Cansancio */

                if (needs.energy < 25) {

                    const box = document.querySelector(
                        '.room-object[data-action="box"]'
                    );

                    if (box) {

                        await interact(box);

                    } else {

                        say("Gounter tiene sueño...");

                    }

                }

                /* Hambre */

                else if (needs.hunger < 25) {

                    say("Miau... Gounter parece tener hambre.");

                }

                /* Sed */

                else if (needs.thirst < 25) {

                    say("Gounter está buscando agua.");

                }

                /* Exploración */

                else {

                    const current = getCatPosition();

                    const x = clamp(

                        current.x +
                        (Math.random() - 0.5) * 180,

                        140,

                        room.clientWidth - 140

                    );

                    const y = clamp(

                        current.y +
                        (Math.random() - 0.5) * 90,

                        280,

                        room.clientHeight - 150

                    );

                    await walkTo(x, y);

                }

            } catch (error) {

                console.error("Error en comportamiento autónomo:", error);

            }

            scheduleIdle();

        }, 14000 + Math.random() * 10000);

    }


    /* =========================================
       INICIALIZACIÓN
    ========================================= */

    cat.classList.remove("facing-left");

    updateNeedsUI();

    say("Gounter está descansando. ¡Ven a jugar con él!");

    scheduleIdle();


    /* =========================================
       LIMPIEZA
    ========================================= */

    window.addEventListener("beforeunload", () => {

        clearTimeout(idleTimer);
        clearTimeout(messageTimer);
        clearInterval(needsTimer);

    });

    console.log("EVARKION: Gounter Pet System iniciado correctamente.");

});
