/**
 * shogi.js が返す疑似合法手を、着手後に自玉が王手されていない手へ絞り込む。
 * 判定中はSFENから複製した盤面を使い、表示中の盤面を変更しない。
 */

function clonePosition(shogi, Shogi) {
  const clone = new Shogi();
  clone.initializeFromSFENString(shogi.toSFENString(1));
  return clone;
}

export function isLegalMove(shogi, Shogi, fromX, fromY, toX, toY, promote, color) {
  try {
    const clone = clonePosition(shogi, Shogi);
    clone.move(fromX, fromY, toX, toY, promote);
    return !clone.isCheck(color);
  } catch {
    return false;
  }
}

export function isLegalDrop(shogi, Shogi, x, y, kind, color) {
  try {
    const clone = clonePosition(shogi, Shogi);
    clone.drop(x, y, kind, color);
    return !clone.isCheck(color);
  } catch {
    return false;
  }
}
