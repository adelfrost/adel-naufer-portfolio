import { HERO_VIDEO } from './content';
import { ARTWORKS_VIDEO } from './artworks';

// Full-viewport background videos the loading screen fully downloads before it
// reveals the site, so every backdrop is ready the instant the page appears.
// (Reel clips load lazily in the lightbox — they're not backdrops.)
export const PRELOAD_VIDEOS = [
  HERO_VIDEO,                        // hero wheat-field backdrop
  ARTWORKS_VIDEO,                    // artworks llama scrub
  '/videos/videos-bg-scrub.mp4',    // videos-section scroll-scrub backdrop
];
