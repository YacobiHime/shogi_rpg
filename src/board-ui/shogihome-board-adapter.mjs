/**
 * ShogiHome互換のWeb Componentを既存の対局ループへ接続するアダプター。
 * 盤面状態・合法手判定は従来のBoardViewを引き続き正とし、描画と入力だけを
 * @yacobihime/shogi-match-ui（tsshogiベース）へ委譲する。
 */
export function mountShogiMatchUiBoard(board, container, onMove) {
  const element = document.createElement('shogi-match-board');
  element.setAttribute('aria-label', '将棋盤');
  element.assetBaseUrl = '/assets/shogihome';
  element.allowMove = true;
  element.candidates = [];

  const render = () => {
    element.sfen = board.toSfen();
  };

  // BoardViewをルール状態の互換アダプターとして残し、以後の再描画を
  // Web ComponentへのSFEN同期へ置き換える。
  container.replaceChildren(element);
  board.render = render;
  render();

  const originalLock = board.lock.bind(board);
  board.lock = () => {
    originalLock();
    element.allowMove = false;
  };

  element.setRecommendedMoves = (candidates = []) => {
    element.candidates = candidates
      .filter(({ usi }) => typeof usi === 'string' && usi.length > 0)
      .map(({ usi, score }) => ({ usi, score }));
  };

  element.addEventListener('usi-move', (event) => {
    if (board.locked || !board.isHumanTurn()) return;
    const usiMove = event.detail?.[0];
    if (typeof usiMove !== 'string') return;
    // tsshogiが検証した手を既存の盤面状態へも適用し、エンジン連携・待った・
    // 千日手履歴は従来実装のまま利用する。
    element.setRecommendedMoves();
    board.applyUsiMove(usiMove);
    onMove(usiMove);
  });

  return element;
}
