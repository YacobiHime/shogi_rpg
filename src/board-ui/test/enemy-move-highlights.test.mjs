import assert from 'node:assert/strict';
import test from 'node:test';
import { parseUsiMove } from '../board.js';

test('敵の通常着手と成りから移動元・移動先を取得する', () => {
  assert.deepEqual(parseUsiMove('3c3d'), {
    from: { x: 3, y: 3 },
    to: { x: 3, y: 4 },
    kind: null,
    promote: false,
  });
  assert.deepEqual(parseUsiMove('8h2b+'), {
    from: { x: 8, y: 8 },
    to: { x: 2, y: 2 },
    kind: null,
    promote: true,
  });
});

test('敵の駒打ちは移動先だけを取得する', () => {
  assert.deepEqual(parseUsiMove('P*5e'), {
    from: null,
    to: { x: 5, y: 5 },
    kind: 'FU',
    promote: false,
  });
});

test('不正なUSI指し手を拒否する', () => {
  assert.throws(() => parseUsiMove('bestmove'), /不正なUSI指し手/);
});
