import assert from 'node:assert/strict';
import test from 'node:test';

import { ShogiEngine } from '../../engine/engine.js';

function initializedEngine(commands) {
  const engine = new ShogiEngine({ factory: async () => {} });
  engine.instance = {
    postMessage(command) {
      commands.push(command);
    },
  };
  return engine;
}

test('ノード数だけをUSIのgoコマンドへ渡す', async () => {
  const commands = [];
  const engine = initializedEngine(commands);
  const resultPromise = engine.go({ nodes: 10000, maxTimeMs: 100 });

  assert.deepEqual(commands, ['go nodes 10000']);
  engine._emit('bestmove 7g7f');

  assert.deepEqual(await resultPromise, {
    move: '7g7f',
    ponder: undefined,
    candidates: [{ rank: 1, move: '7g7f' }],
  });
  await new Promise((resolve) => setTimeout(resolve, 120));
  assert.deepEqual(commands, ['go nodes 10000']);
});

test('最大思考時間を超えた場合だけstopを送る', async () => {
  const commands = [];
  const engine = initializedEngine(commands);
  const resultPromise = engine.go({ nodes: 10000, maxTimeMs: 10 });

  await new Promise((resolve) => setTimeout(resolve, 30));
  assert.deepEqual(commands, ['go nodes 10000', 'stop']);

  engine._emit('bestmove 3c3d');
  assert.equal((await resultPromise).move, '3c3d');
});

test('MultiPVの各順位について最後に受信した候補手を返す', async () => {
  const commands = [];
  const engine = initializedEngine(commands);
  engine.applyStrengthOptions({ multiPv: 3 });
  const resultPromise = engine.go({ nodes: 5000 });

  engine._emit('info depth 1 multipv 1 score cp 10 pv 7g7f 3c3d');
  engine._emit('info depth 1 multipv 2 score cp 5 pv 2g2f 8c8d');
  engine._emit('info depth 2 multipv 1 score cp 20 pv 7g7f 3c3d');
  engine._emit('info depth 2 multipv 3 score cp 0 pv 6g6f 8c8d');
  engine._emit('bestmove 7g7f ponder 3c3d');

  assert.deepEqual(commands, [
    'setoption name MultiPV value 3',
    'go nodes 5000',
  ]);
  assert.deepEqual(await resultPromise, {
    move: '7g7f',
    ponder: '3c3d',
    candidates: [
      { rank: 1, move: '7g7f' },
      { rank: 2, move: '2g2f' },
      { rank: 3, move: '6g6f' },
    ],
  });
});

test('MultiPVへ1未満または整数でない値を設定できない', () => {
  const engine = initializedEngine([]);
  assert.throws(() => engine.applyStrengthOptions({ multiPv: 0 }), /multiPv/);
  assert.throws(() => engine.applyStrengthOptions({ multiPv: 1.5 }), /multiPv/);
});
