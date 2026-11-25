// Sound, synthesised with the Web Audio API: no audio files, no network.
// Every effect is a short oscillator/noise burst. Muted with M.

export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.sizzleNodes = null;
  }

  unlock() {
    if (this.ctx !== null) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
    } catch {
      this.ctx = null;
    }
  }

  tone(freq, dur, type = 'sine', vol = 0.12, slideTo = null, delay = 0) {
    if (this.ctx === null || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo !== null) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  noise(dur, vol = 0.1, freq = 1200, delay = 0) {
    if (this.ctx === null || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    const gain = this.ctx.createGain();
    gain.gain.value = vol;
    src.connect(filter).connect(gain).connect(this.ctx.destination);
    src.start(t0);
  }

  play(name) {
    if (this.ctx === null || this.muted) return;
    switch (name) {
      case 'pickup': this.tone(520, 0.07, 'triangle', 0.08); break;
      case 'chop': this.noise(0.08, 0.16, 900); this.tone(180, 0.06, 'square', 0.05); break;
      case 'chopDone': this.tone(660, 0.08, 'triangle', 0.09); this.tone(880, 0.1, 'triangle', 0.09, null, 0.07); break;
      case 'grill': this.noise(0.25, 0.1, 2400); break;
      case 'grillDone': this.tone(740, 0.09, 'triangle', 0.09); this.tone(988, 0.12, 'triangle', 0.09, null, 0.08); break;
      case 'brew': this.tone(300, 0.25, 'sine', 0.08, 520); break;
      case 'brewDone': this.tone(520, 0.1, 'sine', 0.09, 780); this.tone(1040, 0.14, 'sine', 0.07, null, 0.09); break;
      case 'plate': this.tone(440, 0.08, 'triangle', 0.1); break;
      case 'serve': this.tone(523, 0.1, 'triangle', 0.11); this.tone(659, 0.1, 'triangle', 0.11, null, 0.09); this.tone(784, 0.18, 'triangle', 0.11, null, 0.18); break;
      case 'coin': this.tone(1318, 0.07, 'square', 0.05); this.tone(1760, 0.12, 'square', 0.05, null, 0.06); break;
      case 'wrong': this.tone(220, 0.16, 'sawtooth', 0.07, 160); break;
      case 'angry': this.tone(196, 0.3, 'sawtooth', 0.09, 110); break;
      case 'burnt': this.noise(0.3, 0.12, 500); this.tone(140, 0.25, 'sawtooth', 0.08, 90); break;
      case 'trash': this.noise(0.15, 0.1, 700); break;
      case 'tick': this.tone(880, 0.08, 'square', 0.06); break;
      case 'over': this.tone(392, 0.2, 'triangle', 0.1); this.tone(523, 0.2, 'triangle', 0.1, null, 0.18); this.tone(659, 0.35, 'triangle', 0.1, null, 0.36); break;
      default: break;
    }
  }
}
