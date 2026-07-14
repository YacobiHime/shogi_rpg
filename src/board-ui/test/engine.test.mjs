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

  assert.deepEqual(await resultPromise, { move: '7g7f', ponder: undefined });
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
