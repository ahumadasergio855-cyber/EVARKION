
/* =========================================
   EVARKION - GOUNTER AI
   brain.js | Cerebro autónomo
========================================= */

import {
    getNeeds,
    getNeed,
    updateNeedsOverTime
} from "./needs.js";

import {
    getActivityPreference,
    getTrait
} from "./personality.js";

import {
    rememberActivity,
    getActivityCount,
    getLastActivity,
    getLeastVisitedPlaces
} from "./memory.js";

import {
    initializeRoom,
    getLandmarks,
    getRandomLandmark,
    getObject
} from "./room.js";

import {
    initializeActions,
    isBusy,
    goToPlace,
    observe,
    sniff,
    play,
    sleep,
    groom,
    knead,
    eat,
    drink,
    rest,
    showMessage
} from "./actions.js";

let running = false;
let decisionTimer = null;
let needsTimer = null;

const CONFIG = {
    minimumDecisionDelay: 9000,
    maximumDecisionDelay: 16000,
    needsUpdateInterval: 10000
};

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChance(probability) {
    return Math.random() < probability;
}

function calculateActivityScores() {
    const needs = getNeeds();

    const scores = {
        eat: (100 - needs.hunger) * 1.5,
        drink: (100 - needs.thirst) * 1.7,
        sleep: (100 - needs.energy) * 1.35,
        play: needs.happiness < 55 ? 35 : 15,
        explore: getTrait("curiosity") * 0.65,
        observe: getTrait("curiosity") * 0.45,
        groom: 25,
        knead: getTrait("affection") * 0.35
    };

    Object.keys(scores).forEach(activity => {
        scores[activity] += getActivityPreference(activity);
    });

    // Evitar repetir continuamente la misma actividad.
    const lastActivity = getLastActivity();

    if (lastActivity && scores[lastActivity] !== undefined) {
        scores[lastActivity] *= 0.45;
    }

    // Si Gounter está muy cansado, favorecemos el descanso.
    if (needs.energy < 25) scores.sleep += 70;

    // Las necesidades críticas tienen prioridad.
    if (needs.hunger < 15) scores.eat += 120;
    if (needs.thirst < 15) scores.drink += 130;

    return scores;
}

function weightedChoice(scores) {
    const entries = Object.entries(scores)
        .filter(([, score]) => score > 0);

    const total = entries.reduce(
        (sum, [, score]) => sum + score,
        0
    );

    if (!total) return "explore";

    let random = Math.random() * total;

    for (const [activity, score] of entries) {
        random -= score;

        if (random <= 0) {
            return activity;
        }
    }

    return entries[entries.length - 1][0];
}

function choosePlace() {
    const places = getLandmarks();

    if (!places.length) return null;

    const ordered = getLeastVisitedPlaces(places);

    // La mayoría de las veces favorece los lugares poco visitados.
    if (randomChance(0.7)) {
        return ordered[0];
    }

    return getRandomLandmark();
}

async function performDecision() {
    if (!running || isBusy()) return;

    const activity = weightedChoice(calculateActivityScores());

    console.log("Gounter ha elegido:", activity);

    switch (activity) {
        case "eat":
            if (getObject("food")) {
                showMessage("Gounter tiene hambre y busca su comida.");
                // La aproximación al cuenco se conectará con el sistema
                // de objetos del juego.
            } else {
                await exploreRoom();
            }
            break;

        case "drink":
            if (getObject("water")) {
                showMessage("Gounter tiene sed y busca agua.");
            } else {
                await exploreRoom();
            }
            break;

        case "sleep":
            await visitRestingPlace();
            await sleep();
            break;

        case "play":
            await exploreRoom();
            await play();
            break;

        case "explore":
            await exploreRoom();
            break;

        case "observe":
            await exploreRoom();
            await observe();
            break;

        case "groom":
            await groom();
            break;

        case "knead":
            await visitRestingPlace();
            await knead();
            break;

        default:
            await exploreRoom();
    }
}

async function exploreRoom() {
    const place = choosePlace();

    if (!place) {
        await observe();
        return;
    }

    const arrived = await goToPlace(place);

    if (!arrived) return;

    const placeActivities = {
        "window": ["observe", "observe", "sniff"],
        "big-bed": ["sleep", "knead", "groom"],
        "cat-bed": ["sleep", "groom"],
        "left-shelf": ["observe", "sniff"],
        "right-shelf": ["observe", "sniff"],
        "armchair": ["sleep", "observe"],
        "scratcher": ["play", "sniff"],
        "guitar": ["sniff", "observe"],
        "rug": ["play", "groom"],
        "plants": ["sniff", "observe"]
    };

    const options = placeActivities[place.id] || [
        "observe",
        "sniff"
    ];

    const selected = options[
        Math.floor(Math.random() * options.length)
    ];

    switch (selected) {
        case "sleep":
            await sleep();
            break;
        case "knead":
            await knead();
            break;
        case "groom":
            await groom();
            break;
        case "play":
            await play();
            break;
        case "sniff":
            await sniff();
            break;
        default:
            await observe();
    }
}

async function visitRestingPlace() {
    const places = getLandmarks();

    const bed =
        places.find(place => place.id === "cat-bed") ||
        places.find(place => place.id === "big-bed");

    if (bed) {
        await goToPlace(bed);
    }
}

function scheduleNextDecision() {
    if (!running) return;

    clearTimeout(decisionTimer);

    decisionTimer = setTimeout(async () => {
        try {
            await performDecision();
        } catch (error) {
            console.error("Error en el cerebro de Gounter:", error);
        }

        scheduleNextDecision();
    }, randomBetween(
        CONFIG.minimumDecisionDelay,
        CONFIG.maximumDecisionDelay
    ));
}

export function startGounterBrain() {
    if (running) return;

    const roomReady = initializeRoom();
    const actionsReady = initializeActions();

    if (!roomReady || !actionsReady) {
        console.error("No se pudo iniciar el cerebro de Gounter.");
        return;
    }

    running = true;

    showMessage("Gounter está despierto y tiene ganas de explorar.");

    needsTimer = setInterval(() => {
        updateNeedsOverTime();
    }, CONFIG.needsUpdateInterval);

    scheduleNextDecision();

    console.log("EVARKION: Cerebro autónomo de Gounter iniciado.");
}

export function stopGounterBrain() {
    running = false;

    clearTimeout(decisionTimer);
    clearInterval(needsTimer);

    console.log("Gounter ha dejado de tomar decisiones autónomas.");
}

export function isBrainRunning() {
    return running;
}

export function requestDecision() {
    if (!running || isBusy()) return;

    clearTimeout(decisionTimer);

    performDecision().finally(() => {
        scheduleNextDecision();
    });
}
