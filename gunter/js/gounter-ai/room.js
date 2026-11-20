
/* =========================================
   EVARKION - GOUNTER AI
   room.js | Mapa de la habitación
========================================= */

let roomElement = null;
let landmarks = [];

const placeNames = {
    "big-bed": "la cama",
    "window": "la ventana",
    "cat-bed": "su camita",
    "left-shelf": "la estantería izquierda",
    "right-shelf": "la estantería derecha",
    "armchair": "el sillón",
    "scratcher": "el rascador",
    "guitar": "la guitarra",
    "rug": "la alfombra",
    "plants": "las plantas"
};

export function initializeRoom() {
    roomElement = document.getElementById("room");

    if (!roomElement) {
        console.error("Gounter no encuentra #room.");
        return false;
    }

    const elements = roomElement.querySelectorAll(
        ".landmark[data-place][data-x][data-y]"
    );

    landmarks = Array.from(elements).map(element => {
        const x = Number(element.dataset.x);
        const y = Number(element.dataset.y);

        element.style.setProperty("--landmark-x", `${x}%`);
        element.style.setProperty("--landmark-y", `${y}%`);

        return {
            id: element.dataset.place,
            x,
            y,
            name: placeNames[element.dataset.place] ||
                element.dataset.place
        };
    }).filter(place =>
        Number.isFinite(place.x) &&
        Number.isFinite(place.y)
    );

    console.log(
        `Gounter conoce ${landmarks.length} lugares de su habitación.`
    );

    return landmarks.length > 0;
}

export function getRoom() {
    return roomElement;
}

export function getLandmarks() {
    return [...landmarks];
}

export function getLandmark(id) {
    return landmarks.find(place => place.id === id) || null;
}

export function getRandomLandmark() {
    if (!landmarks.length) return null;

    return landmarks[
        Math.floor(Math.random() * landmarks.length)
    ];
}

export function getPlaceName(id) {
    return placeNames[id] || id;
}

export function getRoomCoordinates(place) {
    if (!roomElement || !place) return null;

    const rect = roomElement.getBoundingClientRect();

    return {
        x: rect.width * (place.x / 100),
        y: rect.height * (place.y / 100)
    };
}

/* Objetos que Gounter puede localizar */

export function getObject(action) {
    if (!roomElement) return null;

    return roomElement.querySelector(
        `.room-object[data-action="${action}"]`
    );
}

export function getObjects() {
    if (!roomElement) return [];

    return Array.from(
        roomElement.querySelectorAll(".room-object")
    );
}
