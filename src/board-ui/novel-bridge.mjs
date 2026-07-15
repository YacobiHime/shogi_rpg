import {
  createMatchResultMessage,
  normalizeMatchConfig,
} from '../novel/match-bridge.mjs';

/** ティラノのiframe内で起動した場合だけ、同一オリジンの親へ結果を1回返す。 */
export function createNovelResultReporter(windowObject, params) {
  const embedded = params.get('bridge') === 'tyrano'
    && windowObject.parent !== windowObject;
  if (!embedded) return { embedded: false, send: () => false };

  const config = normalizeMatchConfig({
    matchId: params.get('match_id'),
    enemyId: params.get('enemy'),
    formationId: params.get('formation'),
    difficultyId: params.get('difficulty'),
    itemId: params.get('item'),
    startSfen: params.get('start_sfen'),
  });
  let sent = false;
  return {
    embedded: true,
    send(result) {
      if (sent) return false;
      const message = createMatchResultMessage(config, result);
      windowObject.parent.postMessage(message, windowObject.location.origin);
      sent = true;
      return true;
    },
  };
}
