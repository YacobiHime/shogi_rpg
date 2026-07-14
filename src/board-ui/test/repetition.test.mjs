import assert from 'node:assert/strict';
import test from 'node:test';

import { positionKeyFromSfen, RepetitionTracker } from '../repetition.mjs';

const BLACK = 0;
const WHITE = 1;
const POSITION_A = '4k4/9/9/9/9/9/9/9/4K4 b -';
const POSITION_B = '4k4/9/9/9/9/9/9/4K4/9 w -';

function sfen(position, moveCount) {
  return `${position} ${moveCount}`;
}

function playCycle(tracker, blackChecks = false) {
  tracker.record(sfen(POSITION_B, 2), BLACK, blackChecks);
  return tracker.record(sfen(POSITION_A, 3), WHITE, false);
}

test('局面キーは手数だけを除き、手番と持ち駒を保持する', () => {
  assert.equal(
    positionKeyFromSfen('4k4/9/9/9/9/9/9/9/4K4 b P 42'),
    '4k4/9/9/9/9/9/9/9/4K4 b P'
  );
  assert.notEqual(
    positionKeyFromSfen('4k4/9/9/9/9/9/9/9/4K4 b - 1'),
    positionKeyFromSfen('4k4/9/9/9/9/9/9/9/4K4 w - 1')
  );
});

test('同一局面の4回目で通常の千日手と判定する', () => {
  const tracker = new RepetitionTracker(sfen(POSITION_A, 1));

  assert.equal(playCycle(tracker), null);
  assert.equal(playCycle(tracker), null);
  assert.deepEqual(playCycle(tracker), { type: 'draw' });
});

test('連続王手による千日手は王手を続けた側の反則負けと判定する', () => {
  const tracker = new RepetitionTracker(sfen(POSITION_A, 1));

  playCycle(tracker, true);
  playCycle(tracker, true);
  assert.deepEqual(playCycle(tracker, true), {
    type: 'perpetual-check',
    loserColor: BLACK,
  });
});

test('後手が連続王手を続けた場合も後手の反則負けと判定する', () => {
  const tracker = new RepetitionTracker(sfen(POSITION_A, 1));
  let result = null;

  for (let i = 0; i < 3; i++) {
    tracker.record(sfen(POSITION_B, 2), BLACK, false);
    result = tracker.record(sfen(POSITION_A, 3), WHITE, true);
  }

  assert.deepEqual(result, {
    type: 'perpetual-check',
    loserColor: WHITE,
  });
});

test('途中に王手でない着手があれば連続王手にしない', () => {
  const tracker = new RepetitionTracker(sfen(POSITION_A, 1));

  playCycle(tracker, true);
  playCycle(tracker, false);
  assert.deepEqual(playCycle(tracker, true), { type: 'draw' });
});
