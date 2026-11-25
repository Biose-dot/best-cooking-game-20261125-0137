// GRIM & GRAVY — all drawing, canvas 2D, no images, no fonts loaded.
// Warm tavern palette, wooden counter, glowing cauldron, fire on the grill.
// `t` is the render clock; in shot mode main.js freezes it so frames repeat.

import {
  GRILL_BURNT, GRILL_GOOD, GRILL_PERFECT, HUD_H, INGREDIENTS, INGREDIENT_IDS, LAYOUT,
  METHODS, MONSTERS, RECIPES, STAR_THRESHOLDS, VIEW,
} from './config.js';

const CREAM = '#fef3c7';
const GOLD = '#fbbf24';
const WOOD = '#6b4226';
const WOOD_DARK = '#4a2c17';
const WOOD_LIGHT = '#8b5a2b';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, align = 'center', font = 'Verdana, sans-serif', weight = 'bold') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

/** Small method badge: knife / flame / potion. */
export function methodIcon(ctx, method, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  const col = METHODS[method].color;
  ctx.fillStyle = col;
  ctx.strokeStyle = col;
  ctx.lineWidth = Math.max(2, s * 0.12);
  if (method === 'chop') {
    ctx.beginPath();
    ctx.moveTo(-s * 0.4, s * 0.35);
    ctx.lineTo(s * 0.35, -s * 0.4);
    ctx.lineTo(s * 0.5, -s * 0.25);
    ctx.lineTo(-s * 0.25, s * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.3, -s * 0.45);
    ctx.lineTo(s * 0.5, -s * 0.25);
    ctx.stroke();
  } else if (method === 'grill') {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.5);
    ctx.quadraticCurveTo(s * 0.45, -s * 0.05, s * 0.3, s * 0.3);
    ctx.quadraticCurveTo(s * 0.1, s * 0.5, -s * 0.15, s * 0.42);
    ctx.quadraticCurveTo(-s * 0.45, s * 0.25, -s * 0.3, -s * 0.15);
    ctx.quadraticCurveTo(-s * 0.2, -s * 0.35, 0, -s * 0.5);
    ctx.fill();
  } else {
    // Potion flask.
    ctx.fillRect(-s * 0.08, -s * 0.5, s * 0.16, s * 0.3);
    ctx.beginPath();
    ctx.arc(0, s * 0.12, s * 0.34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-s * 0.1, s * 0.05, s * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** The six ingredients, drawn as little icons. */
export function ingredientIcon(ctx, ing, x, y, s, t = 0) {
  const def = INGREDIENTS[ing];
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = def.color;
  ctx.strokeStyle = def.dark;
  ctx.lineWidth = Math.max(1.5, s * 0.06);
  if (ing === 'mushroom') {
    ctx.fillStyle = '#f5f0e1';
    ctx.fillRect(-s * 0.14, -s * 0.05, s * 0.28, s * 0.5);
    ctx.fillStyle = def.color;
    ctx.beginPath();
    ctx.arc(0, -s * 0.05, s * 0.48, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-s * 0.2, -s * 0.3, s * 0.09, 0, Math.PI * 2);
    ctx.arc(s * 0.18, -s * 0.22, s * 0.07, 0, Math.PI * 2);
    ctx.fill();
  } else if (ing === 'pepper') {
    ctx.beginPath();
    ctx.moveTo(-s * 0.42, -s * 0.3);
    ctx.quadraticCurveTo(0, -s * 0.62, s * 0.42, -s * 0.28);
    ctx.quadraticCurveTo(s * 0.3, s * 0.42, -s * 0.05, s * 0.45);
    ctx.quadraticCurveTo(-s * 0.42, s * 0.3, -s * 0.42, -s * 0.3);
    ctx.fill();
    ctx.strokeStyle = '#2f9e44';
    ctx.lineWidth = s * 0.09;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.5);
    ctx.quadraticCurveTo(s * 0.1, -s * 0.65, s * 0.25, -s * 0.6);
    ctx.stroke();
  } else if (ing === 'slime') {
    const wob = Math.sin(t * 3 + x) * s * 0.04;
    ctx.beginPath();
    ctx.moveTo(-s * 0.45, s * 0.35);
    ctx.quadraticCurveTo(-s * 0.5, -s * 0.2 + wob, -s * 0.2, -s * 0.35);
    ctx.quadraticCurveTo(0, -s * 0.55 + wob, s * 0.2, -s * 0.35);
    ctx.quadraticCurveTo(s * 0.5, -s * 0.2 - wob, s * 0.45, s * 0.35);
    ctx.quadraticCurveTo(0, s * 0.5, -s * 0.45, s * 0.35);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-s * 0.14, -s * 0.05, s * 0.09, 0, Math.PI * 2);
    ctx.arc(s * 0.14, -s * 0.05, s * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.arc(-s * 0.14, -s * 0.05, s * 0.045, 0, Math.PI * 2);
    ctx.arc(s * 0.14, -s * 0.05, s * 0.045, 0, Math.PI * 2);
    ctx.fill();
  } else if (ing === 'bone') {
    ctx.rotate(-0.6);
    ctx.fillStyle = def.color;
    rr(ctx, -s * 0.4, -s * 0.1, s * 0.8, s * 0.2, s * 0.1);
    ctx.fill();
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(sx * s * 0.42, -s * 0.1, s * 0.14, 0, Math.PI * 2);
      ctx.arc(sx * s * 0.42, s * 0.1, s * 0.14, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (ing === 'moonberry') {
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f3e8ff';
    ctx.beginPath();
    ctx.arc(-s * 0.18, -s * 0.15, s * 0.12, 0, Math.PI * 2);
    ctx.arc(s * 0.16, s * 0.05, s * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2f9e44';
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.42);
    ctx.quadraticCurveTo(s * 0.2, -s * 0.6, s * 0.32, -s * 0.48);
    ctx.quadraticCurveTo(s * 0.12, -s * 0.38, 0, -s * 0.42);
    ctx.fill();
  } else if (ing === 'batwing') {
    ctx.beginPath();
    ctx.moveTo(0, s * 0.3);
    ctx.quadraticCurveTo(-s * 0.15, -s * 0.3, -s * 0.5, -s * 0.45);
    ctx.quadraticCurveTo(-s * 0.35, -s * 0.1, -s * 0.42, s * 0.05);
    ctx.quadraticCurveTo(-s * 0.2, s * 0.05, -s * 0.12, s * 0.3);
    ctx.quadraticCurveTo(0, s * 0.42, 0, s * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, s * 0.3);
    ctx.quadraticCurveTo(s * 0.15, -s * 0.3, s * 0.5, -s * 0.45);
    ctx.quadraticCurveTo(s * 0.35, -s * 0.1, s * 0.42, s * 0.05);
    ctx.quadraticCurveTo(s * 0.2, s * 0.05, s * 0.12, s * 0.3);
    ctx.quadraticCurveTo(0, s * 0.42, 0, s * 0.3);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** One monster regular, drawn big and cute. mood: 'happy' | 'worried' | 'angry' | 'joy'. */
function monsterFace(ctx, monster, x, y, r, mood, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = monster.color;
  ctx.strokeStyle = monster.dark;
  ctx.lineWidth = 3;
  if (monster.id === 'goblin') {
    ctx.beginPath();
    ctx.moveTo(-r * 0.8, -r * 0.3);
    ctx.lineTo(-r * 1.5, -r * 0.9);
    ctx.lineTo(-r * 0.6, -r * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.8, -r * 0.3);
    ctx.lineTo(r * 1.5, -r * 0.9);
    ctx.lineTo(r * 0.6, -r * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (monster.id === 'slime') {
    const wob = Math.sin(t * 2.4) * r * 0.05;
    ctx.beginPath();
    ctx.moveTo(-r, r * 0.7);
    ctx.quadraticCurveTo(-r * 1.05, -r * 0.5 + wob, -r * 0.4, -r * 0.8);
    ctx.quadraticCurveTo(0, -r * 1.1 + wob, r * 0.4, -r * 0.8);
    ctx.quadraticCurveTo(r * 1.05, -r * 0.5 - wob, r, r * 0.7);
    ctx.quadraticCurveTo(0, r * 0.95, -r, r * 0.7);
    ctx.fill();
    ctx.stroke();
  } else if (monster.id === 'bat') {
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, -r * 0.4);
    ctx.lineTo(-r * 0.9, -r * 1.2);
    ctx.lineTo(-r * 0.3, -r * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.7, -r * 0.4);
    ctx.lineTo(r * 0.9, -r * 1.2);
    ctx.lineTo(r * 0.3, -r * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    // Golem: square-ish rock head.
    rr(ctx, -r, -r * 0.9, r * 2, r * 1.9, r * 0.35);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = monster.dark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, -r * 0.9);
    ctx.lineTo(-r * 0.3, -r * 0.4);
    ctx.lineTo(-r * 0.55, 0);
    ctx.stroke();
  }
  // Eyes.
  ctx.fillStyle = '#1c1917';
  const ey = -r * 0.15;
  const ex = r * 0.38;
  const eyeR = r * 0.13;
  if (mood === 'angry') {
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-ex - eyeR, ey - eyeR - 4);
    ctx.lineTo(-ex + eyeR, ey + eyeR - 2);
    ctx.moveTo(ex + eyeR, ey - eyeR - 4);
    ctx.lineTo(ex - eyeR, ey + eyeR - 2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(-ex, ey, eyeR, 0, Math.PI * 2);
  ctx.arc(ex, ey, eyeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-ex + 2, ey - 2, eyeR * 0.35, 0, Math.PI * 2);
  ctx.arc(ex + 2, ey - 2, eyeR * 0.35, 0, Math.PI * 2);
  ctx.fill();
  // Mouth.
  ctx.strokeStyle = '#1c1917';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (mood === 'joy' || mood === 'happy') {
    ctx.arc(0, r * 0.28, r * 0.42, 0.15 * Math.PI, 0.85 * Math.PI);
  } else if (mood === 'worried') {
    ctx.arc(0, r * 0.75, r * 0.35, 1.15 * Math.PI, 1.85 * Math.PI);
  } else if (mood === 'angry') {
    ctx.moveTo(-r * 0.4, r * 0.55);
    ctx.lineTo(r * 0.4, r * 0.55);
  } else {
    ctx.moveTo(-r * 0.3, r * 0.5);
    ctx.quadraticCurveTo(0, r * 0.62, r * 0.3, r * 0.5);
  }
  ctx.stroke();
  if (monster.id === 'bat') {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(-r * 0.25, r * 0.45);
    ctx.lineTo(-r * 0.12, r * 0.45);
    ctx.lineTo(-r * 0.18, r * 0.68);
    ctx.closePath();
    ctx.moveTo(r * 0.25, r * 0.45);
    ctx.lineTo(r * 0.12, r * 0.45);
    ctx.lineTo(r * 0.18, r * 0.68);
    ctx.closePath();
    ctx.fill();
  }
  if (mood === 'worried') {
    ctx.fillStyle = '#7dd3fc';
    ctx.beginPath();
    ctx.arc(r * 0.95, -r * 0.7, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawBackground(ctx, t) {
  // Wall + floor.
  const wall = ctx.createLinearGradient(0, 0, 0, 340);
  wall.addColorStop(0, '#3a2415');
  wall.addColorStop(1, '#2a1a10');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, VIEW.width, 340);
  ctx.fillStyle = '#1d130b';
  ctx.fillRect(0, 340, VIEW.width, 140);
  // Wall planks.
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  for (let y = 30; y < 340; y += 34) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(VIEW.width, y);
    ctx.stroke();
  }
  // Hanging lanterns.
  for (const lx of [70, 640, 1210]) {
    const flick = 0.85 + Math.sin(t * 2 + lx) * 0.08;
    ctx.fillStyle = `rgba(251,191,36,${0.12 * flick})`;
    ctx.beginPath();
    ctx.arc(lx, 52, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#78350f';
    ctx.fillRect(lx - 2, 0, 4, 26);
    ctx.fillStyle = '#fbbf24';
    rr(ctx, lx - 14, 26, 28, 34, 6);
    ctx.fill();
    ctx.fillStyle = '#fde68a';
    rr(ctx, lx - 9, 32, 18, 22, 4);
    ctx.fill();
  }
  // Tavern sign.
  ctx.fillStyle = WOOD_DARK;
  rr(ctx, 470, 6, 340, 30, 8);
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  rr(ctx, 470, 6, 340, 30, 8);
  ctx.stroke();
  text(ctx, 'GRIM & GRAVY  ·  MONSTER TAVERN', 640, 22, 13, GOLD, 'center', 'Georgia, serif');
}

function drawHud(ctx, world) {
  ctx.fillStyle = '#241610';
  ctx.fillRect(0, 0, VIEW.width, HUD_H);
  ctx.fillStyle = GOLD;
  ctx.fillRect(0, HUD_H - 3, VIEW.width, 3);

  text(ctx, `SCORE ${world.score}`, 16, 23, 17, CREAM, 'left');
  text(ctx, `COINS ${world.coins}`, 190, 23, 17, GOLD, 'left');

  const mins = Math.floor(Math.max(0, world.timeLeft) / 60);
  const secs = Math.floor(Math.max(0, world.timeLeft) % 60);
  const timeText = `${mins}:${String(secs).padStart(2, '0')}`;
  const timeCol = world.timeLeft <= 30 ? '#f87171' : CREAM;
  text(ctx, `⏱ ${timeText}`, 640, 24, 24, timeCol, 'center', 'Georgia, serif');

  if (world.combo >= 2) {
    text(ctx, `🔥 COMBO x${world.combo}`, 880, 23, 16, '#fb923c', 'center');
  }
  for (let i = 0; i < 3; i += 1) {
    const hx = 1150 + i * 34;
    ctx.fillStyle = i < world.hearts ? '#f87171' : '#44403c';
    ctx.beginPath();
    ctx.arc(hx - 5, 19, 8, 0, Math.PI * 2);
    ctx.arc(hx + 5, 19, 8, 0, Math.PI * 2);
    ctx.moveTo(hx - 12, 21);
    ctx.lineTo(hx, 36);
    ctx.lineTo(hx + 12, 21);
    ctx.closePath();
    ctx.fill();
  }
  text(ctx, 'SHIFT', 1060, 23, 13, '#a8a29e', 'right');
}

function drawTicket(ctx, c, slot, t) {
  const box = LAYOUT.customers[slot];
  const tx = box.x - 8;
  const ty = box.y - 66;
  ctx.save();
  // Parchment ticket.
  ctx.fillStyle = '#fde68a';
  rr(ctx, tx, ty, 166, 60, 8);
  ctx.fill();
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 2;
  rr(ctx, tx, ty, 166, 60, 8);
  ctx.stroke();
  text(ctx, c.recipe.name.toUpperCase(), tx + 83, ty + 12, 11, '#78350f', 'center', 'Verdana, sans-serif');
  // Two needed items with their method badges.
  c.recipe.needs.forEach((need, i) => {
    const ix = tx + 34 + i * 76;
    ingredientIcon(ctx, need.ing, ix, ty + 32, 15, t);
    methodIcon(ctx, need.method, ix + 22, ty + 42, 9);
  });
  // Patience bar.
  const frac = Math.max(0, c.patience / c.max);
  ctx.fillStyle = '#d6d3d1';
  rr(ctx, tx + 10, ty + 50, 146, 6, 3);
  ctx.fill();
  ctx.fillStyle = frac > 0.5 ? '#22c55e' : frac > 0.25 ? '#f59e0b' : '#ef4444';
  rr(ctx, tx + 10, ty + 50, 146 * frac, 6, 3);
  ctx.fill();
  ctx.restore();
}

function drawCustomers(ctx, world, t) {
  // Order board strip behind the tickets.
  ctx.fillStyle = WOOD;
  rr(ctx, 8, 48, 1264, 88, 10);
  ctx.fill();
  ctx.strokeStyle = WOOD_DARK;
  ctx.lineWidth = 2;
  rr(ctx, 8, 48, 1264, 88, 10);
  ctx.stroke();
  text(ctx, 'O R D E R   B O A R D', 640, 56, 9, '#d6a05a', 'center', 'Georgia, serif');

  // The counter top.
  ctx.fillStyle = WOOD_LIGHT;
  rr(ctx, 8, 132, 1264, 16, 6);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(8, 144, 1264, 4);

  for (let i = 0; i < 4; i += 1) {
    const c = world.customers[i];
    const box = LAYOUT.customers[i];
    const cx = box.x + 75;
    const cy = box.y + 4;
    // Stool.
    ctx.fillStyle = WOOD_DARK;
    ctx.fillRect(cx - 26, cy + 26, 52, 6);
    ctx.fillRect(cx - 3, cy + 8, 6, 20);
    if (c === null) {
      // Empty stool: a faint "next customer..." hint.
      ctx.fillStyle = 'rgba(254,243,199,0.35)';
      ctx.font = 'italic 11px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('next customer…', cx, cy - 8);
      continue;
    }
    const frac = c.patience / c.max;
    let mood = 'happy';
    if (c.state === 'leaving') mood = 'angry';
    else if (c.state === 'served') mood = 'joy';
    else if (frac < 0.35) mood = 'worried';
    const bob = c.state === 'served' ? -Math.sin(Math.min(1, c.anim) * Math.PI) * 8 : Math.sin(t * 2 + i * 2) * 1.5;
    const shakeX = world.shakeSlot === i && world.shakeT > 0 ? Math.sin(t * 40) * 4 : 0;    const alpha = c.state === 'waiting' ? 1 : Math.min(1, c.anim / 0.4);
    ctx.save();
    ctx.globalAlpha = alpha;
    monsterFace(ctx, c.monster, cx + shakeX, cy + bob, 30, mood, t);
    ctx.restore();
    if (c.state === 'waiting') drawTicket(ctx, c, i, t);
    if (c.state === 'served') {
      text(ctx, 'SERVED!', cx, cy - 42, 15, '#7ee787', 'center', 'Georgia, serif');
    }
    if (c.state === 'leaving') {
      text(ctx, 'WALKED OUT!', cx, cy - 42, 13, '#f87171', 'center', 'Georgia, serif');
    }
  }
}

function drawBins(ctx, world, t) {
  text(ctx, 'I N G R E D I E N T S', 152, 176, 10, '#d6a05a', 'center', 'Georgia, serif');
  for (const bin of LAYOUT.bins) {
    const def = INGREDIENTS[bin.id];
    const heldHere = world.held !== null && world.held.ing === bin.id;
    ctx.fillStyle = heldHere ? '#7c5a36' : WOOD;
    rr(ctx, bin.x, bin.y, bin.w, bin.h, 8);
    ctx.fill();
    ctx.strokeStyle = heldHere ? GOLD : WOOD_DARK;
    ctx.lineWidth = heldHere ? 3 : 2;
    rr(ctx, bin.x, bin.y, bin.w, bin.h, 8);
    ctx.stroke();
    ingredientIcon(ctx, bin.id, bin.x + bin.w / 2, bin.y + 26, 22, t);
    text(ctx, def.name, bin.x + bin.w / 2, bin.y + 54, 10, CREAM, 'center', 'Verdana, sans-serif');
    // Key hint.
    ctx.fillStyle = '#1c1008';
    ctx.beginPath();
    ctx.arc(bin.x + 12, bin.y + 12, 8, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, def.key, bin.x + 12, bin.y + 12, 10, GOLD, 'center', 'Verdana, sans-serif');
  }
}

function stationFrame(ctx, box, label, active) {
  ctx.fillStyle = active ? '#7c5a36' : '#3f2a18';
  rr(ctx, box.x, box.y, box.w, box.h, 10);
  ctx.fill();
  ctx.strokeStyle = active ? GOLD : WOOD_DARK;
  ctx.lineWidth = active ? 3 : 2;
  rr(ctx, box.x, box.y, box.w, box.h, 10);
  ctx.stroke();
  text(ctx, label, box.x + box.w / 2, box.y + 14, 11, '#d6a05a', 'center', 'Georgia, serif');
}

function drawChop(ctx, world, t) {
  const box = LAYOUT.chop;
  stationFrame(ctx, box, 'CHOPPING BOARD', world.chop.item !== null);
  // Board.
  ctx.fillStyle = '#d9a066';
  rr(ctx, box.x + 18, box.y + 34, box.w - 36, 74, 8);
  ctx.fill();
  ctx.strokeStyle = '#8a5a2e';
  ctx.lineWidth = 2;
  rr(ctx, box.x + 18, box.y + 34, box.w - 36, 74, 8);
  ctx.stroke();
  if (world.chop.item !== null) {
    const cx = box.x + box.w / 2;
    const cy = box.y + 70;
    ingredientIcon(ctx, world.chop.item.ing, cx, cy, 26, t);
    if (!world.chop.done) {
      // Knife chopping.
      const kx = cx + 34 + Math.sin(t * 14) * 6;
      ctx.strokeStyle = '#e7e5e4';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(kx - 12, cy - 26);
      ctx.lineTo(kx + 12, cy - 8);
      ctx.stroke();
      const frac = world.chop.t / 1.1;
      ctx.fillStyle = '#44403c';
      rr(ctx, box.x + 24, box.y + 118, box.w - 48, 8, 4);
      ctx.fill();
      ctx.fillStyle = GOLD;
      rr(ctx, box.x + 24, box.y + 118, (box.w - 48) * Math.min(1, frac), 8, 4);
      ctx.fill();
    } else {
      text(ctx, '✓ CHOPPED — click to take', box.x + box.w / 2, box.y + 122, 11, '#7ee787');
    }
  } else {
    text(ctx, 'click a raw item,', box.x + box.w / 2, box.y + 62, 11, '#5b3a1e');
    text(ctx, 'then click here', box.x + box.w / 2, box.y + 80, 11, '#5b3a1e');
  }
}

function drawGrill(ctx, world, t) {
  const box = LAYOUT.grill;
  const cooking = world.grill.item !== null;
  stationFrame(ctx, box, 'GRILL', cooking);
  // Fire under the grate.
  const flame = cooking ? 1 : 0.35;
  for (let i = 0; i < 5; i += 1) {
    const fx = box.x + 30 + i * 27;
    const fh = (16 + Math.sin(t * 7 + i * 1.7) * 6) * flame + 6;
    ctx.fillStyle = i % 2 ? '#f97316' : '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(fx - 10, box.y + 108);
    ctx.quadraticCurveTo(fx - 6, box.y + 108 - fh, fx, box.y + 96 - fh);
    ctx.quadraticCurveTo(fx + 6, box.y + 108 - fh, fx + 10, box.y + 108);
    ctx.closePath();
    ctx.fill();
  }
  // Grate.
  ctx.fillStyle = '#292524';
  rr(ctx, box.x + 14, box.y + 84, box.w - 28, 26, 6);
  ctx.fill();
  ctx.strokeStyle = '#57534e';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(box.x + 24 + i * 36, box.y + 88);
    ctx.lineTo(box.x + 24 + i * 36, box.y + 106);
    ctx.stroke();
  }
  if (cooking) {
    const item = world.grill.item;
    ingredientIcon(ctx, item.ing, box.x + box.w / 2, box.y + 62, 24, t);
    if (item.quality === 'burnt') {
      text(ctx, '☠ BURNT', box.x + box.w / 2, box.y + 122, 12, '#f87171');
    } else {
      // Doneness meter with the green perfect window.
      const mx = box.x + 20;
      const mw = box.w - 40;
      const my = box.y + 118;
      ctx.fillStyle = '#44403c';
      rr(ctx, mx, my, mw, 9, 4);
      ctx.fill();
      const px = mx + mw * GRILL_PERFECT[0];
      const pw = mw * (GRILL_PERFECT[1] - GRILL_PERFECT[0]);
      ctx.fillStyle = '#22c55e';
      rr(ctx, px, my, pw, 9, 4);
      ctx.fill();
      const d = Math.min(1, world.grill.doneness);
      ctx.fillStyle = d >= GRILL_BURNT ? '#ef4444' : '#fef3c7';
      ctx.fillRect(mx + mw * d - 2, my - 3, 4, 15);
      text(ctx, 'click to pull!', box.x + box.w / 2, box.y + 136, 10, '#a8a29e');
    }
  } else {
    text(ctx, 'timed sear:', box.x + box.w / 2, box.y + 62, 11, '#a8a29e');
    text(ctx, 'pull in the green!', box.x + box.w / 2, box.y + 80, 11, '#a8a29e');
  }
}

function drawCauldron(ctx, world, t) {
  const box = LAYOUT.cauldron;
  const brewing = world.cauldron.item !== null;
  stationFrame(ctx, box, 'CAULDRON', brewing);
  // Pot.
  ctx.fillStyle = '#1f2937';
  ctx.beginPath();
  ctx.moveTo(box.x + 26, box.y + 46);
  ctx.quadraticCurveTo(box.x + 20, box.y + 104, box.x + 52, box.y + 108);
  ctx.lineTo(box.x + box.w - 52, box.y + 108);
  ctx.quadraticCurveTo(box.x + box.w - 20, box.y + 104, box.x + box.w - 26, box.y + 46);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#4b5563';
  ctx.lineWidth = 3;
  ctx.stroke();
  // Brew surface.
  const brewCol = brewing ? '#4ade80' : '#14532d';
  ctx.fillStyle = brewCol;
  ctx.beginPath();
  ctx.ellipse(box.x + box.w / 2, box.y + 48, (box.w - 52) / 2, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  if (brewing) {
    for (let i = 0; i < 4; i += 1) {
      const bx = box.x + 48 + ((i * 23 + Math.floor(t * 20) * 3) % 72);
      const by = box.y + 46 - ((t * 26 + i * 17) % 26);
      ctx.fillStyle = 'rgba(187,247,208,0.8)';
      ctx.beginPath();
      ctx.arc(bx, by, 3 + (i % 2), 0, Math.PI * 2);
      ctx.fill();
    }
    if (world.cauldron.item) {
      ingredientIcon(ctx, world.cauldron.item.ing, box.x + box.w / 2, box.y + 46, 16, t);
    }
    if (!world.cauldron.done) {
      const frac = world.cauldron.t / 2.6;
      ctx.fillStyle = '#44403c';
      rr(ctx, box.x + 24, box.y + 118, box.w - 48, 8, 4);
      ctx.fill();
      ctx.fillStyle = '#4ade80';
      rr(ctx, box.x + 24, box.y + 118, (box.w - 48) * Math.min(1, frac), 8, 4);
      ctx.fill();
    } else {
      text(ctx, '✓ BREWED — click to take', box.x + box.w / 2, box.y + 122, 11, '#7ee787');
    }
  } else {
    text(ctx, 'slow magic for', box.x + box.w / 2, box.y + 66, 11, '#a8a29e');
    text(ctx, 'soups & stews', box.x + box.w / 2, box.y + 84, 11, '#a8a29e');
  }
}

function drawPlate(ctx, world, t) {
  const box = LAYOUT.plate;
  const ready = world.plateReady();
  stationFrame(ctx, box, 'PLATE', ready);
  // The plate itself.
  const cx = box.x + box.w / 2;
  const cy = box.y + 78;
  ctx.fillStyle = ready ? '#fef3c7' : '#e7e5e4';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 84, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ready ? GOLD : '#a8a29e';
  ctx.lineWidth = ready ? 4 : 2;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 84, 34, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, cy, 62, 22, 0, 0, Math.PI * 2);
  ctx.stroke();
  world.plate.forEach((item, i) => {
    const ix = cx + (i === 0 ? -34 : 34);
    ingredientIcon(ctx, item.ing, ix, cy - 4, 24, t);
    methodIcon(ctx, item.method, ix + 20, cy + 12, 10);
    if (item.quality === 'perfect') {
      text(ctx, '★', ix - 22, cy - 16, 14, GOLD);
    }
  });
  if (world.plate.length === 0) {
    text(ctx, 'build the dish here', cx, cy - 2, 11, '#78716c');
  }
  if (ready) {
    ctx.fillStyle = GOLD;
    rr(ctx, cx - 72, box.y + 116, 144, 20, 10);
    ctx.fill();
    text(ctx, 'READY TO SERVE!', cx, box.y + 127, 11, '#1c1008');
  } else {
    text(ctx, `${world.plate.length}/2 items`, cx, box.y + 126, 11, '#a8a29e');
  }
}

function drawTrash(ctx, world) {
  const box = LAYOUT.trash;
  stationFrame(ctx, box, 'TRASH', false);
  ctx.fillStyle = '#57534e';
  rr(ctx, box.x + 16, box.y + 44, box.w - 32, 66, 6);
  ctx.fill();
  ctx.fillStyle = '#44403c';
  rr(ctx, box.x + 10, box.y + 36, box.w - 20, 12, 6);
  ctx.fill();
  ctx.fillStyle = '#a8a29e';
  ctx.font = 'bold 26px Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✕', box.x + box.w / 2, box.y + 82);
  text(ctx, 'dump hand', box.x + box.w / 2, box.y + 122, 10, '#a8a29e');
  text(ctx, 'or plate', box.x + box.w / 2, box.y + 136, 10, '#a8a29e');
}

function drawRecipes(ctx, world) {
  text(ctx, 'R E C I P E   B O O K', 470, 356, 10, '#d6a05a', 'center', 'Georgia, serif');
  for (const card of LAYOUT.recipes) {
    const recipe = RECIPES.find((r) => r.id === card.id);
    const wanted = world.customers.some((c) => c !== null && c.state === 'waiting' && c.recipe.id === recipe.id);
    ctx.fillStyle = wanted ? '#4a2c17' : '#332416';
    rr(ctx, card.x, card.y, card.w, card.h, 8);
    ctx.fill();
    ctx.strokeStyle = wanted ? GOLD : WOOD_DARK;
    ctx.lineWidth = wanted ? 2.5 : 1.5;
    rr(ctx, card.x, card.y, card.w, card.h, 8);
    ctx.stroke();
    text(ctx, recipe.name, card.x + card.w / 2, card.y + 14, 11, wanted ? GOLD : CREAM, 'center', 'Georgia, serif');
    recipe.needs.forEach((need, i) => {
      const ix = card.x + 44 + i * 82;
      ingredientIcon(ctx, need.ing, ix, card.y + 48, 17, 0);
      methodIcon(ctx, need.method, ix + 24, card.y + 60, 10);
      text(ctx, INGREDIENTS[need.ing].name, ix, card.y + 78, 9, '#d6d3d1', 'center', 'Verdana, sans-serif');
      text(ctx, METHODS[need.method].name, ix, card.y + 92, 9, METHODS[need.method].color, 'center', 'Verdana, sans-serif');
    });
    text(ctx, `${recipe.price} coins`, card.x + card.w / 2, card.y + 110, 10, GOLD);
  }
}

function drawChef(ctx, world, t) {
  const box = LAYOUT.chef;
  ctx.fillStyle = '#332416';
  rr(ctx, box.x, box.y, box.w, box.h, 8);
  ctx.fill();
  ctx.strokeStyle = WOOD_DARK;
  ctx.lineWidth = 1.5;
  rr(ctx, box.x, box.y, box.w, box.h, 8);
  ctx.stroke();
  text(ctx, 'YOUR HAND', box.x + box.w / 2, box.y + 14, 10, '#d6a05a', 'center', 'Georgia, serif');
  // Goblin chef: green head, white chef hat, apron.
  const cx = box.x + 52;
  const cy = box.y + 66;
  ctx.fillStyle = '#fef3c7';
  ctx.beginPath();
  ctx.arc(cx, cy - 26, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#84cc16';
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - 20, cy - 6);
  ctx.lineTo(cx - 38, cy - 18);
  ctx.lineTo(cx - 18, cy - 16);
  ctx.closePath();
  ctx.moveTo(cx + 20, cy - 6);
  ctx.lineTo(cx + 38, cy - 18);
  ctx.lineTo(cx + 18, cy - 16);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.arc(cx - 8, cy - 2, 3.5, 0, Math.PI * 2);
  ctx.arc(cx + 8, cy - 2, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1c1917';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy + 6, 8, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  // Apron body.
  ctx.fillStyle = '#f5f0e1';
  rr(ctx, cx - 18, cy + 20, 36, 26, 6);
  ctx.fill();
  // Held item floats above the chef's raised hand.
  const hx = box.x + 150;
  const hy = box.y + 52;
  if (world.held !== null) {
    const bob = Math.sin(t * 3) * 3;
    ingredientIcon(ctx, world.held.ing, hx, hy + bob, 30, t);
    if (world.held.method !== null) {
      methodIcon(ctx, world.held.method, hx + 26, hy + 22 + bob, 12);
      if (world.held.quality === 'perfect') text(ctx, '★ PERFECT', hx, hy + 44, 11, GOLD);
      else if (world.held.quality === 'burnt') text(ctx, 'BURNT!', hx, hy + 44, 11, '#f87171');
      else if (world.held.quality === 'raw') text(ctx, 'RAW', hx, hy + 44, 11, '#fbbf24');
      else text(ctx, METHODS[world.held.method].name.toUpperCase(), hx, hy + 44, 11, '#7ee787');
    } else {
      text(ctx, 'RAW — pick a station', hx, hy + 44, 10, '#fbbf24');
    }
  } else {
    text(ctx, 'empty hands', hx, hy, 11, '#a8a29e');
    text(ctx, 'click an ingredient', hx, hy + 18, 10, '#78716c');
  }
  text(ctx, '1-6 bins · click stations · click a customer to serve · T trash · P pause · M mute', 640, 474, 10, '#78716c', 'center', 'Verdana, sans-serif');
}

function drawPopups(ctx, world) {
  for (const p of world.popups) {
    const frac = p.t / p.life;
    ctx.save();
    ctx.globalAlpha = 1 - frac;
    text(ctx, p.text, p.x, p.y - frac * 26, 15, p.color, 'center', 'Georgia, serif');
    ctx.restore();
  }
}

export function drawWorld(ctx, world, t) {
  drawBackground(ctx, t);
  drawCustomers(ctx, world, t);
  drawBins(ctx, world, t);
  drawChop(ctx, world, t);
  drawGrill(ctx, world, t);
  drawCauldron(ctx, world, t);
  drawPlate(ctx, world, t);
  drawTrash(ctx, world);
  drawRecipes(ctx, world);
  drawChef(ctx, world, t);
  drawPopups(ctx, world);
  drawHud(ctx, world);
}

export function drawTitle(ctx, world, best, t) {
  drawBackground(ctx, t);
  // A few regulars peek in behind the title panel.
  MONSTERS.forEach((m, i) => {
    monsterFace(ctx, m, 240 + i * 260, 118, 34, 'happy', t + i);
  });
  ctx.fillStyle = 'rgba(20,10,4,0.72)';
  rr(ctx, 240, 170, 800, 240, 16);
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  rr(ctx, 240, 170, 800, 240, 16);
  ctx.stroke();
  text(ctx, 'GRIM & GRAVY', 640, 218, 54, GOLD, 'center', 'Georgia, serif');
  text(ctx, '—  a monster tavern kitchen  —', 640, 258, 17, CREAM, 'center', 'Georgia, serif');
  text(ctx, 'Chop it. Grill it. Brew it. Plate it. Serve it before the monsters lose their temper.', 640, 296, 14, '#d6d3d1');
  text(ctx, 'Click ingredients (1-6), prep them at the stations, build the dish on the plate,', 640, 322, 13, '#a8a29e');
  text(ctx, 'then click a customer to serve. Perfect sears pay extra. Three walk-outs end the shift.', 640, 342, 13, '#a8a29e');
  const blink = Math.sin(t * 3) > -0.2;
  if (blink) text(ctx, 'CLICK OR PRESS ENTER TO START', 640, 384, 16, '#7ee787', 'center', 'Georgia, serif');
  if (best > 0) text(ctx, `Best shift: ${best} points`, 640, 452, 13, GOLD);
  // The pantry, along the bottom.
  INGREDIENT_IDS.forEach((id, i) => {
    ingredientIcon(ctx, id, 470 + i * 56, 440, 15, t);
  });
}

export function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  text(ctx, 'PAUSED', 640, 220, 44, CREAM, 'center', 'Georgia, serif');
  text(ctx, 'P / Esc to keep cooking', 640, 262, 15, '#a8a29e');
}

export function drawOver(ctx, world, best, t) {
  ctx.fillStyle = 'rgba(20,10,4,0.78)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  const stars = STAR_THRESHOLDS.filter((n) => world.served >= n).length;
  const reason = world.overReason === 'hearts'
    ? 'Three monsters stormed out — the tavern empties…'
    : 'The shift bell rings. The tavern closes its doors.';
  text(ctx, 'SHIFT OVER', 640, 96, 44, GOLD, 'center', 'Georgia, serif');
  text(ctx, reason, 640, 132, 15, '#d6d3d1');
  let starText = '';
  for (let i = 0; i < 3; i += 1) starText += i < stars ? '★ ' : '☆ ';
  text(ctx, starText.trim(), 640, 178, 40, GOLD);
  const rows = [
    [`Score`, `${world.score}`],
    [`Best shift`, `${best}`],
    [`Dishes served`, `${world.served}  (${world.servedPerfect} perfect)`],
    [`Coins earned`, `${world.coins}`],
    [`Best combo`, `x${world.bestCombo}`],
    [`Walk-outs`, `${world.lost}`],
  ];
  rows.forEach((row, i) => {
    const y = 222 + i * 30;
    text(ctx, row[0], 470, y, 15, '#a8a29e', 'left');
    text(ctx, row[1], 810, y, 15, CREAM, 'right');
  });
  const blink = Math.sin(t * 3) > -0.2;
  if (blink) text(ctx, 'PRESS R TO COOK ANOTHER SHIFT', 640, 424, 16, '#7ee787', 'center', 'Georgia, serif');
}
