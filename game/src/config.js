// GRIM & GRAVY — Monster Tavern Kitchen. Constants, layout and data.
// The canvas is 1280x480 (the bounty screenshots are 1280x480 at most).
// Layout, top to bottom: HUD bar, the counter where monster customers sit
// with their order tickets, the kitchen stations, the recipe book strip.

export const VIEW = { width: 1280, height: 480 };
export const HUD_H = 44;

/** Shift length, seconds. */
export const SHIFT_SECONDS = 150;
/** Hearts: a customer who walks out angry costs one. */
export const MAX_HEARTS = 3;
/** Seconds a customer waits before storming out. */
export const PATIENCE_SECONDS = 42;
/** Seconds between new customers arriving (shrinks as the shift wears on). */
export const SPAWN_START = 13;
export const SPAWN_END = 7;
/** Seconds a chop takes / a brew takes. */
export const CHOP_SECONDS = 1.1;
export const BREW_SECONDS = 2.6;
/** Grill doneness gained per second (1.0 = fully cooked in 4s). */
export const GRILL_RATE = 0.25;
/** Doneness windows: [perfect-lo, perfect-hi] and the burn line. */
export const GRILL_PERFECT = [0.55, 0.8];
export const GRILL_GOOD = [0.35, 0.95];
export const GRILL_BURNT = 0.97;

/** The six ingredients on the counter. Each is prepped by a station. */
export const INGREDIENTS = {
  mushroom: { name: 'Mushroom', color: '#e8b4b8', dark: '#a86a72', key: '1' },
  pepper: { name: 'Ember Pepper', color: '#ff5a3c', dark: '#b32d12', key: '2' },
  slime: { name: 'Slime', color: '#7ee787', dark: '#2f9e44', key: '3' },
  bone: { name: 'Bone', color: '#f5f0e1', dark: '#b8ab8a', key: '4' },
  moonberry: { name: 'Moonberry', color: '#c084fc', dark: '#7e3af2', key: '5' },
  batwing: { name: 'Bat Wing', color: '#8b7fd4', dark: '#4c3d99', key: '6' },
};
export const INGREDIENT_IDS = ['mushroom', 'pepper', 'slime', 'bone', 'moonberry', 'batwing'];

/** Prep methods, one per station. */
export const METHODS = {
  chop: { name: 'Chop', icon: 'knife', color: '#fbbf24' },
  grill: { name: 'Grill', icon: 'flame', color: '#fb923c' },
  brew: { name: 'Brew', icon: 'potion', color: '#7ee787' },
};

/** The five dishes on the tavern menu. Each needs two prepped items. */
export const RECIPES = [
  { id: 'skewer', name: 'Dragonfire Skewer', price: 140, needs: [{ ing: 'pepper', method: 'grill' }, { ing: 'mushroom', method: 'chop' }] },
  { id: 'soup', name: 'Slime Soup', price: 120, needs: [{ ing: 'slime', method: 'brew' }, { ing: 'bone', method: 'chop' }] },
  { id: 'tart', name: 'Moonberry Tart', price: 150, needs: [{ ing: 'moonberry', method: 'chop' }, { ing: 'mushroom', method: 'grill' }] },
  { id: 'stew', name: 'Bat Wing Stew', price: 160, needs: [{ ing: 'batwing', method: 'grill' }, { ing: 'slime', method: 'brew' }] },
  { id: 'broth', name: 'Bone Broth', price: 130, needs: [{ ing: 'bone', method: 'brew' }, { ing: 'pepper', method: 'chop' }] },
];

/** The four regulars who sit at the counter. */
export const MONSTERS = [
  { id: 'goblin', name: 'Gobby', color: '#84cc16', dark: '#3f6212', tip: 10 },
  { id: 'slime', name: 'Blorp', color: '#4ade80', dark: '#166534', tip: 10 },
  { id: 'bat', name: 'Vesper', color: '#a78bfa', dark: '#4c1d95', tip: 20 },
  { id: 'golem', name: 'Boulder', color: '#a8a29e', dark: '#57534e', tip: 30 },
];

/** Fixed layout rectangles (canvas coordinates). */
export const LAYOUT = {
  // Customers sit at the counter; their tickets hang above them.
  customers: [
    { x: 90, y: 132, w: 150, h: 34 },
    { x: 400, y: 132, w: 150, h: 34 },
    { x: 710, y: 132, w: 150, h: 34 },
    { x: 1020, y: 132, w: 150, h: 34 },
  ],
  // Ingredient bins on the counter, 3 x 2.
  bins: INGREDIENT_IDS.map((id, i) => ({
    id,
    x: 16 + (i % 3) * 96,
    y: 186 + Math.floor(i / 3) * 76,
    w: 88,
    h: 68,
  })),
  chop: { x: 312, y: 186, w: 168, h: 144 },
  grill: { x: 496, y: 186, w: 168, h: 144 },
  cauldron: { x: 680, y: 186, w: 168, h: 144 },
  plate: { x: 864, y: 186, w: 216, h: 144 },
  trash: { x: 1096, y: 186, w: 88, h: 144 },
  // Recipe book strip along the bottom.
  recipes: RECIPES.map((r, i) => ({ id: r.id, x: 16 + i * 178, y: 344, w: 170, h: 122 })),
  // The chef stands at the bottom right, holding the held item.
  chef: { x: 1070, y: 344, w: 194, h: 122 },
};

/** Score for a served dish. */
export const SCORE = {
  base: 100,
  patienceBonus: 100,
  perfectBonus: 50,
  comboPer: 15,
};

/** Stars on the shift report, by dishes served. */
export const STAR_THRESHOLDS = [6, 10, 14];
