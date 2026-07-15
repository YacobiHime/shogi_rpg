export const CAMPAIGN_SAVE_KEY = 'shogi_rpg_campaign';

export function validateCampaignMaster(value, enemyIds = null) {
  if (!value || typeof value !== 'object' || !Array.isArray(value.stages)
    || value.stages.length < 1 || !value.pieces || !value.initial_army) {
    throw new Error('本編マスタの必須項目が不足しています');
  }
  const stageIds = new Set();
  for (const stage of value.stages) {
    if (typeof stage.stage_id !== 'string' || stageIds.has(stage.stage_id)) {
      throw new Error(`戦IDが不正または重複しています: ${String(stage.stage_id)}`);
    }
    stageIds.add(stage.stage_id);
    if (enemyIds && !enemyIds.has(stage.enemy_id)) {
      throw new Error(`本編が未知の敵を参照しています: ${stage.enemy_id}`);
    }
    if (!Array.isArray(stage.intro) || !Array.isArray(stage.victory)
      || typeof stage.enemy_sfen_board !== 'string') {
      throw new Error(`戦の会話または局面が不正です: ${stage.stage_id}`);
    }
  }
  return value;
}

export function createCampaignState(master, profile) {
  return {
    version: 1,
    playerName: profile.playerName,
    difficulty: profile.difficulty,
    stage: 0,
    currency: master.initial_currency,
    army: { ...master.initial_army },
    friends: ['FU', 'KI', 'GI'],
    bond: { FU: 1, KI: 1, GI: 1 },
    aidUsedAtStage: {},
    completed: false,
  };
}

export function normalizeCampaignState(value, master) {
  if (!value || value.version !== 1) throw new Error('未対応の本編セーブです');
  if (typeof value.playerName !== 'string' || Array.from(value.playerName.trim()).length < 1
    || Array.from(value.playerName.trim()).length > 12) throw new Error('名前が不正です');
  if (!['easy', 'normal', 'hard'].includes(value.difficulty)) throw new Error('難易度が不正です');
  if (!Number.isInteger(value.stage) || value.stage < 0 || value.stage > master.stages.length) {
    throw new Error('進行段階が不正です');
  }
  const kinds = new Set(Object.keys(master.pieces));
  const army = {};
  for (const kind of kinds) {
    const count = value.army?.[kind] || 0;
    if (!Number.isInteger(count) || count < 0 || count > 40) throw new Error('軍勢が不正です');
    army[kind] = count;
  }
  if (army.OU !== 1) throw new Error('玉将が見つかりません');
  return {
    ...value,
    playerName: value.playerName.trim(),
    army,
    friends: [...new Set((value.friends || []).filter((kind) => kinds.has(kind)))],
    bond: { ...(value.bond || {}) },
    aidUsedAtStage: { ...(value.aidUsedAtStage || {}) },
    completed: value.completed === true,
  };
}

export function loadCampaignState(storage, master) {
  const text = storage.getItem(CAMPAIGN_SAVE_KEY);
  if (!text) return null;
  return normalizeCampaignState(JSON.parse(text), master);
}

export function saveCampaignState(storage, state) {
  storage.setItem(CAMPAIGN_SAVE_KEY, JSON.stringify(state));
  return state;
}

export function hirePiece(state, master, kind) {
  const piece = master.pieces[kind];
  if (!piece || kind === 'OU') throw new Error('雇えない駒です');
  if (state.currency < piece.cost) throw new Error('棋貨が足りません');
  return {
    ...state,
    currency: state.currency - piece.cost,
    army: { ...state.army, [kind]: (state.army[kind] || 0) + 1 },
  };
}

export function callFriend(state, kind) {
  if (!state.friends.includes(kind)) throw new Error('まだ縁を結んでいない駒です');
  const key = String(state.stage);
  if (state.aidUsedAtStage[key]) throw new Error('この戦ではすでに援軍を呼びました');
  return {
    ...state,
    army: { ...state.army, [kind]: (state.army[kind] || 0) + 1 },
    aidUsedAtStage: { ...state.aidUsedAtStage, [key]: kind },
  };
}

export function completeStage(state, master, survivingArmy) {
  const stage = master.stages[state.stage];
  if (!stage) throw new Error('完了できる戦がありません');
  const friends = new Set(state.friends);
  friends.add(stage.friend);
  const army = { ...survivingArmy };
  army[stage.friend] = (army[stage.friend] || 0) + 1;
  const nextStage = state.stage + 1;
  const bond = { ...state.bond };
  for (const [kind, count] of Object.entries(army)) {
    if (kind !== 'OU' && count > 0) bond[kind] = Math.min(5, (bond[kind] || 0) + 1);
  }
  return {
    ...state,
    stage: nextStage,
    currency: state.currency + stage.reward_currency,
    army,
    friends: [...friends],
    bond,
    completed: nextStage >= master.stages.length,
  };
}
