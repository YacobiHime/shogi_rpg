import { getUnlockState, parsePlayerLevel } from '../board-ui/level-unlocks.mjs';

export const SAVE_KEY = 'shogi_rpg_save';
export const SAVE_VERSION = 1;

export class SaveDataError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SaveDataError';
  }
}

function requireInteger(value, field, min, max) {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new SaveDataError(`${field}は${min}〜${max}の整数にしてください`);
  }
  return value;
}

function normalizeIdList(value, field, allowedIds, defaults = []) {
  if (value === undefined) return [...defaults];
  if (!Array.isArray(value)) throw new SaveDataError(`${field}は配列にしてください`);
  const result = [];
  const seen = new Set();
  for (const id of value) {
    if (typeof id !== 'string' || !allowedIds.has(id)) {
      throw new SaveDataError(`${field}に未知のIDがあります: ${String(id)}`);
    }
    if (seen.has(id)) throw new SaveDataError(`${field}でIDが重複しています: ${id}`);
    seen.add(id);
    result.push(id);
  }
  return result;
}

function defaultItemCounts(items, unlockedIds) {
  return Object.fromEntries(items
    .filter((item) => item.consumable && unlockedIds.has(item.item_id))
    .map((item) => [item.item_id, Math.min(15, Math.max(0, item.effect_value))]));
}

function normalizeItemCounts(value, items, unlockedIds, useDefaults) {
  const knownConsumables = new Map(items
    .filter((item) => item.consumable)
    .map((item) => [item.item_id, item]));
  if (value === undefined && useDefaults) return defaultItemCounts(items, unlockedIds);
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new SaveDataError('item_countsはオブジェクトにしてください');
  }
  const result = {};
  for (const [id, count] of Object.entries(value)) {
    if (!knownConsumables.has(id)) {
      throw new SaveDataError(`item_countsに未知の消費アイテムがあります: ${id}`);
    }
    result[id] = requireInteger(count, `item_counts.${id}`, 0, 15);
  }
  for (const id of knownConsumables.keys()) {
    if (unlockedIds.has(id) && result[id] === undefined) result[id] = 0;
  }
  return result;
}

/** マスタを使ってセーブの既定値を作る。 */
export function createDefaultSave(context, options = {}) {
  const playerLevel = parsePlayerLevel(options.playerLevel);
  const unlockState = getUnlockState(context.levelUnlocks, playerLevel);
  return {
    version: SAVE_VERSION,
    chapter: 1,
    player_level: playerLevel,
    unlocked_formations: [...unlockState.formationIds],
    unlocked_items: [...unlockState.itemIds],
    defeated_bosses: [],
    item_counts: defaultItemCounts(context.items, unlockState.itemIds),
    difficulty: 'normal',
    updated_at: (options.now || new Date()).toISOString(),
  };
}

/** 欠損を補いながらセーブを検証し、現在のバージョンへ移行する。 */
export function normalizeSaveState(value, context, options = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new SaveDataError('セーブデータはオブジェクトにしてください');
  }
  const version = value.version ?? 0;
  if (!Number.isInteger(version) || version < 0 || version > SAVE_VERSION) {
    throw new SaveDataError(`未対応のセーブデータバージョンです: ${String(version)}`);
  }
  const chapter = requireInteger(value.chapter, 'chapter', 1, 63);
  let playerLevel;
  try {
    playerLevel = parsePlayerLevel(value.player_level);
  } catch (error) {
    throw new SaveDataError(error.message);
  }
  const unlockState = getUnlockState(context.levelUnlocks, playerLevel);
  const formationIds = new Set(context.formations.map((item) => item.formation_id));
  const itemIds = new Set(context.items.map((item) => item.item_id));
  const bossIds = new Set(context.bossIds);
  const difficultyIds = new Set(context.difficultyIds);
  if (!difficultyIds.has(value.difficulty)) {
    throw new SaveDataError(`difficultyが不正です: ${String(value.difficulty)}`);
  }

  const unlockedFormations = new Set(normalizeIdList(
    value.unlocked_formations,
    'unlocked_formations',
    formationIds,
    [...unlockState.formationIds],
  ));
  const unlockedItems = new Set(normalizeIdList(
    value.unlocked_items,
    'unlocked_items',
    itemIds,
    [...unlockState.itemIds],
  ));
  // レベル解禁済みの要素は、旧版セーブで配列が欠けていても必ず復元する。
  unlockState.formationIds.forEach((id) => unlockedFormations.add(id));
  unlockState.itemIds.forEach((id) => unlockedItems.add(id));

  const updatedAt = value.updated_at === undefined
    ? (options.now || new Date()).toISOString()
    : value.updated_at;
  if (typeof updatedAt !== 'string' || Number.isNaN(Date.parse(updatedAt))) {
    throw new SaveDataError('updated_atは日時文字列にしてください');
  }

  return {
    version: SAVE_VERSION,
    chapter,
    player_level: playerLevel,
    unlocked_formations: [...unlockedFormations],
    unlocked_items: [...unlockedItems],
    defeated_bosses: normalizeIdList(
      value.defeated_bosses, 'defeated_bosses', bossIds, []
    ),
    item_counts: normalizeItemCounts(
      value.item_counts, context.items, unlockState.itemIds, version === 0
    ),
    difficulty: value.difficulty,
    updated_at: updatedAt,
  };
}

export function touchSaveState(state, now = new Date()) {
  return { ...state, version: SAVE_VERSION, updated_at: now.toISOString() };
}
