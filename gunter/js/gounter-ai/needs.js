
/* =========================================
   EVARKION - GOUNTER AI
   needs.js | Sistema de necesidades
========================================= */

const initialNeeds = {
    hunger: 65,
    thirst: 75,
    energy: 85,
    happiness: 90
};

const needs = { ...initialNeeds };

const limits = {
    min: 0,
    max: 100
};

export function getNeeds() {
    return { ...needs };
}

export function getNeed(name) {
    return needs[name] ?? 0;
}

export function changeNeed(name, amount) {
    if (!(name in needs)) return;

    needs[name] = Math.max(
        limits.min,
        Math.min(limits.max, needs[name] + amount)
    );

    updateNeedsUI();
}

export function setNeed(name, value) {
    if (!(name in needs)) return;

    needs[name] = Math.max(
        limits.min,
        Math.min(limits.max, value)
    );

    updateNeedsUI();
}

export function updateNeedsUI() {
    Object.entries(needs).forEach(([name, value]) => {
        const bar = document.getElementById(`${name}-bar`);
        const label = document.getElementById(`${name}-value`);

        if (bar) {
            bar.style.width = `${value}%`;
            bar.classList.toggle("low", value < 25);
        }

        if (label) {
            label.textContent = `${Math.round(value)}%`;
        }
    });
}

/* Necesidades que disminuyen con el tiempo */

export function updateNeedsOverTime(activity = "idle") {
    changeNeed("hunger", -0.12);
    changeNeed("thirst", -0.16);

    if (activity === "sleeping") {
        changeNeed("energy", 0.35);
        changeNeed("happiness", 0.015);
    } else {
        changeNeed("energy", -0.05);
    }

    if (activity !== "playing" && activity !== "purring") {
        changeNeed("happiness", -0.025);
    }
}

/* Valores de urgencia */

export function getUrgency(name) {
    const value = getNeed(name);

    if (value <= 15) return "critical";
    if (value <= 30) return "high";
    if (value <= 55) return "medium";

    return "low";
}

export function getMostUrgentNeed() {
    const priorities = [
        { name: "hunger", weight: 1.1 },
        { name: "thirst", weight: 1.25 },
        { name: "energy", weight: 1 },
        { name: "happiness", weight: 0.8 }
    ];

    return priorities
        .map(item => ({
            name: item.name,
            score: (100 - needs[item.name]) * item.weight
        }))
        .sort((a, b) => b.score - a.score)[0].name;
}

updateNeedsUI();
