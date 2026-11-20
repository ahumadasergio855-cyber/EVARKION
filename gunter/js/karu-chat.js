
/* =========================================
   EVARKION - KARU CHAT SYSTEM
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const chat = document.getElementById("karu-chat");
    const minimizeButton = document.getElementById("karu-minimize");

    const messages = document.getElementById("karu-messages");
    const form = document.getElementById("karu-form");
    const input = document.getElementById("karu-input");

    const options = document.getElementById("karu-options");

    /* =====================================
       RESPUESTAS DE KARU
    ===================================== */

    const responses = [

        {
            keywords: ["hola", "buenas", "hey"],
            answers: [
                "¡Hola! Me alegra verte por aquí. 🐾",
                "¡Hola! Gounter estaba esperando tu visita.",
                "¡Bienvenido de nuevo al refugio!"
            ]
        },

        {
            keywords: ["gounter", "gato"],
            answers: [
                "Gounter es un gato muy curioso. ¡Le encanta explorar!",
                "¡Gounter está muy a gusto en su refugio!",
                "Puedes acariciarlo haciendo clic sobre él."
            ]
        },

        {
            keywords: ["comida", "comer", "hambre"],
            answers: [
                "¡A Gounter le encanta comer! Acércale su comida.",
                "Creo que Gounter tiene hambre. 🐱",
                "No olvides alimentar a nuestro pequeño amigo."
            ]
        },

        {
            keywords: ["agua", "beber", "sed"],
            answers: [
                "El agua es muy importante para Gounter.",
                "¡Dale un poquito de agua!",
                "Gounter también necesita mantenerse hidratado. 💧"
            ]
        },

        {
            keywords: ["saco"],
            answers: [
                "¡Ese saco despierta la curiosidad de Gounter!",
                "Creo que Gounter quiere investigar qué hay dentro."
            ]
        },

        {
            keywords: ["caja"],
            answers: [
                "¡A los gatos les encantan las cajas!",
                "Esa caja podría convertirse en su escondite favorito.",
                "¡Gounter y las cajas son una combinación perfecta!"
            ]
        },

        {
            keywords: ["jugar", "juego", "divertir"],
            answers: [
                "¡Jugar es una de las mejores formas de pasar tiempo con Gounter!",
                "Prueba a mover los objetos por la habitación.",
                "¡Seguro que Gounter quiere divertirse contigo!"
            ]
        },

        {
            keywords: ["gracias"],
            answers: [
                "¡No hay de qué! Estoy aquí para ayudarte. ❤️",
                "¡Para eso estamos! Cuida mucho de Gounter."
            ]
        },

        {
            keywords: ["adios", "adiós", "hasta luego"],
            answers: [
                "¡Hasta pronto! Gounter y yo estaremos aquí.",
                "¡Nos vemos! Que tengas un buen día. 🐾"
            ]
        }

    ];

    /* =====================================
       ELEGIR RESPUESTA
    ===================================== */

    function getResponse(text) {

        const normalized = text.toLowerCase().trim();

        for (const category of responses) {

            const found = category.keywords.some(keyword =>
                normalized.includes(keyword)
            );

            if (found) {

                const index = Math.floor(
                    Math.random() * category.answers.length
                );

                return category.answers[index];
            }

        }

        const defaultResponses = [
            "¡Interesante! Cuéntame un poquito más.",
            "Estoy aquí para escucharte. 🐾",
            "¿Qué te gustaría hacer con Gounter?",
            "¡Podemos seguir explorando el refugio juntos!",
            "No estoy segura de entenderte, pero quiero ayudarte."
        ];

        return defaultResponses[
            Math.floor(Math.random() * defaultResponses.length)
        ];
    }

    /* =====================================
       AÑADIR MENSAJE
    ===================================== */

    function addMessage(text, type) {

        const message = document.createElement("div");

        message.classList.add("message");

        if (type === "user") {
            message.classList.add("user-message");
        } else {
            message.classList.add("karu-message");
        }

        message.textContent = text;

        messages.appendChild(message);

        messages.scrollTop = messages.scrollHeight;
    }

    /* =====================================
       ENVIAR MENSAJE
    ===================================== */

    function sendMessage(text) {

        const cleanText = text.trim();

        if (!cleanText) return;

        addMessage(cleanText, "user");

        input.value = "";

        setTimeout(() => {

            const response = getResponse(cleanText);

            addMessage(response, "karu");

        }, 500);

    }

    /* =====================================
       FORMULARIO
    ===================================== */

    form.addEventListener("submit", event => {

        event.preventDefault();

        sendMessage(input.value);

    });

    /* =====================================
       OPCIONES PREDETERMINADAS
    ===================================== */

    options.addEventListener("click", event => {

        const button = event.target.closest("button");

        if (!button) return;

        const text = button.dataset.message;

        if (text) {
            sendMessage(text);
        }

    });

    /* =====================================
       MINIMIZAR CHAT
    ===================================== */

    minimizeButton.addEventListener("click", () => {

        chat.classList.toggle("minimized");

        const minimized = chat.classList.contains("minimized");

        minimizeButton.textContent = minimized ? "+" : "−";

        minimizeButton.setAttribute(
            "aria-label",
            minimized ? "Abrir chat" : "Minimizar chat"
        );

    });

});
