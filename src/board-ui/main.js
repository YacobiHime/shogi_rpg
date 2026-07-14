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
import { evaluateEnteringKingDeclaration } from './entering-king.mjs';
import { RepetitionTracker } from './repetition.mjs';

const statusEl = document.getElementById('status');
const resignButton = document.getElementById('resign-button');
const declareWinButton = document.getElementById('declare-win-button');
const resultOverlay = document.getElementById('result-overlay');
const resultMessageEl = document.getElementById('result-message');
const resultCloseButton = document.getElementById('result-close');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingMessageEl = document.getElementById('loading-message');

function setStatus(text) {
  statusEl.textContent = text;
}

function setLoading(text) {
  loadingMessageEl.textContent = text;
}

function showResult(board, message) {
  resignButton.disabled = true;
  declareWinButton.disabled = true;
  board.lock();
  resultMessageEl.textContent = message;
  resultOverlay.hidden = false;
}

resultCloseButton.addEventListener('click', () => {
  resultOverlay.hidden = true;
});

async function main() {
  setStatus('エンジンを初期化中...');
  setLoading('エンジンを初期化中...');

  // M1では軽量版(arashigaoka)を使う想定。本番評価関数(水匠5/hao)へ差し替える場合は
  // nnuePath を指定する（docs/AGENTS.md 2. 参照）。isready応答に約1.3〜1.4秒かかるため
  // （docs/AGENTS.md 6. 参照）、init()〜ready()の間はローディングオーバーレイで隠す。
  const engine = new ShogiEngine({
    factory: window.YaneuraOu,
  });

  await engine.init();
  // GUI側の宣言条件（先手28点・後手27点）とエンジン側を一致させる。
  engine.send('setoption name EnteringKingRule value CSARule27');
  setStatus('エンジン初期化完了。isready送信中...');
  setLoading('評価関数を解析中...');
  await engine.ready();
  engine.newGame();
  loadingOverlay.hidden = true;

  const board = new BoardView(document.getElementById('board-container'), {
    onMove: async (usiMove) => {
      await onHumanMove(usiMove);
    },
  });

  let moveHistory = [];
  let gameOver = false;
  const repetitionTracker = new RepetitionTracker(board.toSfen());

  function humanDeclarationStatus() {
    return evaluateEnteringKingDeclaration(
      board.toSfen(), Color.Black, board.isCheck(Color.Black)
    );
  }

  function updateDeclareWinButton() {
    declareWinButton.disabled = gameOver || !humanDeclarationStatus().eligible;
  }

  function finishByRepetition(result) {
    if (!result) return false;
    gameOver = true;

    if (result.type === 'draw') {
      setStatus('千日手が成立しました。');
      showResult(board, '千日手により引き分けです。');
    } else if (result.loserColor === Color.Black) {
      setStatus('連続王手の千日手により反則負けです。');
      showResult(board, '連続王手の千日手によりあなたの敗北です。');
    } else {
      setStatus('相手の連続王手により反則勝ちです。');
      showResult(board, '連続王手の千日手によりあなたの勝利です。');
    }
    return true;
  }

  resignButton.disabled = false;
  resignButton.addEventListener('click', () => {
    if (gameOver) return;
    gameOver = true;
    setStatus('あなたの投了により終了しました。');
    showResult(board, 'あなたの投了により敗北しました。');
  });

  declareWinButton.addEventListener('click', () => {
    if (gameOver || !humanDeclarationStatus().eligible) return;
    gameOver = true;
    setStatus('入玉宣言が成立しました。');
    showResult(board, '入玉宣言によりあなたの勝利です。');
  });

  async function onHumanMove(usiMove) {
    if (gameOver) return;
    declareWinButton.disabled = true;
    moveHistory.push(usiMove);

    if (finishByRepetition(repetitionTracker.record(
      board.toSfen(), Color.Black, board.isCheck(Color.White)
    ))) return;

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
      setStatus('相手の入玉宣言が成立しました。');
      showResult(board, '相手の入玉宣言によりあなたの敗北です。');
      return;
    }

    moveHistory.push(move);
    board.applyUsiMove(move);

    if (finishByRepetition(repetitionTracker.record(
      board.toSfen(), Color.White, board.isCheck(Color.Black)
    ))) return;

    // エンジンの指し手で人間(先手)が詰み・打つ手なしになっていないか確認する
    if (!board.hasLegalMoves(Color.Black)) {
      gameOver = true;
      setStatus('あなたは詰まされました。');
      showResult(board, 'あなたの敗北です（詰み）。');
      return;
    }

    updateDeclareWinButton();
    setStatus('あなたの番です');
  }

  updateDeclareWinButton();
  setStatus('あなたの番です（先手）');
}

main().catch((e) => {
  console.error(e);
  setStatus('エラーが発生しました: ' + e.message);
  setLoading('エラーが発生しました: ' + e.message);
});
