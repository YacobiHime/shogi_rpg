import { isLegalDrop, isLegalMove } from './legal-moves.mjs';

const BOARD_SIZE = 9;

/** 選択中の盤上駒または持ち駒について、合法な移動先を列挙する。 */
export function getLegalDestinations(shogi, Shogi, selected, color) {
  if (!selected) return [];

  if (selected.hand) {
    const destinations = [];
    for (let x = 1; x <= BOARD_SIZE; x++) {
      for (let y = 1; y <= BOARD_SIZE; y++) {
        if (isLegalDrop(shogi, Shogi, x, y, selected.hand.kind, color)) {
          destinations.push({ x, y });
        }
      }
    }
    return destinations;
  }

  return shogi.getMovesFrom(selected.x, selected.y)
    .filter(({ to }) =>
      isLegalMove(shogi, Shogi, selected.x, selected.y, to.x, to.y, false, color) ||
      isLegalMove(shogi, Shogi, selected.x, selected.y, to.x, to.y, true, color)
    )
    .map(({ to }) => ({ x: to.x, y: to.y }));
}
