
import { karuModel } from "./firebase-config.js";

// =====================================
// KARU CHAT - EVARKION
// =====================================

// Historial temporal: desaparece al recargar.
const history = [];

// Crear conversación
const chat = karuModel.startChat({
    history: []
});

// Elementos del chat
let chatWindow;
let messagesContainer;
let messageInput;
let sendButton;

// =====================================
// CREAR INTERFAZ
// =====================================

function createKaruChat() {

    const chatHTML = `
        <div id="karu-chat-widget">

            <button id="karu-chat-toggle" aria-label="Abrir chat de Karu">
                <img src="./assets/karu_avatar.png" alt="Karu">
                <span class="karu-online"></span>
            </button>

            <section id="karu-chat-window" class="karu-hidden">

                <header class="karu-chat-header">

                    <div class="karu-header-avatar">
                        <img src="./assets/karu_avatar.png" alt="Karu">
                    </div>

                    <div class="karu-header-info">
                        <h3>Karu</h3>
                        <span>Asistente EVARKION · En línea</span>
                    </div>

                    <button id="karu-close" aria-label="Cerrar chat">
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

                    <button type="submit" id="karu-send">
                        ➤
                    </button>

                </form>

                <footer class="karu-chat-footer">
                    EVARKION · Refugio Gunter
                </footer>

            </section>

        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", chatHTML);

    chatWindow = document.getElementById("karu-chat-window");
    messagesContainer = document.getElementById("karu-messages");
    messageInput = document.getElementById("karu-message-input");
    sendButton = document.getElementById("karu-send");

    const toggle = document.getElementById("karu-chat-toggle");
    const close = document.getElementById("karu-close");
    const form = document.getElementById("karu-chat-form");

    toggle.addEventListener("click", () => {
        chatWindow.classList.toggle("karu-hidden");

        if (!chatWindow.classList.contains("karu-hidden")) {
            messageInput.focus();
        }
    });

    close.addEventListener("click", () => {
        chatWindow.classList.add("karu-hidden");
    });

    form.addEventListener("submit", sendMessage);
}

// =====================================
// MOSTRAR MENSAJES
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
// ENVIAR MENSAJES A GEMINI
// =====================================

async function sendMessage(event) {

    event.preventDefault();

    const text = messageInput.value.trim();

    if (!text || sendButton.disabled) return;

    addMessage(text, "user");

    history.push({
        role: "user",
        text: text
    });

    messageInput.value = "";

    sendButton.disabled = true;

    const loading = addMessage("Karu está pensando...", "bot");

    try {

        const result = await chat.sendMessage(text);

        const response = result.response.text();

        loading.textContent = response ||
            "¡Vaya! Me he quedado sin palabras. ¿Puedes repetirlo?";

        history.push({
            role: "model",
            text: response
        });

    } catch (error) {

        console.error("Error de Karu:", error);

        loading.textContent =
            "¡Ups! No consigo conectarme ahora mismo. Inténtalo de nuevo en un momento.";

    } finally {

        sendButton.disabled = false;
        messageInput.focus();

    }
}

// =====================================
// INICIAR KARU
// =====================================

document.addEventListener("DOMContentLoaded", () => {

    createKaruChat();

    console.log("🐱 Karu Chat iniciado.");

});
