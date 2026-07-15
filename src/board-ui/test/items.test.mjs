import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { calculateEffectiveNodeLimit } from '../difficulty.mjs';
import {
  getNodeDebuffMultiplier,
  getNodeDebuffSkills,
  selectItem,
  validateItems,
} from '../items.mjs';

const itemsUrl = new URL('../../../data/items.json', import.meta.url);

async function readItems() {
  return JSON.parse(await readFile(itemsUrl, 'utf8'));
}

test('items.jsonの探索量デバフスキルを読み込める', async () => {
  const items = validateItems(await readItems());
  const skill = selectItem(items, 'node_limit_half');

  assert.equal(skill.name, '読み筋封じ');
  assert.equal(getNodeDebuffMultiplier(skill), 0.5);
  assert.equal(
    calculateEffectiveNodeLimit(10000, 0.5 * getNodeDebuffMultiplier(skill)),
    2500
  );
  assert.deepEqual(getNodeDebuffSkills(items), [skill]);
});

test('未装備なら探索ノード数を補正しない', async () => {
  const items = validateItems(await readItems());

  assert.equal(selectItem(items, null), null);
  assert.equal(getNodeDebuffMultiplier(null), 1);
});

test('現在のプレイヤーレベルで未解禁のスキルを準備画面へ出さない', async () => {
  const [item] = validateItems(await readItems());
  const levelTwoSkill = { ...item, item_id: 'level_two', unlock_level: 2 };

  assert.deepEqual(getNodeDebuffSkills([item, levelTwoSkill], 1), [item]);
  assert.deepEqual(getNodeDebuffSkills([item, levelTwoSkill], 2), [item, levelTwoSkill]);
  assert.throws(() => getNodeDebuffSkills([item], 0), /playerLevel/);
});

test('重複IDと不正な探索ノード倍率を拒否する', async () => {
  const [item] = await readItems();

  assert.throws(() => validateItems([item, item]), /重複/);
  assert.throws(
    () => validateItems([{ ...item, effect_value: 0 }]),
    /探索ノード倍率/
  );
  assert.throws(
    () => validateItems([{ ...item, effect_value: 1.1 }]),
    /探索ノード倍率/
  );
});

test('存在しないIDと異なる種類のアイテム適用を拒否する', async () => {
  const items = validateItems(await readItems());

  assert.throws(() => selectItem(items, 'missing'), /見つかりません/);
  assert.throws(
    () => getNodeDebuffMultiplier({ type: 'hint', effect_value: 1 }),
    /適用できません/
  );
});
