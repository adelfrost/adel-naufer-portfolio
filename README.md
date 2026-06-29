# Adel Naufer — Portfolio

Personal portfolio for Adel Naufer, a senior graphic designer and art director. Built as a single page app with section based storytelling, a WebGL "My Journey" experience, and dedicated case study pages for each project.

## Stack

- Vite 5 + React 18
- Tailwind CSS v3
- motion (Framer Motion) for animation
- React Three Fiber, drei and postprocessing for the 3D journey
- GSAP and OGL for select effects

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build

```bash
npm run build    # outputs to dist/
npm run preview  # serve the production build locally
```

## Routes

Navigation is hash based.

- `#journey` opens the flying DeLorean career experience
- `#project/<slug>` opens a project case study (for example `#project/falcon-gold`)

Project case study content lives in `src/data/projectsData.js`, and the media sits under `public/projects/`.
