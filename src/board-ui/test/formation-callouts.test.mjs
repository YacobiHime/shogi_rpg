import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  detectFormationCallouts,
  findNewFormationCallouts,
  validateFormationCallouts,
} from '../formation-callouts.mjs';

const masterUrl = new URL('../../../data/formation_callouts.json', import.meta.url);

async function loadMaster() {
  return validateFormationCallouts(JSON.parse(await readFile(masterUrl, 'utf8')));
}

test('戦形コールアウトマスタを読み込める', async () => {
  const master = await loadMaster();
  assert.equal(master.version, 1);
  assert.deepEqual(master.callouts.map((entry) => entry.callout_id), [
    'bogin', 'gold_yagura', 'right_shiken',
  ]);
});

test('棒銀、金矢倉囲い、右四間飛車を駒配置から検出する', async () => {
  const master = await loadMaster();
  const bogin = '9/9/9/9/7S1/9/9/7R1/9 b - 1';
  const goldYagura = '9/9/9/9/9/9/2SG5/1KG6/9 b - 1';
  const rightShiken = '9/9/9/9/9/3P5/4S4/3R5/9 b - 1';

  assert.deepEqual(detectFormationCallouts(bogin, master).map((entry) => entry.callout_id), ['bogin']);
  assert.deepEqual(detectFormationCallouts(goldYagura, master).map((entry) => entry.callout_id), ['gold_yagura']);
  assert.deepEqual(detectFormationCallouts(rightShiken, master).map((entry) => entry.callout_id), ['right_shiken']);
});

test('後手の戦形も検出し、発話済み戦形は繰り返さない', async () => {
  const master = await loadMaster();
  const whiteBogin = '9/1r7/9/1s7/9/9/9/9/9 w - 1';
  assert.deepEqual(
    findNewFormationCallouts(whiteBogin, master, []).map((entry) => entry.speech),
    ['棒銀！'],
  );
  assert.deepEqual(findNewFormationCallouts(whiteBogin, master, ['bogin']), []);
});

test('未知ID、重複ID、不正なSFENを拒否する', async () => {
  const master = await loadMaster();
  assert.throws(
    () => validateFormationCallouts({
      ...master,
      callouts: [...master.callouts, { callout_id: 'unknown', name: '未知', speech: '未知！' }],
    }),
    /未対応/,
  );
  assert.throws(
    () => validateFormationCallouts({ ...master, callouts: [...master.callouts, master.callouts[0]] }),
    /重複/,
  );
  assert.throws(() => detectFormationCallouts('9/9', master), /9段/);
});
