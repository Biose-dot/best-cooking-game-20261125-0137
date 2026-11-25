// Mouse + keyboard input for the canvas. Clicks are reported in canvas
// coordinates (the canvas is fixed 1280x480, CSS scales it); keys are
// reported as `key` strings. The game reads them once per frame.

import { INGREDIENT_IDS, VIEW } from './config.js';

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.clicks = [];
    this.pressed = [];
    this.onKey = null;
    this.onClick = null;

    canvas.addEventListener('pointerdown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * VIEW.width;
      const y = ((e.clientY - rect.top) / rect.height) * VIEW.height;
      this.clicks.push({ x, y });
      if (this.onClick) this.onClick(x, y);
    });
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      const k = e.key;
      if (k === ' ' || k.startsWith('Arrow')) e.preventDefault();
      this.pressed.push(k);
      if (this.onKey) this.onKey(k);
    });
  }

  takeClicks() {
    const out = this.clicks;
    this.clicks = [];
    return out;
  }

  takePressed() {
    const out = this.pressed;
    this.pressed = [];
    return out;
  }

  /** Number-key ingredient shortcuts (1-6). */
  ingredientKey(key) {
    const n = Number(key);
    if (Number.isInteger(n) && n >= 1 && n <= INGREDIENT_IDS.length) return INGREDIENT_IDS[n - 1];
    return null;
  }
}
