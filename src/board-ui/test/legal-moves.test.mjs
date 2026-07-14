import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

import { isLegalDrop, isLegalMove } from '../legal-moves.mjs';

const require = createRequire(import.meta.url);
const { Shogi, Color } = require('shogi.js');

function position(sfen) {
  const shogi = new Shogi();
  shogi.initializeFromSFENString(sfen);
  return shogi;
}

test('王手を遮っている駒を横へ動かせない', () => {
  const shogi = position('4r3k/9/9/9/9/9/9/4G4/4K4 b - 1');

  assert.equal(isLegalMove(shogi, Shogi, 5, 8, 4, 8, false, Color.Black), false);
  assert.equal(isLegalMove(shogi, Shogi, 5, 8, 5, 7, false, Color.Black), true);
});

test('王手中の持ち駒は、王手を解消するマスにだけ打てる', () => {
  const shogi = position('4r3k/9/9/9/9/9/9/9/4K4 b G 1');

  assert.equal(isLegalDrop(shogi, Shogi, 4, 8, 'KI', Color.Black), false);
  assert.equal(isLegalDrop(shogi, Shogi, 5, 8, 'KI', Color.Black), true);
});

test('判定しても元の盤面は変更されない', () => {
  const shogi = position('4r3k/9/9/9/9/9/9/4G4/4K4 b - 1');
  const before = shogi.toSFENString(1);

  isLegalMove(shogi, Shogi, 5, 8, 5, 7, false, Color.Black);

  assert.equal(shogi.toSFENString(1), before);
});
