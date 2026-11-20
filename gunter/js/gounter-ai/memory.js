
/* =========================================
   EVARKION - GOUNTER AI
   memory.js | Memoria persistente
========================================= */

const STORAGE_KEY = "evarkion_gounter_memory";

const defaultMemory = {
    visits: {},
    activities: {},
    discoveries: [],
    lastPlace: null,
    lastActivity: null,
    totalActions: 0,
    createdAt: Date.now()
};

function loadMemory() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) return { ...defaultMemory };

        const parsed = JSON.parse(saved);

        return {
            ...defaultMemory,
            ...parsed,
            visits: parsed.visits || {},
            activities: parsed.activities || {},
            discoveries: parsed.discoveries || []
        };
    } catch (error) {
        console.warn("Gounter no pudo cargar su memoria:", error);
        return { ...defaultMemory };
    }
}

let memory = loadMemory();

function saveMemory() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(memory)
        );
    } catch (error) {
        console.warn("Gounter no pudo guardar su memoria:", error);
    }
}

export function rememberVisit(place) {
    if (!place) return;

    memory.visits[place] = (memory.visits[place] || 0) + 1;
    memory.lastPlace = place;
    memory.totalActions++;

    saveMemory();
}

export function rememberActivity(activity) {
    if (!activity) return;

    memory.activities[activity] =
        (memory.activities[activity] || 0) + 1;

    memory.lastActivity = activity;
    memory.totalActions++;

    saveMemory();
}

export function rememberDiscovery(discovery) {
    if (!discovery) return;

    if (!memory.discoveries.includes(discovery)) {
        memory.discoveries.push(discovery);
        saveMemory();
    }
}

export function getMemory() {
    return JSON.parse(JSON.stringify(memory));
}

export function getVisitCount(place) {
    return memory.visits[place] || 0;
}

export function getActivityCount(activity) {
    return memory.activities[activity] || 0;
}

export function getLastPlace() {
    return memory.lastPlace;
}

export function getLastActivity() {
    return memory.lastActivity;
}

export function hasDiscovered(discovery) {
    return memory.discoveries.includes(discovery);
}

export function getLeastVisitedPlaces(places = []) {
    return [...places].sort(
        (a, b) => getVisitCount(a.id) - getVisitCount(b.id)
    );
}

export function resetMemory() {
    memory = {
        ...defaultMemory,
        visits: {},
        activities: {},
        discoveries: [],
        createdAt: Date.now()
    };

    saveMemory();
}
