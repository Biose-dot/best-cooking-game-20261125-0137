// Screenshot scenes behind ?shot=title|play|serve|end. Each one plays the
// real rules forward from a fresh world (seed 7) with a scripted autopilot,
// so every frame is what a short game really looks like and the same seed
// always gives the same frame. The autopilot serves one full dish, then
// keeps a second dish mid-assembly when the scene freezes.

import { GRILL_PERFECT, LAYOUT, RECIPES } from './config.js';
import { World } from './world.js';

const STEP = 1 / 60;
const SEED = 7;

/** The recipe the autopilot cooks, and the customer waiting for it. */
function findCustomerFor(world, recipeId) {
  for (let i = 0; i < world.customers.length; i += 1) {
    const c = world.customers[i];
    if (c !== null && c.state === 'waiting' && c.recipe.id === recipeId) return i;
  }
  return -1;
}

/**
 * One scripted dish: pick each needed ingredient, prep it at its station,
 * plate it, and serve the matching customer. Returns true when served.
 * With `stopWhenPlated`, it freezes the moment the plate is full and a
 * customer wants it (the "ready to serve" frame) instead of serving.
 * Runs the world forward in fixed steps; each action waits for its station.
 */
function cookDish(world, recipe, maxSeconds, stopWhenPlated = false) {
  const limit = Math.floor(maxSeconds / STEP);
  let slot = -1;
  for (let step = 0; step < limit; step += 1) {
    if (world.over) return false;
    // Serve as soon as the plate is full and a customer wants it.
    if (world.plateReady()) {
      slot = findCustomerFor(world, recipe.id);
      if (slot >= 0) {
        if (stopWhenPlated) return true;
        world.clickCustomer(slot);
        return true;
      }
      // No customer wants it yet: wait for one to arrive.
      world.step(STEP);
      continue;
    }
    // What is still missing from the plate?
    const have = world.plate.map((p) => `${p.ing}:${p.method}`);
    const need = recipe.needs.find((n) => !have.includes(`${n.ing}:${n.method}`));
    if (need === undefined) {
      world.step(STEP);
      continue;
    }
    if (world.held === null) {
      const onChop = world.chop.done && world.chop.item !== null;
      const onGrill = world.grill.item !== null && world.grill.doneness >= GRILL_PERFECT[0];
      const onPot = world.cauldron.done && world.cauldron.item !== null;
      if (onChop && world.chop.item.ing === need.ing && need.method === 'chop') world.clickChop();
      else if (onGrill && world.grill.item.ing === need.ing && need.method === 'grill') world.clickGrill();
      else if (onPot && world.cauldron.item.ing === need.ing && need.method === 'brew') world.clickCauldron();
      else if (world.chop.item === null && world.grill.item === null && world.cauldron.item === null) {
        world.pickIngredient(need.ing);
      }
    } else if (world.held.method === null) {
      if (need.method === 'chop' && world.chop.item === null) world.clickChop();
      else if (need.method === 'grill' && world.grill.item === null) world.clickGrill();
      else if (need.method === 'brew' && world.cauldron.item === null) world.clickCauldron();
    } else if (world.held.ing === need.ing && world.held.method === need.method) {
      world.clickPlate();
    } else {
      // Holding the wrong thing (should not happen): trash it.
      world.clickTrash();
    }
    world.step(STEP);
  }
  return false;
}

/** Step the world forward `seconds`, doing nothing. */
function idle(world, seconds) {
  for (let i = 0; i < seconds / STEP; i += 1) {
    if (world.over) break;
    world.step(STEP);
  }
}

/** Let customers arrive until at least `n` are waiting. */
function waitForCustomers(world, n, maxSeconds = 30) {
  for (let i = 0; i < maxSeconds / STEP; i += 1) {
    const waiting = world.customers.filter((c) => c !== null && c.state === 'waiting').length;
    if (waiting >= n) return;
    if (world.over) return;
    world.step(STEP);
  }
}

/**
 * Stage the named scene and return the screen to draw over it.
 * title: a busy tavern behind the title card. play: mid-shift, one dish
 * mid-assembly. serve: a plate full and ready to serve. end: a full shift.
 */
export function stageShot(name, world) {
  world.reset();
  if (name === 'title') {
    waitForCustomers(world, 3);
    idle(world, 2);
    return { screen: 'title' };
  }
  if (name === 'serve') {
    waitForCustomers(world, 2);
    const recipe = world.customers.find((c) => c !== null).recipe;
    // Freeze with the plate full and the dish ready to serve.
    cookDish(world, recipe, 60, true);
    return { screen: 'play' };
  }
  if (name === 'end') {
    // Play dish after dish until the shift bell rings.
    for (let dish = 0; dish < 20; dish += 1) {
      if (world.over) break;
      waitForCustomers(world, 1, 20);
      const waiting = world.customers.find((c) => c !== null && c.state === 'waiting');
      if (waiting === null) break;
      cookDish(world, waiting.recipe, 45);
      idle(world, 1);
    }
    while (!world.over) world.step(STEP);
    return { screen: 'over' };
  }
  // play (default): cook one dish, then freeze mid-assembly of the next.
  waitForCustomers(world, 3);
  const first = world.customers.find((c) => c !== null).recipe;
  cookDish(world, first, 60);
  // Second dish: get the first ingredient plated and the second on the grill.
  const second = world.customers.find((c) => c !== null && c.state === 'waiting');
  if (second !== null) {
    const recipe = second.recipe;
    const firstNeed = recipe.needs[0];
    // Plate the first need (chop or brew: quick), then start the second on the grill.
    if (firstNeed.method === 'chop') {
      world.pickIngredient(firstNeed.ing);
      world.clickChop();
      idle(world, 1.4);
      world.clickChop();
      world.clickPlate();
    } else if (firstNeed.method === 'brew') {
      world.pickIngredient(firstNeed.ing);
      world.clickCauldron();
      idle(world, 3.0);
      world.clickCauldron();
      world.clickPlate();
    } else {
      world.pickIngredient(firstNeed.ing);
      world.clickGrill();
      idle(world, 2.6);
      world.clickGrill();
      world.clickPlate();
    }
    const secondNeed = recipe.needs[1];
    if (secondNeed.method === 'grill') {
      world.pickIngredient(secondNeed.ing);
      world.clickGrill();
      idle(world, 1.6);
    } else if (secondNeed.method === 'chop') {
      world.pickIngredient(secondNeed.ing);
      world.clickChop();
      idle(world, 0.6);
    } else {
      world.pickIngredient(secondNeed.ing);
      world.clickCauldron();
      idle(world, 1.2);
    }
  }
  return { screen: 'play' };
}

export function shotWorld() {
  return new World(SEED);
}
