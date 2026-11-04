# Joe Laredo – Website

Portfolio/EPK von Joe Laredo. Statisch (HTML/CSS/JS + GSAP), läuft auf GitHub Pages.

## Inhalte ändern
Alles Wichtige steht in **`content.js`**: Filme (Titel, Jahr, Rolle, YouTube-ID, Poster), E-Mail, Socials.
- YouTube-ID = der Teil nach `watch?v=` im Link
- Bilder nach `assets/` legen (Portrait: `assets/joe.jpg`)

## Lokal ansehen
`python3 -m http.server` im Ordner, dann http://localhost:8000

## Struktur
- `index.html` – Aufbau (Intro/Trunk-Shot, Kapitel, Filme, About, Services, Kontakt)
- `style.css` – Look (Farben/Schriften oben in `:root`)
- `main.js` – Animationen & Player
- `impressum.html` – Pflichtangaben (TODOs ausfüllen!)
