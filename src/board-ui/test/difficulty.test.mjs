import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  calculateEffectiveNodeLimit,
  loadDifficulty,
  validateDifficulties,
  varyNodeLimit,
} from '../difficulty.mjs';

const difficultyUrl = new URL('../../../data/difficulty.json', import.meta.url);

async function readDifficulty() {
  return JSON.parse(await readFile(difficultyUrl, 'utf8'));
}

test('difficulty.jsonの3段階を読み込める', async () => {
  const difficulties = validateDifficulties(await readDifficulty());

  assert.equal(difficulties.easy.node_limit_mult, 0.5);
  assert.equal(difficulties.normal.node_limit_mult, 1);
  assert.equal(difficulties.normal.node_limit_stddev_ratio, 0.45);
  assert.equal(difficulties.hard.node_limit_mult, 1.5);
});

test('探索ノード数の下振れを保ちつつ、正規分布の上振れ幅を半分に圧縮する', () => {
  const sequenceRandom = (...values) => {
    let index = 0;
    return () => values[index++];
  };

  assert.equal(varyNodeLimit(10000, 0), 10000);
  assert.equal(varyNodeLimit(10000, 0.45, sequenceRandom(Math.exp(-0.5), 0)), 12250);
  assert.equal(varyNodeLimit(10000, 0.45, sequenceRandom(0, 0)), 14500);
  assert.equal(varyNodeLimit(10000, 0.45, sequenceRandom(0, 0.5)), 1000);
});

test('指定した難易度を表示名付きで取得できる', async () => {
  const difficulty = await loadDifficulty('normal', {
    fetchImpl: async () => ({ ok: true, json: readDifficulty }),
  });

  assert.equal(difficulty.difficulty_id, 'normal');
  assert.equal(difficulty.name, 'ふつう');
});

test('難易度倍率から実効ノード数を計算する', () => {
  assert.equal(calculateEffectiveNodeLimit(10000, 0.5), 5000);
  assert.equal(calculateEffectiveNodeLimit(10000, 1), 10000);
  assert.equal(calculateEffectiveNodeLimit(10000, 1.5), 15000);
  assert.equal(calculateEffectiveNodeLimit(1, 0.5), 1);
});

test('不正な係数と存在しない難易度IDを拒否する', async () => {
  const difficulties = await readDifficulty();

  assert.throws(
    () => validateDifficulties({
      ...difficulties,
      easy: { ...difficulties.easy, node_limit_mult: 0 },
    }),
    /node_limit_mult/
  );
  assert.throws(
    () => validateDifficulties({
      ...difficulties,
      easy: { ...difficulties.easy, move_rank_max_bonus: -1 },
    }),
    /move_rank_max_bonus/
  );
  assert.throws(
    () => validateDifficulties({
      ...difficulties,
      normal: { ...difficulties.normal, node_limit_stddev_ratio: 0.6 },
    }),
    /node_limit_stddev_ratio/
  );
  await assert.rejects(
    loadDifficulty('missing', {
      fetchImpl: async () => ({ ok: true, json: readDifficulty }),
    }),
    /見つかりません/
  );
});
