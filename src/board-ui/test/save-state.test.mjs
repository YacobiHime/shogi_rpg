import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createDefaultSave,
  normalizeSaveState,
  SAVE_KEY,
} from '../../save/save-state.mjs';
import { loadSaveState, saveSaveState } from '../../save/save-storage.mjs';

const context = {
  formations: [{ formation_id: 'standard' }, { formation_id: 'mino' }],
  items: [
    { item_id: 'hint_ticket', consumable: true, effect_value: 2 },
    { item_id: 'undo_ticket', consumable: true, effect_value: 3 },
    { item_id: 'node_limit_half', consumable: false, effect_value: 0.5 },
  ],
  bossIds: ['boss1'],
  difficultyIds: ['easy', 'normal', 'hard'],
  levelUnlocks: [
    {
      level: 1,
      unlocks: {
        formations: ['standard'],
        items: ['hint_ticket', 'undo_ticket', 'node_limit_half'],
        skill_upgrades: { hint_max: 0, undo_max: 0 },
      },
    },
    {
      level: 3,
      unlocks: {
        formations: ['mino'],
        items: [],
        skill_upgrades: { hint_max: 1, undo_max: 0 },
      },
    },
  ],
};
const now = new Date('2026-07-15T00:00:00Z');

function memoryStorage(initial = null) {
  const values = new Map(initial === null ? [] : [[SAVE_KEY, initial]]);
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    value: (key) => values.get(key),
  };
}

test('初回セーブはレベル解禁と消費アイテムの初期数を反映する', () => {
  const state = createDefaultSave(context, { playerLevel: 3, now });

  assert.equal(state.version, 1);
  assert.equal(state.player_level, 3);
  assert.deepEqual(state.unlocked_formations, ['standard', 'mino']);
  assert.equal(state.item_counts.hint_ticket, 2);
  assert.equal(state.item_counts.undo_ticket, 3);
  assert.equal(state.updated_at, now.toISOString());
});

test('旧版の欠損フィールドを補い現在版へ移行する', () => {
  const state = normalizeSaveState({
    chapter: 1,
    player_level: 1,
    defeated_bosses: [],
    difficulty: 'easy',
  }, context, { now });

  assert.equal(state.version, 1);
  assert.deepEqual(state.unlocked_formations, ['standard']);
  assert.deepEqual(state.unlocked_items, ['hint_ticket', 'undo_ticket', 'node_limit_half']);
  assert.deepEqual(state.item_counts, { hint_ticket: 2, undo_ticket: 3 });
});

test('未知ID、不正範囲、未来バージョンを拒否する', () => {
  const base = createDefaultSave(context, { now });
  assert.throws(
    () => normalizeSaveState({ ...base, unlocked_formations: ['unknown'] }, context),
    /未知のID/,
  );
  assert.throws(
    () => normalizeSaveState({ ...base, item_counts: { hint_ticket: 16 } }, context),
    /0〜15/,
  );
  assert.throws(
    () => normalizeSaveState({ ...base, version: 2 }, context),
    /未対応/,
  );
});

test('localStorageへ保存し、再読込できる', () => {
  const storage = memoryStorage();
  const original = createDefaultSave(context, { now });
  const saved = saveSaveState(storage, { ...original, difficulty: 'hard' }, now);
  const loaded = loadSaveState(storage, context, { now });

  assert.equal(JSON.parse(storage.value(SAVE_KEY)).difficulty, 'hard');
  assert.deepEqual(loaded.state, saved);
  assert.equal(loaded.source, 'storage');
  assert.equal(loaded.warning, null);
});

test('保存済みデータがあれば互換用level入力より保存レベルを優先する', () => {
  const saved = createDefaultSave(context, { playerLevel: 3, now });
  const loaded = loadSaveState(
    memoryStorage(JSON.stringify(saved)), context, { playerLevel: 'invalid', now }
  );

  assert.equal(loaded.state.player_level, 3);
  assert.equal(loaded.source, 'storage');
});

test('壊れたJSONは初期値で復旧し警告する', () => {
  const loaded = loadSaveState(memoryStorage('{broken'), context, { now });

  assert.equal(loaded.source, 'recovered');
  assert.equal(loaded.state.player_level, 1);
  assert.match(loaded.warning, /壊れていたため初期状態/);
});
