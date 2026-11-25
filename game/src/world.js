// GRIM & GRAVY — the kitchen rules, pure logic, no DOM.
// One item in hand at a time. Raw ingredients come from the bins; a station
// preps them (chop / grill / brew); prepped items stack on the plate (two
// make a dish); a full plate that matches a customer's ticket is served.
// The grill is timing: pull in the green window for a perfect sear, wait too
// long and it burns. Customers lose patience and storm out angry.

import {
  BREW_SECONDS, CHOP_SECONDS, GRILL_BURNT, GRILL_GOOD, GRILL_PERFECT,
  GRILL_RATE, INGREDIENT_IDS, LAYOUT, MAX_HEARTS, MONSTERS, PATIENCE_SECONDS,
  RECIPES, SCORE, SHIFT_SECONDS, SPAWN_END, SPAWN_START,
} from './config.js';
import { makeRng, pick } from './random.js';

export const EVENT = {
  PICKUP: 'pickup', CHOP: 'chop', CHOP_DONE: 'chopDone', GRILL: 'grill',
  GRILL_DONE: 'grillDone', BREW: 'brew', BREW_DONE: 'brewDone', PLATE: 'plate',
  SERVE: 'serve', COIN: 'coin', WRONG: 'wrong', ANGRY: 'angry', BURNT: 'burnt',
  TRASH: 'trash', TICK: 'tick', OVER: 'over',
};

/** A carried or stationed item: { ing, method, quality }. */
function rawItem(ing) {
  return { ing, method: null, quality: 'raw' };
}

export class World {
  constructor(seed = 1) {
    this.rng = makeRng(seed);
    this.reset();
  }

  reset() {
    this.timeLeft = SHIFT_SECONDS;
    this.score = 0;
    this.coins = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.served = 0;
    this.servedPerfect = 0;
    this.lost = 0;
    this.hearts = MAX_HEARTS;
    this.over = false;
    this.overReason = null;
    this.held = null;
    this.chop = { item: null, t: 0, done: false };
    this.grill = { item: null, doneness: 0 };
    this.cauldron = { item: null, t: 0, done: false };
    this.plate = [];
    this.customers = [null, null, null, null];
    this.spawnTimer = 1.5;
    this.events = [];
    this.popups = [];
    this.servedAnim = [];
    this.shakeSlot = -1;
    this.shakeT = 0;
    this.elapsed = 0;
    this.tickPlayed = false;
  }

  // ---------------------------------------------------------- helpers

  event(name) {
    this.events.push(name);
  }

  takeEvents() {
    const out = this.events;
    this.events = [];
    return out;
  }

  popup(x, y, text, color = '#fef3c7') {
    this.popups.push({ x, y, text, color, t: 0, life: 1.1 });
  }

  spawnInterval() {
    const done = 1 - this.timeLeft / SHIFT_SECONDS;
    return SPAWN_START + (SPAWN_END - SPAWN_START) * done;
  }

  spawnCustomer() {
    const free = this.customers.findIndex((c) => c === null);
    if (free < 0) return false;
    const monster = pick(this.rng, MONSTERS);
    const recipe = pick(this.rng, RECIPES);
    this.customers[free] = {
      monster, recipe,
      patience: PATIENCE_SECONDS,
      max: PATIENCE_SECONDS,
      state: 'waiting',
      anim: 0,
    };
    return true;
  }

  plateMatches(recipe) {
    if (this.plate.length !== recipe.needs.length) return false;
    const have = this.plate.map((p) => `${p.ing}:${p.method}`).sort().join('|');
    const want = recipe.needs.map((n) => `${n.ing}:${n.method}`).sort().join('|');
    return have === want;
  }

  plateReady() {
    return this.plate.length === 2;
  }

  // ---------------------------------------------------------- actions (shared by input + autopilot)

  pickIngredient(id) {
    if (this.over || this.held !== null || !INGREDIENT_IDS.includes(id)) return false;
    this.held = rawItem(id);
    this.event(EVENT.PICKUP);
    return true;
  }

  clickChop() {
    if (this.over) return false;
    const box = LAYOUT.chop;
    if (this.chop.item === null) {
      if (this.held === null || this.held.method !== null) return false;
      this.chop.item = this.held;
      this.chop.t = 0;
      this.chop.done = false;
      this.held = null;
      this.event(EVENT.CHOP);
      return true;
    }
    if (this.chop.done && this.held === null) {
      this.held = this.chop.item;
      this.chop.item = null;
      this.chop.t = 0;
      this.chop.done = false;
      this.event(EVENT.PICKUP);
      return true;
    }
    return false;
  }

