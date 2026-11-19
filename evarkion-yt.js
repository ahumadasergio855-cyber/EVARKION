// =========================================
// EVARKION YT — biblioteca y reproductor
// =========================================

// Los vídeos se muestran en el orden de visualizaciones
// que aparecía en la captura facilitada.

const videos = [
    {
        id: "5ADbymfBY74",
        title: "El Circo De Los Cuerdos",
        views: 318,
        description: "EVARKION · Vídeo musical"
    },
    {
        id: "JyAN9QAP8mk",
        title: "Que Desastre Tan Bien Hecho",
        views: 301,
        description: "EVARKION · Vídeo musical"
    },
    {
        id: "wGEFzjwNrfs",
        title: "I Sing So You Stay",
        views: 285,
        description: "EVARKION · Vídeo musical"
    },
    {
        id: "HJasqWHyRaU",
        title: "Porque Yo Lo Valgo",
        views: 225,
        description: "EVARKION · Vídeo musical"
    },
    {
        id: "-K7TgmzGDcE",
        title: "Mi Funeral · BROOK",
        views: 167,
        description: "BROOK · Colaboración ocasional de EVARKION"
    },
    {
        id: "gabhJXLPTbI",
        title: "La Última Noche De Siempre",
        views: 153,
        description: "Last Call Kids · Colaboración ocasional de EVARKION"
    }
];

const player = document.getElementById("youtube-player");
const currentTitle = document.getElementById("current-title");
const currentArtist = document.getElementById("current-artist");
const youtubeOpen = document.getElementById("youtube-open");
const queueList = document.getElementById("queue-list");
const videoGrid = document.getElementById("video-grid");
const queueCount = document.getElementById("queue-count");

let currentVideoIndex = 0;

// Devuelve la miniatura de YouTube correspondiente a cada vídeo.
function obtenerMiniatura(videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

// Cambia el vídeo del reproductor y actualiza la información.
function reproducirVideo(index) {
    if (index < 0 || index >= videos.length) {
        return;
    }

    currentVideoIndex = index;

    const video = videos[index];

    player.src = `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`;
    player.title = `Reproduciendo ${video.title}`;

    currentTitle.textContent = video.title;
    currentArtist.textContent = video.description;
    youtubeOpen.href = `https://youtu.be/${video.id}`;

    // Actualizamos el estado visual de la cola y las tarjetas.
    document.querySelectorAll(".queue-item").forEach((item, itemIndex) => {
        item.classList.toggle("selected", itemIndex === index);
        item.setAttribute("aria-current", itemIndex === index ? "true" : "false");
    });

    document.querySelectorAll(".video-card").forEach((card, cardIndex) => {
        card.classList.toggle("selected", cardIndex === index);
    });
}

// Crea la lista compacta que aparece junto al reproductor.
function crearCola() {
    queueCount.textContent = String(videos.length).padStart(2, "0");

    videos.forEach((video, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "queue-item";
        button.setAttribute("aria-label", `Reproducir ${video.title}`);

        button.innerHTML = `
            <span class="queue-number">${String(index + 1).padStart(2, "0")}</span>
            <img class="queue-thumb" src="${obtenerMiniatura(video.id)}"
                 alt="" loading="lazy">
            <span class="queue-meta">
                <span class="queue-title"></span>
                <span class="queue-views">${video.views} visualizaciones</span>
            </span>
        `;

        button.querySelector(".queue-title").textContent = video.title;
        button.addEventListener("click", () => reproducirVideo(index));

        queueList.appendChild(button);
    });
}

// Crea las tarjetas grandes de vídeos destacados.
function crearTarjetas() {
    videos.forEach((video, index) => {
        const article = document.createElement("article");
        article.className = "video-card";
        article.tabIndex = 0;
        article.setAttribute("role", "button");
        article.setAttribute("aria-label", `Reproducir ${video.title}`);

        article.innerHTML = `
            <div class="card-thumb-wrap">
                <img class="card-thumb" src="${obtenerMiniatura(video.id)}"
                     alt="Miniatura de ${video.title}" loading="lazy">
                <span class="card-play" aria-hidden="true">▶</span>
            </div>
            <div class="card-info">
                <span class="card-rank">#${index + 1}</span>
                <div class="card-text">
                    <h3></h3>
                    <p>${video.views} visualizaciones</p>
                </div>
            </div>
        `;

        article.querySelector("h3").textContent = video.title;

        article.addEventListener("click", () => {
            reproducirVideo(index);
            document.querySelector(".player-panel").scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        });

        article.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                reproducirVideo(index);
            }
        });

        videoGrid.appendChild(article);
    });
}

// Inicializamos la página.
crearCola();
crearTarjetas();
reproducirVideo(0);
