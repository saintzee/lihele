# Lihele · Likele — Castelsardo, Sardegna

Sito web React per le strutture ricettive Lihele e Likele a Castelsardo.

## Tech Stack

- **React 19** — componenti funzionali + hooks
- **Tailwind CSS v4** — utility-first via `@tailwindcss/vite`
- **GSAP 3** — ScrollTrigger, timeline, parallax
- **Lucide React** — icone
- **Vite 6** — bundler

## Setup

```bash
npm install
npm run dev
```

Apre su `http://localhost:5173`

## Build per produzione

```bash
npm run build
```

Output in `dist/`. Deployabile su Netlify, Vercel, Cloudflare Pages, o qualsiasi hosting statico.

## Deploy rapido su Netlify

1. `npm run build`
2. Trascina la cartella `dist/` su [app.netlify.com/drop](https://app.netlify.com/drop)
3. Fatto.

Oppure collega il repo GitHub a Netlify/Vercel per deploy automatici.

## Struttura progetto

```
├── index.html          ← Entry point con SEO meta + JSON-LD
├── package.json
├── vite.config.js
├── public/
│   └── assets/
│       ├── hero.mp4            ← Video hero
│       ├── Lihele.svg          ← Logo Lihele (colore)
│       ├── Likele.svg          ← Logo Likele (colore)
│       ├── Lihele-wh.svg       ← Logo Lihele (bianco)
│       ├── Likele-wh.svg       ← Logo Likele (bianco)
│       ├── bookingcom.svg       ← Logo Booking.com
│       ├── NostalgicWhispers-Regular.ttf
│       └── images/
│           └── lihele2.jpeg
└── src/
    ├── main.jsx        ← React entry
    ├── index.css       ← Tailwind + custom styles
    └── App.jsx         ← Tutti i componenti (~900 righe)
```

## Cose da fare prima del lancio

- [ ] Sostituire `YOUR_ID` nel form Formspree (`src/App.jsx` → sezione Contact)
- [ ] Aggiungere foto reali nella gallery e nei placeholder
- [ ] Aggiungere favicon: `<link rel="icon" href="/favicon.ico">`
- [ ] Creare pagine Privacy Policy e Cookie Policy
- [ ] Aggiungere Google Analytics / cookie consent
- [ ] Verificare Open Graph image URL nel `index.html`