  clickGrill() {
    if (this.over) return false;
    if (this.grill.item === null) {
      if (this.held === null || this.held.method !== null) return false;
      this.grill.item = this.held;
      this.grill.doneness = 0;
      this.held = null;
      this.event(EVENT.GRILL);
      return true;
    }
    if (this.held === null) {
      const d = this.grill.doneness;
      const item = this.grill.item;
      this.grill.item = null;
      this.grill.doneness = 0;
      if (d >= GRILL_BURNT) {
        item.method = 'grill';
        item.quality = 'burnt';
        this.held = item;
        this.popup(LAYOUT.grill.x + 84, LAYOUT.grill.y - 6, 'BURNT!', '#f87171');
        this.event(EVENT.BURNT);
      } else if (d < GRILL_GOOD[0]) {
        item.method = 'grill';
        item.quality = 'raw';
        this.held = item;
        this.popup(LAYOUT.grill.x + 84, LAYOUT.grill.y - 6, 'Still raw!', '#fbbf24');
        this.event(EVENT.PICKUP);
      } else {
        item.method = 'grill';
        item.quality = d >= GRILL_PERFECT[0] && d <= GRILL_PERFECT[1] ? 'perfect' : 'good';
        this.held = item;
        this.event(EVENT.GRILL_DONE);
      }
      return true;
    }
    return false;
  }

  clickCauldron() {
    if (this.over) return false;
    if (this.cauldron.item === null) {
      if (this.held === null || this.held.method !== null) return false;
      this.cauldron.item = this.held;
      this.cauldron.t = 0;
      this.cauldron.done = false;
      this.held = null;
      this.event(EVENT.BREW);
      return true;
    }
    if (this.cauldron.done && this.held === null) {
      this.held = this.cauldron.item;
      this.cauldron.item = null;
      this.cauldron.t = 0;
      this.cauldron.done = false;
      this.event(EVENT.PICKUP);
      return true;
    }
    return false;
  }

  clickPlate() {
    if (this.over) return false;
    const box = LAYOUT.plate;
    if (this.held !== null) {
      if (this.held.method === null) {
        this.popup(box.x + box.w / 2, box.y - 6, 'Prep it first!', '#fbbf24');
        this.event(EVENT.WRONG);
        return false;
      }
      if (this.held.quality === 'burnt' || this.held.quality === 'raw') {
        this.popup(box.x + box.w / 2, box.y - 6, 'Not servable!', '#f87171');
        this.event(EVENT.WRONG);
        return false;
      }
      if (this.plate.length >= 2) return false;
      this.plate.push(this.held);
      this.held = null;
      this.event(EVENT.PLATE);
      return true;
    }
    if (this.plate.length > 0) {
      this.held = this.plate.pop();
      this.event(EVENT.PICKUP);
      return true;
    }
    return false;
  }

  clickTrash() {
    if (this.over) return false;
    if (this.held !== null) {
      this.held = null;
      this.event(EVENT.TRASH);
      return true;
    }
    if (this.plate.length > 0) {
      this.plate = [];
      this.event(EVENT.TRASH);
      return true;
    }
    return false;
  }

  clickCustomer(slot) {
    if (this.over) return false;
    const c = this.customers[slot];
    if (c === null || c.state !== 'waiting') return false;
    if (!this.plateReady()) {
      this.shakeSlot = slot;
      this.shakeT = 0.4;
      this.popup(LAYOUT.customers[slot].x + 75, LAYOUT.customers[slot].y - 64, 'Plate not ready', '#fbbf24');
      return false;
    }
    if (!this.plateMatches(c.recipe)) {
      this.shakeSlot = slot;
      this.shakeT = 0.4;
      this.popup(LAYOUT.customers[slot].x + 75, LAYOUT.customers[slot].y - 64, 'Wrong order!', '#f87171');
      this.event(EVENT.WRONG);
      return false;
    }
    const patienceFrac = Math.max(0, c.patience / c.max);
    const perfect = this.plate.some((p) => p.quality === 'perfect');
    const gained = SCORE.base + Math.round(patienceFrac * SCORE.patienceBonus)
      + (perfect ? SCORE.perfectBonus : 0) + this.combo * SCORE.comboPer;
    const tip = c.monster.tip + (patienceFrac > 0.5 ? 20 : 0);
    this.score += gained;
    this.coins += c.recipe.price + tip;
    this.combo += 1;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    this.served += 1;
    if (perfect) this.servedPerfect += 1;
    const cx = LAYOUT.customers[slot].x + 75;
    this.popup(cx, LAYOUT.customers[slot].y - 64, `+${gained}`, '#7ee787');
    this.popup(cx, LAYOUT.customers[slot].y - 40, `+${c.recipe.price + tip} coins`, '#fbbf24');
    this.plate = [];
    c.state = 'served';
    c.anim = 0.9;
    this.servedAnim.push({ slot, t: 0 });
    this.event(EVENT.SERVE);
    this.event(EVENT.COIN);
    return true;
  }

