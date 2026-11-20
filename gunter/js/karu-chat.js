
/* ==========================================
   EVARKION - CHAT DE KARU
========================================== */

const karuToggle = document.getElementById("karu-toggle");
const karuChat = document.getElementById("karu-chat");
const karuClose = document.getElementById("karu-close");

const chatForm = document.getElementById("karu-chat-form");
const chatInput = document.getElementById("karu-input");
const chatMessages = document.getElementById("chat-messages");


/* ==========================================
   ABRIR Y CERRAR CHAT
========================================== */

function openKaruChat() {
    karuChat.classList.add("open");
    karuChat.setAttribute("aria-hidden", "false");
    karuToggle.setAttribute("aria-expanded", "true");

    chatInput.focus();
}

function closeKaruChat() {
    karuChat.classList.remove("open");
    karuChat.setAttribute("aria-hidden", "true");
    karuToggle.setAttribute("aria-expanded", "false");
}

karuToggle.addEventListener("click", () => {
    if (karuChat.classList.contains("open")) {
        closeKaruChat();
    } else {
        openKaruChat();
    }
});

karuClose.addEventListener("click", closeKaruChat);


/* ==========================================
   AÑADIR MENSAJES AL CHAT
========================================== */

function addChatMessage(message, type) {
    const messageElement = document.createElement("div");

    messageElement.classList.add(
        "chat-message",
        type === "user" ? "user-message" : "karu-message"
    );

    const author = document.createElement("span");
    author.className = "message-author";
    author.textContent = type === "user" ? "TÚ" : "KARU";

    const content = document.createElement("span");
    content.textContent = message;

    messageElement.appendChild(author);
    messageElement.appendChild(content);

    chatMessages.appendChild(messageElement);

    chatMessages.scrollTop = chatMessages.scrollHeight;
}


/* ==========================================
   RESPUESTAS DE KARU
========================================== */

function getKaruResponse(message) {
    const text = message.toLowerCase();

    if (
        text.includes("hola") ||
        text.includes("buenas")
    ) {
        return "¡Holaaa! Me alegra verte por aquí. ¿Qué hacemos hoy con Gunter?";
    }

    if (
        text.includes("gunter") ||
        text.includes("gato")
    ) {
        return "¡Gunter es el protagonista de este refugio! Puedes acariciarlo haciendo clic sobre él.";
    }

    if (
        text.includes("comida") ||
        text.includes("comer") ||
        text.includes("hambre") ||
        text.includes("pienso")
    ) {
        return "¡Creo que Gunter tiene hambre! Prueba a acercarlo al cuenco de comida.";
    }

    if (
        text.includes("agua") ||
        text.includes("beber") ||
        text.includes("sed")
    ) {
        return "¡No olvides mantener hidratado a Gunter! Acerca el cuenco de agua.";
    }

    if (
        text.includes("jugar") ||
        text.includes("juguete") ||
        text.includes("caja")
    ) {
        return "¡A Gunter le encanta jugar! La caja puede ser una aventura estupenda.";
    }

    if (
        text.includes("gracias")
    ) {
        return "¡No hay de qué! Para eso estoy aquí. ♥";
    }

    if (
        text.includes("adios") ||
        text.includes("hasta luego")
    ) {
        return "¡Hasta pronto! Cuidaremos de Gunter mientras tanto.";
    }

    if (
        text.includes("quien eres") ||
        text.includes("quién eres")
    ) {
        return "Soy Karu, tu pequeño asistente dentro del refugio de Gunter.";
    }

    return "¡Te escucho! Cuéntame un poco más. Estoy aquí para acompañarte en el refugio.";
}


/* ==========================================
   ENVIAR MENSAJES
========================================== */

chatForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const message = chatInput.value.trim();

    if (message === "") {
        return;
    }

    // Mostrar mensaje del usuario
    addChatMessage(message, "user");

    // Limpiar el campo
    chatInput.value = "";

    // Respuesta de Karu
    setTimeout(() => {
        const response = getKaruResponse(message);

        addChatMessage(response, "karu");
    }, 550);
});
