/** エンジンの探索結果からヒントに使う最善手を取得する。 */
export function getHintMove(searchResult) {
  if (!searchResult || typeof searchResult !== 'object') {
    throw new Error('ヒントの探索結果が不正です');
  }
  const bestCandidate = Array.isArray(searchResult.candidates)
    ? searchResult.candidates.find((candidate) => candidate.rank === 1)
    : null;
  const move = bestCandidate?.move || searchResult.move;
  if (typeof move !== 'string' || move.length === 0) {
    throw new Error('ヒントの指し手を取得できませんでした');
  }
  return move;
}

/** USI形式の指し手を対局画面向けの短い表記にする。 */
export function formatHintMove(usiMove) {
  if (usiMove === 'resign') return '投了';
  if (usiMove === 'win') return '入玉宣言';
  const drop = usiMove.match(/^([PLNSGBR])\*([1-9][a-i])$/);
  if (drop) return `${drop[1]}を${drop[2]}へ打つ`;
  const move = usiMove.match(/^([1-9][a-i])([1-9][a-i])(\+)?$/);
  if (move) return `${move[1]} → ${move[2]}${move[3] ? '（成）' : ''}`;
  return usiMove;
}

function validateSnapshot(snapshot) {
  if (!snapshot || typeof snapshot.sfen !== 'string'
    || !Number.isInteger(snapshot.moveHistoryLength) || snapshot.moveHistoryLength < 0
    || !Number.isInteger(snapshot.repetitionLength) || snapshot.repetitionLength < 1) {
    throw new Error('待った用の局面履歴が不正です');
  }
  return { ...snapshot };
}

/** プレイヤーの手番開始時点の局面を保存する。 */
export class TurnHistory {
  constructor(initialSnapshot) {
    this.snapshots = [validateSnapshot(initialSnapshot)];
  }

  record(snapshot) {
    this.snapshots.push(validateSnapshot(snapshot));
  }

  canUndo() {
    return this.snapshots.length > 1;
  }

  undo() {
    if (!this.canUndo()) return null;
    this.snapshots.pop();
    return { ...this.snapshots.at(-1) };
  }
}
