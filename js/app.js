const SOUND_BASE_PATH = "./sounds/";
const SECTIONS_URL = "./data/sections.json";

// Cache de audios para que no haya delay
const audioCache = new Map();

// Estado global: “el audio que está sonando ahora”
let currentAudio = null;
let currentButton = null;
let currentUI = null; // { barEl, timeEl, rafId }

function getAudio(file) {
    if (!audioCache.has(file)) {
        const audio = new Audio(SOUND_BASE_PATH + file);
        audio.preload = "auto";
        audioCache.set(file, audio);
    }
    return audioCache.get(file);
}

function fadeOutAndStop(audio, duration = 400) {
    if (!audio) return;

    const startVolume = audio.volume;
    const startTime = performance.now();

    function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        audio.volume = startVolume * (1 - progress);

        if (progress < 1) {
            requestAnimationFrame(tick);
        } else {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = startVolume; // restauramos volumen
        }
    }

    requestAnimationFrame(tick);
}


function stopAudio(audio) {
    if (!audio) return;
    // audio.pause();
    // audio.currentTime = 0;
    fadeOutAndStop(audio, 400); // 400ms fade-out
}

function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
}

function cleanupCurrentUI() {
    if (!currentUI) return;
    if (currentUI.rafId) cancelAnimationFrame(currentUI.rafId);
    currentUI.rafId = null;
    if (currentUI.barEl) currentUI.barEl.style.width = "0%";
    if (currentUI.timeEl) currentUI.timeEl.textContent = "";
}

function setButtonPlayingState(btn, isPlaying) {
    if (!btn) return;
    btn.classList.toggle("is-playing", isPlaying);
}

function stopCurrentPlayback() {
    // corta audio y limpia UI/estado
    if (currentAudio) stopAudio(currentAudio);
    cleanupCurrentUI();
    setButtonPlayingState(currentButton, false);

    currentAudio = null;
    currentButton = null;
    currentUI = null;
}

function startProgressLoop(audio, ui) {
    const tick = () => {
        if (!audio || !ui) return;

        const duration = audio.duration;
        const current = audio.currentTime;

        // Progreso
        if (ui.barEl && Number.isFinite(duration) && duration > 0) {
            const pct = Math.min(100, Math.max(0, (current / duration) * 100));
            ui.barEl.style.width = `${pct}%`;
        }

        // Texto: "0:12 / 0:33 · -0:21"
        if (ui.timeEl) {
            const total = formatTime(duration);
            const cur = formatTime(current);
            const remaining = formatTime((duration || 0) - current);
            ui.timeEl.textContent = `${cur} / ${total} · -${remaining}`;
        }

        ui.rafId = requestAnimationFrame(tick);
    };

    ui.rafId = requestAnimationFrame(tick);
}

function toggleSound({ btn, file, ui }) {
    const audio = getAudio(file);

    // Si apreté el MISMO botón y está sonando => STOP
    if (currentButton === btn && currentAudio && !currentAudio.paused) {
        stopCurrentPlayback();
        return;
    }

    // Si hay otro audio sonando => lo corto (solo 1 a la vez)
    if (currentAudio && !currentAudio.paused) {
        stopCurrentPlayback();
    }

    // Set nuevo "current"
    currentAudio = audio;
    currentButton = btn;
    currentUI = ui;

    // Reinicio y play
    audio.currentTime = 0;
    setButtonPlayingState(btn, true);

    // Cuando termina => limpiar estado
    audio.onended = () => {
        if (currentAudio === audio) {
            stopCurrentPlayback();
        }
    };

    // Si hay error/stop externo
    audio.onpause = () => {
        // Si pausan sin querer, no limpiamos siempre.
        // Pero si el pause viene porque stopCurrentPlayback ya limpió, está ok.
    };

    // Arranca loop de progreso
    cleanupCurrentUI();
    startProgressLoop(audio, ui);

    audio.play().catch(() => {
        // Si falla por autoplay policies, no rompemos la UI
        stopCurrentPlayback();
    });
}

