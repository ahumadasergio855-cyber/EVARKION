
/* =========================================
   EVARKION - GOUNTER AI
   actions.js | Sistema de acciones
========================================= */

import {
    changeNeed
} from "./needs.js";

import {
    rememberActivity,
    rememberVisit
} from "./memory.js";

import {
    getRoomCoordinates,
    getPlaceName
} from "./room.js";

let room;
let catArea;
let cat;
let messageElement;

let busy = false;
let currentAction = "idle";

const wait = ms =>
    new Promise(resolve => setTimeout(resolve, ms));

export function initializeActions() {
    room = document.getElementById("room");
    catArea = document.getElementById("cat-area");
    cat = document.getElementById("gounter");
    messageElement = document.getElementById("room-message");

    if (!room || !catArea || !cat) {
        console.error("No se han encontrado los elementos de Gounter.");
        return false;
    }

    // Convertir la posición inicial a coordenadas de la habitación.
    const roomRect = room.getBoundingClientRect();
    const catRect = catArea.getBoundingClientRect();

    catArea.style.left =
        `${catRect.left - roomRect.left + catRect.width / 2}px`;

    catArea.style.top =
        `${catRect.top - roomRect.top + catRect.height / 2}px`;

    catArea.style.transform = "translate(-50%, -50%)";

    return true;
}

export function isBusy() {
    return busy;
}

export function getCurrentAction() {
    return currentAction;
}

export function showMessage(text, duration = 3000) {
    if (!messageElement) return;

    messageElement.textContent = text;
    messageElement.style.opacity = "1";

    clearTimeout(showMessage.timer);

    showMessage.timer = setTimeout(() => {
        messageElement.style.opacity = "0";
    }, duration);
}

function setState(state) {
    const states = [
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

    cat.classList.remove(...states);

    if (state && state !== "idle") {
        cat.classList.add(state);
    }

    currentAction = state || "idle";
}

function createPaw() {
    const paw = document.createElement("span");

    paw.className = "cat-paw";
    paw.textContent = "🐾";

    paw.style.left = `${parseFloat(catArea.style.left) - 10}px`;
    paw.style.top = `${parseFloat(catArea.style.top) + 75}px`;

    room.appendChild(paw);

    setTimeout(() => paw.remove(), 2200);
}

function walkTo(x, y) {
    return new Promise(resolve => {
        const roomRect = room.getBoundingClientRect();

        const maxX = roomRect.width - catArea.offsetWidth / 2;
        const maxY = roomRect.height - catArea.offsetHeight / 2;

        x = Math.max(catArea.offsetWidth / 2, Math.min(maxX, x));
        y = Math.max(catArea.offsetHeight / 2, Math.min(maxY, y));

        const currentX = parseFloat(catArea.style.left) || 0;
        const currentY = parseFloat(catArea.style.top) || 0;

        const distance = Math.hypot(x - currentX, y - currentY);

        if (distance < 10) {
            resolve();
            return;
        }

        cat.classList.toggle("facing-left", x < currentX);

        setState("walking");

        const duration = Math.max(
            900,
            Math.min(4500, distance * 5)
        );

        catArea.style.transitionDuration = `${duration}ms`;

        catArea.style.left = `${x}px`;
        catArea.style.top = `${y}px`;

        const pawInterval = setInterval(createPaw, 450);

        setTimeout(() => {
            clearInterval(pawInterval);
            setState("idle");
            resolve();
        }, duration + 100);
    });
}

export async function goToPlace(place) {
    if (busy || !place) return false;

    const coordinates = getRoomCoordinates(place);

    if (!coordinates) return false;

    busy = true;

    try {
        await walkTo(coordinates.x, coordinates.y);

        rememberVisit(place.id);

        showMessage(`Gounter ha llegado a ${getPlaceName(place.id)}.`);
        return true;
    } finally {
        busy = false;
    }
}

async function perform(activity, state, message, duration, reward = {}) {
    if (busy) return false;

    busy = true;

    try {
        setState(state);
        showMessage(message, duration + 500);

        await wait(duration);

        Object.entries(reward).forEach(([need, amount]) => {
            changeNeed(need, amount);
        });

        rememberActivity(activity);

        return true;
    } finally {
        setState("idle");
        busy = false;
    }
}

export async function observe() {
    return perform(
        "observe",
        "observing",
        "Gounter está observando lo que ocurre...",
        3500,
        { happiness: 1 }
    );
}

export async function sniff() {
    return perform(
        "sniff",
        "sniffing",
        "Gounter está olfateando algo interesante.",
        2500,
        { happiness: 2 }
    );
}

export async function play() {
    return perform(
        "play",
        "playing",
        "¡Gounter está jugando!",
        4500,
        { happiness: 12, energy: -5 }
    );
}

export async function sleep() {
    return perform(
        "sleep",
        "sleeping",
        "Gounter se ha quedado dormido...",
        7000,
        { energy: 18, happiness: 2 }
    );
}

export async function groom() {
    return perform(
        "groom",
        "grooming",
        "Gounter se está acicalando tranquilamente.",
        4000,
        { happiness: 2 }
    );
}

export async function knead() {
    return perform(
        "knead",
        "kneading",
        "Gounter está amasando con sus patitas.",
        3500,
        { happiness: 5, energy: -1 }
    );
}

export async function eat() {
    return perform(
        "eat",
        "eating",
        "Gounter está comiendo.",
        4500,
        { hunger: 45, happiness: 3 }
    );
}

export async function drink() {
    return perform(
        "drink",
        "drinking",
        "Gounter está bebiendo agua.",
        3500,
        { thirst: 50, happiness: 2 }
    );
}

export async function rest() {
    return perform(
        "rest",
        "sleeping",
        "Gounter está descansando un rato.",
        5000,
        { energy: 12 }
    );
}


export async function approachObject(action) {
    if (busy) return false;

    const object = document.querySelector(
        `.room-object[data-action="${action}"]`
    );

    if (!object) return false;

    const roomRect = room.getBoundingClientRect();
    const objectRect = object.getBoundingClientRect();

    const x = objectRect.left - roomRect.left + objectRect.width / 2;
    const y = objectRect.top - roomRect.top + objectRect.height / 2;

    busy = true;

    try {
        await walkTo(x, y);
        return true;
    } finally {
        busy = false;
    }
}
