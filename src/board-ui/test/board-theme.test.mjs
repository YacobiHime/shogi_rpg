import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  BOARD_THEME,
  BOARD_PIECE_POINTS,
  HAND_PIECE_POINTS,
  isPromotedKind,
  summarizeHand,
} from '../board-theme.mjs';

test('盤上駒と持ち駒は将棋駒らしい五角形で描画する', () => {
  assert.equal(BOARD_PIECE_POINTS.trim().split(/\s+/).length, 5);
  assert.equal(HAND_PIECE_POINTS.trim().split(/\s+/).length, 5);
});

test('敵の直前手は移動元と移動先を異なる色で表示する', () => {
  assert.match(BOARD_THEME.lastMoveFrom, /^#[0-9a-f]{6}$/i);
  assert.match(BOARD_THEME.lastMoveTo, /^#[0-9a-f]{6}$/i);
  assert.notEqual(BOARD_THEME.lastMoveFrom, BOARD_THEME.lastMoveTo);
});

test('全81マスに座標付きのクリック領域を用意する', async () => {
  const source = await readFile(new URL('../board.js', import.meta.url), 'utf8');
  assert.match(source, /classList\.add\('board-cell-hitbox'\)/);
  assert.match(source, /dataset\.square = this\._squareName\(x, y\)/);
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
