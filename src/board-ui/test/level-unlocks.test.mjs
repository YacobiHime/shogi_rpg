import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  applyAssistLimitUpgrades,
  getUnlockState,
  parsePlayerLevel,
  validateLevelUnlocks,
} from '../level-unlocks.mjs';

const dataUrl = new URL('../../../data/', import.meta.url);

async function readJson(name) {
  return JSON.parse(await readFile(new URL(name, dataUrl), 'utf8'));
}

test('実マスタの解禁レベルとlevel_unlocks.jsonが一致する', async () => {
  const [data, formations, items] = await Promise.all([
    readJson('level_unlocks.json'),
    readJson('formations.json'),
    readJson('items.json'),
  ]);
  assert.equal(validateLevelUnlocks(data, formations, items), data);
});

test('指定レベルまでの解禁と補助回数アップグレードを累積する', () => {
  const data = [
    { level: 1, unlocks: {
      formations: ['standard'], items: ['hint'],
      skill_upgrades: { undo_max: 0, hint_max: 0 },
    } },
    { level: 3, unlocks: {
      formations: ['advanced'], items: ['undo'],
      skill_upgrades: { undo_max: 1, hint_max: 2 },
    } },
  ];
  const levelOne = getUnlockState(data, 1);
  assert.deepEqual([...levelOne.formationIds], ['standard']);
  assert.deepEqual([...levelOne.itemIds], ['hint']);

  const levelThree = getUnlockState(data, 3);
  assert.deepEqual([...levelThree.formationIds], ['standard', 'advanced']);
  assert.deepEqual(applyAssistLimitUpgrades(
    { hints: 2, undo: 3 }, levelThree
  ), { hints: 4, undo: 4 });
});

test('プレイヤーレベルは既定値1を使い、不正値を拒否する', () => {
  assert.equal(parsePlayerLevel(null), 1);
  assert.equal(parsePlayerLevel('12'), 12);
  for (const value of ['0', '1.5', '01', 'abc', '256']) {
    assert.throws(() => parsePlayerLevel(value), /1〜255/);
  }
});

test('重複レベル、未知ID、マスタとのレベル不一致、登録漏れを拒否する', () => {
  const formations = [{ formation_id: 'standard', unlock_level: 1 }];
  const items = [{ item_id: 'skill', unlock_level: 1 }];
  const entry = (level, formationIds = ['standard'], itemIds = ['skill']) => ({
    level,
    unlocks: {
      formations: formationIds,
      items: itemIds,
      skill_upgrades: { undo_max: 0, hint_max: 0 },
    },
  });

  assert.throws(
    () => validateLevelUnlocks([entry(1), entry(1, [], [])], formations, items),
    /昇順かつ重複なし/
  );
  assert.throws(
    () => validateLevelUnlocks([entry(1, ['missing'])], formations, items),
    /未定義の戦形/
  );
  assert.throws(
    () => validateLevelUnlocks([entry(2)], formations, items),
    /unlock_level/
  );
  assert.throws(
    () => validateLevelUnlocks([entry(1, [], ['skill'])], formations, items),
    /解禁テーブルに戦形がありません/
  );
});
