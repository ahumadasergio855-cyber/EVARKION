
/* =====================================================
   EVARKION - GOUNTER AI SYSTEM
   Mascota virtual autónoma
   Versión 3.0
===================================================== */

import { createGounterActions } from "./gounter-ai/actions.js";

document.addEventListener("DOMContentLoaded", () => {

    /* =================================================
       1. ELEMENTOS
    ================================================= */

    const room = document.getElementById("room");
    const cat = document.getElementById("gounter");
    const catArea = document.getElementById("cat-area");
    const message = document.getElementById("room-message");

    if (!room || !cat || !catArea) {
        console.error("Gounter: faltan elementos principales del HTML.");
        return;
    }

    const objects = [...document.querySelectorAll(".room-object")];

    const hungerBar = document.getElementById("hunger-bar");
    const thirstBar = document.getElementById("thirst-bar");
    const energyBar = document.getElementById("energy-bar");
    const happinessBar = document.getElementById("happiness-bar");

    const hungerValue = document.getElementById("hunger-value");
    const thirstValue = document.getElementById("thirst-value");
    const energyValue = document.getElementById("energy-value");
    const happinessValue = document.getElementById("happiness-value");

    /* =================================================
       2. CONFIGURACIÓN
    ================================================= */

    const clamp = (value, min = 0, max = 100) =>
        Math.max(min, Math.min(max, value));

    const random = (min, max) =>
        Math.random() * (max - min) + min;

    const delay = ms =>
        new Promise(resolve => setTimeout(resolve, ms));

    let busy = false;
    let currentState = "idle";
    let idleTimer = null;
    let decisionTimer = null;
    let messageTimer = null;
    let drag = null;
    let lastActivity = Date.now();

    const needs = {
        hunger: 65,
        thirst: 75,
        energy: 85,
        happiness: 90
    };

    const personality = {
        curiosity: 85,
        playfulness: 75,
        sociability: 65,
        independence: 80,
        calmness: 70
    };

    /* =================================================
       3. MEMORIA LOCAL
    ================================================= */

    const MEMORY_KEY = "evarkion_gounter_memory_v3";

    function loadMemory() {
        try {
            const saved = JSON.parse(localStorage.getItem(MEMORY_KEY));

            return {
                visits: saved?.visits || 0,
                activities: saved?.activities || {},
                discoveries: saved?.discoveries || [],
                favorites: saved?.favorites || [],
                lastLocation: saved?.lastLocation || "center"
            };
        } catch {
            return {
                visits: 0,
                activities: {},
                discoveries: [],
                favorites: [],
                lastLocation: "center"
            };
        }
    }

    const memory = loadMemory();

    memory.visits++;

    function saveMemory() {
        localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
    }

    function rememberActivity(activity) {
        memory.activities[activity] =
            (memory.activities[activity] || 0) + 1;

        lastActivity = Date.now();
        saveMemory();
    }

    function rememberLocation(location) {
        memory.lastLocation = location;

        if (!memory.discoveries.includes(location)) {
            memory.discoveries.push(location);
        }

        saveMemory();
    }

    /* =================================================
       4. MENSAJES
    ================================================= */

    function say(text, duration = 3000) {
        if (!message) return;

        message.textContent = text;
        message.classList.add("visible");

        clearTimeout(messageTimer);

        messageTimer = setTimeout(() => {
            message.classList.remove("visible");
        }, duration);
    }

    /* =================================================
       5. NECESIDADES
    ================================================= */

    function updateNeeds() {
        const bars = {
            hunger: [hungerBar, hungerValue],
            thirst: [thirstBar, thirstValue],
            energy: [energyBar, energyValue],
            happiness: [happinessBar, happinessValue]
        };

        Object.entries(bars).forEach(([key, elements]) => {
            const [bar, value] = elements;
            const amount = Math.round(needs[key]);

            if (bar) bar.style.width = `${amount}%`;
            if (value) value.textContent = `${amount}%`;

            if (bar) {
                bar.classList.toggle("low", amount < 25);
            }
        });
    }

    function changeNeed(name, amount) {
        if (!(name in needs)) return;

        needs[name] = clamp(needs[name] + amount);
        updateNeeds();
    }

    function degradeNeeds() {
        needs.hunger = clamp(needs.hunger - 0.12);
        needs.thirst = clamp(needs.thirst - 0.16);

        if (currentState !== "sleeping") {
            needs.energy = clamp(needs.energy - 0.07);
        }

        if (currentState !== "purring") {
            needs.happiness = clamp(needs.happiness - 0.035);
        }

        updateNeeds();
    }

    /* =================================================
       6. ESTADOS VISUALES
    ================================================= */

    const stateClasses = [
        "idle",
        "walking",
        "sniffing",
        "eating",
        "drinking",
        "sleeping",
        "playing",
        "purring",
        "observing",
        "curious",
        "grooming",
        "kneading",
        "jumping"
    ];

    function setState(state) {
        currentState = state;

        cat.classList.remove(...stateClasses);
        cat.classList.add(state);

        catArea.dataset.state = state;
    }

    /* =================================================
       7. POSICIÓN DEL GATO
    ================================================= */

    function prepareCatPosition() {
        const roomRect = room.getBoundingClientRect();

        const width = catArea.offsetWidth;
        const height = catArea.offsetHeight;

        const left = roomRect.width * 0.5 - width / 2;
        const top = roomRect.height * 0.68 - height / 2;

        catArea.style.left = `${left}px`;
        catArea.style.top = `${top}px`;
    }

    function getCatPosition() {
        const roomRect = room.getBoundingClientRect();
        const catRect = catArea.getBoundingClientRect();

        return {
            x: catRect.left - roomRect.left + catRect.width / 2,
            y: catRect.top - roomRect.top + catRect.height / 2
        };
    }

    function getObject(action) {
        return objects.find(object =>
            object.dataset.action === action
        );
    }

    function getObjectPosition(object) {
        if (!object) return null;

        const roomRect = room.getBoundingClientRect();
        const rect = object.getBoundingClientRect();

        return {
            x: rect.left - roomRect.left + rect.width / 2,
            y: rect.top - roomRect.top + rect.height / 2
        };
    }

    /* =================================================
       8. MOVIMIENTO
    ================================================= */

    function walkTo(x, y) {
        return new Promise(resolve => {
            const roomWidth = room.clientWidth;
            const roomHeight = room.clientHeight;

            const catWidth = catArea.offsetWidth;
            const catHeight = catArea.offsetHeight;

            const targetX = clamp(
                x - catWidth / 2,
                0,
                roomWidth - catWidth
            );

            const targetY = clamp(
                y - catHeight / 2,
                0,
                roomHeight - catHeight
            );

            const currentX = parseFloat(catArea.style.left) || 0;
            const currentY = parseFloat(catArea.style.top) || 0;

            const distance = Math.hypot(
                targetX - currentX,
                targetY - currentY
            );

            if (distance < 8) {
                resolve(true);
                return;
            }

            cat.classList.toggle(
                "facing-left",
                targetX < currentX
            );

            cat.classList.toggle(
                "facing-right",
                targetX >= currentX
            );

            setState("walking");

            const duration = clamp(distance * 4, 500, 3000);

            catArea.style.transition =
                `left ${duration}ms ease-in-out, top ${duration}ms ease-in-out`;

            requestAnimationFrame(() => {
                catArea.style.left = `${targetX}px`;
                catArea.style.top = `${targetY}px`;
            });

            setTimeout(() => {
                catArea.style.transition = "";
                setState("idle");
                resolve(true);
            }, duration + 50);
        });
    }

    /* =================================================
       9. UBICACIONES DE LA HABITACIÓN
    ================================================= */

    const locations = [
        { name: "ventana", x: 60, y: 35 },
        { name: "cama", x: 22, y: 68 },
        { name: "alfombra", x: 57, y: 84 },
        { name: "estanteria", x: 29, y: 28 },
        { name: "sillon", x: 44, y: 58 },
        { name: "plantas", x: 24, y: 16 },
        { name: "guitarra", x: 83, y: 65 },
        { name: "rascador", x: 76, y: 61 }
    ];

    async function visitLocation(location) {
        const x = room.clientWidth * location.x / 100;
        const y = room.clientHeight * location.y / 100;

        await walkTo(x, y);

        rememberLocation(location.name);

        setState("observing");
        say(`Gounter está explorando ${location.name}.`);

        await delay(1800);

        setState("idle");
    }

    /* =================================================
       10. EFECTOS VISUALES
    ================================================= */

    function createEffect(className, x, y) {
        const effect = document.createElement("div");

        effect.className = className;
        effect.style.left = `${x}px`;
        effect.style.top = `${y}px`;

        room.appendChild(effect);

        setTimeout(() => effect.remove(), 1800);
    }

    function createHearts() {
        const position = getCatPosition();

        for (let i = 0; i < 3; i++) {
            createEffect(
                "gounter-heart",
                position.x + random(-30, 30),
                position.y - random(40, 90)
            );
        }
    }

    function createFootprint() {
        if (currentState !== "walking") return;

        const position = getCatPosition();

        createEffect(
            "gounter-footprint",
            position.x + random(-15, 15),
            position.y + 55
        );
    }

    /* =================================================
       11. SISTEMA DE ACCIONES
    ================================================= */

    const actions = createGounterActions({
        getObject,
        walkTo,
        getObjectPosition,
        say,
        setState,
        delay,
        changeNeed,
        rememberActivity
    });

    async function executeAction(action) {
        if (busy || drag) return;

        busy = true;

        try {
            if (action === "food") {
                await actions.eat();
            }

            if (action === "water") {
                await actions.drink();
            }

            if (action === "sack") {
                await actions.play();
            }

            if (action === "box") {
                await actions.sleep();
            }
        } catch (error) {
            console.error("Gounter action error:", error);
            setState("idle");
            say("Gounter se ha distraído...");
        } finally {
            busy = false;
            scheduleDecision();
        }
    }

    /* =================================================
       12. DECISIONES AUTÓNOMAS
    ================================================= */

    async function autonomousDecision() {
        if (busy || drag) return;

        busy = true;

        try {
            if (needs.hunger < 35) {
                await actions.eat();
                return;
            }

            if (needs.thirst < 35) {
                await actions.drink();
                return;
            }

            if (needs.energy < 25) {
                await actions.sleep();
                return;
            }

            if (needs.happiness < 30) {
                await actions.play();
                return;
            }

            const choice = Math.random();

            if (choice < 0.65) {
                const location =
                    locations[Math.floor(Math.random() * locations.length)];

                await visitLocation(location);
            } else if (choice < 0.82) {
                setState("grooming");
                say("Gounter se está acicalando.");
                await delay(2500);
                rememberActivity("groom");
            } else {
                setState("observing");
                say("Gounter está observando la habitación.");
                await delay(2500);
                rememberActivity("observe");
            }

        } catch (error) {
            console.error("Gounter AI error:", error);
            setState("idle");
        } finally {
            busy = false;
            scheduleDecision();
        }
    }

    function scheduleDecision() {
        clearTimeout(decisionTimer);

        decisionTimer = setTimeout(
            autonomousDecision,
            random(7000, 14000)
        );
    }

    /* =================================================
       13. INTERACCIÓN CON EL GATO
    ================================================= */

    cat.addEventListener("click", event => {
        event.stopPropagation();

        if (busy || drag) return;

        setState("purring");

        changeNeed("happiness", 5);
        rememberActivity("pet");

        createHearts();

        say("¡Miau! A Gounter le gustan las caricias.");

        clearTimeout(idleTimer);

        idleTimer = setTimeout(() => {
            if (!busy) setState("idle");
        }, 2500);
    });

    /* =================================================
       14. ARRASTRAR OBJETOS
    ================================================= */

    objects.forEach(object => {

        object.addEventListener("pointerdown", event => {
            if (busy) return;

            event.preventDefault();

            const rect = object.getBoundingClientRect();
            const roomRect = room.getBoundingClientRect();

            drag = {
                object,
                pointerId: event.pointerId,
                offsetX: event.clientX - rect.left,
                offsetY: event.clientY - rect.top
            };

            object.setPointerCapture(event.pointerId);
            object.classList.add("dragging");
        });

        object.addEventListener("pointermove", event => {
            if (!drag || drag.object !== object) return;

            const roomRect = room.getBoundingClientRect();

            const x =
                event.clientX - roomRect.left - drag.offsetX;

            const y =
                event.clientY - roomRect.top - drag.offsetY;

            object.style.left =
                `${clamp(x, 0, room.clientWidth - object.offsetWidth)}px`;

            object.style.top =
                `${clamp(y, 0, room.clientHeight - object.offsetHeight)}px`;

            object.style.right = "auto";
            object.style.bottom = "auto";
        });

        object.addEventListener("pointerup", event => {
            if (!drag || drag.object !== object) return;

            object.classList.remove("dragging");

            const action = object.dataset.action;
            const position = getObjectPosition(object);
            const catPosition = getCatPosition();

            const distance = Math.hypot(
                position.x - catPosition.x,
                position.y - catPosition.y
            );

            drag = null;

            if (distance < 190) {
                executeAction(action);
            } else {
                say("Gounter está mirando el objeto desde lejos.");
            }
        });

        object.addEventListener("pointercancel", () => {
            if (drag?.object === object) {
                drag = null;
                object.classList.remove("dragging");
            }
        });

        object.addEventListener("click", event => {
            if (drag) return;

            executeAction(object.dataset.action);
        });
    });

    /* =================================================
       15. INICIALIZACIÓN
    ================================================= */

    function initialize() {
        prepareCatPosition();

        setState("idle");
        updateNeeds();

        say("¡Bienvenido de nuevo! Gounter está en su refugio.");

        scheduleDecision();

        setInterval(degradeNeeds, 10000);
        setInterval(createFootprint, 700);

        window.addEventListener("resize", prepareCatPosition);

        console.log("EVARKION: Gounter AI iniciado correctamente.");
    }

    if (document.readyState === "complete") {
        initialize();
    } else {
        window.addEventListener("load", initialize, { once: true });
    }

    /* =================================================
       16. LIMPIEZA
    ================================================= */

    window.addEventListener("beforeunload", () => {
        clearTimeout(idleTimer);
        clearTimeout(decisionTimer);
        clearTimeout(messageTimer);
        saveMemory();
    });

});
