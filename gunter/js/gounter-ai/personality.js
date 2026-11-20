
/* =========================================
   EVARKION - GOUNTER AI
   personality.js | Personalidad
========================================= */

const defaultPersonality = {
    curiosity: 85,
    playfulness: 70,
    affection: 75,
    laziness: 45,
    independence: 65,
    sociability: 70
};

let personality = { ...defaultPersonality };

export function getPersonality() {
    return { ...personality };
}

export function getTrait(name) {
    return personality[name] ?? 50;
}

export function changeTrait(name, amount) {
    if (!(name in personality)) return;

    personality[name] = Math.max(
        0,
        Math.min(100, personality[name] + amount)
    );
}

export function setPersonality(data = {}) {
    Object.keys(defaultPersonality).forEach(key => {
        if (typeof data[key] === "number") {
            personality[key] = Math.max(
                0,
                Math.min(100, data[key])
            );
        }
    });
}

export function getPersonalityDescription() {
    const traits = getPersonality();

    const descriptions = [];

    if (traits.curiosity >= 75) descriptions.push("muy curioso");
    if (traits.playfulness >= 75) descriptions.push("juguetón");
    if (traits.laziness >= 75) descriptions.push("dormilón");
    if (traits.affection >= 75) descriptions.push("cariñoso");
    if (traits.independence >= 75) descriptions.push("independiente");

    return descriptions.length
        ? descriptions.join(", ")
        : "tranquilo y equilibrado";
}

export function getActivityPreference(activity) {
    const traits = getPersonality();

    const preferences = {
        explore: traits.curiosity,
        play: traits.playfulness,
        interact: traits.affection,
        sleep: traits.laziness,
        observe: traits.curiosity * 0.85,
        groom: 45 + traits.independence * 0.2
    };

    return preferences[activity] ?? 50;
}