  /** Click at canvas coordinates: bins, stations, plate, trash, customers. */
  clickAt(x, y) {
    if (this.over) return false;
    const inBox = (b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
    for (const bin of LAYOUT.bins) {
      if (inBox(bin)) return this.pickIngredient(bin.id);
    }
    if (inBox(LAYOUT.chop)) return this.clickChop();
    if (inBox(LAYOUT.grill)) return this.clickGrill();
    if (inBox(LAYOUT.cauldron)) return this.clickCauldron();
    if (inBox(LAYOUT.plate)) return this.clickPlate();
    if (inBox(LAYOUT.trash)) return this.clickTrash();
    for (let i = 0; i < LAYOUT.customers.length; i += 1) {
      const c = LAYOUT.customers[i];
      const ticket = { x: c.x - 8, y: c.y - 66, w: 166, h: 60 };
      if (inBox(c) || inBox(ticket)) return this.clickCustomer(i);
    }
    return false;
  }

  // ---------------------------------------------------------- simulation

  step(dt) {
    if (this.over) {
      for (const p of this.popups) p.t += dt;
      this.popups = this.popups.filter((p) => p.t < p.life);
      return;
    }
    this.elapsed += dt;
    this.timeLeft -= dt;
    if (this.timeLeft <= 10 && !this.tickPlayed) {
      this.tickPlayed = true;
      this.event(EVENT.TICK);
    }
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.over = true;
      this.overReason = 'time';
      this.event(EVENT.OVER);
      return;
    }

    // Stations.
    if (this.chop.item !== null && !this.chop.done) {
      this.chop.t += dt;
      if (this.chop.t >= CHOP_SECONDS) {
        this.chop.done = true;
        this.chop.item.method = 'chop';
        this.chop.item.quality = 'good';
        this.event(EVENT.CHOP_DONE);
      }
    }
    if (this.grill.item !== null) {
      this.grill.doneness = Math.min(1.2, this.grill.doneness + GRILL_RATE * dt);
      if (this.grill.doneness >= GRILL_BURNT && this.grill.item.quality !== 'burnt') {
        this.grill.item.quality = 'burnt';
        this.event(EVENT.BURNT);
      }
    }
    if (this.cauldron.item !== null && !this.cauldron.done) {
      this.cauldron.t += dt;
      if (this.cauldron.t >= BREW_SECONDS) {
        this.cauldron.done = true;
        this.cauldron.item.method = 'brew';
        this.cauldron.item.quality = 'good';
        this.event(EVENT.BREW_DONE);
      }
    }

    // Customers: patience, leaving, spawning.
    for (let i = 0; i < this.customers.length; i += 1) {
      const c = this.customers[i];
      if (c === null) continue;
      if (c.state === 'served' || c.state === 'leaving') {
        c.anim -= dt;
        if (c.anim <= 0) this.customers[i] = null;
        continue;
      }
      c.patience -= dt;
      if (c.patience <= 0) {
        c.state = 'leaving';
        c.anim = 0.7;
        this.lost += 1;
        this.hearts -= 1;
        this.combo = 0;
        this.popup(LAYOUT.customers[i].x + 75, LAYOUT.customers[i].y - 64, 'Walked out!', '#f87171');
        this.event(EVENT.ANGRY);
        if (this.hearts <= 0) {
          this.over = true;
          this.overReason = 'hearts';
          this.event(EVENT.OVER);
        }
      }
    }

    if (!this.over) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        if (this.spawnCustomer()) this.spawnTimer = this.spawnInterval();
        else this.spawnTimer = 2;
      }
    }

    if (this.shakeT > 0) this.shakeT -= dt;
    for (const p of this.popups) p.t += dt;
    this.popups = this.popups.filter((p) => p.t < p.life);
    for (const a of this.servedAnim) a.t += dt;
    this.servedAnim = this.servedAnim.filter((a) => a.t < 0.9);
  }
}
