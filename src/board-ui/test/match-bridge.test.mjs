import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyMatchResultToProgress,
  buildBoardMatchUrl,
  createMatchResultMessage,
  normalizeMatchConfig,
  parseMatchResultMessage,
} from '../../novel/match-bridge.mjs';
import { createNovelResultReporter } from '../novel-bridge.mjs';

const config = {
  matchId: 'chapter1.training:1',
  enemyId: 'training_partner',
  formationId: 'standard',
  difficultyId: 'normal',
  itemId: 'node_limit_half',
  startSfen: '4k4/9/9/9/9/9/9/9/4K4 b - 1',
};

test('対局構成をiframe URLへ固定の契約で渡す', () => {
  const url = buildBoardMatchUrl(
    '/src/board-ui/index.html', config, 'https://example.test/'
  );
  assert.equal(url.origin, 'https://example.test');
  assert.equal(url.searchParams.get('bridge'), 'tyrano');
  assert.equal(url.searchParams.get('match_id'), config.matchId);
  assert.equal(url.searchParams.get('enemy'), config.enemyId);
  assert.equal(url.searchParams.get('formation'), config.formationId);
  assert.equal(url.searchParams.get('difficulty'), config.difficultyId);
  assert.equal(url.searchParams.get('item'), config.itemId);
  assert.equal(url.searchParams.get('start_sfen'), config.startSfen);
});

test('未知形式の対局構成を拒否する', () => {
  assert.throws(
    () => normalizeMatchConfig({ ...config, enemyId: '../enemy' }),
    /enemyIdが不正/
  );
  assert.throws(
    () => normalizeMatchConfig({ ...config, matchId: '' }),
    /matchIdが不正/
  );
});

test('対局結果をバージョン付きメッセージとして往復する', () => {
  const message = createMatchResultMessage(config, {
    outcome: 'win',
    reason: 'checkmate',
    moveCount: 57,
    finalSfen: '4k4/9/9/9/9/9/9/9/4K4 b G 57',
  });
  assert.deepEqual(parseMatchResultMessage(message, config.matchId), message);
  assert.equal(parseMatchResultMessage(message, 'different-match'), null);
});

test('結果の列挙値と手数を検証する', () => {
  assert.throws(() => createMatchResultMessage(config, {
    outcome: 'unknown', reason: 'checkmate', moveCount: 1,
  }), /outcomeが不正/);
  assert.throws(() => createMatchResultMessage(config, {
    outcome: 'draw', reason: 'timeout', moveCount: 1,
  }), /reasonが不正/);
  assert.throws(() => createMatchResultMessage(config, {
    outcome: 'loss', reason: 'resignation', moveCount: -1,
  }), /moveCountが不正/);
});

test('勝利結果を再適用しても章フラグと直近結果が安定する', () => {
  const message = createMatchResultMessage(config, {
    outcome: 'win', reason: 'checkmate', moveCount: 57,
  });
  const first = applyMatchResultToProgress(undefined, message);
  const retried = applyMatchResultToProgress(first, message);
  assert.equal(retried.chapter_flags[`defeated_${config.enemyId}`], true);
  assert.deepEqual(retried.last_match_result, message);
});

test('敗北と引き分けでは撃破済みフラグを更新しない', () => {
  for (const outcome of ['loss', 'draw']) {
    const message = createMatchResultMessage(config, {
      outcome,
      reason: outcome === 'draw' ? 'repetition' : 'resignation',
      moveCount: 12,
    });
    const progress = applyMatchResultToProgress(undefined, message);
    assert.deepEqual(progress.chapter_flags, {});
  }
});

test('iframe内の対局UIは同一オリジンの親へ結果を一度だけ返す', () => {
  const sent = [];
  const parent = {
    postMessage(message, targetOrigin) {
      sent.push({ message, targetOrigin });
    },
  };
  const windowObject = {
    parent,
    location: { origin: 'https://example.test' },
  };
  const params = new URLSearchParams({
    bridge: 'tyrano',
    match_id: config.matchId,
    enemy: config.enemyId,
    formation: config.formationId,
    difficulty: config.difficultyId,
    item: config.itemId,
  });
  const reporter = createNovelResultReporter(windowObject, params);
  const result = { outcome: 'loss', reason: 'resignation', moveCount: 12 };

  assert.equal(reporter.embedded, true);
  assert.equal(reporter.send(result), true);
  assert.equal(reporter.send(result), false);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].targetOrigin, 'https://example.test');
  assert.equal(sent[0].message.match_id, config.matchId);
});

test('スタンドアロン起動では結果メッセージを送らない', () => {
  const windowObject = { location: { origin: 'https://example.test' } };
  windowObject.parent = windowObject;
  const reporter = createNovelResultReporter(windowObject, new URLSearchParams());
  assert.equal(reporter.embedded, false);
  assert.equal(reporter.send({}), false);
});
