// JourneyAudio — ambient bed (engine, city, rain) + a switchable radio.
// HTML5 Audio elements (looping). Per-frame the engine volume/pitch follows the
// car speed and the rain follows the weather. A 4-channel mixer (music, engine,
// city, rain) lets the user balance levels. Music can be muted independently.
// Special case: while the Satie station plays, the city ambience drops out so
// only rain and engine sit under the piano.

const AMBIENT = {
  car: '/audio/car.wav',
  city: '/audio/city.wav',
  rain: '/audio/rain.wav',
};

export const RADIO_TRACKS = [
  { id: 'cyberpunk', name: 'Neon Drive', src: '/audio/radio/cyberpunk.mp3' },
  { id: 'rock', name: 'Rock Station', src: '/audio/radio/rock.mp3' },
  { id: 'punk', name: 'Punk', src: '/audio/radio/punk.mp3' },
  { id: 'hiphop95', name: "'95 Hip Hop", src: '/audio/radio/hiphop95.mp3' },
  { id: 'satie', name: 'Satie, Gymnopedies', src: '/audio/radio/satie.wav' },
];

const DEFAULT_MIX = { music: 0.8, car: 1, city: 0.7, rain: 0.85 };

export class JourneyAudio {
  constructor(initialMix) {
    this.started = false;
    this.musicMuted = false;
    this.radioIndex = 0;
    this._speed = 0;
    this._rain = 0;
    this.mix = { ...DEFAULT_MIX, ...(initialMix || {}) };
    this.onChange = null;

    this.car = this._mk(AMBIENT.car);
    this.city = this._mk(AMBIENT.city);
    this.rain = this._mk(AMBIENT.rain);
    this.radio = this._mk(RADIO_TRACKS[0].src);
  }

  _mk(src) {
    const a = new Audio();
    a.src = src;
    a.loop = true;
    a.preload = 'auto';
    a.volume = 0;
    return a;
  }

  preload() {
    [this.car, this.city, this.rain, this.radio].forEach((a) => { try { a.load(); } catch (_) {} });
  }

  start() {
    if (this.started) return;
    this.started = true;
    [this.car, this.city, this.rain, this.radio].forEach((a) => { a.play().catch(() => {}); });
    this._apply();
    this._emit();
  }

  // central volume application — every change routes through here
  _apply() {
    const m = this.mix;
    const satie = this.current().id === 'satie' && !this.musicMuted;
    this.car.volume = Math.min(1, (0.3 + 0.85 * this._speed) * m.car); // louder engine + strong rev
    this.car.playbackRate = 0.8 + 0.7 * this._speed; // engine revs with speed
    this.city.volume = satie ? 0 : 0.42 * m.city;       // city drops under Satie
    this.rain.volume = 0.72 * this._rain * m.rain;
    this.radio.muted = this.musicMuted;
    this.radio.volume = this.musicMuted ? 0 : 0.55 * m.music;
  }

  setSpeed(v) { this._speed = v; if (this.started) this._apply(); }
  setRain(v) { this._rain = v; if (this.started) this._apply(); }

  setMix(channel, value) {
    if (!(channel in this.mix)) return;
    this.mix[channel] = value;
    this._apply();
    this._emit();
  }

  nextRadio(dir = 1) {
    this.radioIndex = (this.radioIndex + dir + RADIO_TRACKS.length) % RADIO_TRACKS.length;
    this.radio.src = RADIO_TRACKS[this.radioIndex].src;
    this.radio.loop = true;
    try { this.radio.load(); } catch (_) {}
    if (this.started) this.radio.play().catch(() => {});
    this._apply();
    this._emit();
  }

  toggleMusicMute() { this.musicMuted = !this.musicMuted; this._apply(); this._emit(); return this.musicMuted; }

  current() { return RADIO_TRACKS[this.radioIndex]; }

  _emit() {
    if (this.onChange) {
      this.onChange({
        track: this.current(),
        index: this.radioIndex,
        total: RADIO_TRACKS.length,
        musicMuted: this.musicMuted,
        mix: { ...this.mix },
      });
    }
  }

  dispose() {
    [this.car, this.city, this.rain, this.radio].forEach((a) => {
      try { a.pause(); a.removeAttribute('src'); a.load(); } catch (_) {}
    });
  }
}
