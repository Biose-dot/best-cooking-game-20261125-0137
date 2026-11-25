// GRIM & GRAVY — boot, fixed-timestep loop and the screen state machine.
// Screens: title -> play <-> paused -> over (shift report). With
// ?shot=title|play|serve|end the game stages one deterministic scene
// instead, for screenshots.

import { VIEW } from './config.js';
import { World, EVENT } from './world.js';
import { Input } from './input.js';
import { SoundBank } from './audio.js';
import { drawOver, drawPaused, drawTitle, drawWorld } from './render.js';
import { shotWorld, stageShot } from './shots.js';

const STEP = 1 / 60;
const BEST_KEY = 'grim-and-gravy-best';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW.width;
canvas.height = VIEW.height;

const input = new Input(canvas);
const sounds = new SoundBank();

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
/** In shot mode the render clock is frozen, so re-screens are identical. */
const shotMode = shotName !== null;

let screen = 'title';
let world = shotMode ? shotWorld() : new World((Date.now() % 2147483647) || 1);
let best = 0;
try {
  best = Number(window.localStorage.getItem(BEST_KEY) ?? 0) || 0;
} catch {
  best = 0;
}

if (shotMode) {
  const staged = stageShot(shotName, world);
  screen = staged.screen;
  if (screen === 'over') best = Math.max(best, world.score);
}

function saveBest() {
  try {
    window.localStorage.setItem(BEST_KEY, String(best));
  } catch {
    // Storage unavailable (private mode, file://): the score just is not kept.
  }
}

function startGame() {
  sounds.unlock();
  world = new World((Date.now() % 2147483647) || 1);
  screen = 'play';
}

function restart() {
  sounds.unlock();
  world = new World((Date.now() % 2147483647) || 1);
  screen = 'play';
}

function playSoundEvents(events) {
  for (const event of events) {
    sounds.play(event);
  }
}

input.onKey = (key) => {
  if (shotMode) return;
  const k = key.toLowerCase();
  if (screen === 'title' && (key === 'Enter' || key === ' ')) startGame();
  else if (screen === 'play' && (k === 'p' || key === 'Escape')) screen = 'paused';
  else if (screen === 'paused' && (k === 'p' || key === 'Escape')) screen = 'play';
  else if (screen === 'over' && k === 'r') restart();
  else if (screen === 'play') {
    const ing = input.ingredientKey(key);
    if (ing !== null) {
      sounds.unlock();
      world.pickIngredient(ing);
      playSoundEvents(world.takeEvents());
    } else if (k === 't') {
      world.clickTrash();
      playSoundEvents(world.takeEvents());
    }
  }
  if (k === 'm') sounds.muted = !sounds.muted;
};

input.onClick = (x, y) => {
  if (shotMode) return;
  sounds.unlock();
  if (screen === 'title') {
    startGame();
    return;
  }
  if (screen === 'play') {
    world.clickAt(x, y);
    playSoundEvents(world.takeEvents());
  }
};

let last = performance.now();
let accumulator = 0;

function frame(now) {
  requestAnimationFrame(frame);
  const elapsed = Math.min(0.25, (now - last) / 1000);
  last = now;
  const renderNow = shotMode ? 1.0 : now / 1000;

  if (!shotMode && screen === 'play') {
    accumulator += elapsed;
    while (accumulator >= STEP) {
      accumulator -= STEP;
      input.takeClicks();
      input.takePressed();
      world.step(STEP);
      playSoundEvents(world.takeEvents());
      if (world.over) {
        best = Math.max(best, world.score);
        saveBest();
        screen = 'over';
      }
    }
  } else {
    input.takeClicks();
    input.takePressed();
  }

  if (screen === 'title') drawTitle(ctx, world, best, renderNow);
  else if (screen === 'play' || screen === 'paused') {
    drawWorld(ctx, world, renderNow);
    if (screen === 'paused') drawPaused(ctx);
  } else if (screen === 'over') drawOver(ctx, world, best, renderNow);
}

requestAnimationFrame(frame);
