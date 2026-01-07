const SOUND_BASE_PATH = "./sounds/";
const SECTIONS_URL = "./data/sections.json";

// Cache de audios para que no haya delay
const audioCache = new Map();

function getAudio(file) {
    if (!audioCache.has(file)) {
        const audio = new Audio(SOUND_BASE_PATH + file);
        audio.preload = "auto";
        audioCache.set(file, audio);
    }
    return audioCache.get(file);
}

function playSound(file) {
    const audio = getAudio(file);
    audio.pause();
    audio.currentTime = 0;
    audio.play().catch(() => {});
}

function createSoundButton(sound) {
    const wrapper = document.createElement("div");
    wrapper.className = "arcade-button";

    const btn = document.createElement("button");
    btn.className = `btn botonera ${sound.color || ""}`;
    btn.type = "button";
    btn.setAttribute("aria-label", sound.label);

    btn.addEventListener("click", () => playSound(sound.file));
    btn.addEventListener(
        "touchstart",
        (e) => {
            e.preventDefault();
            playSound(sound.file);
        },
        { passive: false }
    );

    const label = document.createElement("span");
    label.className = "button-label";
    label.textContent = sound.label;

    wrapper.appendChild(btn);
    wrapper.appendChild(label);

    // Pre-carga
    getAudio(sound.file);

    return wrapper;
}

async function loadJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`No pude cargar: ${url}`);
    return res.json();
}

async function renderSection({ title, json }) {
    const container = document.getElementById("soundSections");

    // Wrapper de sección
    const sectionEl = document.createElement("section");
    sectionEl.className = "sound-section";

    // Título
    const heading = document.createElement("h2");
    heading.className = "sound-section-title";
    heading.textContent = title;

    // Grid de botones
    const grid = document.createElement("div");
    grid.className = "buttons-section";

    // Cargar sonidos del json
    const sounds = await loadJson(json);

    sounds.forEach((s) => {
        grid.appendChild(createSoundButton(s));
    });

    sectionEl.appendChild(heading);
    sectionEl.appendChild(grid);
    container.appendChild(sectionEl);
}

async function init() {
    const sections = await loadJson(SECTIONS_URL);

    // Limpia y renderiza todas
    const container = document.getElementById("soundSections");
    container.innerHTML = "";

    for (const section of sections) {
        await renderSection(section);
    }
}

init().catch(console.error);
