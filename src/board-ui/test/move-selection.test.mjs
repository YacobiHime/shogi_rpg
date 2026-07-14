import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateEffectiveMoveRank,
  selectMoveByRank,
} from '../move-selection.mjs';

const searchResult = {
  move: '7g7f',
  candidates: [
    { rank: 1, move: '7g7f' },
    { rank: 2, move: '2g2f' },
    { rank: 3, move: '6g6f' },
  ],
};

test('難易度補正を手の最大ランクへ加算する', () => {
  assert.deepEqual(calculateEffectiveMoveRank({ min: 1, max: 1 }, 2), {
    min: 1,
    max: 3,
  });
});

test('注入した乱数に応じて候補範囲から指し手を選ぶ', () => {
  assert.deepEqual(selectMoveByRank(searchResult, { min: 1, max: 3 }, () => 0), {
    move: '7g7f', rank: 1,
  });
  assert.deepEqual(selectMoveByRank(searchResult, { min: 1, max: 3 }, () => 0.5), {
    move: '2g2f', rank: 2,
  });
  assert.deepEqual(selectMoveByRank(searchResult, { min: 1, max: 3 }, () => 0.999), {
    move: '6g6f', rank: 3,
  });
});

test('最小ランクを指定すると、それより強い手を選ばない', () => {
  assert.deepEqual(selectMoveByRank(searchResult, { min: 2, max: 3 }, () => 0), {
    move: '2g2f', rank: 2,
  });
});

test('候補数が指定範囲に足りない場合は利用可能な範囲へ縮める', () => {
  const result = { move: '7g7f', candidates: [{ rank: 1, move: '7g7f' }] };
  assert.deepEqual(selectMoveByRank(result, { min: 2, max: 3 }, () => 0.5), {
    move: '7g7f', rank: 1,
  });
});

test('info候補がなくてもbestmoveへフォールバックする', () => {
  assert.deepEqual(selectMoveByRank({ move: 'resign' }, { min: 1, max: 3 }, () => 0), {
    move: 'resign', rank: 1,
  });
});

test('不正なランク範囲・補正・乱数を拒否する', () => {
  assert.throws(() => calculateEffectiveMoveRank({ min: 0, max: 1 }, 0), /moveRank/);
  assert.throws(() => calculateEffectiveMoveRank({ min: 1, max: 1 }, -1), /maxBonus/);
  assert.throws(() => selectMoveByRank(searchResult, { min: 1, max: 3 }, () => 1), /random/);
});
