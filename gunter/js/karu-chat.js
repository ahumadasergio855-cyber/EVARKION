
import { karuModel } from "./firebase-config.js";

// =====================================
// KARU CHAT - EVARKION
// =====================================

let chat;
let messagesContainer;
let messageInput;
let sendButton;

let sending = false;

// =====================================
// CREAR CHAT
// =====================================

function createKaruChat() {

    const widget = document.createElement("div");

    widget.id = "karu-chat-widget";

    widget.innerHTML = `
        <button
            type="button"
            id="karu-chat-toggle"
            aria-label="Abrir conversación con Karu"
        >
            💬 Hablar con Karu
        </button>

        <section id="karu-chat-window" class="karu-hidden">

            <header class="karu-chat-header">

                <div class="karu-header-info">
                    <h3>Karu</h3>
                    <span>Asistente EVARKION</span>
                </div>

                <button
                    type="button"
                    id="karu-close"
                    aria-label="Cerrar chat"
                >
                    ×
                </button>

            </header>

            <div id="karu-messages">

                <div class="karu-message bot">
                    ¡Hola! Soy Karu.
                    ¿Qué tal? ¿En qué puedo ayudarte hoy?
                </div>

            </div>

            <form id="karu-chat-form">

                <input
                    id="karu-message-input"
                    type="text"
                    placeholder="Escribe a Karu..."
                    autocomplete="off"
                    maxlength="2000"
                    required
                >

                <button
                    type="submit"
                    id="karu-send"
                >
                    ➤
                </button>

            </form>

            <footer class="karu-chat-footer">
                EVARKION · Refugio Gunter
            </footer>

        </section>
    `;

    document.body.appendChild(widget);

    messagesContainer =
        document.getElementById("karu-messages");

    messageInput =
        document.getElementById("karu-message-input");

    sendButton =
        document.getElementById("karu-send");

    const chatWindow =
        document.getElementById("karu-chat-window");

    const toggle =
        document.getElementById("karu-chat-toggle");

    const close =
        document.getElementById("karu-close");

    const form =
        document.getElementById("karu-chat-form");

    // Abrir conversación
    toggle.addEventListener("click", () => {

        chatWindow.classList.toggle("karu-hidden");

        if (!chatWindow.classList.contains("karu-hidden")) {
            messageInput.focus();
        }

    });

    // Cerrar conversación
    close.addEventListener("click", () => {

        chatWindow.classList.add("karu-hidden");

    });

    // Enviar mensaje
    form.addEventListener("submit", sendMessage);

    // Inicializar conversación
    chat = karuModel.startChat({
        history: []
    });

    console.log("🐱 Karu Chat iniciado correctamente.");
}

// =====================================
// AÑADIR MENSAJE
// =====================================

function addMessage(text, sender) {

    const message = document.createElement("div");

    message.classList.add("karu-message", sender);

    message.textContent = text;

    messagesContainer.appendChild(message);

    messagesContainer.scrollTop =
        messagesContainer.scrollHeight;

    return message;
}

// =====================================
// ENVIAR MENSAJE
// =====================================

async function sendMessage(event) {

    event.preventDefault();

    if (sending) return;

    const text = messageInput.value.trim();

    if (!text) return;

    sending = true;

    sendButton.disabled = true;

    addMessage(text, "user");

    messageInput.value = "";

    const loading = addMessage(
        "Karu está pensando...",
        "bot"
    );

    try {

        const result = await chat.sendMessage(text);

        const response = result.response.text();

        loading.textContent = response ||
            "¡Vaya! ¿Puedes repetirlo?";

    } catch (error) {

        console.error("Error de Karu:", error);

        loading.textContent =
            "No consigo conectarme ahora mismo. Inténtalo de nuevo.";

    } finally {

        sending = false;

        sendButton.disabled = false;

        messageInput.focus();

    }
}

// =====================================
// INICIAR
// =====================================

document.addEventListener("DOMContentLoaded", () => {

    try {

        createKaruChat();

    } catch (error) {

        console.error("Error al iniciar Karu:", error);

    }

});
