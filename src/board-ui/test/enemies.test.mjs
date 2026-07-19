import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { loadEnemy, validateEnemies } from '../enemies.mjs';

const enemiesUrl = new URL('../../../data/enemies.json', import.meta.url);
const formationsUrl = new URL('../../../data/formations.json', import.meta.url);
const openingBooksUrl = new URL('../../../data/enemy_openings.json', import.meta.url);

async function readJson(url) {
  return JSON.parse(await readFile(url, 'utf8'));
}

function masterFetch(url) {
  const source = url.endsWith('enemies.json')
    ? enemiesUrl
    : (url.endsWith('formations.json') ? formationsUrl : openingBooksUrl);
  return Promise.resolve({ ok: true, json: () => readJson(source) });
}

test('enemies.jsonの稽古相手を読み込める', async () => {
  const enemy = await loadEnemy('training_partner', { fetchImpl: masterFetch });

  assert.equal(enemy.name, '稽古相手');
  assert.equal(enemy.node_limit, 10000);
  assert.equal(enemy.max_think_time_ms, 10000);
  assert.equal(enemy.nnue_file, null);
  assert.equal(enemy.opening_book_id, null);
});

test('ノード上限は1以上の整数を必須とする', async () => {
  const [enemy] = await readJson(enemiesUrl);

  assert.throws(() => validateEnemies([{ ...enemy, node_limit: null }]), /node_limit/);
  assert.throws(() => validateEnemies([{ ...enemy, node_limit: 0 }]), /node_limit/);
});

test('nnue_fileにディレクトリや親ディレクトリ参照を指定できない', async () => {
  const [enemy] = await readJson(enemiesUrl);

  assert.throws(() => validateEnemies([{ ...enemy, nnue_file: '../nn.bin' }]), /nnue_file/);
  assert.throws(() => validateEnemies([{ ...enemy, nnue_file: 'eval/nn.bin' }]), /nnue_file/);
});

test('未定義の戦形参照を拒否する', async () => {
  const [enemy] = await readJson(enemiesUrl);

  assert.throws(
    () => validateEnemies([{ ...enemy, allowed_openings: ['missing'] }], ['standard']),
    /未定義/
  );
});

test('未定義の敵定跡参照を拒否する', async () => {
  const [enemy] = await readJson(enemiesUrl);

  assert.throws(
    () => validateEnemies(
      [{ ...enemy, opening_book_id: 'missing' }], ['standard'], ['white_bogin']
    ),
    /未定義の敵定跡/,
  );
});

test('存在しない敵IDを明確なエラーにする', async () => {
  await assert.rejects(
    loadEnemy('missing', { fetchImpl: masterFetch }),
    /見つかりません/
  );
});
