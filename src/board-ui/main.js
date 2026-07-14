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
import { BoardView, Color } from './board.js';

const statusEl = document.getElementById('status');
const resignButton = document.getElementById('resign-button');
const resultOverlay = document.getElementById('result-overlay');
const resultMessageEl = document.getElementById('result-message');
const resultCloseButton = document.getElementById('result-close');

function setStatus(text) {
  statusEl.textContent = text;
}

function showResult(board, message) {
  resignButton.disabled = true;
  board.lock();
  resultMessageEl.textContent = message;
  resultOverlay.hidden = false;
}

resultCloseButton.addEventListener('click', () => {
  resultOverlay.hidden = true;
});

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
  let gameOver = false;

  resignButton.disabled = false;
  resignButton.addEventListener('click', () => {
    if (gameOver) return;
    gameOver = true;
    setStatus('あなたの投了により終了しました。');
    showResult(board, 'あなたの投了により敗北しました。');
  });

  async function onHumanMove(usiMove) {
    if (gameOver) return;
    moveHistory.push(usiMove);

    // 人間の指し手でエンジン側(後手)が詰み・打つ手なしになっていないか確認する
    if (!board.hasLegalMoves(Color.White)) {
      gameOver = true;
      setStatus('相手を詰ませました。');
      showResult(board, 'あなたの勝利です（詰み）。');
      return;
    }

    setStatus('エンジン思考中...');
    engine.setPosition('startpos moves ' + moveHistory.join(' '));

    const { move } = await engine.go({ movetime: 1000 });

    if (move === 'resign') {
      gameOver = true;
      setStatus('エンジンが投了しました。勝利！');
      showResult(board, 'エンジンの投了によりあなたの勝利です。');
      return;
    }
    if (move === 'win') {
      gameOver = true;
      setStatus('入玉宣言勝ちです。');
      showResult(board, '入玉宣言によりあなたの勝利です。');
      return;
    }

    moveHistory.push(move);
    board.applyUsiMove(move);

    // エンジンの指し手で人間(先手)が詰み・打つ手なしになっていないか確認する
    if (!board.hasLegalMoves(Color.Black)) {
      gameOver = true;
      setStatus('あなたは詰まされました。');
      showResult(board, 'あなたの敗北です（詰み）。');
      return;
    }

    setStatus('あなたの番です');
  }

  setStatus('あなたの番です（先手）');
}

main().catch((e) => {
  console.error(e);
  setStatus('エラーが発生しました: ' + e.message);
});
