import { applyMatchResultToProgress, openMatchFrame } from './match-bridge.mjs';

const tyranoObject = window.tyrano;
if (!tyranoObject?.plugin?.kag?.tag) {
  throw new Error('ティラノスクリプトのタグ登録前にエンジンを読み込んでください');
}

tyranoObject.plugin.kag.tag.shogi_match = {
  vital: ['match_id', 'enemy', 'formation', 'difficulty'],
  pm: {
    match_id: '',
    enemy: '',
    formation: '',
    difficulty: '',
    item: '',
  },
  start(pm) {
    const kag = this.kag;
    openMatchFrame({
      matchId: pm.match_id,
      enemyId: pm.enemy,
      formationId: pm.formation,
      difficultyId: pm.difficulty,
      itemId: pm.item || null,
    }).then((message) => {
      kag.stat.f.match_result = message;
      kag.variable.sf.shogi_rpg = applyMatchResultToProgress(
        kag.variable.sf.shogi_rpg, message
      );
      kag.saveSystemVariable();
      kag.ftag.nextOrder();
    }).catch((error) => {
      console.error('対局UIとの連携に失敗しました', error);
      kag.stat.f.match_result = {
        error: error instanceof Error ? error.message : String(error),
      };
      kag.ftag.nextOrder();
    });
  },
};
