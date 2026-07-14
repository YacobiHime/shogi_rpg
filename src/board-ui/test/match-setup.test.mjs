import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  buildMatchSearch,
  getAvailableFormations,
  loadMatchSetupOptions,
} from '../match-setup.mjs';

const dataUrl = new URL('../../../data/', import.meta.url);

function createMasterFetch(url) {
  const fileName = String(url).split('/').at(-1);
  return readFile(new URL(fileName, dataUrl), 'utf8').then((body) => ({
    ok: true,
    json: async () => JSON.parse(body),
  }));
}

test('準備画面用の敵・戦形・難易度一覧を読み込める', async () => {
  const options = await loadMatchSetupOptions({ fetchImpl: createMasterFetch });

  assert.equal(options.enemies[0].name, '稽古相手');
  assert.equal(options.formations[0].name, '平手');
  assert.deepEqual(options.difficulties.map((item) => item.name), [
    'やさしい', 'ふつう', 'むずかしい',
  ]);
});

test('敵が使用できる戦形だけを選択肢にする', () => {
  const formations = [
    { formation_id: 'standard' },
    { formation_id: 'another' },
  ];
  const available = getAvailableFormations(
    { allowed_openings: ['another'] },
    formations
  );

  assert.deepEqual(available, [{ formation_id: 'another' }]);
});

test('選択内容を既存形式の対局URLクエリへ変換する', () => {
  assert.equal(buildMatchSearch({
    enemyId: 'training_partner',
    formationId: 'standard',
    difficultyId: 'normal',
  }), '?enemy=training_partner&formation=standard&difficulty=normal');
});
