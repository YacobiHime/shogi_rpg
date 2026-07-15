export const MATCH_RESULT_TYPE = 'shogi-rpg:match-result';
export const MATCH_PROTOCOL_VERSION = 1;

const ID_PATTERN = /^[a-z][a-z0-9_]*$/;
const MATCH_ID_PATTERN = /^[A-Za-z0-9._:-]{1,64}$/;
const SFEN_PATTERN = /^[A-Za-z0-9+\/]+ [bw] (?:-|[A-Za-z0-9]+) [1-9][0-9]*$/;
const OUTCOMES = new Set(['win', 'loss', 'draw']);
const REASONS = new Set([
  'checkmate',
  'entering_king',
  'perpetual_check',
  'repetition',
  'resignation',
]);

function requireId(value, field) {
  if (typeof value !== 'string' || !ID_PATTERN.test(value)) {
    throw new Error(`${field}が不正です: ${String(value)}`);
  }
  return value;
}

export function normalizeMatchConfig(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('対局開始構成はオブジェクトにしてください');
  }
  if (typeof value.matchId !== 'string' || !MATCH_ID_PATTERN.test(value.matchId)) {
    throw new Error(`matchIdが不正です: ${String(value.matchId)}`);
  }
  return {
    matchId: value.matchId,
    enemyId: requireId(value.enemyId, 'enemyId'),
    formationId: requireId(value.formationId, 'formationId'),
    difficultyId: requireId(value.difficultyId, 'difficultyId'),
    itemId: value.itemId ? requireId(value.itemId, 'itemId') : null,
    startSfen: normalizeOptionalSfen(value.startSfen, 'startSfen'),
  };
}

function normalizeOptionalSfen(value, field) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || value.length > 256 || !SFEN_PATTERN.test(value)) {
    throw new Error(`${field}が不正です`);
  }
  return value;
}

export function buildBoardMatchUrl(boardUrl, config, baseUrl) {
  const normalized = normalizeMatchConfig(config);
  const url = new URL(boardUrl, baseUrl);
  url.searchParams.set('bridge', 'tyrano');
  url.searchParams.set('match_id', normalized.matchId);
  url.searchParams.set('enemy', normalized.enemyId);
  url.searchParams.set('formation', normalized.formationId);
  url.searchParams.set('difficulty', normalized.difficultyId);
  if (normalized.itemId) url.searchParams.set('item', normalized.itemId);
  if (normalized.startSfen) url.searchParams.set('start_sfen', normalized.startSfen);
  return url;
}

export function createMatchResultMessage(config, result) {
  const normalized = normalizeMatchConfig(config);
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    throw new Error('対局結果はオブジェクトにしてください');
  }
  if (!OUTCOMES.has(result.outcome)) {
    throw new Error(`outcomeが不正です: ${String(result.outcome)}`);
  }
  if (!REASONS.has(result.reason)) {
    throw new Error(`reasonが不正です: ${String(result.reason)}`);
  }
  if (!Number.isInteger(result.moveCount) || result.moveCount < 0) {
    throw new Error(`moveCountが不正です: ${String(result.moveCount)}`);
  }
  return {
    type: MATCH_RESULT_TYPE,
    version: MATCH_PROTOCOL_VERSION,
    match_id: normalized.matchId,
    match: {
      enemy_id: normalized.enemyId,
      formation_id: normalized.formationId,
      difficulty_id: normalized.difficultyId,
      item_id: normalized.itemId,
      start_sfen: normalized.startSfen,
    },
    result: {
      outcome: result.outcome,
      reason: result.reason,
      move_count: result.moveCount,
      final_sfen: normalizeOptionalSfen(result.finalSfen, 'finalSfen'),
    },
  };
}

export function parseMatchResultMessage(value, expectedMatchId) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || value.type !== MATCH_RESULT_TYPE
    || value.version !== MATCH_PROTOCOL_VERSION
    || value.match_id !== expectedMatchId) {
    return null;
  }
  const message = createMatchResultMessage({
    matchId: value.match_id,
    enemyId: value.match?.enemy_id,
    formationId: value.match?.formation_id,
    difficultyId: value.match?.difficulty_id,
    itemId: value.match?.item_id,
    startSfen: value.match?.start_sfen,
  }, {
    outcome: value.result?.outcome,
    reason: value.result?.reason,
    moveCount: value.result?.move_count,
    finalSfen: value.result?.final_sfen,
  });
  return message;
}

/** ティラノの永続変数へ章分岐用フラグと直近結果を反映する。 */
export function applyMatchResultToProgress(current, message) {
  const parsed = parseMatchResultMessage(message, message?.match_id);
  if (!parsed) throw new Error('対局結果メッセージが不正です');
  const source = current && typeof current === 'object' && !Array.isArray(current)
    ? current
    : {};
  const chapterFlags = source.chapter_flags
    && typeof source.chapter_flags === 'object'
    && !Array.isArray(source.chapter_flags)
    ? { ...source.chapter_flags }
    : {};
  if (parsed.result.outcome === 'win') {
    chapterFlags[`defeated_${parsed.match.enemy_id}`] = true;
  }
  return {
    ...source,
    chapter_flags: chapterFlags,
    last_match_result: parsed,
  };
}

function createMatchOverlay(document, frameUrl) {
  const overlay = document.createElement('div');
  overlay.setAttribute('data-shogi-rpg-match', '');
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '2147483647',
    background: '#111',
  });
  const frame = document.createElement('iframe');
  frame.title = '将棋対局';
  frame.src = frameUrl.href;
  frame.setAttribute('allow', 'screen-wake-lock');
  Object.assign(frame.style, {
    width: '100%',
    height: '100%',
    border: '0',
    display: 'block',
  });
  overlay.append(frame);
  return { overlay, frame };
}

export function openMatchFrame(config, options = {}) {
  const windowObject = options.windowObject || window;
  const documentObject = options.documentObject || document;
  const normalized = normalizeMatchConfig(config);
  const frameUrl = buildBoardMatchUrl(
    options.boardUrl || '/src/board-ui/index.html',
    normalized,
    windowObject.location.href,
  );
  const { overlay, frame } = createMatchOverlay(documentObject, frameUrl);

  return new Promise((resolve, reject) => {
    let settled = false;
    const cleanup = () => {
      windowObject.removeEventListener('message', handleMessage);
      overlay.remove();
    };
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      cleanup();
      callback(value);
    };
    const handleMessage = (event) => {
      if (event.origin !== windowObject.location.origin
        || event.source !== frame.contentWindow) return;
      try {
        const message = parseMatchResultMessage(event.data, normalized.matchId);
        if (message) finish(resolve, message);
      } catch (error) {
        finish(reject, error);
      }
    };
    windowObject.addEventListener('message', handleMessage);
    (options.container || documentObject.body).append(overlay);
  });
}
