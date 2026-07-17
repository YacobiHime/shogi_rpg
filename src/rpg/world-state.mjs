import { getUnlockState } from '../board-ui/level-unlocks.mjs';
import { recordDefeatedEnemy } from '../save/save-state.mjs';

const ID_PATTERN = /^[a-z][a-z0-9_]*$/;
const MAX_ITEM_COUNT = 999;

function requireId(value, label) {
  if (typeof value !== 'string' || !ID_PATTERN.test(value)) {
    throw new Error(`${label}が不正です: ${String(value)}`);
  }
  return value;
}

function addUnique(list, values = []) {
  return [...new Set([...(list || []), ...values])];
}

function validateReward(reward, ids, label) {
  if (!reward || typeof reward !== 'object' || Array.isArray(reward)) {
    throw new Error(`${label}.rewardが不正です`);
  }
  for (const field of ['experience', 'currency']) {
    if (reward[field] !== undefined
      && (!Number.isInteger(reward[field]) || reward[field] < 0)) {
      throw new Error(`${label}.reward.${field}が不正です`);
    }
  }
  for (const bookId of reward.books || []) {
    if (!ids.books.has(bookId)) throw new Error(`${label}が未知の定跡書を参照しています: ${bookId}`);
  }
  for (const [itemId, count] of Object.entries(reward.items || {})) {
    if (!ids.items.has(itemId) || !Number.isInteger(count) || count < 1) {
      throw new Error(`${label}のアイテム報酬が不正です: ${itemId}`);
    }
  }
}

export function validateWorldMaster(world, catalogs) {
  if (!world || world.version !== 1 || typeof world.title !== 'string') {
    throw new Error('world.jsonの基本情報が不正です');
  }
  const ids = {
    enemies: new Set(catalogs.enemies.map((entry) => entry.enemy_id)),
    items: new Set(catalogs.items.map((entry) => entry.item_id)),
    books: new Set(catalogs.books.map((entry) => entry.book_id)),
  };
  if (!Array.isArray(world.level_curve) || world.level_curve.length === 0) {
    throw new Error('level_curveが空です');
  }
  let previousExperience = -1;
  world.level_curve.forEach((entry, index) => {
    if (entry.level !== index + 1 || !Number.isInteger(entry.total_experience)
      || entry.total_experience <= previousExperience) {
      throw new Error(`level_curve[${index}]が不正です`);
    }
    previousExperience = entry.total_experience;
  });

  const chapterIds = new Set();
  const encounterIds = new Set();
  const chestIds = new Set();
  const questIds = new Set();
  for (const [index, chapter] of world.chapters.entries()) {
    requireId(chapter.chapter_id, `chapters[${index}].chapter_id`);
    if (chapterIds.has(chapter.chapter_id) || chapter.number !== index + 1) {
      throw new Error(`章IDまたは章番号が重複しています: ${chapter.chapter_id}`);
    }
    chapterIds.add(chapter.chapter_id);
    if (!ids.enemies.has(chapter.boss_id)) throw new Error(`未知のボスです: ${chapter.boss_id}`);
    for (const bookId of chapter.guide_books || []) {
      if (!ids.books.has(bookId)) throw new Error(`未知の案内書です: ${bookId}`);
    }
    for (const encounter of chapter.encounters || []) {
      if (!ids.enemies.has(encounter.enemy_id) || encounterIds.has(encounter.enemy_id)) {
        throw new Error(`敵参照が不正または重複しています: ${encounter.enemy_id}`);
      }
      encounterIds.add(encounter.enemy_id);
      if (encounter.guide_id && !ids.books.has(encounter.guide_id)) {
        throw new Error(`未知の対局ガイドです: ${encounter.guide_id}`);
      }
      validateReward(encounter.reward, ids, encounter.enemy_id);
    }
    const boss = chapter.encounters.find((entry) => entry.enemy_id === chapter.boss_id);
    if (!boss?.boss) throw new Error(`${chapter.chapter_id}のボス戦がありません`);
    for (const chest of chapter.chests || []) {
      requireId(chest.chest_id, 'chest_id');
      if (chestIds.has(chest.chest_id)) throw new Error(`宝箱IDが重複しています: ${chest.chest_id}`);
      chestIds.add(chest.chest_id);
      validateReward(chest.reward, ids, chest.chest_id);
    }
    for (const quest of chapter.quests || []) {
      requireId(quest.quest_id, 'quest_id');
      if (questIds.has(quest.quest_id)) throw new Error(`クエストIDが重複しています: ${quest.quest_id}`);
      questIds.add(quest.quest_id);
      const requirements = [
        quest.requires_enemy_id,
        ...(quest.requires_enemy_ids || []),
        ...(quest.requires_any_enemy_ids || []),
      ].filter(Boolean);
      if (!requirements.length || requirements.some((id) => !ids.enemies.has(id))) {
        throw new Error(`${quest.quest_id}の達成条件が不正です`);
      }
      validateReward(quest.reward, ids, quest.quest_id);
    }
    for (const shopItem of chapter.shop || []) {
      if (!ids.items.has(shopItem.item_id) || !Number.isInteger(shopItem.price)
        || shopItem.price < 1) {
        throw new Error(`${chapter.chapter_id}の店データが不正です`);
      }
    }
  }
  if (encounterIds.size !== catalogs.enemies.length - Number(ids.enemies.has('training_partner'))) {
    throw new Error('world.jsonに未配置の敵がいます');
  }
  return { chapterIds, encounterIds, chestIds, questIds };
}

