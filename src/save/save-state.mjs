import { getUnlockState, parsePlayerLevel } from '../board-ui/level-unlocks.mjs';

export const SAVE_KEY = 'shogi_rpg_save';
export const SAVE_VERSION = 2;

const MAX_NAME_LENGTH = 12;
const MAX_PROGRESS_VALUE = 999_999_999;
const MAX_ITEM_COUNT = 999;
const QUEST_STATES = new Set(['active', 'completed']);
const NAME_SUFFIXES = new Set(['kun', 'chan']);

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

function optionalAllowedIds(context, primaryKey, legacyKey = null) {
  const values = context[primaryKey] ?? (legacyKey ? context[legacyKey] : undefined);
  return values === undefined ? null : new Set(values);
}

function normalizeIdList(value, field, allowedIds = null, defaults = []) {
  if (value === undefined) return [...defaults];
  if (!Array.isArray(value)) throw new SaveDataError(`${field}は配列にしてください`);
  const result = [];
  const seen = new Set();
  for (const id of value) {
    if (typeof id !== 'string' || id.length === 0
      || (allowedIds && !allowedIds.has(id))) {
      throw new SaveDataError(`${field}に未知のIDがあります: ${String(id)}`);
    }
    if (seen.has(id)) throw new SaveDataError(`${field}でIDが重複しています: ${id}`);
    seen.add(id);
    result.push(id);
  }
  return result;
}

function normalizePlayerName(value, profileCreated) {
  if (value === undefined && !profileCreated) return 'あなた';
  if (typeof value !== 'string') {
    throw new SaveDataError('player_nameは文字列にしてください');
  }
  const normalized = value.trim();
  const length = Array.from(normalized).length;
  if (length < 1 || length > MAX_NAME_LENGTH || /[\u0000-\u001f\u007f]/u.test(normalized)) {
    throw new SaveDataError(`player_nameは1〜${MAX_NAME_LENGTH}文字にしてください`);
  }
  return normalized;
}

function defaultItemCounts(items, unlockedIds) {
  return Object.fromEntries(items
    .filter((item) => item.consumable && unlockedIds.has(item.item_id))
    .map((item) => [
      item.item_id,
      Math.min(MAX_ITEM_COUNT, Math.max(0, Math.trunc(item.effect_value))),
    ]));
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
    result[id] = requireInteger(count, `item_counts.${id}`, 0, MAX_ITEM_COUNT);
  }
  for (const id of knownConsumables.keys()) {
    if (unlockedIds.has(id) && result[id] === undefined) result[id] = 0;
  }
  return result;
}

function normalizeQuestStates(value, allowedIds) {
  if (value === undefined) return {};
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new SaveDataError('quest_statesはオブジェクトにしてください');
  }
  const result = {};
  for (const [id, status] of Object.entries(value)) {
    if ((allowedIds && !allowedIds.has(id)) || !QUEST_STATES.has(status)) {
      throw new SaveDataError(`quest_statesが不正です: ${id}=${String(status)}`);
    }
    result[id] = status;
  }
  return result;
}

function normalizeCurrentLocation(value, allowedIds) {
  const location = value ?? 'chapter1_village';
  if (typeof location !== 'string' || location.length === 0
    || (allowedIds && !allowedIds.has(location))) {
    throw new SaveDataError(`current_locationが不正です: ${String(location)}`);
  }
  return location;
}

