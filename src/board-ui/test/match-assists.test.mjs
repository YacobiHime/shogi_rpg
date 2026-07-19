import assert from 'node:assert/strict';
import test from 'node:test';

import { formatHintMove, getHintMove, getHintMoves, TurnHistory } from '../match-assists.mjs';

const START_SFEN = 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1';

test('上位3候補を順位順にヒントとして取得する', () => {
  const moves = getHintMoves({
    move: '7g7f',
    candidates: [
      { rank: 2, move: '7g7f' },
      { rank: 3, move: '2g2f' },
      { rank: 1, move: '3i4h' },
      { rank: 4, move: '9g9f' },
    ],
  });

  assert.deepEqual(moves, [
    { rank: 1, move: '3i4h' },
    { rank: 2, move: '7g7f' },
    { rank: 3, move: '2g2f' },
  ]);
  assert.equal(formatHintMove(moves[0].move, START_SFEN), '4八銀');
  assert.equal(formatHintMove(
    '5c5b', '4k4/9/4S4/9/9/9/9/9/4K4 b - 1'
  ), '5二銀');
  assert.equal(formatHintMove('P*5e', START_SFEN), '5五歩打');
  assert.equal(formatHintMove('8h2b+', START_SFEN), '2二角成');
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