export function validateBooksMaster(books) {
  const ids = new Set();
  for (const book of books) {
    requireId(book.book_id, 'book_id');
    if (ids.has(book.book_id)) throw new Error(`定跡書IDが重複しています: ${book.book_id}`);
    ids.add(book.book_id);
    if (!book.title || !book.summary || !Array.isArray(book.steps) || !book.steps.length) {
      throw new Error(`${book.book_id}の内容が不足しています`);
    }
    for (const step of book.steps) {
      if (typeof step.move !== 'string' || !step.title || !step.text
        || !Array.isArray(step.highlights)) {
        throw new Error(`${book.book_id}の手順が不正です`);
      }
    }
  }
  return ids;
}

export function buildSaveContext(catalogs, validation) {
  return {
    formations: catalogs.formations,
    items: catalogs.items,
    levelUnlocks: catalogs.levelUnlocks,
    difficultyIds: catalogs.difficulties.map((entry) => entry.difficulty_id),
    enemyIds: catalogs.enemies.map((entry) => entry.enemy_id),
    bookIds: catalogs.books.map((entry) => entry.book_id),
    chestIds: [...validation.chestIds],
    questIds: [...validation.questIds],
    locationIds: [...validation.chapterIds],
    tutorialIds: [],
  };
}

export function levelForExperience(levelCurve, experience) {
  let level = 1;
  for (const entry of levelCurve) {
    if (experience < entry.total_experience) break;
    level = entry.level;
  }
  return level;
}

export function createProfile(state, { playerName, nameSuffix, difficulty }) {
  const name = String(playerName || '').trim();
  if (!name || Array.from(name).length > 12) throw new Error('名前は1〜12文字で入力してください');
  if (!['kun', 'chan'].includes(nameSuffix)) throw new Error('呼び方が不正です');
  return {
    ...state,
    profile_created: true,
    player_name: name,
    name_suffix: nameSuffix,
    difficulty,
  };
}

