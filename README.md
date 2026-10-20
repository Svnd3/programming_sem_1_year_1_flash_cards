# Sundays

A minimal 3D flashcard globe for programming basics. Study a card, flip it for the definition, and watch it join the globe.

## Run locally

Requires Node.js 18+ and an internet connection for Three.js (loaded from jsDelivr).

```powershell
node serve.cjs
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173).

## Controls

- Drag the globe to rotate; scroll to zoom.
- Select a card to reveal its definition; use the close button to return.
- Use the redo icon to clear saved progress and restart. Progress is stored in this browser.
- **Test all cards** is a temporary preview control for the completion animation.

## Content

Flashcards are defined in `main.js` and `extra-cards.js`. Add entries with a topic, title, and definition; duplicate titles are ignored.

## Credits

- 3D rendering: [Three.js](https://threejs.org/), loaded from jsDelivr.
- Typeface: Note Paper from 1001Fonts. Its FFC license permits app embedding; republishing the font file requires the author's permission. See the [1001Fonts license](https://www.1001fonts.com/license.html).

No license is declared for the Sundays project itself.
