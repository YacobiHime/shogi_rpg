import { DIFFICULTY_NAMES, validateDifficulties } from './difficulty.mjs';
import { validateEnemies } from './enemies.mjs';
import { validateFormations } from './formations.mjs';
import { validateItems } from './items.mjs';

/**
 * 準備画面で使用する敵・戦形・難易度の一覧を取得する。
 * @param {{ fetchImpl?: typeof fetch, enemiesUrl?: string, formationsUrl?: string, difficultyUrl?: string, itemsUrl?: string }} [options]
 */
export async function loadMatchSetupOptions(options = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  const [enemyResponse, formationResponse, difficultyResponse, itemsResponse] = await Promise.all([
    fetchImpl(options.enemiesUrl || '../../data/enemies.json'),
    fetchImpl(options.formationsUrl || '../../data/formations.json'),
    fetchImpl(options.difficultyUrl || '../../data/difficulty.json'),
    fetchImpl(options.itemsUrl || '../../data/items.json'),
  ]);

  const responses = [
    [enemyResponse, '敵'],
    [formationResponse, '戦形'],
    [difficultyResponse, '難易度'],
    [itemsResponse, 'アイテム'],
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
  const difficulties = Object.entries(DIFFICULTY_NAMES).map(([difficultyId, name]) => ({
    difficulty_id: difficultyId,
    name,
    ...difficultyData[difficultyId],
  }));

  return { enemies, formations, difficulties, items };
}

/**
 * 選択した敵が使用可能な戦形だけを返す。
 * @param {{ allowed_openings: string[] }} enemy
 * @param {Array<{ formation_id: string }>} formations
 */
export function getAvailableFormations(enemy, formations) {
  const allowed = new Set(enemy.allowed_openings);
  return formations.filter((formation) => allowed.has(formation.formation_id));
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
