/**
 * src/board-ui/main.js
 *
 * 対局UIのエントリポイント。
 * 盤面(BoardView)とエンジン(ShogiEngine)を繋ぎ、人間(先手) vs エンジン(後手)の
 * 対局を成立させるゲームループ。M2では戦形・敵マスタを対局条件へ反映する。
 */

import { ShogiEngine } from '../engine/engine.js';
// クエリを更新すると、展示端末に残った旧版の盤面描画コードを確実に置き換えられる。
import { BoardView, Color } from './board.js?v=selection-highlights-1';
import { calculateEffectiveNodeLimit, loadDifficulty } from './difficulty.mjs';
import { evaluateEnteringKingDeclaration } from './entering-king.mjs';
import { loadEngineFactories } from './engine-loader.mjs';
import { loadEnemy } from './enemies.mjs';
import { loadFormation } from './formations.mjs';
import {
  buildMatchSearch,
  getAvailableFormations,
  loadMatchSetupOptions,
} from './match-setup.mjs';
import { calculateEffectiveMoveRank, selectMoveByRank } from './move-selection.mjs';
import { resolveNnuePath } from './nnue.mjs';
import { RepetitionTracker } from './repetition.mjs';

const statusEl = document.getElementById('status');
const resignButton = document.getElementById('resign-button');
const declareWinButton = document.getElementById('declare-win-button');
const restartButton = document.getElementById('restart-button');
const connectionStatusEl = document.getElementById('connection-status');
const resultOverlay = document.getElementById('result-overlay');
const resultMessageEl = document.getElementById('result-message');
const resultCloseButton = document.getElementById('result-close');
const resultRetryButton = document.getElementById('result-retry');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingMessageEl = document.getElementById('loading-message');
const loadingSpinner = document.getElementById('loading-spinner');
const loadingRetryButton = document.getElementById('loading-retry');
const setupScreen = document.getElementById('setup-screen');
const setupForm = document.getElementById('setup-form');
const setupEnemy = document.getElementById('setup-enemy');
const setupFormation = document.getElementById('setup-formation');
const setupDifficulty = document.getElementById('setup-difficulty');
const gameScreen = document.getElementById('game-screen');
let wakeLock = null;

function reloadPage() {
  window.location.reload();
}

function showOptions(select, options, valueKey, nameKey) {
  select.replaceChildren(...options.map((item) => {
    const option = document.createElement('option');
    option.value = item[valueKey];
    option.textContent = item[nameKey];
    return option;
  }));
}

async function showMatchSetup(params) {
  setStatus('対局条件を読み込み中...');
  setLoading('対局条件を読み込み中...');
  const options = await loadMatchSetupOptions();

  showOptions(setupEnemy, options.enemies, 'enemy_id', 'name');
  showOptions(setupDifficulty, options.difficulties, 'difficulty_id', 'name');

  const requestedEnemy = params.get('enemy');
  if (options.enemies.some((enemy) => enemy.enemy_id === requestedEnemy)) {
    setupEnemy.value = requestedEnemy;
  }
  const requestedDifficulty = params.get('difficulty') || 'normal';
  if (options.difficulties.some((difficulty) => difficulty.difficulty_id === requestedDifficulty)) {
    setupDifficulty.value = requestedDifficulty;
  }

  function updateFormationOptions() {
    const enemy = options.enemies.find((item) => item.enemy_id === setupEnemy.value);
    const available = getAvailableFormations(enemy, options.formations);
    const previous = setupFormation.value;
    showOptions(setupFormation, available, 'formation_id', 'name');
    const requested = params.get('formation') || previous || 'standard';
    if (available.some((formation) => formation.formation_id === requested)) {
      setupFormation.value = requested;
    }
  }

  setupEnemy.addEventListener('change', updateFormationOptions);
  updateFormationOptions();
  setupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    window.location.assign(buildMatchSearch({
      enemyId: setupEnemy.value,
      formationId: setupFormation.value,
      difficultyId: setupDifficulty.value,
    }));
  });

  gameScreen.hidden = true;
  setupScreen.hidden = false;
  loadingOverlay.hidden = true;
  setStatus('対局条件を選んでください。');
}

function updateConnectionStatus() {
  connectionStatusEl.hidden = navigator.onLine;
}

