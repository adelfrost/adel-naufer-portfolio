import { HERO_VIDEO } from './content';
import { ARTWORKS_VIDEO } from './artworks';

// The contact section's looping backdrop (hosted on CloudFront).
export const CONTACT_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_171521_25968ba2-b594-4b32-aab7-f6b69398a6fa.mp4';

// Every full-viewport background video. The loading screen buffers all of them
// (until each can play through) before it reveals the site, so no backdrop pops
// in afterwards on a slow connection. (Reel clips load lazily in the lightbox.)
export const PRELOAD_VIDEOS = [
  HERO_VIDEO,                        // hero backdrop
  ARTWORKS_VIDEO,                    // artworks llama scrub
  '/videos/videos-bg-scrub.mp4',    // videos-section scroll-scrub backdrop
  CONTACT_VIDEO,                     // contact section loop (external)
];
