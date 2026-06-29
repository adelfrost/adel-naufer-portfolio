// JourneyAudio — ambient bed (engine, city, rain) + a switchable radio.
// Every file is fully downloaded into an in-memory Blob before the journey
// starts and played from a blob URL, so nothing ever buffers mid-flight, not
// even when switching stations. Per-frame the engine volume/pitch follows the
// car speed and the rain follows the weather. A 4-channel mixer (music, engine,
// city, rain) sets levels. Music can be muted independently. Special case:
// while Satie plays, the city ambience drops out.

const AMBIENT = {
  car: '/audio/car.mp3',
  city: '/audio/city.mp3',
  rain: '/audio/rain.mp3',
};

export const RADIO_TRACKS = [
  { id: 'cyberpunk', name: 'Neon Drive', src: '/audio/radio/cyberpunk.mp3' },
  { id: 'rock', name: 'Rock Station', src: '/audio/radio/rock.mp3' },
  { id: 'punk', name: 'Punk', src: '/audio/radio/punk.mp3' },
  { id: 'hiphop95', name: "'95 Hip Hop", src: '/audio/radio/hiphop95.mp3' },
  { id: 'satie', name: 'Satie, Gymnopedies', src: '/audio/radio/satie.mp3' },
];

const DEFAULT_MIX = { music: 0.8, car: 1, city: 0.7, rain: 0.85 };

export class JourneyAudio {
  constructor(initialMix) {
    this.started = false;
    this.musicMuted = false;
    this.radioIndex = 0;
    this._speed = 0;
    this._rain = 0;
    this._disposed = false;
    this.mix = { ...DEFAULT_MIX, ...(initialMix || {}) };
    this.onChange = null;
    this.blobUrls = {};

    this.car = this._mk();
    this.city = this._mk();
    this.rain = this._mk();
    this.radio = this._mk();
  }

  _mk() {
    const a = new Audio();
    a.loop = true;
    a.preload = 'auto';
    a.volume = 0;
    // Backup loop: some Chromium builds drop the loop attribute on blob URLs,
    // so restart manually if a clip ever ends.
    a.addEventListener('ended', () => {
      if (this._disposed) return;
      try { a.currentTime = 0; a.play().catch(() => {}); } catch (_) {}
    });
    // If a blob ever fails to decode (browser quirk), fall back to streaming the
    // real file url so the sound still plays.
    a.addEventListener('error', () => {
      if (this._disposed || !a._net || a._fellBack || a.src === a._net) return;
      a._fellBack = true;
      a.src = a._net;
      try { a.load(); } catch (_) {}
      if (this.started) a.play().catch(() => {});
    });
    return a;
  }

  // Download EVERY sound fully (ambient + all radio stations) into memory and
  // wire blob URLs into the elements, so playback and station switches never
  // buffer. Resolves once all are downloaded. Reports byte progress (0..1).
  async preloadAll(onProgress) {
    const items = [
      ['car', AMBIENT.car],
      ['city', AMBIENT.city],
      ['rain', AMBIENT.rain],
      ...RADIO_TRACKS.map((t, i) => [`radio${i}`, t.src]),
    ];
    const n = items.length;
    const frac = new Array(n).fill(0);
    const report = () => { if (onProgress) onProgress(Math.min(1, frac.reduce((a, b) => a + b, 0) / n)); };

    await Promise.all(items.map(async ([key, url], i) => {
      try {
        const res = await fetch(url);
        const total = Number(res.headers.get('content-length')) || 0;
        if (!res.body || !total) {
          const blob = await res.blob();
          this.blobUrls[key] = URL.createObjectURL(new Blob([blob], { type: 'audio/mpeg' }));
          frac[i] = 1; report(); return;
        }
        const reader = res.body.getReader();
        const chunks = [];
        let loaded = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          loaded += value.length;
          frac[i] = Math.min(loaded / total, 1);
          report();
        }
        this.blobUrls[key] = URL.createObjectURL(new Blob(chunks, { type: 'audio/mpeg' }));
        frac[i] = 1; report();
      } catch (_) {
        frac[i] = 1; report(); // never block the journey on one failed file
      }
    }));

    // play everything from the in-memory blobs (fall back to the network url)
    this._wire(this.car, this.blobUrls.car, AMBIENT.car);
    this._wire(this.city, this.blobUrls.city, AMBIENT.city);
    this._wire(this.rain, this.blobUrls.rain, AMBIENT.rain);
    this._wire(this.radio, this.blobUrls[`radio${this.radioIndex}`], RADIO_TRACKS[this.radioIndex].src);
    [this.car, this.city, this.rain, this.radio].forEach((a) => { try { a.load(); } catch (_) {} });
  }

  // set the playback src + remember the network url for the error fallback
  _wire(el, blobUrl, net) {
    el._net = net;
    el._fellBack = false;
    el.src = blobUrl || net;
  }

  start() {
    if (this.started) return;
    this.started = true;
    [this.car, this.city, this.rain, this.radio].forEach((a) => { a.play().catch(() => {}); });
    this._apply();
    this._emit();
  }

  _apply() {
    const m = this.mix;
    const satie = this.current().id === 'satie' && !this.musicMuted;
    this.car.volume = Math.min(1, (0.3 + 0.85 * this._speed) * m.car);
    this.car.playbackRate = 0.8 + 0.7 * this._speed;
    this.city.volume = satie ? 0 : 0.42 * m.city;
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
    this._wire(this.radio, this.blobUrls[`radio${this.radioIndex}`], RADIO_TRACKS[this.radioIndex].src);
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
    this._disposed = true;
    [this.car, this.city, this.rain, this.radio].forEach((a) => {
      try { a.pause(); a.removeAttribute('src'); a.load(); } catch (_) {}
    });
    Object.values(this.blobUrls).forEach((u) => { try { URL.revokeObjectURL(u); } catch (_) {} });
    this.blobUrls = {};
  }
}
