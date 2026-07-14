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

function engineFactory(capture) {
  return async (moduleArgs) => {
    capture.moduleArgs = moduleArgs;
    let listener;
    return {
      addMessageListener(nextListener) {
        listener = nextListener;
      },
      postMessage(command) {
        if (command === 'usi') queueMicrotask(() => listener('usiok'));
      },
    };
  };
}

test('取得した評価関数を初期化前に仮想FSへ書き込む', async () => {
  const capture = {};
  const bytes = Uint8Array.from([1, 2, 3]);
  const engine = new ShogiEngine({
    factory: engineFactory(capture),
    nnuePath: '../../assets/nnue/hao.bin',
    fetchImpl: async () => ({
      ok: true,
      arrayBuffer: async () => bytes.buffer,
    }),
  });

  await engine.init();
  const writes = [];
  capture.moduleArgs.preRun[0]({
    FS: { writeFile: (path, contents) => writes.push([path, [...contents]]) },
  });

  assert.deepEqual(writes, [['/nn.bin', [1, 2, 3]]]);
  assert.equal(engine.activeNnuePath, '../../assets/nnue/hao.bin');
});

test('fetch実装をShogiEngineへ束縛せず呼び出す', async () => {
  const capture = {};
  let receiver;
  const engine = new ShogiEngine({
    factory: engineFactory(capture),
    nnuePath: '../../assets/nnue/hao.bin',
    fetchImpl: async function () {
      receiver = this;
      return {
        ok: true,
        arrayBuffer: async () => Uint8Array.from([1]).buffer,
      };
    },
  });

  await engine.init();

  assert.equal(receiver, undefined);
  assert.equal(engine.activeNnuePath, '../../assets/nnue/hao.bin');
});

test('評価関数が未配置なら内蔵評価関数で初期化を続行する', async () => {
  const capture = {};
  const fallbackCapture = {};
  let fallback;
  const engine = new ShogiEngine({
    factory: engineFactory(capture),
    fallbackFactory: engineFactory(fallbackCapture),
    nnuePath: '../../assets/nnue/missing.bin',
    fetchImpl: async () => ({ ok: false, status: 404 }),
    onNnueFallback: (details) => { fallback = details; },
  });

  await engine.init();

  assert.equal(capture.moduleArgs, undefined);
  assert.deepEqual(fallbackCapture.moduleArgs.preRun, []);
  assert.equal(engine.activeNnuePath, null);
  assert.equal(fallback.path, '../../assets/nnue/missing.bin');
  assert.match(fallback.error.message, /HTTP 404/);
  assert.equal(fallback.stage, 'fetch');
});

test('HalfKPエンジン初期化に失敗した場合は内蔵評価版へ切り替える', async () => {
  const fallbackCapture = {};
  let fallback;
  const engine = new ShogiEngine({
    factory: async () => { throw new Error('WASM load failed'); },
    fallbackFactory: engineFactory(fallbackCapture),
    nnuePath: '../../assets/nnue/hao.bin',
    fetchImpl: async () => ({
      ok: true,
      arrayBuffer: async () => Uint8Array.from([1]).buffer,
    }),
    onNnueFallback: (details) => { fallback = details; },
  });

  await engine.init();

  assert.deepEqual(fallbackCapture.moduleArgs.preRun, []);
  assert.equal(engine.activeNnuePath, null);
  assert.equal(fallback.stage, 'engine');
  assert.match(fallback.error.message, /WASM load failed/);
});

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