async function requestScreenWakeLock() {
  if (wakeLock || !navigator.wakeLock || document.visibilityState !== 'visible') return;
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => {
      wakeLock = null;
    });
  } catch (error) {
    // Wake Lock非対応・省電力設定等でも対局機能には影響させない。
    console.warn('画面スリープの抑止を有効にできませんでした', error);
  }
}

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

restartButton.addEventListener('click', () => {
  if (window.confirm('現在の対局を終了して、対局条件の選択へ戻りますか？')) {
    window.location.assign(window.location.pathname);
  }
});
resultRetryButton.addEventListener('click', reloadPage);
loadingRetryButton.addEventListener('click', reloadPage);
window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);
document.addEventListener('pointerdown', requestScreenWakeLock, { once: true });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') requestScreenWakeLock();
});
updateConnectionStatus();

async function main() {
  const params = new URLSearchParams(window.location.search);
  const hasDirectMatch = ['formation', 'enemy', 'difficulty']
    .some((key) => params.has(key));
  if (!hasDirectMatch) {
    await showMatchSetup(params);
    return;
  }

  setupScreen.hidden = true;
  gameScreen.hidden = false;
  const formationId = params.get('formation') || 'standard';
  const enemyId = params.get('enemy') || 'training_partner';
  const difficultyId = params.get('difficulty') || 'normal';
  setStatus('対局データを読み込み中...');
  setLoading('対局データを読み込み中...');
  const [formation, enemy, difficulty] = await Promise.all([
    loadFormation(formationId),
    loadEnemy(enemyId),
    loadDifficulty(difficultyId),
  ]);
  const effectiveNodeLimit = calculateEffectiveNodeLimit(
    enemy.node_limit,
    difficulty.node_limit_mult
  );
  const effectiveMoveRank = calculateEffectiveMoveRank(
    enemy.move_rank,
    difficulty.move_rank_max_bonus
  );
  const nnuePath = resolveNnuePath(enemy.nnue_file);

  setStatus('エンジンを初期化中...');
  setLoading('エンジンを初期化中...');

  const handleNnueFallback = ({ path, error }) => {
    console.warn(`NNUE ${path} を使用できないため内蔵評価関数を使用します`, error);
    setLoading('NNUEエンジンを使用できないため、内蔵評価関数を使用します...');
  };
  const engineFactories = await loadEngineFactories(nnuePath, {
    onFallback: handleNnueFallback,
  });
  const engine = new ShogiEngine({
    factory: engineFactories.factory,
    fallbackFactory: engineFactories.fallbackFactory,
    nnuePath: engineFactories.useNnue ? nnuePath : null,
    onNnueFallback: handleNnueFallback,
  });

  await engine.init();
  engine.applyStrengthOptions({ multiPv: effectiveMoveRank.max });
  // GUI側の宣言条件（先手28点・後手27点）とエンジン側を一致させる。
  engine.send('setoption name EnteringKingRule value CSARule27');
  setStatus('エンジン初期化完了。isready送信中...');
  setLoading('評価関数を解析中...');
  await engine.ready();
  engine.newGame();
  loadingOverlay.hidden = true;

  const board = new BoardView(document.getElementById('board-container'), {
    startSfen: formation.start_sfen,
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
    const moves = moveHistory.length ? ' moves ' + moveHistory.join(' ') : '';
    engine.setPosition(formation.start_sfen + moves);

    const searchResult = await engine.go({
      nodes: effectiveNodeLimit,
      maxTimeMs: enemy.max_think_time_ms,
    });
    const { move } = selectMoveByRank(searchResult, effectiveMoveRank);

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
    setStatus(`${enemy.name}／${formation.name}／${difficulty.name}：あなたの番です`);
  }

  updateDeclareWinButton();
  setStatus(`${enemy.name}／${formation.name}／${difficulty.name}：あなたの番です（先手）`);
}

main().catch((e) => {
  console.error(e);
  setStatus('エラーが発生しました: ' + e.message);
  setLoading(
    '読み込みに失敗しました。通信状況を確認して「再試行」を押してください。' +
    `（${e.message}）`
  );
  loadingSpinner.hidden = true;
  loadingRetryButton.hidden = false;
});
