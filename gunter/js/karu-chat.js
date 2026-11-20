
document.addEventListener("DOMContentLoaded", () => {

    const widget = document.createElement("div");
    widget.id = "karu-chat-widget";

    widget.innerHTML = `
        <button id="karu-chat-toggle" type="button">
            💬 Hablar con Karu
        </button>

        <section id="karu-chat-window" class="karu-hidden">

            <header class="karu-chat-header">
                <div>
                    <h3>Karu 🐱</h3>
                    <span>Asistente EVARKION</span>
                </div>
                <button id="karu-close" type="button">×</button>
            </header>

            <div id="karu-messages"></div>

            <div id="karu-options"></div>

            <footer class="karu-chat-footer">
                EVARKION · Refugio Gunter
            </footer>

        </section>
    `;

    document.body.appendChild(widget);

    const windowChat = document.getElementById("karu-chat-window");
    const messages = document.getElementById("karu-messages");
    const options = document.getElementById("karu-options");

    document.getElementById("karu-chat-toggle")
        .addEventListener("click", () => {
            windowChat.classList.toggle("karu-hidden");
        });

    document.getElementById("karu-close")
        .addEventListener("click", () => {
            windowChat.classList.add("karu-hidden");
        });

    // =====================================
    // BASE DE PREGUNTAS Y RESPUESTAS
    // =====================================

    const conversations = {

        inicio: {
            message: "¡Hola! Soy Karu. 🐱 ¿Qué te gustaría hacer hoy?",
            options: [
                ["🎮 Hablar sobre videojuegos", "videojuegos"],
                ["🎵 EVARKION Music", "musica"],
                ["💻 Programación", "programacion"],
                ["🐱 Conocer a Gunter", "gunter"],
                ["💬 Simplemente charlar", "charlar"]
            ]
        },

        videojuegos: {
            message: "¡Me encantan los videojuegos! ¿Qué te interesa?",
            options: [
                ["⚽ Inazuma Eleven", "inazuma"],
                ["⛏️ Minecraft", "minecraft"],
                ["🎮 Otros videojuegos", "otros_juegos"]
            ]
        },

        musica: {
            message: "¡Bienvenido a EVARKION Music! 🎵 ¿Qué quieres descubrir?",
            options: [
                ["🎧 Escuchar música", "escuchar"],
                ["🌟 Conocer EVARKION", "evarkion"],
                ["🔙 Volver al inicio", "inicio"]
            ]
        },

        programacion: {
            message: "¡El mundo del código! 💻 ¿Sobre qué quieres hablar?",
            options: [
                ["🌐 Desarrollo web", "web"],
                ["☕ Java", "java"],
                ["🚀 Crear proyectos", "proyectos"]
            ]
        },

        gunter: {
            message: "¡Gunter! 🐱 Nuestro pequeño compañero del refugio. ¿Qué quieres saber?",
            options: [
                ["🐾 Su personalidad", "personalidad"],
                ["🍗 Sus cuidados", "cuidados"],
                ["🎮 Sus interacciones", "interacciones"]
            ]
        },

        charlar: {
            message: "¡Me alegra que quieras charlar conmigo! ¿Cómo te encuentras?",
            options: [
                ["😄 Estoy genial", "genial"],
                ["😴 Estoy cansado", "cansado"],
                ["🤔 Estoy aburrido", "aburrido"]
            ]
        },

        inazuma: {
            message: "¡Inazuma Eleven! ⚽ Una aventura llena de fútbol, técnicas especiales y amistad.",
            options: [
                ["⚡ Técnicas especiales", "tecnicas"],
                ["🏆 Equipos y personajes", "equipos"]
            ]
        },

        minecraft: {
            message: "Minecraft es perfecto para construir y explorar. ⛏️ ¿Qué prefieres?",
            options: [
                ["🏡 Construcción", "construccion"],
                ["⚔️ Supervivencia", "supervivencia"]
            ]
        },

        otros_juegos: {
            message: "¡Hay muchísimos mundos por descubrir! ¿Qué género te gusta?",
            options: [
                ["🗺️ Aventuras", "aventuras"],
                ["⚔️ RPG", "rpg"]
            ]
        },

        escuchar: {
            message: "¡Puedes descubrir los proyectos musicales de EVARKION desde su sección Music!",
            options: [
                ["🎵 Ir a EVARKION Music", "abrir_musica"]
            ]
        },

        evarkion: {
            message: "EVARKION es un universo creativo que reúne música, proyectos y experiencias digitales.",
            options: []
        },

        web: {
            message: "El desarrollo web combina HTML, CSS y JavaScript para construir páginas y aplicaciones.",
            options: []
        },

        java: {
            message: "Java es un lenguaje de programación orientado a objetos. ¡Ideal para aprender lógica y crear aplicaciones!",
            options: []
        },

        proyectos: {
            message: "¡Crear proyectos es una de las mejores formas de aprender! Empieza por algo pequeño y ve añadiendo funciones.",
            options: []
        },

        personalidad: {
            message: "Gunter es curioso, tranquilo y juguetón. Le encanta explorar el refugio.",
            options: []
        },

        cuidados: {
            message: "Gunter necesita cariño, descanso, agua y su cuenco de comida. ¡No olvides atenderlo!",
            options: []
        },

        interacciones: {
            message: "Puedes interactuar con Gunter, jugar con él y descubrir sus animaciones dentro del refugio.",
            options: []
        },

        genial: {
            message: "¡Esa es la actitud! 😸 Me alegra que tengas un buen día.",
            options: []
        },

        cansado: {
            message: "A veces necesitamos descansar. Tómate un respiro, ¡mañana será otro día!",
            options: []
        },

        aburrido: {
            message: "¡Pues vamos a cambiar eso! Podemos hablar de videojuegos, música o inventar algo.",
            options: []
        },

        tecnicas: {
            message: "¡Las supertécnicas son una de las mejores partes de Inazuma Eleven! ⚡",
            options: []
        },

        equipos: {
            message: "Hay equipos increíbles: Raimon, Royal Academy, Zeus y muchos más.",
            options: []
        },

        construccion: {
            message: "¡Construir es dar forma a tu imaginación! Puedes crear casas, ciudades y mundos enteros.",
            options: []
        },

        supervivencia: {
            message: "Consigue recursos, construye un refugio y prepárate para explorar.",
            options: []
        },

        aventuras: {
            message: "Las aventuras nos permiten explorar mundos y descubrir historias increíbles.",
            options: []
        },

        rpg: {
            message: "¡Los RPG! Personajes, progresión, habilidades y mundos llenos de historias.",
            options: []
        }

    };

    // =====================================
    // MOSTRAR CONVERSACIÓN
    // =====================================

    function showConversation(id) {

        const conversation = conversations[id];

        if (!conversation) return;

        const botMessage = document.createElement("div");
        botMessage.className = "karu-message bot";
        botMessage.textContent = conversation.message;

        messages.appendChild(botMessage);

        options.innerHTML = "";

        conversation.options.forEach(([label, next]) => {

            const button = document.createElement("button");

            button.type = "button";
            button.className = "karu-option";
            button.textContent = label;

            button.addEventListener("click", () => {

                const userMessage = document.createElement("div");

                userMessage.className = "karu-message user";
                userMessage.textContent = label;

                messages.appendChild(userMessage);

                showConversation(next);

            });

            options.appendChild(button);

        });

        // Botón volver al menú
        if (id !== "inicio") {

            const back = document.createElement("button");

            back.type = "button";
            back.className = "karu-back";
            back.textContent = "↩ Volver al menú";

            back.addEventListener("click", () => {
                showConversation("inicio");
            });

            options.appendChild(back);

        }

        messages.scrollTop = messages.scrollHeight;
    }

    // =====================================
    // INICIAR
    // =====================================

    showConversation("inicio");

    console.log("🐱 Karu Chat interactivo iniciado.");

});
