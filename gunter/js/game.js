
/* =====================================================
   EVARKION - GOUNTER AI SYSTEM
   Mascota virtual autónoma
   Version 2.1
===================================================== */

import { createGounterActions } from "./gounter-ai/actions.js";

document.addEventListener("DOMContentLoaded", () => {

    /* =================================================
       1. ELEMENTOS PRINCIPALES
    ================================================= */

    const room = document.getElementById("room");
    const cat = document.getElementById("gounter");
    const catArea = document.getElementById("cat-area");
    const message = document.getElementById("room-message");

    const objects = document.querySelectorAll(".room-object");

    if (!room || !cat || !catArea) {
        console.error("GOUNTER: No se encuentra la habitación.");
        return;
    }

    /* =================================================
       2. CONFIGURACIÓN
    ================================================= */

    const clamp = (v, min, max) =>
        Math.max(min, Math.min(max, v));

    const random = (min, max) =>
        Math.random() * (max - min) + min;

    const delay = ms =>
        new Promise(resolve => setTimeout(resolve, ms));

    let busy = false;
    let currentAction = "idle";
    let currentLocation = "floor";

    let idleTimer = null;
    let needsTimer = null;
    let messageTimer = null;
    let drag = null;

    let lastActivity = null;
    let lastDecision = 0;

    const DECISION_MIN = 7000;
    const DECISION_MAX = 14000;

    /* =================================================
       3. NECESIDADES
    ================================================= */

    const needs = {
        hunger: 65,
        thirst: 75,
        energy: 85,
        happiness: 90
    };

    function updateNeedsUI() {

        Object.entries(needs).forEach(([name, amount]) => {

            const bar = document.getElementById(`${name}-bar`);
            const value = document.getElementById(`${name}-value`);

            if (!bar) return;

            const number = Math.round(amount);

            bar.style.width = `${number}%`;
            bar.classList.toggle("low", number < 25);

            if (value) {
                value.textContent = `${number}%`;
            }

        });
    }

    function changeNeed(name, amount) {

        if (!(name in needs)) return;

        needs[name] = clamp(
            needs[name] + amount,
            0,
            100
        );

        updateNeedsUI();
    }

    /* =================================================
       4. PERSONALIDAD
    ================================================= */

    const personality = {
        curiosity: 85,
        playfulness: 75,
        sociability: 65,
        independence: 80,
        calmness: 70
    };

    /* =================================================
       5. MEMORIA DE GOUNTER
    ================================================= */

    const MEMORY_KEY = "evarkion_gounter_memory_v2";

    function loadMemory() {

        try {

            const saved = JSON.parse(
                localStorage.getItem(MEMORY_KEY)
            );

            if (saved && typeof saved === "object") {
                return {
                    visits: saved.visits || {},
                    favorites: saved.favorites || [],
                    activities: saved.activities || {},
                    discoveries: saved.discoveries || [],
                    lastLocation: saved.lastLocation || null
                };
            }

        } catch (error) {
            console.warn("Gounter: No se pudo cargar la memoria.");
        }

        return {
            visits: {},
            favorites: [],
            activities: {},
            discoveries: [],
            lastLocation: null
        };
    }

    const memory = loadMemory();

    function saveMemory() {

        try {
            localStorage.setItem(
                MEMORY_KEY,
                JSON.stringify(memory)
            );
        } catch (error) {
            console.warn("Gounter: No se pudo guardar la memoria.");
        }
    }

    function rememberLocation(id) {

        memory.visits[id] = (memory.visits[id] || 0) + 1;

        if (!memory.discoveries.includes(id)) {
            memory.discoveries.push(id);
        }

        memory.lastLocation = id;

        saveMemory();
    }

    function rememberActivity(action) {

        memory.activities[action] =
            (memory.activities[action] || 0) + 1;

        saveMemory();
    }

    /* =================================================
       6. ESTADOS VISUALES
    ================================================= */

    const stateClasses = [
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

        cat.classList.remove(...stateClasses);

        if (state) {
            cat.classList.add(state);
        }

        currentAction = state || "idle";
    }

    /* =================================================
       7. MENSAJES
    ================================================= */

    function say(text, duration = 3500) {

        if (!message) return;

        message.textContent = text;
        message.style.opacity = "1";

        clearTimeout(messageTimer);

        messageTimer = setTimeout(() => {
            message.style.opacity = "0";
        }, duration);
    }

    /* =================================================
       8. POSICIONAMIENTO INICIAL
    ================================================= */

    function prepareCatPosition() {

        const roomRect = room.getBoundingClientRect();
        const rect = catArea.getBoundingClientRect();

        catArea.style.position = "absolute";
        catArea.style.transform = "none";
        catArea.style.right = "auto";
        catArea.style.bottom = "auto";

        catArea.style.left =
            `${rect.left - roomRect.left}px`;

        catArea.style.top =
            `${rect.top - roomRect.top}px`;
    }

    prepareCatPosition();

    function getCatPosition() {

        const rect = room.getBoundingClientRect();
        const catRect = catArea.getBoundingClientRect();

        return {
            x: catRect.left + catRect.width / 2 - rect.left,
            y: catRect.top + catRect.height / 2 - rect.top
        };
    }

    /* =================================================
       9. RECONOCIMIENTO DE LA HABITACIÓN
    ================================================= */

    const locations = [

        {
            id: "main_bed",
            name: "la cama",
            x: 21,
            y: 68,
            type: "rest",
            actions: ["sleep", "observe", "knead"],
            interest: 75
        },

        {
            id: "cat_bed",
            name: "su pequeña cama",
            x: 55,
            y: 68,
            type: "rest",
            actions: ["sleep", "groom"],
            interest: 90
        },

        {
            id: "window",
            name: "el ventanal",
            x: 57,
            y: 53,
            type: "observation",
            actions: ["observe"],
            interest: 95
        },

        {
            id: "armchair",
            name: "el sillón",
            x: 42,
            y: 65,
            type: "rest",
            actions: ["sleep", "observe", "groom"],
            interest: 70
        },

        {
            id: "cat_tree",
            name: "el árbol rascador",
            x: 76,
            y: 65,
            type: "play",
            actions: ["play", "observe"],
            interest: 85
        },

        {
            id: "rug",
            name: "la alfombra",
            x: 59,
            y: 83,
            type: "play",
            actions: ["play", "sleep"],
            interest: 80
        },

        {
            id: "bookshelves",
            name: "las estanterías",
            x: 30,
            y: 46,
            type: "curiosity",
            actions: ["investigate"],
            interest: 65
        },

        {
            id: "guitar",
            name: "la guitarra",
            x: 83,
            y: 72,
            type: "curiosity",
            actions: ["investigate"],
            interest: 60
        },

        {
            id: "wardrobe",
            name: "el armario",
            x: 94,
            y: 58,
            type: "curiosity",
            actions: ["investigate"],
            interest: 55
        },

        {
            id: "plants",
            name: "las plantas",
            x: 28,
            y: 39,
            type: "curiosity",
            actions: ["investigate"],
            interest: 75
        }

    ];

    function getLocation(id) {
        return locations.find(item => item.id === id);
    }

    function getLocationPosition(location) {

        return {
            x: room.clientWidth * location.x / 100,
            y: room.clientHeight * location.y / 100
        };
    }

    /* =================================================
       10. MOVIMIENTO
    ================================================= */

    function walkTo(x, y) {

        return new Promise(resolve => {

            const width = catArea.offsetWidth;
            const height = catArea.offsetHeight;

            const start = getCatPosition();

            const targetX = clamp(
                x,
                width / 2,
                room.clientWidth - width / 2
            );

            const targetY = clamp(
                y,
                height / 2 + 35,
                room.clientHeight - height / 2 - 20
            );

            const distance = Math.hypot(
                targetX - start.x,
                targetY - start.y
            );

            if (distance < 10) {
                resolve(true);
                return;
            }

            const duration = clamp(
                distance * 4,
                900,
                2800
            );

            cat.classList.toggle(
                "facing-left",
                targetX < start.x
            );

            cat.classList.toggle(
                "facing-right",
                targetX >= start.x
            );

            setState("walking");

            createPawTrail(
                start,
                { x: targetX, y: targetY },
                duration
            );

            catArea.style.left =
                `${targetX - width / 2}px`;

            catArea.style.top =
                `${targetY - height / 2}px`;

            setTimeout(() => {

                setState(null);
                resolve(true);

            }, duration + 100);

        });
    }

    async function visitLocation(location) {

        if (!location) return;

        const position = getLocationPosition(location);

        await walkTo(position.x, position.y);

        currentLocation = location.id;

        rememberLocation(location.id);
    }

    /* =================================================
       11. EFECTOS: HUELLAS
    ================================================= */

    function createPaw(x, y, index) {

        const paw = document.createElement("span");

        paw.className = "cat-paw";
        paw.textContent = "🐾";

        paw.style.left = `${x}px`;
        paw.style.top = `${y}px`;

        paw.style.transform =
            `rotate(${index % 2 ? 15 : -15}deg)`;

        room.appendChild(paw);

        setTimeout(() => paw.remove(), 2400);
    }

    function createPawTrail(start, target, duration) {

        const distance = Math.hypot(
            target.x - start.x,
            target.y - start.y
        );

        const count = Math.min(
            16,
            Math.max(3, Math.floor(distance / 38))
        );

        for (let i = 0; i < count; i++) {

            const progress = (i + 1) / (count + 1);

            const x =
                start.x + (target.x - start.x) * progress;

            const y =
                start.y + (target.y - start.y) * progress;

            setTimeout(() => {

                createPaw(
                    x + (i % 2 ? 7 : -7),
                    y + catArea.offsetHeight * .32,
                    i
                );

            }, duration * progress);
        }
    }

    /* =================================================
       12. EFECTOS: CORAZONES
    ================================================= */

    function showHearts() {

        const roomRect = room.getBoundingClientRect();
        const rect = cat.getBoundingClientRect();

        const x = rect.left - roomRect.left + rect.width / 2;
        const y = rect.top - roomRect.top;

        ["♥", "♡", "❤"].forEach((symbol, index) => {

            const heart = document.createElement("span");

            heart.className = "heart-float";
            heart.textContent = symbol;

            heart.style.left =
                `${x + random(-30, 30)}px`;

            heart.style.top =
                `${y + random(0, 25)}px`;

            heart.style.animationDelay =
                `${index * 150}ms`;

            room.appendChild(heart);

            setTimeout(() => heart.remove(), 2500);
        });
    }

    /* =================================================
       13. ACCIONES FELINAS
    ================================================= */

    async function observe() {

        setState("observing");

        const thoughts = [
            "Gounter está observando el atardecer...",
            "¿Qué habrá detrás de aquella ventana?",
            "Gounter sigue algo con la mirada.",
            "Un pequeño ruido ha llamado su atención.",
            "Gounter está contemplando la habitación."
        ];

        say(thoughts[Math.floor(Math.random() * thoughts.length)]);

        await delay(random(4500, 7500));

        changeNeed("happiness", 2);

        setState(null);
    }

    async function investigate(location) {

        setState("sniffing");

        const messages = [
            `Gounter está olfateando ${location.name}.`,
            `¿Qué será esto? Gounter investiga ${location.name}.`,
            `Gounter ha encontrado algo interesante cerca de ${location.name}.`
        ];

        say(messages[Math.floor(Math.random() * messages.length)]);

        await delay(random(2500, 4500));

        setState("curious");

        await delay(1800);

        changeNeed("happiness", 2);

        setState(null);
    }

    async function groom() {

        setState("grooming");

        say("Gounter se está acicalando. 🐾");

        await delay(5000);

        changeNeed("happiness", 3);
        changeNeed("energy", -1);

        setState(null);
    }

    async function knead() {

        setState("kneading");

        say("Gounter está amasando las mantas. ❤️");

        await delay(5000);

        changeNeed("happiness", 4);

        setState(null);
    }

    async function play() {

        setState("playing");

        say("Gounter está jugando y persiguiendo algo.");

        await delay(4500);

        changeNeed("happiness", 10);
        changeNeed("energy", -7);

        setState(null);
    }

    async function sleepAt(location) {

        setState("sniffing");

        say(`Gounter se acomoda en ${location.name}...`);

        await delay(1400);

        setState("sleeping");

        say("Zzz... Gounter está profundamente dormido. 💤", 7000);

        await delay(random(9000, 14000));

        changeNeed("energy", 24);
        changeNeed("happiness", 3);

        setState(null);

        say("Gounter se está despertando lentamente.");
    }

    /* =================================================
       14. ACCIONES EXTERNAS
       APPROACH OBJECT / EAT / DRINK
    ================================================= */

    function findObject(action) {

        return document.querySelector(
            `.room-object[data-action="${action}"]`
        );
    }

    function getObjectPosition(object) {

        const roomRect = room.getBoundingClientRect();
        const rect = object.getBoundingClientRect();

        return {
            x: rect.left + rect.width / 2 - roomRect.left,
            y: rect.top + rect.height / 2 - roomRect.top
        };
    }

    const {
        approachObject,
        eat,
        drink
    } = createGounterActions({

        getObject: findObject,
        walkTo,
        getObjectPosition,
        say,
        setState,
        delay,
        changeNeed,
        rememberActivity

    });

    /* =================================================
       15. PROBABILIDADES DE INTERACCIÓN
    ================================================= */

    function calculateChance(action) {

        switch (action) {

            case "food":
                return clamp(
                    (100 - needs.hunger) * 0.95,
                    5,
                    95
                );

            case "water":
                return clamp(
                    (100 - needs.thirst) * 0.95,
                    5,
                    95
                );

            case "box":
                return clamp(
                    (100 - needs.energy) * 0.95,
                    5,
                    95
                );

            case "sack":
                return clamp(
                    needs.happiness * 0.55 +
                    personality.playfulness * 0.4,
                    5,
                    95
                );

            default:
                return 50;
        }
    }

    function decideInteraction(action) {

        const probability = calculateChance(action);

        return Math.random() * 100 < probability;
    }

    async function rejectInteraction(action) {

        setState("sniffing");

        const messages = {

            food: [
                "Gounter no tiene demasiada hambre.",
                "Gounter prefiere investigar otra cosa.",
                "Ahora mismo no le apetece comer."
            ],

            water: [
                "Gounter no tiene sed.",
                "El agua puede esperar un poquito.",
                "Gounter prefiere seguir explorando."
            ],

            box: [
                "Gounter todavía no tiene sueño.",
                "Prefiere seguir investigando.",
                "Gounter está demasiado curioso para dormir."
            ],

            sack: [
                "Gounter no está de humor para jugar.",
                "Prefiere descansar un poco.",
                "Gounter mira el saco con curiosidad."
            ]

        };

        const options = messages[action] || [
            "Gounter no está interesado ahora mismo."
        ];

        say(options[Math.floor(Math.random() * options.length)]);

        await delay(1600);

        setState(null);
    }

    /* =================================================
       16. COMPORTAMIENTO DE OBJETOS
    ================================================= */

    async function useObject(action) {

        switch (action) {

            case "food":
                await eat();
                break;

            case "water":
                await drink();
                break;

            case "sack":
                await play();
                rememberActivity("play");
                break;

            case "box":
                await sleepAt({
                    name: "su caja",
                    id: "box"
                });
                rememberActivity("sleep");
                break;

        }
    }

    async function interact(object) {

        if (busy || !object) return;

        const action = object.dataset.action;

        if (!action) return;

        busy = true;
        clearTimeout(idleTimer);

        try {

            // Primero Gounter se acerca al objeto.
            const approached = await approachObject(action);

            if (!approached) {
                return;
            }

            await delay(400);

            // Después decide si quiere utilizarlo.
            if (decideInteraction(action)) {

                await useObject(action);

            } else {

                await rejectInteraction(action);

            }

        } catch (error) {

            console.error("Gounter interaction:", error);

        } finally {

            busy = false;
            scheduleIdle();
        }
    }

    /* =================================================
       17. CEREBRO AUTÓNOMO
    ================================================= */

    function calculateScore(location) {

        let score = location.interest;

        const visits = memory.visits[location.id] || 0;

        score += Math.max(0, 35 - visits * 8);

        if (memory.lastLocation === location.id) {
            score *= 0.12;
        }

        if (location.type === "curiosity") {
            score += personality.curiosity * .3;
        }

        if (location.type === "play") {
            score += personality.playfulness * .25;
            score += needs.happiness * .15;
        }

        if (location.type === "rest") {
            score += personality.calmness * .2;
            score += (100 - needs.energy) * .8;
        }

        if (location.type === "observation") {
            score += personality.curiosity * .4;
        }

        return Math.max(1, score);
    }

    function weightedChoice(items) {

        if (!items.length) return null;

        const total = items.reduce(
            (sum, item) => sum + item.score,
            0
        );

        let roll = Math.random() * total;

        for (const item of items) {

            roll -= item.score;

            if (roll <= 0) {
                return item;
            }
        }

        return items[items.length - 1];
    }

    async function autonomousDecision() {

        if (busy || drag) return;

        busy = true;
        lastDecision = Date.now();

        try {

            /* NECESIDADES PRIORITARIAS */

            if (needs.hunger < 18 && Math.random() < .85) {

                const food = findObject("food");

                if (food) {
                    await approachObject("food");
                    await eat();
                    return;
                }
            }

            if (needs.thirst < 18 && Math.random() < .9) {

                const water = findObject("water");

                if (water) {
                    await approachObject("water");
                    await drink();
                    return;
                }
            }

            /* DESCANSO */

            if (needs.energy < 22 && Math.random() < .9) {

                const beds = [
                    getLocation("cat_bed"),
                    getLocation("main_bed"),
                    getLocation("armchair")
                ].filter(Boolean);

                const target = weightedChoice(
                    beds.map(item => ({
                        ...item,
                        score: calculateScore(item)
                    }))
                );

                if (target) {
                    await visitLocation(target);
                    await sleepAt(target);
                }

                return;
            }

            /* ACTIVIDAD AUTÓNOMA */

            const choices = locations.map(location => ({
                ...location,
                score: calculateScore(location)
            }));

            const selected = weightedChoice(choices);

            if (!selected) return;

            await visitLocation(selected);

            const action = selected.actions[
                Math.floor(Math.random() * selected.actions.length)
            ];

            switch (action) {

                case "observe":
                    await observe();
                    break;

                case "investigate":
                    await investigate(selected);
                    break;

                case "play":
                    await play();
                    break;

                case "sleep":
                    await sleepAt(selected);
                    break;

                case "groom":
                    await groom();
                    break;

                case "knead":
                    await knead();
                    break;

            }

        } catch (error) {

            console.error("Gounter AI:", error);

        } finally {

            busy = false;

            if (!drag) {
                scheduleIdle();
            }
        }
    }

    /* =================================================
       18. MOVIMIENTO ALEATORIO
    ================================================= */

    async function randomExplore() {

        const x = random(
            room.clientWidth * .3,
            room.clientWidth * .7
        );

        const y = random(
            room.clientHeight * .62,
            room.clientHeight * .86
        );

        await walkTo(x, y);
    }

    /* =================================================
       19. PROGRAMAR DECISIONES
    ================================================= */

    function scheduleIdle() {

        clearTimeout(idleTimer);

        idleTimer = setTimeout(() => {

            if (busy || drag) {
                scheduleIdle();
                return;
            }

            autonomousDecision();

        }, random(DECISION_MIN, DECISION_MAX));
    }

    /* =================================================
       20. NECESIDADES CON EL TIEMPO
    ================================================= */

    needsTimer = setInterval(() => {

        changeNeed("hunger", -.12);
        changeNeed("thirst", -.16);

        if (currentAction !== "sleeping") {
            changeNeed("energy", -.07);
        }

        if (currentAction !== "purring") {
            changeNeed("happiness", -.035);
        }

    }, 10000);

    /* =================================================
       21. ACARICIAR
    ================================================= */

    cat.addEventListener("click", async () => {

        if (busy || drag) return;

        busy = true;

        clearTimeout(idleTimer);

        setState("purring");

        showHearts();

        changeNeed("happiness", 12);

        rememberActivity("pet");

        say("¡Prrrrrr! Gounter está disfrutando de las caricias. ❤️");

        await delay(2800);

        setState(null);

        busy = false;

        scheduleIdle();
    });

    /* =================================================
       22. ARRASTRAR OBJETOS
    ================================================= */

    function prepareObjectPosition(object) {

        const roomRect = room.getBoundingClientRect();
        const rect = object.getBoundingClientRect();

        object.style.position = "absolute";

        object.style.left =
            `${rect.left - roomRect.left}px`;

        object.style.top =
            `${rect.top - roomRect.top}px`;

        object.style.right = "auto";
        object.style.bottom = "auto";
        object.style.transform = "none";
    }

    function isCloseToCat(object) {

        const catPosition = getCatPosition();
        const objectPosition = getObjectPosition(object);

        return Math.hypot(
            catPosition.x - objectPosition.x,
            catPosition.y - objectPosition.y
        ) < 190;
    }

    objects.forEach(object => {

        object.addEventListener("pointerdown", event => {

            if (event.button !== 0 || busy || drag) return;

            event.preventDefault();

            clearTimeout(idleTimer);

            prepareObjectPosition(object);

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

            if (!drag ||
                drag.object !== object ||
                drag.pointerId !== event.pointerId) return;

            const dx = event.clientX - drag.startX;
            const dy = event.clientY - drag.startY;

            if (Math.hypot(dx, dy) > 5) {
                drag.moved = true;
            }

            if (!drag.moved) return;

            const rect = room.getBoundingClientRect();

            object.style.left = `${clamp(
                event.clientX - rect.left - drag.offsetX,
                0,
                room.clientWidth - object.offsetWidth
            )}px`;

            object.style.top = `${clamp(
                event.clientY - rect.top - drag.offsetY,
                45,
                room.clientHeight - object.offsetHeight
            )}px`;

        });

        object.addEventListener("pointerup", async event => {

            if (!drag ||
                drag.object !== object ||
                drag.pointerId !== event.pointerId) return;

            const wasDragged = drag.moved;

            drag = null;

            object.style.zIndex = "4";

            if (wasDragged) {

                if (isCloseToCat(object)) {
                    await interact(object);
                } else {
                    say("Gounter observa lo que has movido.");
                    scheduleIdle();
                }

            } else {

                await interact(object);
            }

        });

        object.addEventListener("pointercancel", () => {

            drag = null;
            object.style.zIndex = "4";
            scheduleIdle();

        });

        object.addEventListener("keydown", event => {

            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                interact(object);
            }

        });

    });

    /* =================================================
       23. INICIALIZACIÓN
    ================================================= */

    cat.classList.remove("facing-left");
    cat.classList.add("facing-right");

    updateNeedsUI();

    say("Gounter está explorando su pequeño mundo. 🐾", 5000);

    scheduleIdle();

    /* =================================================
       24. LIMPIEZA
    ================================================= */

    window.addEventListener("beforeunload", () => {

        clearTimeout(idleTimer);
        clearTimeout(messageTimer);
        clearInterval(needsTimer);

        saveMemory();

    });

    console.log(
        "EVARKION: GOUNTER AI SYSTEM iniciado.",
        {
            locations: locations.length,
            personality,
            memory,
            actions: ["approachObject", "eat", "drink"]
        }
    );

});