function applyReward(state, reward, progression) {
  const experience = state.experience + (reward.experience || 0);
  const playerLevel = levelForExperience(progression.world.level_curve, experience);
  const unlocks = getUnlockState(progression.levelUnlocks, playerLevel);
  const itemCounts = { ...state.item_counts };
  for (const [itemId, count] of Object.entries(reward.items || {})) {
    itemCounts[itemId] = Math.min(MAX_ITEM_COUNT, (itemCounts[itemId] || 0) + count);
  }
  for (const itemId of unlocks.itemIds) {
    const item = progression.items.find((entry) => entry.item_id === itemId);
    if (item?.consumable && itemCounts[itemId] === undefined) itemCounts[itemId] = 0;
  }
  return {
    ...state,
    experience,
    player_level: playerLevel,
    currency: state.currency + (reward.currency || 0),
    unlocked_formations: addUnique(state.unlocked_formations, unlocks.formationIds),
    unlocked_items: addUnique(state.unlocked_items, unlocks.itemIds),
    unlocked_books: addUnique(state.unlocked_books, reward.books),
    item_counts: itemCounts,
  };
}

export function applyEncounterVictory(state, chapter, encounter, progression, options = {}) {
  const firstVictory = options.firstVictory
    ?? !state.defeated_enemies.includes(encounter.enemy_id);
  let next = firstVictory
    ? applyReward(recordDefeatedEnemy(state, encounter.enemy_id), encounter.reward, progression)
    : { ...state, currency: state.currency + progression.world.repeat_victory_currency };
  let chapterCompleted = false;
  if (encounter.enemy_id === chapter.boss_id && firstVictory) {
    chapterCompleted = true;
    const nextChapter = progression.world.chapters[chapter.number];
    if (nextChapter) {
      next = {
        ...next,
        chapter: nextChapter.number,
        current_location: nextChapter.chapter_id,
      };
    }
  }
  return { state: next, firstVictory, chapterCompleted };
}

export function reconcileChapterProgress(state, world) {
  const defeated = new Set(state.defeated_enemies);
  const unlockedChapter = world.chapters.reduce((latest, chapter, index) => {
    if (!defeated.has(chapter.boss_id)) return latest;
    return Math.max(latest, Math.min(index + 2, world.chapters.length));
  }, 1);
  if (state.chapter >= unlockedChapter) return state;
  return { ...state, chapter: unlockedChapter };
}

export function openChest(state, chest, progression) {
  if (state.opened_chests.includes(chest.chest_id)) throw new Error('この宝箱は開封済みです');
  const rewarded = applyReward(state, chest.reward, progression);
  return { ...rewarded, opened_chests: [...rewarded.opened_chests, chest.chest_id] };
}

export function questIsReady(state, quest) {
  const defeated = new Set(state.defeated_enemies);
  if (quest.requires_enemy_id) return defeated.has(quest.requires_enemy_id);
  if (quest.requires_enemy_ids) return quest.requires_enemy_ids.every((id) => defeated.has(id));
  return (quest.requires_any_enemy_ids || []).some((id) => defeated.has(id));
}

export function claimQuest(state, quest, progression) {
  if (state.quest_states[quest.quest_id] === 'completed') throw new Error('達成済みです');
  if (!questIsReady(state, quest)) throw new Error('まだ達成条件を満たしていません');
  const rewarded = applyReward(state, quest.reward, progression);
  return {
    ...rewarded,
    quest_states: { ...rewarded.quest_states, [quest.quest_id]: 'completed' },
  };
}

export function buyShopItem(state, offer, item) {
  if (!item?.consumable) throw new Error('購入できない品です');
  if (state.currency < offer.price) throw new Error('棋貨が足りません');
  if ((state.item_counts[offer.item_id] || 0) >= MAX_ITEM_COUNT) {
    throw new Error('これ以上持てません');
  }
  return {
    ...state,
    currency: state.currency - offer.price,
    item_counts: {
      ...state.item_counts,
      [offer.item_id]: (state.item_counts[offer.item_id] || 0) + 1,
    },
  };
}

export function playerDisplayName(state) {
  const suffix = state.name_suffix === 'chan' ? 'ちゃん' : 'くん';
  return `${state.player_name}${suffix}`;
}
