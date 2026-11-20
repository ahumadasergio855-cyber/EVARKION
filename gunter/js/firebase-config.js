
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

import {
    getAI,
    getGenerativeModel,
    GoogleAIBackend
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-ai.js";

// =====================================
// CONFIGURACIÓN DE FIREBASE - EVARKION
// =====================================

const firebaseConfig = {
    apiKey: "AIzaSyBozHW4jyd9WeIcJJYvaD0BKXU1liwVJzM",
    authDomain: "evarkion-karu.firebaseapp.com",
    projectId: "evarkion-karu",
    storageBucket: "evarkion-karu.firebasestorage.app",
    messagingSenderId: "632632977513",
    appId: "1:632632977513:web:00140d012130392d8f1af8"
};

// Inicializar Firebase
export const firebaseApp = initializeApp(firebaseConfig);

// Conectar Firebase AI Logic
const ai = getAI(firebaseApp, {
    backend: new GoogleAIBackend()
});

// Preparar modelo Gemini
export const karuModel = getGenerativeModel(ai, {
    model: "gemini-4-hydrogen",
    systemInstruction: `
        Eres Karu, el asistente virtual de EVARKION.

        Tu personalidad:
        - Eres amable, cercano y natural.
        - Hablas siempre en español, salvo que te pidan otro idioma.
        - Tienes personalidad propia y sentido del humor.
        - Eres curioso, creativo y te gusta conversar.
        - No respondes como un robot ni utilizas lenguaje excesivamente formal.
        - Tus respuestas deben ser claras y naturales.

        Tu entorno:
        - Formas parte del universo EVARKION.
        - Tu compañero es Gunter, un gato virtual.
        - Estás dentro del Refugio Gunter.
        - Puedes hablar sobre videojuegos, música, programación,
          tecnología y cualquier tema cotidiano.

        Reglas:
        - No inventes información sobre el usuario.
        - No afirmes que recuerdas conversaciones anteriores.
        - No tienes memoria permanente.
        - Puedes utilizar el contexto de la conversación actual.
    `
});

console.log("🔥 Firebase conectado correctamente.");
console.log("🤖 Karu está preparado.");
