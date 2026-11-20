
/* =========================================
   EVARKION - KARU CHAT
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const chat = document.getElementById("karu-chat");
    const minimize = document.getElementById("karu-minimize");

    const messages = document.getElementById("karu-messages");
    const form = document.getElementById("karu-form");
    const input = document.getElementById("karu-input");

    const options = document.querySelector(".karu-options");

    /* RESPUESTAS */

    const responses = [

        {
            keywords: ["hola", "buenas"],
            answers: [
                "¡Hola! Qué alegría verte por aquí. 🐾",
                "¡Bienvenido al refugio!",
                "Gounter estaba esperando tu visita."
            ]
        },

        {
            keywords: ["gounter", "gato"],
            answers: [
                "Gounter es muy curioso. Le encanta explorar.",
                "¡Nuestro pequeño amigo está muy cómodo aquí!",
                "Puedes acariciarlo haciendo clic sobre él."
            ]
        },

        {
            keywords: ["comida", "comer", "hambre"],
            answers: [
                "¡Acércale el cuenco de comida!",
                "Gounter necesita sus pequeñas comidas.",
                "¡Seguro que ya ha olfateado su comida!"
            ]
        },

        {
            keywords: ["agua", "beber", "sed"],
            answers: [
                "El agua es muy importante para Gounter.",
                "¡Acércale su cuenco de agua!",
                "Nuestro amigo necesita mantenerse hidratado."
            ]
        },

        {
            keywords: ["caja", "dormir", "sueño"],
            answers: [
                "¡Esa caja es su pequeño refugio!",
                "Gounter puede descansar y sentirse seguro ahí.",
                "Los gatos adoran encontrar lugares tranquilos."
            ]
        },

        {
            keywords: ["saco", "jugar"],
            answers: [
                "¡Gounter tiene mucha curiosidad por ese saco!",
                "Puedes moverlo para que Gounter lo investigue.",
                "¡Un poquito de juego siempre viene bien!"
            ]
        },

        {
            keywords: ["videojuegos", "juegos"],
            answers: [
                "¡Me encantan las aventuras! ¿Cuál estás jugando?",
                "EVARKION también tiene un espacio para los videojuegos."
            ]
        },

        {
            keywords: ["programación", "programar"],
            answers: [
                "¡La programación convierte las ideas en realidad!",
                "¿Sigues trabajando en tus proyectos de EVARKION?"
            ]
        },

        {
            keywords: ["gracias"],
            answers: [
                "¡De nada! Siempre estaré aquí. ❤️",
                "¡Es un placer ayudarte!"
            ]
        }

    ];

    /* RESPUESTA */

    function getResponse(text) {

        const normalized = text.toLowerCase();

        for (const category of responses) {

            if (category.keywords.some(keyword =>
                normalized.includes(keyword)
            )) {

                const index = Math.floor(
                    Math.random() * category.answers.length
                );

                return category.answers[index];
            }
        }

        return "¡Cuéntame más! Estoy aquí para escucharte. 🐾";
    }

    /* MOSTRAR MENSAJES */

    function addMessage(text, type) {

        const element = document.createElement("div");

        element.classList.add("message");

        element.classList.add(
            type === "user" ? "user-message" : "karu-message"
        );

        element.textContent = text;

        messages.appendChild(element);

        messages.scrollTop = messages.scrollHeight;
    }

    /* ENVIAR */

    function sendMessage(text) {

        const clean = text.trim();

        if (!clean) return;

        addMessage(clean, "user");

        input.value = "";

        setTimeout(() => {

            addMessage(getResponse(clean), "karu");

        }, 500);
    }

    form.addEventListener("submit", event => {

        event.preventDefault();

        sendMessage(input.value);

    });

    /* OPCIONES RÁPIDAS */

    options.addEventListener("click", event => {

        const button = event.target.closest("button");

        if (!button) return;

        sendMessage(button.dataset.message);

    });

    /* MINIMIZAR */

    minimize.addEventListener("click", () => {

        chat.classList.toggle("minimized");

        const closed = chat.classList.contains("minimized");

        minimize.textContent = closed ? "+" : "−";

        minimize.setAttribute(
            "aria-label",
            closed ? "Abrir chat" : "Minimizar chat"
        );

    });

});
