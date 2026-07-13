/**
 * src/board-ui/main.js
 *
 * M1「対局UIの最小構成」のエントリポイント。
 * 盤面(BoardView)とエンジン(ShogiEngine)を繋ぎ、人間(先手) vs エンジン(後手)の
 * 対局を成立させる最小限のゲームループ。
 *
 * スコープ外（M2以降）: 戦形選択・駒落ち・アイテム/スキル・難易度連携・ティラノ結線。
 */

import { ShogiEngine } from '../engine/engine.js';
import { BoardView } from './board.js';

const statusEl = document.getElementById('status');

function setStatus(text) {
  statusEl.textContent = text;
}

async function main() {
  setStatus('エンジンを初期化中...');

  // M1では軽量版(arashigaoka)を使う想定。本番評価関数(水匠5/hao)へ差し替える場合は
  // nnuePath を指定する（docs/CLAUDE.md 2. 参照）。
  const engine = new ShogiEngine({
    factory: window.YaneuraOu,
  });

  await engine.init();
  setStatus('エンジン初期化完了。isready送信中...');
  await engine.ready();
  engine.newGame();

  const board = new BoardView(document.getElementById('board-container'), {
    onMove: async (usiMove) => {
      await onHumanMove(usiMove);
    },
  });

  let moveHistory = [];

  async function onHumanMove(usiMove) {
    moveHistory.push(usiMove);
    setStatus('エンジン思考中...');
    engine.setPosition('startpos moves ' + moveHistory.join(' '));

    const { move } = await engine.go({ movetime: 1000 });

    if (move === 'resign') {
      setStatus('エンジンが投了しました。勝利！');
      return;
    }
    if (move === 'win') {
      setStatus('入玉宣言勝ちです。');
      return;
    }

    moveHistory.push(move);
    board.applyUsiMove(move); // TODO(M1実装時): USIの指し手文字列パースを実装する
    setStatus('あなたの番です');
  }

  setStatus('あなたの番です（先手）');
}

main().catch((e) => {
  console.error(e);
  setStatus('エラーが発生しました: ' + e.message);
});
