import { validateFormations } from './formations.mjs';

const REQUIRED_FIELDS = [
  'enemy_id',
  'name',
  'chapter',
  'nnue_file',
  'max_think_time_ms',
  'node_limit',
  'move_rank',
  'allowed_openings',
  'handicap',
  'start_sfen_override',
];

function assertString(value, field, index) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`敵データ[${index}].${field}は空でない文字列にしてください`);
  }
}

function assertNullableString(value, field, index) {
  if (value !== null && (typeof value !== 'string' || value.trim() === '')) {
    throw new Error(`敵データ[${index}].${field}はnullまたは空でない文字列にしてください`);
  }
}

function validateSfen(sfen, field, index) {
  if (sfen === null) return;
  const fields = sfen.trim().split(/\s+/);
  const ranks = fields[0]?.split('/');
  if (fields.length !== 4 || ranks.length !== 9
    || !['b', 'w'].includes(fields[1]) || !/^\d+$/.test(fields[3])) {
    throw new Error(`敵データ[${index}].${field}のSFEN形式が不正です`);
  }
}

/**
 * enemies.jsonの内容を検証して返す。
 * @param {unknown} data
 * @param {Iterable<string>} [formationIds]
 */
export function validateEnemies(data, formationIds) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('enemies.jsonは1件以上の敵を含む配列にしてください');
  }

  const ids = new Set();
  const validFormationIds = formationIds ? new Set(formationIds) : null;

  for (const [index, enemy] of data.entries()) {
    if (!enemy || typeof enemy !== 'object' || Array.isArray(enemy)) {
      throw new Error(`敵データ[${index}]はオブジェクトにしてください`);
    }
    for (const field of REQUIRED_FIELDS) {
      if (!(field in enemy)) {
        throw new Error(`敵データ[${index}].${field}がありません`);
      }
    }

    assertString(enemy.enemy_id, 'enemy_id', index);
    assertString(enemy.name, 'name', index);
    assertNullableString(enemy.nnue_file, 'nnue_file', index);
    assertNullableString(enemy.handicap, 'handicap', index);
    assertNullableString(enemy.start_sfen_override, 'start_sfen_override', index);
    validateSfen(enemy.start_sfen_override, 'start_sfen_override', index);

    if (ids.has(enemy.enemy_id)) {
      throw new Error(`enemy_idが重複しています: ${enemy.enemy_id}`);
    }
    ids.add(enemy.enemy_id);

    if (!Number.isInteger(enemy.chapter) || enemy.chapter < 1) {
      throw new Error(`敵データ[${index}].chapterは1以上の整数にしてください`);
    }
    for (const field of ['max_think_time_ms', 'node_limit']) {
      if (!Number.isInteger(enemy[field]) || enemy[field] < 1) {
        throw new Error(`敵データ[${index}].${field}は1以上の整数にしてください`);
      }
    }

    const rank = enemy.move_rank;
    if (!rank || typeof rank !== 'object' || Array.isArray(rank)
      || !Number.isInteger(rank.min) || !Number.isInteger(rank.max)
      || rank.min < 1 || rank.max < rank.min) {
      throw new Error(`敵データ[${index}].move_rankは1以上かつmin <= maxの整数範囲にしてください`);
    }

    if (!Array.isArray(enemy.allowed_openings) || enemy.allowed_openings.length === 0
      || enemy.allowed_openings.some((id) => typeof id !== 'string' || id.trim() === '')) {
      throw new Error(`敵データ[${index}].allowed_openingsは1件以上の戦形IDを含む配列にしてください`);
    }
    if (validFormationIds) {
      for (const formationId of enemy.allowed_openings) {
        if (!validFormationIds.has(formationId)) {
          throw new Error(`${enemy.enemy_id}が未定義の戦形を参照しています: ${formationId}`);
        }
      }
    }
  }

  return data;
}

/**
 * 敵マスタと戦形マスタを取得・検証し、指定IDの敵を返す。
 * @param {string} enemyId
 * @param {{ fetchImpl?: typeof fetch, url?: string, formationsUrl?: string }} [options]
 */
export async function loadEnemy(enemyId, options = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  const url = options.url || '../../data/enemies.json';
  const formationsUrl = options.formationsUrl || '../../data/formations.json';
  const [enemyResponse, formationResponse] = await Promise.all([
    fetchImpl(url),
    fetchImpl(formationsUrl),
  ]);

  if (!enemyResponse.ok) {
    throw new Error(`敵データを取得できませんでした（HTTP ${enemyResponse.status}）`);
  }
  if (!formationResponse.ok) {
    throw new Error(`戦形データを取得できませんでした（HTTP ${formationResponse.status}）`);
  }

  const formations = validateFormations(await formationResponse.json());
  const enemies = validateEnemies(
    await enemyResponse.json(),
    formations.map((formation) => formation.formation_id)
  );
  const enemy = enemies.find((item) => item.enemy_id === enemyId);
  if (!enemy) {
    throw new Error(`指定された敵が見つかりません: ${enemyId}`);
  }
  return enemy;
}
