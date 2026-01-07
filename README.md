# 🎛️ Botonera 

Una **botonera web** para disparar sonidos con solo un click.  
Ideal para fiestas, juntadas, juegos o simplemente para molestar con estilo 😈

---

## 🚀 Demo

👉 https://valenap-utn.github.io/botonera/

---

## ✨ Features

- 🔊 Reproducción de sonidos instantánea 
- 📦 Organización por **secciones** (packs de sonidos)
- 🧩 Sonidos configurables vía **JSON**
- 📱 Compatible con desktop y mobile
- ⚡ Sin frameworks JS (HTML + CSS + Vanilla JS)

---

## 🗂️ Estructura del proyecto

```
botonera/
├── index.html
├── css/
│ └── styles.css
├── js/
│ └── app.js
├── data/
│ ├── sections.json
│ ├── sounds-party.json
│ └── sounds-jingles.json
├── sounds/
│ └── classics/
│    └── applause-track.mp3
│    └── ...
│ └── jingles
│    └── sapito.mp3
│    └── ...
│ └── ...
└── README.md
```

---

## 🧠 Cómo funciona

### 1️⃣ Secciones de sonidos
Las secciones se definen en:

```json
// data/sections.json
[
  { "title": "Sonidos clásicos", "json": "./data/sounds-party.json" },
  { "title": "Jingles", "json": "./data/sounds-jingles.json" }
]
```
Cada sección tiene:
- Un título
- Un archivo JSON con sus sonidos

### 2️⃣ Sonidos por sección

Ejemplo de un pack de sonidos:
```json
[
  {
    "id": "laugh-track",
    "label": "Laugh (1)",
    "file": "classics/laugh-track.mp3",
    "color": "red"
  },
  {
    "id": "boo",
    "label": "Buuu (1)",
    "file": "classics/boo-track.mp3",
    "color": "blue"
  }
]
```

#### 👉 Para agregar un sonido nuevo:

- Copiá el .mp3 en /sounds
- Agregá una entrada en el JSON
- Refresh → listo 🎉

---

## ▶️ Cómo correr el proyecto

> ⚠️ Importante: no abrir con doble click (file://), porque usa fetch.

### Opción 1 – VS Code
- Instalar Live Server
- Click derecho → Open with Live Server

### Opción 2 – Terminal (Mac / Linux)
```bash
python3 -m http.server 5173
```


Abrir en el navegador:
👉 http://localhost:5173

---

## 📱 Compatibilidad

- ✅ Chrome
- ✅ Firefox
- ✅ Safari (desktop y mobile)
- ✅ Mobile 

---

## 🛠️ Roadmap (ideas futuras)

- ⭐ Favoritos (localStorage)
- 🔍 Buscador de sonidos
- ⌨️ Hotkeys (1–9)
- 🎚️ Control de volumen por sección

---

## 🤘 Autor

### Hecho con ♥︎ y mucho ruido por Valucha
