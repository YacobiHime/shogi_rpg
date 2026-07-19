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

function optionReportingEngineFactory(capture) {
  return async (moduleArgs) => {
    capture.moduleArgs = moduleArgs;
    let listener;
    return {
      addMessageListener(nextListener) {
        listener = nextListener;
      },
      postMessage(command) {
        if (command === 'usi') queueMicrotask(() => {
          listener('option name USI_OwnBook type check default true');
          listener('option name BookFile type combo default no_book var no_book var user_book1.db');
          listener('option name BookDir type string default .');
          listener('usiok');
        });
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

test('任意の定跡DBを初期化前に仮想FSへ書き込める', async () => {
  const capture = {};
  const bytes = Uint8Array.from([35, 89, 65, 78, 69]);
  const engine = new ShogiEngine({
    factory: engineFactory(capture),
    bookPath: '../../data/standard_book.db',
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

  assert.deepEqual(writes, [['/user_book1.db', [...bytes]]]);
  assert.equal(engine.activeBookPath, '../../data/standard_book.db');
});

test('定跡DBの仮想パスに親ディレクトリがあれば先に作成する', async () => {
  const capture = {};
  const engine = new ShogiEngine({
    factory: engineFactory(capture),
    bookPath: '../../data/standard_book.db',
    bookVirtualPath: '/book/standard_book.db',
    fetchImpl: async () => ({
      ok: true,
      arrayBuffer: async () => Uint8Array.from([1]).buffer,
    }),
  });
  await engine.init();
  const actions = [];
  capture.moduleArgs.preRun[0]({ FS: {
    mkdirTree: (path) => actions.push(['mkdir', path]),
    writeFile: (path) => actions.push(['write', path]),
  } });
  assert.deepEqual(actions, [
    ['mkdir', '/book'],
    ['write', '/book/standard_book.db'],
  ]);
});

test('通常版WASMの旧Emscripten仮想FS APIでも定跡DBを配置できる', async () => {
  const capture = {};
  const bytes = Uint8Array.from([35, 89, 65]);
  const engine = new ShogiEngine({
    factory: engineFactory(capture),
    bookPath: '../../assets/books/standard_book.db',
    bookVirtualPath: '/book/standard_book.db',
    fetchImpl: async () => ({ ok: true, arrayBuffer: async () => bytes.buffer }),
  });
  await engine.init();
  const actions = [];
  capture.moduleArgs.preRun[0]({
    FS_createPath: (...args) => actions.push(['path', ...args]),
    FS_createDataFile: (...args) => actions.push(['file', ...args]),
  });
  assert.deepEqual(actions[0], ['path', '/', 'book', true, true]);
  assert.deepEqual(actions[1].slice(0, 3), ['file', '/book', 'standard_book.db']);
  assert.deepEqual([...actions[1][3]], [...bytes]);
});

test('仮想FS APIがない場合は定跡なしで初期化を続ける', async () => {
  const capture = {};
  let fallback;
  const engine = new ShogiEngine({
    factory: engineFactory(capture),
    bookPath: '../../assets/books/standard_book.db',
    fetchImpl: async () => ({
      ok: true,
      arrayBuffer: async () => Uint8Array.from([1]).buffer,
    }),
    onBookFallback: (details) => { fallback = details; },
  });
  await engine.init();
  capture.moduleArgs.preRun[0]({});
  assert.equal(engine.activeBookPath, null);
  assert.equal(fallback.stage, 'filesystem');
});

test('定跡DBの取得失敗は通知して定跡なしで初期化を続ける', async () => {
  const capture = {};
  let fallback;
  const engine = new ShogiEngine({
    factory: engineFactory(capture),
    bookPath: '../../data/missing.db',
    fetchImpl: async () => ({ ok: false, status: 404 }),
    onBookFallback: (details) => { fallback = details; },
  });

  await engine.init();
  assert.deepEqual(capture.moduleArgs.preRun, []);
  assert.equal(engine.activeBookPath, null);
  assert.equal(fallback.path, '../../data/missing.db');
  assert.equal(fallback.stage, 'fetch');
  assert.match(fallback.error.message, /HTTP 404/);
});

test('usiが列挙したオプションだけを対応済みとして扱う', async () => {
  const capture = {};
  const engine = new ShogiEngine({ factory: optionReportingEngineFactory(capture) });
  await engine.init();

  assert.equal(engine.supportsOption('USI_OwnBook'), true);
  assert.equal(engine.supportsOption('BookFile'), true);
  assert.equal(engine.supportsOption('UnknownOption'), false);
  assert.equal(engine.setOption('UnknownOption', 1), false);
});

test('対応オプションがある場合だけpreRun済み定跡DBを有効化する', async () => {
  const capture = {};
  const commands = [];
  const factory = async (moduleArgs) => {
    const instance = await optionReportingEngineFactory(capture)(moduleArgs);
    const originalPostMessage = instance.postMessage;
    instance.postMessage = (command) => {
      commands.push(command);
      originalPostMessage(command);
    };
    return instance;
  };
  const engine = new ShogiEngine({
    factory,
    bookPath: '../../data/standard_book.db',
    bookVirtualPath: '/book/standard_book.db',
    fetchImpl: async () => ({
      ok: true,
      arrayBuffer: async () => Uint8Array.from([1]).buffer,
    }),
  });
  await engine.init();
  assert.equal(engine.enablePreloadedBook(), true);
  assert.deepEqual(commands.slice(-3), [
    'setoption name BookDir value /book',
    'setoption name USI_OwnBook value true',
    'setoption name BookFile value standard_book.db',
  ]);
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

test('searchmovesをgoコマンドの末尾へ渡して候補手を限定する', async () => {
  const commands = [];
  const engine = initializedEngine(commands);
  const resultPromise = engine.go({
    nodes: 5000,
    searchMoves: ['8b4b', '8b4b', '8b3b'],
  });

  assert.deepEqual(commands, ['go nodes 5000 searchmoves 8b4b 8b3b']);
  engine._emit('bestmove 8b4b');
  assert.equal((await resultPromise).move, '8b4b');
});

test('空または不正なsearchmovesを拒否する', async () => {
  const engine = initializedEngine([]);
  await assert.rejects(engine.go({ searchMoves: [] }), /searchMoves/);
  await assert.rejects(engine.go({ searchMoves: ['invalid'] }), /searchMoves/);
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

test('短い探索中の候補手・評価値・深さをリアルタイム通知して停止できる', async () => {
  const commands = [];
  const updates = [];
  const engine = initializedEngine(commands);
  const resultPromise = engine.go({
    nodes: 1000,
    onUpdate: (update) => updates.push(update),
  });

  engine._emit('info depth 12 multipv 1 score cp 84 nodes 12345 nps 60000 pv 7g7f 3c3d');
  engine._emit('info depth 12 multipv 2 score cp 31 nodes 13000 nps 61000 pv 2g2f 8c8d');
  engine.stop();
  engine._emit('bestmove 7g7f');

  assert.deepEqual(commands, ['go nodes 1000', 'stop']);
  assert.deepEqual(updates.at(-1), {
    depth: 12,
    nodes: 13000,
    nps: 61000,
    candidates: [
      {
        rank: 1, move: '7g7f', pv: ['7g7f', '3c3d'], depth: 12,
        score: { type: 'cp', value: 84 },
      },
      {
        rank: 2, move: '2g2f', pv: ['2g2f', '8c8d'], depth: 12,
        score: { type: 'cp', value: 31 },
      },
    ],
  });
  assert.equal((await resultPromise).move, '7g7f');
});

test('MultiPVへ1未満または整数でない値を設定できない', () => {
  const engine = initializedEngine([]);
  assert.throws(() => engine.applyStrengthOptions({ multiPv: 0 }), /multiPv/);
  assert.throws(() => engine.applyStrengthOptions({ multiPv: 1.5 }), /multiPv/);
});

test('内蔵定跡を明示的に無効化する', () => {
  const commands = [];
  const engine = initializedEngine(commands);
  engine._usiOptions.add('USI_OwnBook');
  engine._usiOptions.add('BookFile');
  engine.disableOwnBook();
  assert.deepEqual(commands, [
    'setoption name USI_OwnBook value false',
    'setoption name BookFile value no_book',
  ]);
});
