const BASE_KIND = { P: 'FU', L: 'KY', N: 'KE', S: 'GI', G: 'KI', B: 'KA', R: 'HI', K: 'OU' };
const SFEN_KIND = Object.fromEntries(Object.entries(BASE_KIND).map(([key, value]) => [value, key]));
const HAND_ORDER = ['HI', 'KA', 'KI', 'GI', 'KE', 'KY', 'FU'];

export function parseBoard(boardPart) {
  const ranks = boardPart.split('/');
  if (ranks.length !== 9) throw new Error('盤面は9段で指定してください');
  const pieces = new Map();
  ranks.forEach((rank, rankIndex) => {
    let file = 9;
    let promoted = false;
    for (const character of rank) {
      if (/\d/.test(character)) {
        file -= Number(character);
      } else if (character === '+') {
        promoted = true;
      } else {
        const kind = BASE_KIND[character.toUpperCase()];
        if (!kind || file < 1) throw new Error('盤面に不正な駒があります');
        pieces.set(`${file}${String.fromCharCode(97 + rankIndex)}`, {
          kind,
          color: character === character.toUpperCase() ? 'black' : 'white',
          promoted,
        });
        file -= 1;
        promoted = false;
      }
    }
    if (file !== 0 || promoted) throw new Error('盤面の筋数が不正です');
  });
  return pieces;
}

function serializeBoard(pieces) {
  const ranks = [];
  for (let y = 1; y <= 9; y += 1) {
    let rank = '';
    let empty = 0;
    for (let x = 9; x >= 1; x -= 1) {
      const piece = pieces.get(`${x}${String.fromCharCode(96 + y)}`);
      if (!piece) {
        empty += 1;
        continue;
      }
      if (empty) rank += String(empty);
      empty = 0;
      const letter = SFEN_KIND[piece.kind];
      rank += `${piece.promoted ? '+' : ''}${piece.color === 'black' ? letter : letter.toLowerCase()}`;
    }
    if (empty) rank += String(empty);
    ranks.push(rank);
  }
  return ranks.join('/');
}

export function buildBattleSfen(enemyBoard, placements, army) {
  const pieces = parseBoard(enemyBoard);
  const used = {};
  for (const [square, kind] of Object.entries(placements)) {
    if (!/^[1-9][g-i]$/.test(square)) throw new Error('味方は自陣三段へ配置してください');
    if (!SFEN_KIND[kind] || pieces.has(square)) throw new Error(`配置できないマスです: ${square}`);
    used[kind] = (used[kind] || 0) + 1;
    if (used[kind] > (army[kind] || 0)) throw new Error(`${kind}の所持数が不足しています`);
    pieces.set(square, { kind, color: 'black', promoted: false });
  }
  if (used.OU !== 1) throw new Error('玉将を1枚配置してください');
  const pawnFiles = new Set();
  for (const [square, kind] of Object.entries(placements)) {
    if (kind !== 'FU') continue;
    if (pawnFiles.has(square[0])) throw new Error('同じ筋へ歩を2枚配置できません');
    pawnFiles.add(square[0]);
  }
  let hand = '';
  for (const kind of HAND_ORDER) {
    const count = (army[kind] || 0) - (used[kind] || 0);
    if (count < 0) throw new Error(`${kind}の所持数が不足しています`);
    if (count > 0) hand += `${count > 1 ? count : ''}${SFEN_KIND[kind]}`;
  }
  return `${serializeBoard(pieces)} b ${hand || '-'} 1`;
}

export function extractPlayerArmy(sfen) {
  const [boardPart, , handPart] = String(sfen).split(' ');
  const army = { OU: 0, HI: 0, KA: 0, KI: 0, GI: 0, KE: 0, KY: 0, FU: 0 };
  for (const piece of parseBoard(boardPart).values()) {
    if (piece.color === 'black') army[piece.kind] += 1;
  }
  if (handPart && handPart !== '-') {
    const pattern = /(\d*)([RBGSNLPKrbgsnlpk])/g;
    let match;
    let consumed = '';
    while ((match = pattern.exec(handPart))) {
      consumed += match[0];
      if (match[2] === match[2].toUpperCase()) {
        army[BASE_KIND[match[2]]] += Number(match[1] || 1);
      }
    }
    if (consumed !== handPart) throw new Error('持ち駒表記が不正です');
  }
  return army;
}

export function createDefaultPlacements(army) {
  const placements = { '5i': 'OU' };
  const squares = [
    '6i', '4i', '7i', '3i', '8i', '2i', '9i', '1i',
    '5h', '6h', '4h', '7h', '3h', '8h', '2h', '9h', '1h',
    '5g', '6g', '4g', '7g', '3g', '8g', '2g', '9g', '1g',
  ];
  let index = 0;
  for (const kind of ['HI', 'KA', 'KI', 'GI', 'KE', 'KY', 'FU']) {
    for (let count = 0; count < (army[kind] || 0) && index < squares.length; count += 1) {
      let square = squares[index++];
      if (kind === 'FU') {
        const usedFiles = new Set(Object.entries(placements)
          .filter(([, value]) => value === 'FU').map(([key]) => key[0]));
        while (square && usedFiles.has(square[0])) square = squares[index++];
        if (!square) break;
      }
      placements[square] = kind;
    }
  }
  return placements;
}
