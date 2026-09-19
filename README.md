# HAppy Birthday!

A responsive vector drawing web app for creating a simple illustrated tooth.

## Requirements
- Node.js 20+ recommended
- npm

## Run
```bash
npm install
npm run dev
```

Then open the local Vite URL.

## Production build
```bash
npm run build
npm run preview
```

## Important implementation details
- The canonical artwork coordinate system is always SVG `viewBox="0 0 300 300"`.
- The UI/canvas scales responsively with CSS, but pointer coordinates are converted back to the fixed 300×300 SVG coordinate system.
- Brush width is a fixed `14` SVG units, so it does not become thinner/thicker depending on screen size or device pixel ratio.
- The PNG exporter always renders the SVG at exactly 300×300 pixels.
- The SVG is the source of truth; the HTML canvas is not used as the artwork data store.
- There is one fixed round brush and no eraser.
- Step 1 accepts a closed, non-self-intersecting outline and converts it to a filled white SVG path.
- Step 2 allows only black and blue strokes.
- No backend is required.
