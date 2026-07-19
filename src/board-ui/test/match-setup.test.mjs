import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  buildMatchSearch,
  getAvailableFormations,
  loadMatchSetupOptions,
  resolveMatchSelection,
} from '../match-setup.mjs';

const dataUrl = new URL('../../../data/', import.meta.url);
const indexUrl = new URL('../index.html', import.meta.url);
const mainUrl = new URL('../main.js', import.meta.url);

function createMasterFetch(url) {
  const fileName = String(url).split('/').at(-1);
  return readFile(new URL(fileName, dataUrl), 'utf8').then((body) => ({
    ok: true,
    json: async () => JSON.parse(body),
  }));
}

test('準備画面用の敵・戦形・難易度・アイテム一覧を読み込める', async () => {
  const options = await loadMatchSetupOptions({ fetchImpl: createMasterFetch });

  assert.equal(options.enemies[0].name, '稽古相手');
  assert.equal(options.formations[0].name, '平手');
  assert.deepEqual(options.enemyOpeningBooks.map((book) => book.name), [
    '後手棒銀',
    '後手四間飛車＋美濃囲い',
    '後手角道を止める四間飛車',
    '後手角換わり',
    '後手横歩取り',
    '後手相掛かり',
    '後手居飛車',
    '後手四間飛車穴熊',
  ]);
  assert.deepEqual(options.formationCallouts.callouts.map((item) => item.name), [
    '棒銀', '金矢倉囲い', '右四間飛車',
  ]);
  assert.deepEqual(options.difficulties.map((item) => item.name), [
    'やさしい', 'ふつう', 'むずかしい',
  ]);
  assert.equal(options.items[0].name, '読み筋封じ');
  assert.equal(options.levelUnlocks[0].level, 1);

  const themed = resolveMatchSelection(options, {
    enemyId: 'ch3_minori',
    formationId: 'standard',
    difficultyId: 'normal',
    playerLevel: 1,
    unlockedFormationIds: new Set(['standard']),
  });
  assert.equal(themed.openingBook.book_id, 'white_shiken_mino');
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
  assert.deepEqual(getAvailableFormations(
    { allowed_openings: ['standard', 'another'] },
    formations,
    new Set(['standard'])
  ), [{ formation_id: 'standard' }]);
});

test('URLで直接指定された未解禁の戦形とスキルを拒否する', () => {
  const options = {
    enemies: [{ enemy_id: 'enemy', name: '敵', allowed_openings: ['standard', 'advanced'] }],
    formations: [
      { formation_id: 'standard', name: '平手' },
      { formation_id: 'advanced', name: '上級戦形' },
    ],
    difficulties: [{ difficulty_id: 'normal' }],
    items: [{
      item_id: 'advanced_skill', name: '上級スキル',
      type: 'enemy_debuff_nodes', consumable: false,
    }],
    levelUnlocks: [
      { level: 1, unlocks: {
        formations: ['standard'], items: [],
        skill_upgrades: { undo_max: 0, hint_max: 0 },
      } },
      { level: 2, unlocks: {
        formations: ['advanced'], items: ['advanced_skill'],
        skill_upgrades: { undo_max: 0, hint_max: 0 },
      } },
    ],
  };
  const selection = {
    enemyId: 'enemy', formationId: 'advanced', difficultyId: 'normal', playerLevel: 1,
  };
  assert.throws(() => resolveMatchSelection(options, selection), /未解禁/);
  assert.throws(() => resolveMatchSelection(options, {
    ...selection, formationId: 'standard', itemId: 'advanced_skill',
  }), /未解禁/);

  const resolved = resolveMatchSelection(options, {
    ...selection, playerLevel: 2, itemId: 'advanced_skill',
  });
  assert.equal(resolved.formation.formation_id, 'advanced');
  assert.equal(resolved.equippedItem.item_id, 'advanced_skill');

  const restoredUnlock = resolveMatchSelection(options, {
    ...selection,
    unlockedFormationIds: new Set(['standard', 'advanced']),
    unlockedItemIds: new Set(['advanced_skill']),
    itemId: 'advanced_skill',
  });
  assert.equal(restoredUnlock.formation.formation_id, 'advanced');
});

test('選択内容を既存形式の対局URLクエリへ変換する', () => {
  assert.equal(buildMatchSearch({
    enemyId: 'training_partner',
    formationId: 'standard',
    difficultyId: 'normal',
  }), '?enemy=training_partner&formation=standard&difficulty=normal');

  assert.equal(buildMatchSearch({
    enemyId: 'training_partner',
    formationId: 'standard',
    difficultyId: 'normal',
    itemId: 'node_limit_half',
  }), '?enemy=training_partner&formation=standard&difficulty=normal&item=node_limit_half');

});

test('装備棋具を探索量・候補ランクへ反映し、消費棋具を1個使う', async () => {
  const [html, source] = await Promise.all([
    readFile(indexUrl, 'utf8'),
    readFile(mainUrl, 'utf8'),
  ]);

  assert.match(html, /id="setup-item"/);
  assert.match(source, /itemId: setupItem\.value/);
  assert.match(source, /difficulty\.node_limit_mult \* nodeDebuffMultiplier/);
  assert.match(source, /difficulty\.move_rank_max_bonus \+ moveRankDebuff/);
  assert.match(source, /equippedItem\?\.consumable/);
  assert.match(source, /\[equippedItem\.item_id\]: remaining/);
  assert.match(source, /resolveMatchSelection\(options/);
  assert.match(source, /getEnemyOpeningDecision\(/);
  assert.match(source, /openingDecision\.moves/);
  assert.match(source, /playerLevel/);
});

test('標準定跡DBを読み込み、村固有の戦法がある対局では敵専用定跡を優先する', async () => {
  const source = await readFile(mainUrl, 'utf8');
  assert.match(source, /assets\/books\/standard_book\.db/);
  assert.match(source, /bookVirtualPath: STANDARD_BOOK_VIRTUAL_PATH/);
  assert.match(source, /engine\.enablePreloadedBook\(\)/);
  assert.match(source, /if \(openingBook\) engine\.disableOwnBook\(\)/);
  assert.match(source, /戦法定跡DB/);
  assert.match(source, /openingDecision\.status === 'active'/);
});

test('ヒントは敵の強さと切り離して上位3手を固定探索する', async () => {
  const source = await readFile(mainUrl, 'utf8');
  assert.match(source, /const HINT_NODE_LIMIT = 50_000/);
  assert.match(source, /const HINT_MAX_TIME_MS = 3_000/);
  assert.match(source, /const HINT_MULTI_PV = 3/);
  assert.match(source, /getHintMoves\(searchResult, HINT_MULTI_PV\)/);
  assert.match(source, /formatHintMove\(move, currentSfen\)/);
});
