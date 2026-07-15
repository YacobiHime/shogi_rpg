import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BOARD_PIECE_POINTS,
  HAND_PIECE_POINTS,
  isPromotedKind,
  summarizeHand,
} from '../board-theme.mjs';

test('盤上駒と持ち駒は将棋駒らしい五角形で描画する', () => {
  assert.equal(BOARD_PIECE_POINTS.trim().split(/\s+/).length, 5);
  assert.equal(HAND_PIECE_POINTS.trim().split(/\s+/).length, 5);
});

test('成駒だけを朱文字表示の対象にする', () => {
  for (const kind of ['TO', 'NY', 'NK', 'NG', 'UM', 'RY']) {
    assert.equal(isPromotedKind(kind), true);
  }
  for (const kind of ['FU', 'KY', 'KE', 'GI', 'KI', 'KA', 'HI', 'OU']) {
    assert.equal(isPromotedKind(kind), false);
  }
});

test('持ち駒を駒種別に集約して価値順に並べる', () => {
  const hand = [
    { kind: 'FU' }, { kind: 'KA' }, { kind: 'FU' }, { kind: 'GI' },
  ];
  assert.deepEqual(summarizeHand(hand), [
    { kind: 'KA', count: 1 },
    { kind: 'GI', count: 1 },
    { kind: 'FU', count: 2 },
  ]);
});
