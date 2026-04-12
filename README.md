# Mansplain Away

A big red button you press when someone explains something to you unsolicited. Press it, get a sarcastic comeback read aloud.

**Live:** deployed on Vercel, auto-deploys on push to `main`.

---

## Concept

The app is a single cathartic interaction: click the button, get a snarky response delivered with full drama (animation, buzzer sound, text-to-speech). It has a stealth mode that disguises the UI as YouTube/Spotify/Reddit/BuzzFeed so users can hide what they're doing if interrupted. It also tracks how many times the button has been pressed today.

---

## File Structure

```
mansplain-away/
├── index.html          # The entire app — HTML, CSS, and JS in one file
├── api/
│   ├── comeback.js     # Vercel serverless function, returns a random hardcoded comeback
├── vercel.json         # Vercel config — rewrites "/" to serve index.html
└── .gitignore
```

Everything meaningful is in `index.html`. The `api/` directory is a thin serverless layer on Vercel.

---

## Architecture

**Zero dependencies, zero build step.** Vanilla HTML/CSS/JS. No npm, no bundler, no framework. One file loads in a browser and does everything.

**Backend is minimal.** `api/comeback.js` exists as a Vercel Function that could serve comebacks over HTTP, but the front end doesn't call it — it uses a hardcoded JavaScript array directly in `index.html` instead.

**State lives in three places:**
- `localStorage` — daily counter, keyed by date (resets each day)
- URL query params — theme (`?theme=dark`) and stealth mode (`?stealth=1`), so state is shareable/bookmarkable
- In-memory JS variables — current comeback, loading state, stealth state

---

## Features & How They Work

### The Button
The main button is a 190px circle with a rotating gradient ring (CSS `@keyframes spin` on a `::before` pseudo-element). Clicking it:
1. Triggers a 2-second cooldown (prevents spam)
2. Calls `pickComeback()` — picks a random string from the `COMEBACKS` array (20 entries)
3. Runs `speakText(text)` — Web Speech API, targets female-identified voices by name matching, pitch 1.1, rate 0.95
4. Plays a buzzer sound via Web Audio API (sawtooth oscillator sweeping 180Hz → 90Hz)
5. Spawns 16 spark `<div>` elements positioned at random angles around the button center, animated with `@keyframes sparkfly`, then removed from the DOM after 600ms
6. Shakes the button (`@keyframes shake`, 0.55s)
7. Increments and persists the daily counter

### Comeback Display
The comeback appears in a card below the button with a fade-in animation. The card is hidden at page load and shown on first press.

### Stealth Mode
Clicking the ninja button (top-right corner) swaps the entire visible UI for a full-screen fake interface. There are 5 disguise options (randomly selected each session):
- YouTube video page (two variants)
- Spotify podcast player
- Reddit post thread
- BuzzFeed quiz



Each disguise has authentic styling. Clicking anywhere on the stealth overlay triggers the comeback logic (generating a comeback and reading it aloud) without visually revealing the real app. The page `<title>` also changes to match the disguise. State is stored in `?stealth=1` URL param.

### Themes
Four themes switchable via a dropdown:
- **Retro** (default) — pastel pink/yellow, polka-dot background, chunky box shadows
- **Dark** — red gradients on black, glow effects
- **Pastel** — purple/lavender, diagonal stripe pattern
- **Y2K** — navy + neon cyan/magenta, scanline overlay, VT323 monospace font

Themes use CSS custom properties (`--bg-color`, `--button-color`, etc.) scoped to `[data-theme="x"]` on `<body>`. Switching sets `data-theme` and pushes to URL (`?theme=dark`) via History API.

### Counter
Stored in `localStorage` as `{ date: "YYYY-MM-DD", count: N }`. Resets when the date changes. Displayed as "Times today: N" with a bounce animation on increment.

---

## Comeback Content

The `COMEBACKS` array in `index.html` contains 20 hardcoded strings. They're sarcastic/witty one-liners. Examples:
- "Oh wow, I had no idea until you explained that. What would I do without you?"
- "Thank you for dumbing that down for me. Truly, you're a gift."

The `api/comeback.js` serverless function also has the same array and returns a random entry as JSON (`{ comeback: "..." }`), but the front end does not call this endpoint.

---

## Audio

Two audio mechanisms run on each button press:

**Buzzer (Web Audio API):**
```js
const osc = ctx.createOscillator();
osc.type = 'sawtooth';
osc.frequency.setValueAtTime(180, ctx.currentTime);
osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.3);
// gain envelope: attack 0.01s, decay to 0
```

**Text-to-speech (Web Speech API):**
```js
const utter = new SpeechSynthesisUtterance(text);
// voice selection: prefer voices whose name includes female-associated keywords
utter.pitch = 1.1;
utter.rate = 0.95;
speechSynthesis.speak(utter);
```

Voice availability varies by browser/OS. The code falls back gracefully if no matching voice is found.

---

## Deployment

Hosted on Vercel. `vercel.json` rewrites all paths to `index.html`. Auto-deploys on push to `main`.

**To run locally:**
```bash
npm i -g vercel
vercel dev
```

Or just open `index.html` directly in a browser — everything except the serverless functions works without a server.

---

## License

MIT
