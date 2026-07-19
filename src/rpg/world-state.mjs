import { getUnlockState } from '../board-ui/level-unlocks.mjs';
import { recordDefeatedEnemy } from '../save/save-state.mjs';

const ID_PATTERN = /^[a-z][a-z0-9_]*$/;
const MAX_ITEM_COUNT = 999;
const COURSE_NODE_TYPES = new Set(['start', 'encounter', 'chest']);
const COURSE_LINK_KINDS = new Set(['main', 'branch']);

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

function validateCourse(chapter, chapterIndex, globalNodeIds) {
  const label = `chapters[${chapterIndex}].course`;
  const course = chapter.course;
  if (!course || !Array.isArray(course.nodes) || !Array.isArray(course.links)) {
    throw new Error(`${label}が不正です`);
  }

  const encounterIds = new Set((chapter.encounters || []).map((entry) => entry.enemy_id));
  const chestIds = new Set((chapter.chests || []).map((entry) => entry.chest_id));
  const placedEncounters = new Set();
  const placedChests = new Set();
  const nodesById = new Map();
  let startNode = null;

  for (const [nodeIndex, node] of course.nodes.entries()) {
    requireId(node.node_id, `${label}.nodes[${nodeIndex}].node_id`);
    if (nodesById.has(node.node_id) || globalNodeIds.has(node.node_id)) {
      throw new Error(`コース地点IDが重複しています: ${node.node_id}`);
    }
    if (!COURSE_NODE_TYPES.has(node.type)
      || !Number.isFinite(node.x) || node.x < 0 || node.x > 100
      || !Number.isFinite(node.y) || node.y < 0 || node.y > 100) {
      throw new Error(`${node.node_id}のコース地点データが不正です`);
    }
    nodesById.set(node.node_id, node);
    globalNodeIds.add(node.node_id);

    if (node.type === 'start') {
      if (startNode || typeof node.label !== 'string' || !node.label.trim()) {
        throw new Error(`${label}の入口が不正です`);
      }
      startNode = node;
    } else if (node.type === 'encounter') {
      if (!encounterIds.has(node.enemy_id) || placedEncounters.has(node.enemy_id)) {
        throw new Error(`${node.node_id}の対局参照が不正です: ${String(node.enemy_id)}`);
      }
      placedEncounters.add(node.enemy_id);
    } else if (!chestIds.has(node.chest_id) || placedChests.has(node.chest_id)) {
      throw new Error(`${node.node_id}の宝箱参照が不正です: ${String(node.chest_id)}`);
    } else {
      placedChests.add(node.chest_id);
    }
  }

  if (!startNode || placedEncounters.size !== encounterIds.size
    || placedChests.size !== chestIds.size) {
    throw new Error(`${label}に未配置または重複した地点があります`);
  }

  const incoming = new Map(course.nodes.map((node) => [node.node_id, []]));
  const outgoing = new Map(course.nodes.map((node) => [node.node_id, []]));
  const linkKeys = new Set();
  for (const [linkIndex, link] of course.links.entries()) {
    const fromNode = nodesById.get(link.from);
    const toNode = nodesById.get(link.to);
    const linkKey = `${link.from}>${link.to}`;
    if (!fromNode || !toNode || fromNode === toNode || linkKeys.has(linkKey)
      || !COURSE_LINK_KINDS.has(link.kind)) {
      throw new Error(`${label}.links[${linkIndex}]が不正です`);
    }
    if (fromNode.type === 'chest'
      || (link.kind === 'main' && toNode.type !== 'encounter')
      || (link.kind === 'branch' && toNode.type !== 'chest')) {
      throw new Error(`${label}.links[${linkIndex}]の経路種別が不正です`);
    }
    linkKeys.add(linkKey);
    incoming.get(link.to).push(link);
    outgoing.get(link.from).push(link);
  }

  for (const node of course.nodes) {
    const inboundCount = incoming.get(node.node_id).length;
    if ((node === startNode && inboundCount !== 0) || (node !== startNode && inboundCount !== 1)) {
      throw new Error(`${node.node_id}への経路が不正です`);
    }
  }

  const visited = new Set();
  const visiting = new Set();
  function visit(nodeId) {
    if (visiting.has(nodeId)) throw new Error(`${label}に循環があります`);
    if (visited.has(nodeId)) return;
    visiting.add(nodeId);
    for (const link of outgoing.get(nodeId)) visit(link.to);
    visiting.delete(nodeId);
    visited.add(nodeId);
  }
  visit(startNode.node_id);
  if (visited.size !== course.nodes.length) throw new Error(`${label}に到達できない地点があります`);

  const mainEncounterIds = [];
  let current = startNode;
  while (true) {
    const mainLinks = outgoing.get(current.node_id).filter((link) => link.kind === 'main');
    if (mainLinks.length > 1) throw new Error(`${current.node_id}で本道が分岐しています`);
    if (!mainLinks.length) break;
    current = nodesById.get(mainLinks[0].to);
    mainEncounterIds.push(current.enemy_id);
  }
  if (mainEncounterIds.length !== encounterIds.size
    || mainEncounterIds.some((enemyId) => !encounterIds.has(enemyId))
    || mainEncounterIds.at(-1) !== chapter.boss_id) {
    throw new Error(`${label}の本道に全対局またはボスが正しく配置されていません`);
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
  const courseNodeIds = new Set();
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
    validateCourse(chapter, index, courseNodeIds);
  }
  if (encounterIds.size !== catalogs.enemies.length - Number(ids.enemies.has('training_partner'))) {
    throw new Error('world.jsonに未配置の敵がいます');
  }
  return { chapterIds, encounterIds, chestIds, questIds, courseNodeIds };
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

function courseMainPath(chapter) {
  const nodesById = new Map(chapter.course.nodes.map((node) => [node.node_id, node]));
  const outgoingMain = new Map(chapter.course.links
    .filter((link) => link.kind === 'main')
    .map((link) => [link.from, link.to]));
  const start = chapter.course.nodes.find((node) => node.type === 'start');
  const path = [start];
  let current = start;
  while (outgoingMain.has(current.node_id)) {
    current = nodesById.get(outgoingMain.get(current.node_id));
    path.push(current);
  }
  return path;
}

export function getCourseProgress(state, chapter) {
  const defeated = new Set(state.defeated_enemies || []);
  const openedChests = new Set(state.opened_chests || []);
  const cleared = new Map(chapter.course.nodes.map((node) => [
    node.node_id,
    node.type === 'start'
      || (node.type === 'encounter' && defeated.has(node.enemy_id))
      || (node.type === 'chest' && openedChests.has(node.chest_id)),
  ]));
  const incoming = new Map(chapter.course.links.map((link) => [link.to, link]));
  const mainPath = courseMainPath(chapter);
  const mainNodeIds = new Set(mainPath.map((node) => node.node_id));
  const mainUnlocked = new Map([[mainPath[0].node_id, true]]);
  let contiguousCleared = true;
  let markerNode = mainPath[0];
  let nextNode = null;

  for (const node of mainPath.slice(1)) {
    const isCleared = cleared.get(node.node_id);
    mainUnlocked.set(node.node_id, isCleared || contiguousCleared);
    if (contiguousCleared && isCleared) {
      markerNode = node;
    } else if (contiguousCleared) {
      nextNode = node;
      contiguousCleared = false;
    }
  }

  // 旧版でボスへ直行して既に章クリア済みの場合は、その達成だけを取り消さない。
  const bossNode = mainPath.at(-1);
  if (cleared.get(bossNode.node_id)) {
    markerNode = bossNode;
    nextNode = null;
  }

  const nodeStates = Object.fromEntries(chapter.course.nodes.map((node) => {
    const isCleared = cleared.get(node.node_id);
    const prerequisite = incoming.get(node.node_id);
    const unlocked = mainNodeIds.has(node.node_id)
      ? mainUnlocked.get(node.node_id)
      : isCleared || Boolean(prerequisite && cleared.get(prerequisite.from));
    return [node.node_id, { cleared: isCleared, unlocked }];
  }));
  return {
    nodeStates,
    markerNodeId: markerNode.node_id,
    nextNodeId: nextNode?.node_id || null,
  };
}

export function courseNodeIsAvailable(state, chapter, nodeId) {
  if (!chapter || chapter.number > state.chapter
    || chapter.chapter_id !== state.current_location) {
    return false;
  }
  return Boolean(getCourseProgress(state, chapter).nodeStates[nodeId]?.unlocked);
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
