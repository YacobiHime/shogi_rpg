import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  applyEncounterVictory,
  buyShopItem,
  claimQuest,
  courseNodeIsAvailable,
  getCourseProgress,
  levelForExperience,
  openChest,
  questIsReady,
  reconcileChapterProgress,
  validateBooksMaster,
  validateWorldMaster,
} from '../../rpg/world-state.mjs';

const dataUrl = new URL('../../../data/', import.meta.url);

async function load(name) {
  return JSON.parse(await readFile(new URL(name, dataUrl), 'utf8'));
}

test('7村、全敵、定跡書、報酬の参照が整合する', async () => {
  const [world, enemies, items, books] = await Promise.all([
    load('world.json'), load('enemies.json'), load('items.json'), load('books.json'),
  ]);
  assert.equal(validateBooksMaster(books).size, 13);
  const result = validateWorldMaster(world, { enemies, items, books });
  assert.equal(result.chapterIds.size, 7);
  assert.equal(result.encounterIds.size, 25);
  assert.equal(result.courseNodeIds.size, 41);
});

test('コースに未知の接続先がある場合はマスタ検証で拒否する', async () => {
  const [worldMaster, enemies, items, books] = await Promise.all([
    load('world.json'), load('enemies.json'), load('items.json'), load('books.json'),
  ]);
  worldMaster.chapters[0].course.links[0].to = 'missing_node';
  assert.throws(
    () => validateWorldMaster(worldMaster, { enemies, items, books }),
    /course\.links\[0\]/,
  );
});

const world = {
  repeat_victory_currency: 5,
  level_curve: [
    { level: 1, total_experience: 0 },
    { level: 2, total_experience: 50 },
  ],
  chapters: [{ number: 1 }, { number: 2, chapter_id: 'chapter2_village' }],
};
const progression = {
  world,
  items: [{ item_id: 'hint_ticket', consumable: true }],
  levelUnlocks: [
    { level: 1, unlocks: { formations: ['standard'], items: ['hint_ticket'], skill_upgrades: { undo_max: 0, hint_max: 0 } } },
    { level: 2, unlocks: { formations: ['mino'], items: [], skill_upgrades: { undo_max: 0, hint_max: 0 } } },
  ],
};
const base = {
  chapter: 1,
  current_location: 'chapter1_village',
  experience: 0,
  player_level: 1,
  currency: 10,
  defeated_enemies: [],
  unlocked_formations: ['standard'],
  unlocked_items: ['hint_ticket'],
  unlocked_books: [],
  opened_chests: [],
  quest_states: {},
  item_counts: { hint_ticket: 0 },
};

const courseChapter = {
  boss_id: 'boss1',
  course: {
    nodes: [
      { node_id: 'start', type: 'start' },
      { node_id: 'enemy1_node', type: 'encounter', enemy_id: 'enemy1' },
      { node_id: 'chest1_node', type: 'chest', chest_id: 'chest1' },
      { node_id: 'enemy2_node', type: 'encounter', enemy_id: 'enemy2' },
      { node_id: 'boss1_node', type: 'encounter', enemy_id: 'boss1' },
    ],
    links: [
      { from: 'start', to: 'enemy1_node', kind: 'main' },
      { from: 'enemy1_node', to: 'chest1_node', kind: 'branch' },
      { from: 'enemy1_node', to: 'enemy2_node', kind: 'main' },
      { from: 'enemy2_node', to: 'boss1_node', kind: 'main' },
    ],
  },
};

test('本道は敵への勝利で順次解禁し、宝箱の寄り道はボス解禁を妨げない', () => {
  const fresh = getCourseProgress(base, courseChapter);
  assert.deepEqual(fresh.nodeStates.start, { cleared: true, unlocked: true });
  assert.equal(fresh.nodeStates.enemy1_node.unlocked, true);
  assert.equal(fresh.nodeStates.enemy2_node.unlocked, false);
  assert.equal(fresh.nodeStates.chest1_node.unlocked, false);
  assert.equal(fresh.nodeStates.boss1_node.unlocked, false);
  assert.equal(fresh.markerNodeId, 'start');
  assert.equal(fresh.nextNodeId, 'enemy1_node');

  const firstWon = getCourseProgress(
    { ...base, defeated_enemies: ['enemy1'] },
    courseChapter,
  );
  assert.equal(firstWon.nodeStates.enemy2_node.unlocked, true);
  assert.equal(firstWon.nodeStates.chest1_node.unlocked, true);
  assert.equal(firstWon.nodeStates.boss1_node.unlocked, false);
  assert.equal(firstWon.markerNodeId, 'enemy1_node');
  assert.equal(firstWon.nextNodeId, 'enemy2_node');

  const chestSkipped = getCourseProgress(
    { ...base, defeated_enemies: ['enemy1', 'enemy2'] },
    courseChapter,
  );
  assert.equal(chestSkipped.nodeStates.chest1_node.cleared, false);
  assert.equal(chestSkipped.nodeStates.boss1_node.unlocked, true);
  assert.equal(chestSkipped.markerNodeId, 'enemy2_node');
  assert.equal(chestSkipped.nextNodeId, 'boss1_node');
});

test('旧セーブの順不同な撃破実績は残しつつ、未撃破の本道を飛ばせない', () => {
  const legacy = getCourseProgress(
    { ...base, defeated_enemies: ['enemy2'] },
    courseChapter,
  );
  assert.equal(legacy.nodeStates.enemy1_node.unlocked, true);
  assert.equal(legacy.nodeStates.enemy2_node.cleared, true);
  assert.equal(legacy.nodeStates.enemy2_node.unlocked, true);
  assert.equal(legacy.nodeStates.boss1_node.unlocked, false);
  assert.equal(legacy.markerNodeId, 'start');
  assert.equal(legacy.nextNodeId, 'enemy1_node');
});

