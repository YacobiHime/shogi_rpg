import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

import { getLegalDestinations } from '../selection-highlights.mjs';

const require = createRequire(import.meta.url);
const { Shogi, Color } = require('shogi.js');

function position(sfen) {
  const shogi = new Shogi();
  shogi.initializeFromSFENString(sfen);
  return shogi;
}

function includes(destinations, x, y) {
  return destinations.some((destination) => destination.x === x && destination.y === y);
}

test('盤上の選択駒について自玉を王手にさらさない移動先だけを返す', () => {
  const shogi = position('4r3k/9/9/9/9/9/9/4G4/4K4 b - 1');
  const destinations = getLegalDestinations(
    shogi, Shogi, { x: 5, y: 8 }, Color.Black
  );

  assert.equal(includes(destinations, 5, 7), true);
  assert.equal(includes(destinations, 4, 8), false);
});

test('選択した持ち駒について王手を解消できる打ち場所だけを返す', () => {
  const shogi = position('4r3k/9/9/9/9/9/9/9/4K4 b G 1');
  const destinations = getLegalDestinations(
    shogi, Shogi, { hand: { color: Color.Black, kind: 'KI' } }, Color.Black
  );

  assert.equal(includes(destinations, 5, 8), true);
  assert.equal(includes(destinations, 4, 8), false);
});

test('未選択時は移動先を返さない', () => {
  const shogi = position('4k4/9/9/9/9/9/9/9/4K4 b - 1');
  assert.deepEqual(getLegalDestinations(shogi, Shogi, null, Color.Black), []);
});
