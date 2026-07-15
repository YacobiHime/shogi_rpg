import assert from 'node:assert/strict';
import test from 'node:test';

import { formatHintMove, getHintMove, TurnHistory } from '../match-assists.mjs';

test('最善候補をヒントとして表示用に整形する', () => {
  const move = getHintMove({
    move: '7g7f',
    candidates: [
      { rank: 1, move: '2g2f' },
      { rank: 2, move: '7g7f' },
    ],
  });

  assert.equal(move, '2g2f');
  assert.equal(formatHintMove(move), '2g → 2f');
  assert.equal(formatHintMove('P*5e'), 'Pを5eへ打つ');
  assert.equal(formatHintMove('8h2b+'), '8h → 2b（成）');
});

test('MultiPVがない場合はbestmoveをヒントにする', () => {
  assert.equal(getHintMove({ move: '7g7f', candidates: [] }), '7g7f');
  assert.throws(() => getHintMove({ candidates: [] }), /取得できません/);
});

test('待ったで直前のプレイヤー手番へ戻る', () => {
  const initial = { sfen: 'initial b - 1', moveHistoryLength: 0, repetitionLength: 1 };
  const history = new TurnHistory(initial);
  history.record({ sfen: 'turn2 b - 3', moveHistoryLength: 2, repetitionLength: 3 });
  history.record({ sfen: 'turn3 b - 5', moveHistoryLength: 4, repetitionLength: 5 });

  assert.equal(history.canUndo(), true);
  assert.deepEqual(history.undo(), {
    sfen: 'turn2 b - 3', moveHistoryLength: 2, repetitionLength: 3,
  });
  assert.deepEqual(history.undo(), initial);
  assert.equal(history.canUndo(), false);
  assert.equal(history.undo(), null);
});

test('待った用局面の不正な履歴長を拒否する', () => {
  assert.throws(() => new TurnHistory({
    sfen: 'initial b - 1', moveHistoryLength: -1, repetitionLength: 1,
  }), /局面履歴/);
  assert.throws(() => new TurnHistory({
    sfen: 'initial b - 1', moveHistoryLength: 0, repetitionLength: 0,
  }), /局面履歴/);
});
