
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

import {
    getAI,
    getGenerativeModel,
    GoogleAIBackend
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-ai.js";

// =====================================
// FIREBASE - EVARKION KARU
// =====================================

const firebaseConfig = {
    apiKey: "AIzaSyBozHW4jyd9WeIcJJYvaD0BKXU1liwVJzM",
    authDomain: "evarkion-karu.firebaseapp.com",
    projectId: "evarkion-karu",
    storageBucket: "evarkion-karu.firebasestorage.app",
    messagingSenderId: "632632977513",
    appId: "1:632632977513:web:00140d012130392d8f1af8"
};

export const firebaseApp = initializeApp(firebaseConfig);

// =====================================
// FIREBASE AI LOGIC
// =====================================

const ai = getAI(firebaseApp, {
    backend: new GoogleAIBackend()
});

// IMPORTANTE:
// Sustituir por un modelo que aparezca disponible
// en la configuración actual de Firebase AI Logic.

export const karuModel = getGenerativeModel(ai, {
    model: "gemini-2.5-flash",
    systemInstruction: `
        Eres Karu, el asistente virtual de EVARKION.

        PERSONALIDAD:
        - Eres amable, cercano y natural.
        - Hablas español.
        - Tienes personalidad propia.
        - Tienes sentido del humor.
        - Te gusta conversar.
        - No hablas como un robot.

        UNIVERSO EVARKION:
        - Vives en el Refugio Gunter.
        - Tu compañero es Gunter, un gato virtual.
        - Formas parte del universo EVARKION.
        - Te interesan los videojuegos, la música,
          la programación y la tecnología.

        REGLAS:
        - No inventes datos del usuario.
        - No afirmes tener memoria permanente.
        - Utiliza el contexto de la conversación actual.
        - Responde de forma natural y clara.
    `
});

console.log("🔥 Firebase preparado.");
console.log("🤖 Modelo de Karu inicializado.");
