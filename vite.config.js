import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Dev-only: lets _render.html POST a rendered sprite PNG straight to disk
// (public/sprites/<name>.png) so we can bake the 3D models into flat 2D sprites
// for the lightweight side-scroller. Harmless in production (dev server only).
function spriteSaver() {
  return {
    name: 'sprite-saver',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/_save', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end('POST only');
        }
        const name = (new URL(req.url, 'http://x').searchParams.get('name') || 'sprite').replace(/[^a-z0-9_-]/gi, '');
        const chunks = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => {
          const dir = path.resolve(process.cwd(), 'public/sprites');
          fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(path.join(dir, `${name}.png`), Buffer.concat(chunks));
          res.statusCode = 200;
          res.end('ok');
        });
        return undefined;
      });
      // Save the journey tuning (city/car/camera) back to its config file.
      server.middlewares.use('/_save-tuning', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; return res.end('POST only'); }
        const chunks = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => {
          try {
            const json = JSON.parse(Buffer.concat(chunks).toString('utf8'));
            const file = path.resolve(process.cwd(), 'src/journey/tuning.json');
            fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n');
            res.statusCode = 200;
            res.end('ok');
          } catch (e) {
            res.statusCode = 400;
            res.end('bad json');
          }
        });
        return undefined;
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), spriteSaver()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei'],
  },
});
