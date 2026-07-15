import { DIFFICULTY_NAMES, validateDifficulties } from './difficulty.mjs';
import { validateEnemies } from './enemies.mjs';
import { validateFormations } from './formations.mjs';
import { validateItems } from './items.mjs';
import { getUnlockState, validateLevelUnlocks } from './level-unlocks.mjs';

/**
 * 準備画面で使用する敵・戦形・難易度の一覧を取得する。
 * @param {{ fetchImpl?: typeof fetch, enemiesUrl?: string, formationsUrl?: string, difficultyUrl?: string, itemsUrl?: string, levelUnlocksUrl?: string }} [options]
 */
export async function loadMatchSetupOptions(options = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  const [enemyResponse, formationResponse, difficultyResponse, itemsResponse, levelUnlocksResponse] = await Promise.all([
    fetchImpl(options.enemiesUrl || '../../data/enemies.json'),
    fetchImpl(options.formationsUrl || '../../data/formations.json'),
    fetchImpl(options.difficultyUrl || '../../data/difficulty.json'),
    fetchImpl(options.itemsUrl || '../../data/items.json'),
    fetchImpl(options.levelUnlocksUrl || '../../data/level_unlocks.json'),
  ]);

  const responses = [
    [enemyResponse, '敵'],
    [formationResponse, '戦形'],
    [difficultyResponse, '難易度'],
    [itemsResponse, 'アイテム'],
    [levelUnlocksResponse, 'レベル解禁'],
  ];
  for (const [response, label] of responses) {
    if (!response.ok) {
      throw new Error(`${label}データを取得できませんでした（HTTP ${response.status}）`);
    }
  }

  const formations = validateFormations(await formationResponse.json());
  const enemies = validateEnemies(
    await enemyResponse.json(),
    formations.map((formation) => formation.formation_id)
  );
  const difficultyData = validateDifficulties(await difficultyResponse.json());
  const items = validateItems(await itemsResponse.json());
  const levelUnlocks = validateLevelUnlocks(
    await levelUnlocksResponse.json(), formations, items
  );
  const difficulties = Object.entries(DIFFICULTY_NAMES).map(([difficultyId, name]) => ({
    difficulty_id: difficultyId,
    name,
    ...difficultyData[difficultyId],
  }));

  return { enemies, formations, difficulties, items, levelUnlocks };
}

/**
 * 選択した敵が使用可能な戦形だけを返す。
 * @param {{ allowed_openings: string[] }} enemy
 * @param {Array<{ formation_id: string }>} formations
 */
export function getAvailableFormations(enemy, formations, unlockedIds = null) {
  const allowed = new Set(enemy.allowed_openings);
  return formations.filter((formation) =>
    allowed.has(formation.formation_id)
      && (!unlockedIds || unlockedIds.has(formation.formation_id))
  );
}

/** URL指定を含む対局条件を検証し、解禁済みのマスタを返す。 */
export function resolveMatchSelection(options, selection) {
  const unlockState = getUnlockState(options.levelUnlocks, selection.playerLevel);
  const unlockedFormationIds = selection.unlockedFormationIds || unlockState.formationIds;
  const unlockedItemIds = selection.unlockedItemIds || unlockState.itemIds;
  const enemy = options.enemies.find((item) => item.enemy_id === selection.enemyId);
  if (!enemy) throw new Error(`指定された敵が見つかりません: ${selection.enemyId}`);
  const formation = options.formations.find(
    (item) => item.formation_id === selection.formationId
  );
  if (!formation) throw new Error(`指定された戦形が見つかりません: ${selection.formationId}`);
  if (!unlockedFormationIds.has(formation.formation_id)) {
    throw new Error(`レベル${selection.playerLevel}では戦形「${formation.name}」は未解禁です`);
  }
  if (!enemy.allowed_openings.includes(formation.formation_id)) {
    throw new Error(`${enemy.name}との対局では戦形「${formation.name}」を使用できません`);
  }
  const difficulty = options.difficulties.find(
    (item) => item.difficulty_id === selection.difficultyId
  );
  if (!difficulty) throw new Error(`指定された難易度が見つかりません: ${selection.difficultyId}`);

  let equippedItem = null;
  if (selection.itemId) {
    equippedItem = options.items.find((item) => item.item_id === selection.itemId);
    if (!equippedItem) throw new Error(`指定されたアイテムが見つかりません: ${selection.itemId}`);
    if (!unlockedItemIds.has(equippedItem.item_id)) {
      throw new Error(`レベル${selection.playerLevel}では「${equippedItem.name}」は未解禁です`);
    }
    if (equippedItem.type !== 'enemy_debuff_nodes' || equippedItem.consumable) {
      throw new Error(`この対局では恒久探索量デバフスキルだけを装備できます: ${selection.itemId}`);
    }
  }
  return { formation, enemy, difficulty, equippedItem, unlockState };
}

/**
 * 既存のURLクエリ形式に合わせて対局開始URLを作る。
 * @param {{ enemyId: string, formationId: string, difficultyId: string, itemId?: string }} selection
 */
export function buildMatchSearch({ enemyId, formationId, difficultyId, itemId }) {
  const params = new URLSearchParams({
    enemy: enemyId,
    formation: formationId,
    difficulty: difficultyId,
  });
  if (itemId) params.set('item', itemId);
  return `?${params.toString()}`;
}
