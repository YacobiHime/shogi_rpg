import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  buildBattleSfen,
  createDefaultPlacements,
  extractPlayerArmy,
} from '../../campaign/sfen-army.mjs';
import {
  callFriend,
  completeStage,
  createCampaignState,
  hirePiece,
  validateCampaignMaster,
} from '../../campaign/campaign-state.mjs';

const master = {
  initial_currency: 8,
  initial_army: { OU: 1, KI: 1, GI: 1, FU: 5 },
  pieces: {
    OU: { cost: 0 }, FU: { cost: 1 }, KY: { cost: 2 }, KE: { cost: 3 },
    GI: { cost: 3 }, KI: { cost: 4 }, KA: { cost: 6 }, HI: { cost: 7 },
  },
  stages: [{ friend: 'KE', reward_currency: 5 }],
};

test('軍勢を自陣へ配置し、残りを持ち駒にしたSFENを作る', () => {
  const army = { OU: 1, KI: 1, GI: 1, FU: 3 };
  const placements = { '5i': 'OU', '6i': 'KI', '5g': 'FU' };
  const sfen = buildBattleSfen('4k4/3g5/4p4/9/9/9/9/9/9', placements, army);
  assert.equal(sfen, '4k4/3g5/4p4/9/9/9/4P4/9/3GK4 b S2P 1');
});

test('二歩、玉未配置、自陣外配置を拒否する', () => {
  const enemy = '4k4/9/9/9/9/9/9/9/9';
  const army = { OU: 1, FU: 2 };
  assert.throws(() => buildBattleSfen(enemy, { '5i': 'OU', '5g': 'FU', '5h': 'FU' }, army), /同じ筋/);
  assert.throws(() => buildBattleSfen(enemy, { '5g': 'FU' }, army), /玉将/);
  assert.throws(() => buildBattleSfen(enemy, { '5i': 'OU', '4f': 'FU' }, army), /自陣三段/);
});

test('終局SFENから残った味方と鹵獲した持ち駒を数える', () => {
  const army = extractPlayerArmy('4k4/9/9/9/9/9/4P4/9/4K4 b B2S 42');
  assert.equal(army.OU, 1);
  assert.equal(army.FU, 1);
  assert.equal(army.KA, 1);
  assert.equal(army.GI, 2);
});

test('棋貨雇用、友軍要請、勝利加入を進行へ反映する', () => {
  let state = createCampaignState(master, { playerName: '主', difficulty: 'normal' });
  state = hirePiece(state, master, 'FU');
  assert.equal(state.currency, 7);
  assert.equal(state.army.FU, 6);
  state = callFriend(state, 'GI');
  assert.equal(state.army.GI, 2);
  assert.throws(() => callFriend(state, 'FU'), /すでに援軍/);
  state = completeStage(state, master, { OU: 1, KI: 1, GI: 1, FU: 4 });
  assert.equal(state.stage, 1);
  assert.equal(state.army.KE, 1);
  assert.ok(state.friends.includes('KE'));
});

test('おすすめ配置は玉を必ず盤上へ置く', () => {
  const placements = createDefaultPlacements(master.initial_army);
  assert.equal(placements['5i'], 'OU');
});

test('本編マスタは重複戦と未知の敵参照を拒否する', async () => {
  const campaign = JSON.parse(await readFile(
    new URL('../../../data/campaign.json', import.meta.url), 'utf8'
  ));
  const enemies = JSON.parse(await readFile(
    new URL('../../../data/enemies.json', import.meta.url), 'utf8'
  ));
  assert.equal(validateCampaignMaster(
    campaign, new Set(enemies.map((enemy) => enemy.enemy_id))
  ).stages.length, 3);
  assert.throws(() => validateCampaignMaster({
    ...campaign, stages: [campaign.stages[0], campaign.stages[0]],
  }), /重複/);
  assert.throws(() => validateCampaignMaster({
    ...campaign, stages: [{ ...campaign.stages[0], enemy_id: 'missing' }],
  }, new Set()), /未知の敵/);
});