/** マスタを使ってセーブの既定値を作る。 */
export function createDefaultSave(context, options = {}) {
  const playerLevel = parsePlayerLevel(options.playerLevel);
  const unlockState = getUnlockState(context.levelUnlocks, playerLevel);
  const profileCreated = options.profileCreated === true;
  return {
    version: SAVE_VERSION,
    profile_created: profileCreated,
    player_name: normalizePlayerName(options.playerName, profileCreated),
    name_suffix: NAME_SUFFIXES.has(options.nameSuffix) ? options.nameSuffix : 'kun',
    chapter: 1,
    current_location: 'chapter1_village',
    player_level: playerLevel,
    experience: 0,
    currency: 0,
    unlocked_formations: [...unlockState.formationIds],
    unlocked_items: [...unlockState.itemIds],
    defeated_enemies: [],
    unlocked_books: [],
    opened_chests: [],
    completed_tutorials: [],
    quest_states: {},
    item_counts: defaultItemCounts(context.items, unlockState.itemIds),
    equipped_item: null,
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

  const chapter = requireInteger(value.chapter, 'chapter', 1, 7);
  let playerLevel;
  try {
    playerLevel = parsePlayerLevel(value.player_level);
  } catch (error) {
    throw new SaveDataError(error.message);
  }
  const unlockState = getUnlockState(context.levelUnlocks, playerLevel);
  const formationIds = new Set(context.formations.map((item) => item.formation_id));
  const itemIds = new Set(context.items.map((item) => item.item_id));
  const enemyIds = optionalAllowedIds(context, 'enemyIds', 'bossIds');
  const bookIds = optionalAllowedIds(context, 'bookIds');
  const chestIds = optionalAllowedIds(context, 'chestIds');
  const tutorialIds = optionalAllowedIds(context, 'tutorialIds');
  const questIds = optionalAllowedIds(context, 'questIds');
  const locationIds = optionalAllowedIds(context, 'locationIds');
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
  unlockState.formationIds.forEach((id) => unlockedFormations.add(id));
  unlockState.itemIds.forEach((id) => unlockedItems.add(id));

  const profileCreated = version >= 2 ? value.profile_created === true : false;
  const playerName = normalizePlayerName(value.player_name, profileCreated);
  const nameSuffix = value.name_suffix ?? 'kun';
  if (!NAME_SUFFIXES.has(nameSuffix)) {
    throw new SaveDataError(`name_suffixが不正です: ${String(nameSuffix)}`);
  }
  const equippedItem = value.equipped_item ?? null;
  if (equippedItem !== null
    && (!itemIds.has(equippedItem) || !unlockedItems.has(equippedItem))) {
    throw new SaveDataError(`equipped_itemが不正です: ${String(equippedItem)}`);
  }

  const updatedAt = value.updated_at === undefined
    ? (options.now || new Date()).toISOString()
    : value.updated_at;
  if (typeof updatedAt !== 'string' || Number.isNaN(Date.parse(updatedAt))) {
    throw new SaveDataError('updated_atは日時文字列にしてください');
  }

  return {
    version: SAVE_VERSION,
    profile_created: profileCreated,
    player_name: playerName,
    name_suffix: nameSuffix,
    chapter,
    current_location: normalizeCurrentLocation(value.current_location, locationIds),
    player_level: playerLevel,
    experience: requireInteger(value.experience ?? 0, 'experience', 0, MAX_PROGRESS_VALUE),
    currency: requireInteger(value.currency ?? 0, 'currency', 0, MAX_PROGRESS_VALUE),
    unlocked_formations: [...unlockedFormations],
    unlocked_items: [...unlockedItems],
    defeated_enemies: normalizeIdList(
      value.defeated_enemies ?? value.defeated_bosses,
      'defeated_enemies',
      enemyIds,
      [],
    ),
    unlocked_books: normalizeIdList(value.unlocked_books, 'unlocked_books', bookIds, []),
    opened_chests: normalizeIdList(value.opened_chests, 'opened_chests', chestIds, []),
    completed_tutorials: normalizeIdList(
      value.completed_tutorials,
      'completed_tutorials',
      tutorialIds,
      [],
    ),
    quest_states: normalizeQuestStates(value.quest_states, questIds),
    item_counts: normalizeItemCounts(
      value.item_counts,
      context.items,
      unlockState.itemIds,
      version < 1,
    ),
    equipped_item: equippedItem,
    difficulty: value.difficulty,
    updated_at: updatedAt,
  };
}

export function touchSaveState(state, now = new Date()) {
  return { ...state, version: SAVE_VERSION, updated_at: now.toISOString() };
}

/** 初回勝利した敵を、再読込や結果再送でも重複しない形で記録する。 */
export function recordDefeatedEnemy(state, enemyId) {
  if (typeof enemyId !== 'string' || enemyId.length === 0) {
    throw new SaveDataError('enemyIdは空でない文字列にしてください');
  }
  const defeated = state.defeated_enemies || [];
  if (defeated.includes(enemyId)) return state;
  return {
    ...state,
    defeated_enemies: [...defeated, enemyId],
  };
}

/** version 1の呼び出し元との互換用。 */
export function recordDefeatedBoss(state, bossId) {
  return recordDefeatedEnemy(state, bossId);
}