test('旧版で撃破済みのボスは章クリア実績として維持する', () => {
  const legacyComplete = getCourseProgress(
    { ...base, defeated_enemies: ['boss1'] },
    courseChapter,
  );
  assert.equal(legacyComplete.nodeStates.boss1_node.cleared, true);
  assert.equal(legacyComplete.markerNodeId, 'boss1_node');
  assert.equal(legacyComplete.nextNodeId, null);
});

test('コース地点は表示中かつ解禁済みの村でのみ実行できる', () => {
  const visibleState = {
    ...base,
    chapter: 1,
    current_location: 'chapter1_village',
  };
  const chapter = { ...courseChapter, chapter_id: 'chapter1_village', number: 1 };
  assert.equal(courseNodeIsAvailable(visibleState, chapter, 'enemy1_node'), true);
  assert.equal(courseNodeIsAvailable(
    { ...visibleState, current_location: 'chapter2_village' }, chapter, 'enemy1_node'
  ), false);
  assert.equal(courseNodeIsAvailable(
    visibleState, { ...chapter, chapter_id: 'chapter2_village', number: 2 }, 'enemy1_node'
  ), false);
  assert.equal(courseNodeIsAvailable(visibleState, chapter, 'boss1_node'), false);
});

test('初回勝利だけ報酬と章進行を適用し、再戦は棋貨だけを与える', () => {
  const chapter = { number: 1, boss_id: 'boss1' };
  const encounter = {
    enemy_id: 'boss1',
    reward: { experience: 60, currency: 20, books: ['bogin'], items: { hint_ticket: 1 } },
  };
  const won = applyEncounterVictory(base, chapter, encounter, progression);
  assert.equal(won.state.player_level, 2);
  assert.equal(won.state.chapter, 2);
  assert.equal(won.state.currency, 30);
  assert.deepEqual(won.state.unlocked_books, ['bogin']);
  assert.deepEqual(won.state.unlocked_formations, ['standard', 'mino']);

  const replay = applyEncounterVictory(won.state, chapter, encounter, progression);
  assert.equal(replay.firstVictory, false);
  assert.equal(replay.state.currency, 35);
  assert.equal(replay.state.experience, 60);
});

test('埋め込み対局側が先に撃破済みを保存しても初回報酬と章進行を適用する', () => {
  const chapter = { number: 1, boss_id: 'boss1' };
  const encounter = {
    enemy_id: 'boss1',
    reward: { experience: 60, currency: 20, books: ['bogin'] },
  };
  const savedByMatchFrame = { ...base, defeated_enemies: ['boss1'] };
  const won = applyEncounterVictory(
    savedByMatchFrame,
    chapter,
    encounter,
    progression,
    { firstVictory: true },
  );

  assert.equal(won.firstVictory, true);
  assert.equal(won.chapterCompleted, true);
  assert.equal(won.state.chapter, 2);
  assert.equal(won.state.current_location, 'chapter2_village');
  assert.equal(won.state.experience, 60);
  assert.equal(won.state.currency, 30);
  assert.deepEqual(won.state.defeated_enemies, ['boss1']);
});

test('撃破済みボスだけ保存された既存データから次章解禁を復旧する', () => {
  const chapters = [
    { boss_id: 'boss1' },
    { boss_id: 'boss2' },
    { boss_id: 'boss3' },
  ];
  const stuck = { ...base, defeated_enemies: ['boss1'] };
  const repaired = reconcileChapterProgress(stuck, { chapters });

  assert.equal(repaired.chapter, 2);
  assert.equal(repaired.current_location, 'chapter1_village');
  assert.equal(reconcileChapterProgress(repaired, { chapters }), repaired);
});

test('宝箱、クエスト、店は二重取得と不足棋貨を防ぐ', () => {
  const chest = { chest_id: 'chest1', reward: { currency: 15 } };
  const opened = openChest(base, chest, progression);
  assert.equal(opened.currency, 25);
  assert.throws(() => openChest(opened, chest, progression), /開封済み/);

  const quest = { quest_id: 'quest1', requires_enemy_id: 'friend1', reward: { currency: 8 } };
  assert.equal(questIsReady(base, quest), false);
  const ready = { ...base, defeated_enemies: ['friend1'] };
  const claimed = claimQuest(ready, quest, progression);
  assert.equal(claimed.quest_states.quest1, 'completed');
  assert.throws(() => claimQuest(claimed, quest, progression), /達成済み/);

  const bought = buyShopItem(base, { item_id: 'hint_ticket', price: 6 }, progression.items[0]);
  assert.equal(bought.currency, 4);
  assert.equal(bought.item_counts.hint_ticket, 1);
  assert.throws(() => buyShopItem(bought, { item_id: 'hint_ticket', price: 6 }, progression.items[0]), /足りません/);
  assert.throws(() => buyShopItem(
    { ...base, currency: 100, item_counts: { hint_ticket: 999 } },
    { item_id: 'hint_ticket', price: 6 },
    progression.items[0],
  ), /これ以上/);
});

test('経験値曲線から現在レベルを求める', () => {
  assert.equal(levelForExperience(world.level_curve, 49), 1);
  assert.equal(levelForExperience(world.level_curve, 50), 2);
});