function createSoundButton(sound) {
    const wrapper = document.createElement("div");
    wrapper.className = "arcade-button";

    const btn = document.createElement("button");
    btn.className = `btn botonera ${sound.color || ""}`;
    btn.type = "button";
    btn.setAttribute("aria-label", sound.label);

    const label = document.createElement("span");
    label.className = "button-label";
    label.textContent = sound.label;

    // UI: barra + tiempo
    const progressWrap = document.createElement("div");
    progressWrap.className = "sound-progress";

    const progressBar = document.createElement("div");
    progressBar.className = "sound-progress-bar";

    const time = document.createElement("div");
    time.className = "sound-time";
    time.textContent = ""; // se llena al reproducir

    progressWrap.appendChild(progressBar);

    const ui = { barEl: progressBar, timeEl: time, rafId: null };

    // Eventos
    const onPress = (e) => {
        if (e?.type === "touchstart") e.preventDefault();
        toggleSound({ btn, file: sound.file, ui });
    };

    btn.addEventListener("click", onPress);
    btn.addEventListener("touchstart", onPress, { passive: false });

    // Pre-carga audio (y metadatos)
    const audio = getAudio(sound.file);
    audio.addEventListener(
        "loadedmetadata",
        () => {
            // opcional: mostrar duración fija aun sin reproducir
            // time.textContent = `0:00 / ${formatTime(audio.duration)}`;
        },
        { once: true }
    );

    wrapper.appendChild(btn);
    wrapper.appendChild(label);
    wrapper.appendChild(progressWrap);
    wrapper.appendChild(time);

    return wrapper;
}

async function loadJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`No pude cargar: ${url} (${res.status})`);
    return res.json();
}

async function renderSection({ title, json }) {
    const container = document.getElementById("soundSections");

    const sectionEl = document.createElement("section");
    sectionEl.className = "sound-section";

    const heading = document.createElement("h2");
    heading.className = "sound-section-title";
    heading.textContent = title;

    const grid = document.createElement("div");
    grid.className = "buttons-section";

    const sounds = await loadJson(json);

    sounds.forEach((s) => {
        grid.appendChild(createSoundButton(s));
    });

    sectionEl.appendChild(heading);
    sectionEl.appendChild(grid);
    container.appendChild(sectionEl);
}

/*async function init() {
    const sections = await loadJson(SECTIONS_URL);

    const container = document.getElementById("soundSections");
    container.innerHTML = "";

    for (const section of sections) {
        try {
            await renderSection(section);
        } catch (e) {
            console.error("Falló sección:", section?.title, e);
            // sigue con las demás
        }
    }
}*/

async function renderSelectedSection(section) {
    const container = document.getElementById("soundSections");

    // 1) Limpio TODO lo anterior (incluye menú + sección)
    container.innerHTML = "";

    const sections = await loadJson(SECTIONS_URL);

    // 2) Menú (una sola vez)
    const menu = document.createElement("div");
    menu.className = "section-menu";

    const inner = document.createElement("div");
    inner.className = "section-menu-inner";

    sections.forEach((s) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "section-tab";
        btn.textContent = s.title;

        if (s.json === section.json) btn.classList.add("active");

        btn.addEventListener("click", async () => {
            if (s.json === section.json) return;

            stopCurrentPlayback();
            localStorage.setItem("botonera:selectedSectionJson", s.json);

            await renderSelectedSection(s);
        });

        inner.appendChild(btn);
    });

    menu.appendChild(inner);
    container.appendChild(menu);

    // 3) Render de la sección elegida
    await renderSection(section);
}


async function init() {
    const sections = await loadJson(SECTIONS_URL);

    // 1) intentar agarrar sounds-party.json como default
    const party = sections.find((s) => String(s.json).includes("sounds-party.json"));

    // 2) si el usuario ya eligió una antes, usar esa
    const saved = localStorage.getItem("botonera:selectedSectionJson");
    const savedSection = saved ? sections.find((s) => s.json === saved) : null;

    const defaultSection = savedSection || party || sections[0];

    await renderSelectedSection(defaultSection);
}

init().catch(console.error);

// Cortar todo con tecla ESC
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") stopCurrentPlayback();
});
